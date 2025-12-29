import { Layout } from "@/constants/layout";
import { useTimer } from "@/contexts/timer-context";
import { Client, useClients } from "@/hooks/use-clients";
import { useSettings } from "@/hooks/use-settings";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { Button, Select, Toast, useThemeColor, useToast } from "heroui-native";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { Icon } from "../ui/icon";

const CARD_WIDTH = Dimensions.get('screen').width * .9;

const Actions = () => {
    const { isTracking, startTimer, stopTimer, pauseTimer, resumeTimer, isPaused, setClientId } = useTimer();
    const { toast } = useToast();
    const { settings } = useSettings();
    const { clients } = useClients();

    const [isOpen, setIsOpen] = useState(false);
    
    const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);

    const background = useThemeColor('background');
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');

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
                <Toast variant="default" placement="top" className="bg-[#0f172aff] border-[#334155] border-1 p-5" {...props}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Toast.Label style={{ fontSize: 22 }}>{label}</Toast.Label>
                            <Toast.Description style={{ fontSize: 16 }}>{description}</Toast.Description>
                        </View>
                    </View>
                </Toast>
            ),
        });
    }, [toast]);

    const handleStart = useCallback((overrideClientId?: string) => {
        const idToUse = overrideClientId || selectedClient?.id;
        startTimer(idToUse);
        showToast('Timer Started', 'Time tracking has begun. Wishing you a productive session!');
    }, [startTimer, showToast, selectedClient]);

    const handleStop = useCallback(() => {
        stopTimer();
        showToast('Session Saved', 'Your work time has been recorded and added to the session history.');
    }, [stopTimer, showToast]);

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
            <Icon name="time-outline" color="black" />
            <Button.Label style={{ fontSize: 24, fontWeight: '600', color: 'black' }}>Set Hourly Rate</Button.Label>
        </Button>
    );

    // 🔥 ВИПРАВЛЕНО: Кнопка тепер сама керує логікою відкриття
    const StartBtn = (
        <Button 
            key="start"
            size="lg" 
            style={{ minWidth: CARD_WIDTH, backgroundColor: '#2bee6c' }}
            isDisabled={settings?.currency === undefined}
            feedbackVariant="ripple"
        >
            <Icon name="play-outline" color="black" />
            <Button.Label style={{ fontSize: 24, fontWeight: '600', color: 'black' }}>
                Start Tracking
            </Button.Label>
        </Button>
    );

    const PauseBtn = (
        <Button
            key="pause"
            onPress={handlePause}
            size="lg"
            style={[styles.outlineButton, { borderColor: '#FFEB3B' }]}
        >
            <Icon name="pause-outline" color="#FFEB3B" />
            <Button.Label style={[styles.outlineButtonText, { color: '#FFEB3B' }]}>Pause Session</Button.Label>
        </Button>
    );
    
    const ResumeBtn = (
        <Button
            key="resume"
            onPress={handleResume}
            size="lg"
            style={[styles.outlineButton, { borderColor: '#2bee6c' }]}
        >
            <Icon name="play-outline" color="#2bee6c" />
            <Button.Label style={[styles.outlineButtonText, { color: '#2bee6c' }]}>Resume Session</Button.Label>
        </Button>
    );

    const StopBtn = (
        <Button
            key="stop"
            onPress={handleStop}
            size="lg"
            style={[styles.outlineButton, { borderColor: '#fe5959ff' }]}
        >
            <Icon name="stop-outline" color="#fe5959ff" />
            <Button.Label style={[styles.outlineButtonText, { color: '#fe5959ff' }]}>Stop Session</Button.Label>
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
                style={{ minWidth: CARD_WIDTH, backgroundColor: '#2bee6c' }}
                isDisabled={settings?.currency === undefined}
                feedbackVariant="ripple"
                onPress={() => handleStart()}
            >
                <Icon name="play-outline" color="black" />
                <Button.Label style={{ fontSize: 24, fontWeight: '600', color: 'black' }}>
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
            <Select.Trigger asChild>
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
                                <Text style={{ color: muted, textAlign: 'center', marginBottom: 10, fontSize: 24, fontWeight: '600' }}>
                                    Select Client to Start
                                </Text>
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
                                                        backgroundColor: cl.color || '#2bee6c', 
                                                        width: 40, 
                                                        height: 40, 
                                                        borderRadius: 20,
                                                        justifyContent: 'center',
                                                        alignItems: 'center'
                                                    }}>
                                                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black' }}>
                                                            {cl.name.charAt(0).toUpperCase()}
                                                        </Text>
                                                    </View>

                                                    <View>
                                                        <Text style={{ color: foreground, fontSize: 20, fontWeight: '700' }}>
                                                            {cl.name}
                                                        </Text>
                                                        {cl.isDefault && (
                                                            <Text style={{ color: muted, fontSize: 14 }}>Default</Text>
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