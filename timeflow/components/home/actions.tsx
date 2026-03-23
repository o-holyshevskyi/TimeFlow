import { Layout } from "@/constants/layout";
import { useTimer } from "@/contexts/timer-context";
import { Client, useClients } from "@/hooks/use-clients";
import { useSettings } from "@/hooks/use-settings";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import * as StoreReview from 'expo-store-review';
import { Select, Toast, useThemeColor, useToast } from "heroui-native";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "../ui/app-text";
import { Icon } from "../ui/icon";

const CARD_WIDTH = Dimensions.get('window').width * 0.9;

export const triggerReview = async () => {
    try {
        const isAvailable = await StoreReview.isAvailableAsync();
        const hasAction = await StoreReview.hasAction();
        if (isAvailable && hasAction) await StoreReview.requestReview();
    } catch (error) {
        console.error("Review request failed", error);
    }
};

// ─────────────────────────────────────────────
// Primary solid button (e.g. Start, Resume)
// ─────────────────────────────────────────────
const PrimaryBtn = ({
    icon,
    label,
    onPress,
    disabled,
    color,
    textColor = 'white',
    flex = 1,
}: {
    icon: string;
    label: string;
    onPress: () => void;
    disabled?: boolean;
    color: string;
    textColor?: string;
    flex?: number;
}) => (
    <Pressable
        onPress={() => {
            if (!disabled) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onPress();
            }
        }}
        style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: color, flex, opacity: (disabled || pressed) ? 0.65 : 1 },
        ]}
    >
        <Icon name={icon as any} color={textColor} size={20} />
        <AppText style={[styles.primaryBtnLabel, { color: textColor }]}>{label}</AppText>
    </Pressable>
);

// ─────────────────────────────────────────────
// Outline button (e.g. Pause, Stop secondary)
// ─────────────────────────────────────────────
const OutlineBtn = ({
    icon,
    label,
    onPress,
    color,
    flex = 1,
}: {
    icon: string;
    label: string;
    onPress: () => void;
    color: string;
    flex?: number;
}) => (
    <Pressable
        onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onPress();
        }}
        style={({ pressed }) => [
            styles.outlineBtn,
            { borderColor: color, backgroundColor: color + '10', flex, opacity: pressed ? 0.65 : 1 },
        ]}
    >
        <Icon name={icon as any} color={color} size={20} />
        <AppText style={[styles.outlineBtnLabel, { color }]}>{label}</AppText>
    </Pressable>
);

// ─────────────────────────────────────────────
// Main Actions component
// ─────────────────────────────────────────────
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
    const surface = useThemeColor('surface');

    useEffect(() => {
        if (clients.length > 0 && !selectedClient) {
            const defaultClient = clients.find(cl => cl.isDefault) || clients[0];
            setSelectedClient(defaultClient);
            if (defaultClient) setClientId(defaultClient.id);
        }
    }, [clients, selectedClient, setClientId]);

    const showToast = useCallback((label: string, description: string) => {
        toast.show({
            component: (props) => (
                <Toast
                    variant="default"
                    placement="top"
                    style={{ backgroundColor: background, borderColor: muted + '30' }}
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
    }, [toast, background, muted]);

    const handleStart = useCallback((overrideClientId?: string) => {
        startTimer(overrideClientId || selectedClient?.id);
        showToast('Timer Started', 'Wishing you a productive session!');
    }, [startTimer, showToast, selectedClient]);

    const handleStop = useCallback(() => {
        stopTimer();
        showToast('Session Saved', 'Your session has been recorded.');
        if (elapsedTime > 1800) setTimeout(() => triggerReview(), 1000);
    }, [stopTimer, showToast, elapsedTime]);

    const handlePause = useCallback(() => {
        pauseTimer();
        showToast('Timer Paused', 'Take a break and resume when ready.');
    }, [pauseTimer, showToast]);

    const handleResume = useCallback(() => {
        resumeTimer();
        showToast('Timer Resumed', 'Welcome back!');
    }, [resumeTimer, showToast]);

    // ── No currency set ──
    if (!settings?.currency) {
        return (
            <View style={styles.center}>
                <PrimaryBtn
                    icon="settings-outline"
                    label="Set Hourly Rate"
                    color={accent}
                    onPress={() => router.push('/cards/settings')}
                />
            </View>
        );
    }

    // ── Actively tracking ──
    if (isTracking && !isPaused) {
        return (
            <View style={styles.center}>
                <AppText style={[styles.actionHint, { color: muted }]}>Session in progress</AppText>
                <View style={styles.buttonRow}>
                    <OutlineBtn icon="pause" color={warning} label="Pause" onPress={handlePause} />
                    <PrimaryBtn icon="stop" color={danger} label="Stop" onPress={handleStop} />
                </View>
            </View>
        );
    }

    // ── Paused ──
    if (isPaused) {
        return (
            <View style={styles.center}>
                <AppText style={[styles.actionHint, { color: muted }]}>Session paused</AppText>
                <View style={styles.buttonRow}>
                    <PrimaryBtn icon="play" color={accent} label="Resume" onPress={handleResume} />
                    <OutlineBtn icon="stop" color={danger} label="Stop" onPress={handleStop} />
                </View>
            </View>
        );
    }

    // ── Idle, no clients ──
    if (clients.length === 0) {
        return (
            <View style={styles.center}>
                <PrimaryBtn
                    icon="play"
                    label="Start Tracking"
                    color={accent}
                    disabled={!settings?.currency}
                    onPress={() => handleStart()}
                    flex={0}
                />
            </View>
        );
    }

    // ── Idle, with client selector ──
    return (
        <View style={styles.center}>
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
                <Select.Trigger style={{ width: CARD_WIDTH }} asChild>
                    <Pressable
                        onPress={() => {
                            if (!settings?.currency) return;
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            setIsOpen(true);
                        }}
                        style={({ pressed }) => [
                            styles.startBtn,
                            { backgroundColor: accent, width: CARD_WIDTH, opacity: pressed ? 0.8 : 1 },
                        ]}
                    >
                        <Icon name="play" color="white" size={20} />
                        <AppText style={styles.startBtnLabel}>Start Tracking</AppText>
                    </Pressable>
                </Select.Trigger>

                <Select.Portal>
                    <Select.Overlay />
                    {isOpen && (
                        <BlurView
                            intensity={25}
                            tint='systemThinMaterialDark'
                            style={{ ...StyleSheet.absoluteFillObject, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' }}
                        >
                            <Select.Content
                                backgroundStyle={{ backgroundColor: background, borderTopLeftRadius: Layout.borderRadius, borderTopRightRadius: Layout.borderRadius }}
                                presentation='bottom-sheet'
                                snapPoints={['60%']}
                            >
                                <View style={{ height: Math.min(clients.length * 80 + 50, 400), paddingVertical: 20 }}>
                                    <AppText style={{ color: muted, textAlign: 'center', marginBottom: 10, fontSize: 18, fontWeight: '600' }}>
                                        Select Client
                                    </AppText>
                                    <ScrollView showsVerticalScrollIndicator={false}>
                                        {clients.map((cl) => (
                                            <Select.Item key={cl.id} value={cl.id} label={cl.name}>
                                                <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                                        <View style={{ backgroundColor: cl.color || accent, width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                                                            <AppText style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
                                                                {cl.name.charAt(0).toUpperCase()}
                                                            </AppText>
                                                        </View>
                                                        <View>
                                                            <AppText style={{ color: foreground, fontSize: 18, fontWeight: '700' }}>{cl.name}</AppText>
                                                            {cl.isDefault && <AppText style={{ color: muted, fontSize: 13 }}>Default</AppText>}
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
        </View>
    );
};

const styles = StyleSheet.create({
    center: {
        alignItems: 'center',
        gap: Layout.spacing * 3,
        paddingHorizontal: Layout.spacing * 3,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        width: CARD_WIDTH,
    },
    primaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 14,
        minWidth: 120,
    },
    primaryBtnLabel: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.1,
    },
    outlineBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 14,
        borderWidth: 1.5,
        minWidth: 120,
    },
    outlineBtnLabel: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.1,
    },
    startBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 18,
        paddingHorizontal: 28,
        borderRadius: 14,
    },
    startBtnLabel: {
        fontSize: 17,
        fontWeight: '700',
        color: 'white',
        letterSpacing: 0.1,
    },
    actionHint: {
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
});

export default Actions;
