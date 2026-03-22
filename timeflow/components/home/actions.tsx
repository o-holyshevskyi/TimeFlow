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
        const isAvailable = await StoreReview.isAvailableAsync();
        const hasAction = await StoreReview.hasAction();
        if (isAvailable && hasAction) {
            await StoreReview.requestReview();
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
                    className="border-1 p-5"
                    {...props}
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
            setTimeout(() => triggerReview(), 1000);
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

    if (!settings?.currency) {
        return (
            <View style={styles.container}>
                <Button
                    size="lg"
                    style={{ minWidth: CARD_WIDTH }}
                    feedbackVariant="ripple"
                    onPress={handleSetRate}
                >
                    <Icon name="time-outline" color={foreground} />
                    <Button.Label style={styles.btnLabel}>Set Hourly Rate</Button.Label>
                </Button>
            </View>
        );
    }

    if (isTracking && !isPaused) {
        return (
            <View style={styles.rowContainer}>
                <Button
                    onPress={handlePause}
                    size="lg"
                    style={[styles.halfButton, { borderColor: warning, backgroundColor: warning + '15' }]}
                >
                    <Icon name="pause-outline" color={warning} />
                    <Button.Label style={[styles.halfBtnLabel, { color: warning }]}>Pause</Button.Label>
                </Button>
                <Button
                    onPress={handleStop}
                    size="lg"
                    style={[styles.halfButton, { borderColor: danger, backgroundColor: danger + '15' }]}
                >
                    <Icon name="stop-outline" color={danger} />
                    <Button.Label style={[styles.halfBtnLabel, { color: danger }]}>Stop</Button.Label>
                </Button>
            </View>
        );
    }

    if (isPaused) {
        return (
            <View style={styles.rowContainer}>
                <Button
                    onPress={handleResume}
                    size="lg"
                    style={[styles.halfButton, { borderColor: accent, backgroundColor: accent + '15' }]}
                >
                    <Icon name="play-outline" color={accent} />
                    <Button.Label style={[styles.halfBtnLabel, { color: accent }]}>Resume</Button.Label>
                </Button>
                <Button
                    onPress={handleStop}
                    size="lg"
                    style={[styles.halfButton, { borderColor: danger, backgroundColor: danger + '15' }]}
                >
                    <Icon name="stop-outline" color={danger} />
                    <Button.Label style={[styles.halfBtnLabel, { color: danger }]}>Stop</Button.Label>
                </Button>
            </View>
        );
    }

    if (clients.length === 0) {
        return (
            <View style={styles.container}>
                <Button
                    size="lg"
                    style={{ minWidth: CARD_WIDTH, backgroundColor: accent }}
                    isDisabled={settings?.currency === undefined}
                    feedbackVariant="ripple"
                    onPress={() => handleStart()}
                >
                    <Icon name="play-outline" color={foreground} />
                    <Button.Label style={styles.btnLabel}>Start Tracking</Button.Label>
                </Button>
            </View>
        );
    }

    const StartBtn = (
        <Button
            key="start"
            size="lg"
            style={{ minWidth: CARD_WIDTH, backgroundColor: accent }}
            isDisabled={settings?.currency === undefined}
            feedbackVariant="ripple"
        >
            <Icon name="play-outline" color={foreground} />
            <Button.Label style={styles.btnLabel}>Start Tracking</Button.Label>
        </Button>
    );

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
                                                        alignItems: 'center',
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
        paddingHorizontal: Dimensions.get('window').width * 0.05,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Layout.spacing * 2,
        paddingHorizontal: Dimensions.get('window').width * 0.05,
    },
    halfButton: {
        flex: 1,
        borderRadius: 9999,
        borderWidth: 1,
        backgroundColor: 'transparent',
        paddingHorizontal: Layout.spacing * 2,
        paddingVertical: Layout.spacing / 1.5,
    },
    halfBtnLabel: {
        fontSize: 20,
        fontWeight: '600',
    },
    btnLabel: {
        fontSize: 22,
        fontWeight: '600',
    },
});

export default Actions;
