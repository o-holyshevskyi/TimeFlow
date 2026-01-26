import { Layout } from "@/constants/layout";
import { useTimer } from "@/contexts/timer-context";
import { Client, useClients } from "@/hooks/use-clients";
import { useSettings } from "@/hooks/use-settings";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import * as StoreReview from 'expo-store-review';
import { Button, Select, Toast, useThemeColor, useToast } from "heroui-native";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "../ui/app-text";
import { Icon } from "../ui/icon";

const CARD_WIDTH = Dimensions.get('window').width * .9;

export const triggerReview = async () => {
    try {
        console.log("Review check started");

        // 1. Перевіряємо, чи платформа взагалі підтримує відгуки (Android 5.0+, iOS non-TestFlight)
        const isAvailable = await StoreReview.isAvailableAsync(); //
        
        // 2. Перевіряємо, чи налаштовані URL магазинів в app.json
        const hasAction = await StoreReview.hasAction(); //

        if (isAvailable && hasAction) {
            console.log("Review window requested");
            await StoreReview.requestReview(); //
        } else {
            console.log("Review not available: ", { isAvailable, hasAction });
        }
    } catch (error) {
        console.error("Review request failed", error);
    }
};

const Actions = () => {
    const { isTracking, startTimer, stopTimer, pauseTimer, resumeTimer, isPaused, setClientId, elapsedTime } = useTimer();
    const { toast } = useToast();
    const { settings } = useSettings();
    const { clients } = useClients();

    const [isOpen, setIsOpen] = useState(false);
    
    const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);

    const background = useThemeColor('background');
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const accent = useThemeColor('accent');
    const warning = useThemeColor('warning');
    const danger = useThemeColor('danger');

    useEffect(() => {
        if (clients.length > 0 && !selectedClient) {
            const defaultClient = clients.find(cl => cl.isDefault) || clients[0];
            setSelectedClient(defaultClient);
            if (defaultClient) {
                setClientId(defaultClient.id);
            }
        }
    }, [clients, selectedClient, setClientId]);

    const showToast = useCallback((label: string, description: string) => {
        toast.show({
            component: (props) => (
                <Toast 
                    variant="default" 
                    placement="top" 
                    style={{ backgroundColor: background, borderColor: accent }}
                    className="border-1 p-5" {...props}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Toast.Label style={{ fontSize: 22 }}>{label}</Toast.Label>
                            <Toast.Description style={{ fontSize: 16 }}>{description}</Toast.Description>
                        </View>
                    </View>
                </Toast>
            ),
        });
    }, [toast, background, accent]);

    const handleStart = useCallback((overrideClientId?: string) => {
        const idToUse = overrideClientId || selectedClient?.id;
        startTimer(idToUse);
        showToast('Timer Started', 'Time tracking has begun. Wishing you a productive session!');
    }, [startTimer, showToast, selectedClient]);

    const handleStop = useCallback(() => {
        stopTimer();
        showToast('Session Saved', 'Your work time has been recorded and added to the session history.');

        if (elapsedTime > 1800) { 
            setTimeout(() => triggerReview(), 1000); // невелика затримка для плавності
        }
    }, [stopTimer, showToast, elapsedTime]);

    const handlePause = useCallback(() => {
        pauseTimer();
        showToast('Timer Paused', 'Time tracking has been paused. Take a break and resume when ready.');
    }, [pauseTimer, showToast]);

    const handleResume = useCallback(() => {
        resumeTimer();
        showToast('Timer Resumed', 'Time tracking has resumed. Welcome back to your productive session!');
    }, [resumeTimer, showToast]);

    const handleSetRate = useCallback(() => {
        router.push('/cards/settings');
    }, []);

    const SetHourlyRateBtn = (
        <Button 
            key="set-rate"
            size="lg" 
            style={{ minWidth: CARD_WIDTH }}
            feedbackVariant="ripple"
            onPress={handleSetRate}
        >
            <Icon name="time-outline" color={foreground} />
            <Button.Label style={{ fontSize: 24, fontWeight: '600', color: foreground }}>Set Hourly Rate</Button.Label>
        </Button>
    );

    // 🔥 ВИПРАВЛЕНО: Кнопка тепер сама керує логікою відкриття
    const StartBtn = (
        <Button 
            key="start"
            size="lg" 
            style={{ minWidth: CARD_WIDTH, backgroundColor: accent }}
            isDisabled={settings?.currency === undefined}
            feedbackVariant="ripple"
        >
            <Icon name="play-outline" color={foreground} />
            <Button.Label style={{ fontSize: 24, fontWeight: '600', color: foreground }}>
                Start Tracking
            </Button.Label>
        </Button>
    );

    const PauseBtn = (
        <Button
            key="pause"
            onPress={handlePause}
            size="lg"
            style={[styles.outlineButton, { borderColor: warning }]}
        >
            <Icon name="pause-outline" color={warning} />
            <Button.Label style={[styles.outlineButtonText, { color: warning }]}>Pause Session</Button.Label>
        </Button>
    );
    
    const ResumeBtn = (
        <Button
            key="resume"
            onPress={handleResume}
            size="lg"
            style={[styles.outlineButton, { borderColor: accent }]}
        >
            <Icon name="play-outline" color={accent} />
            <Button.Label style={[styles.outlineButtonText, { color: accent }]}>Resume Session</Button.Label>
        </Button>
    );

    const StopBtn = (
        <Button
            key="stop"
            onPress={handleStop}
            size="lg"
            style={[styles.outlineButton, { borderColor: danger }]}
        >
            <Icon name="stop-outline" color={danger} />
            <Button.Label style={[styles.outlineButtonText, { color: danger }]}>Stop Session</Button.Label>
        </Button>
    );

    if (!settings?.currency) {
        return <View style={styles.container}>{SetHourlyRateBtn}</View>;
    }

    if (isTracking && !isPaused) {
        return (
            <View style={styles.container}>
                {PauseBtn}
                {StopBtn}
            </View>
        );
    }

    if (isPaused) {
        return (
            <View style={styles.container}>
                {ResumeBtn}
                {StopBtn}
            </View>
        );
    }

    // Якщо клієнтів немає, не показуємо Select, просто кнопку
    if (clients.length === 0) {
        // When no clients, use the button with onPress handler
        const StartBtnWithHandler = (
            <Button 
                key="start"
                size="lg" 
                style={{ minWidth: CARD_WIDTH, backgroundColor: accent }}
                isDisabled={settings?.currency === undefined}
                feedbackVariant="ripple"
                onPress={() => handleStart()}
            >
                <Icon name="play-outline" color={foreground} />
                <Button.Label style={{ fontSize: 24, fontWeight: '600', color: foreground }}>
                    Start Tracking
                </Button.Label>
            </Button>
        );
        return <View style={styles.container}>{StartBtnWithHandler}</View>;
    }

    return (
        <Select
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            value={selectedClient ? { value: selectedClient.id, label: selectedClient.name } : undefined}
            onValueChange={(option) => {
                if (option?.value) {
                    const client = clients.find(c => c.id === option.value);
                    if (client) {
                        setSelectedClient(client);
                        setClientId(client.id); 
                        handleStart(client.id);
                        setIsOpen(false);
                    }
                }
            }}
        >
            <Select.Trigger style={{ width: CARD_WIDTH, alignSelf: 'center' }} asChild>
                {StartBtn}
            </Select.Trigger>
            
            <Select.Portal>
                <Select.Overlay />
                {isOpen && (
                    <BlurView
                        intensity={25}
                        tint='systemThinMaterialDark'
                        style={{
                            ...StyleSheet.absoluteFillObject,
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            overflow: 'hidden',
                        }}
                    >
                        <Select.Content 
                            backgroundStyle={{ 
                                backgroundColor: background, 
                                borderTopLeftRadius: Layout.borderRadius,
                                borderTopRightRadius: Layout.borderRadius, 
                            }}
                            presentation='bottom-sheet'
                            snapPoints={['60%']}
                        >
                            <View style={{ height: Math.min(clients.length * 80 + 50, 400), paddingVertical: 20 }}>
                                <AppText style={{ color: muted, textAlign: 'center', marginBottom: 10, fontSize: 24, fontWeight: '600' }}>
                                    Select Client to Start
                                </AppText>
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {clients.map((cl) => (
                                        <Select.Item
                                            key={cl.id}
                                            value={cl.id}
                                            label={cl.name}
                                        >
                                            <View style={{ 
                                                flexDirection: 'row', 
                                                gap: Layout.spacing * 2, 
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                            }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                                                    <View style={{ 
                                                        backgroundColor: cl.color || accent, 
                                                        width: 40, 
                                                        height: 40, 
                                                        borderRadius: 20,
                                                        justifyContent: 'center',
                                                        alignItems: 'center'
                                                    }}>
                                                        <AppText style={{ fontSize: 18, fontWeight: 'bold', color: 'black' }}>
                                                            {cl.name.charAt(0).toUpperCase()}
                                                        </AppText>
                                                    </View>

                                                    <View>
                                                        <AppText style={{ color: foreground, fontSize: 20, fontWeight: '700' }}>
                                                            {cl.name}
                                                        </AppText>
                                                        {cl.isDefault && (
                                                            <AppText style={{ color: muted, fontSize: 14 }}>Default</AppText>
                                                        )}
                                                    </View>
                                                </View>

                                                <Select.ItemIndicator />
                                            </View>
                                        </Select.Item>
                                    ))}
                                </ScrollView>
                            </View>
                        </Select.Content> 
                    </BlurView>
                )}
            </Select.Portal>
        </Select>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Layout.spacing * 2,
        width: '100%',
    },
    outlineButton: {
        borderRadius: 9999,
        borderWidth: 1,
        backgroundColor: 'transparent',
        minWidth: CARD_WIDTH,
        paddingHorizontal: Layout.spacing * 3,
        paddingVertical: Layout.spacing / 1.5,
    },
    outlineButtonText: {
        fontSize: 24, 
        fontWeight: '600',
    }
});

export default Actions;