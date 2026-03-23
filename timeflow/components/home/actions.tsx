import { Layout } from "@/constants/layout";
import { useTimer } from "@/contexts/timer-context";
import { Client, useClients } from "@/hooks/use-clients";
import { useSettings } from "@/hooks/use-settings";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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
// Circular icon button (music-player style)
// ─────────────────────────────────────────────
const CircleBtn = ({
    icon,
    color,
    label,
    onPress,
    large = false,
}: {
    icon: string;
    color: string;
    label: string;
    onPress: () => void;
    large?: boolean;
}) => {
    const size = large ? 90 : 76;
    const iconSize = large ? 32 : 26;
    return (
        <Pressable
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onPress();
            }}
            style={({ pressed }) => [
                styles.circleBtn,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderColor: color,
                    backgroundColor: color + '18',
                    opacity: pressed ? 0.7 : 1,
                },
            ]}
        >
            <Icon name={icon as any} color={color} size={iconSize} />
            <AppText style={[styles.circleBtnLabel, { color }]}>{label}</AppText>
        </Pressable>
    );
};

// ─────────────────────────────────────────────
// Full-width pill start button (uses gradient)
// ─────────────────────────────────────────────
const PillStartBtn = ({
    accent,
    foreground,
    onPress,
    disabled,
    label = 'Start Tracking',
    icon = 'play',
}: {
    accent: string;
    foreground: string;
    onPress: () => void;
    disabled?: boolean;
    label?: string;
    icon?: string;
}) => (
    <Pressable
        onPress={() => {
            if (!disabled) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onPress();
            }
        }}
        style={({ pressed }) => [{ width: CARD_WIDTH, opacity: (disabled || pressed) ? 0.6 : 1 }]}
    >
        <LinearGradient
            colors={[accent, accent + 'BB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.pillGradient}
        >
            <Icon name={icon as any} color={foreground} size={22} />
            <AppText style={[styles.pillLabel, { color: foreground }]}>{label}</AppText>
        </LinearGradient>
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
                <PillStartBtn
                    accent={accent}
                    foreground={foreground}
                    onPress={() => router.push('/cards/settings')}
                    label="Set Hourly Rate"
                    icon="time-outline"
                />
            </View>
        );
    }

    // ── Actively tracking ──
    if (isTracking && !isPaused) {
        return (
            <View style={styles.center}>
                <AppText style={[styles.actionHint, { color: muted }]}>
                    Session in progress
                </AppText>
                <View style={styles.circleRow}>
                    <CircleBtn icon="pause" color={warning} label="Pause" onPress={handlePause} />
                    <CircleBtn icon="stop" color={danger} label="Stop" onPress={handleStop} large />
                </View>
            </View>
        );
    }

    // ── Paused ──
    if (isPaused) {
        return (
            <View style={styles.center}>
                <AppText style={[styles.actionHint, { color: muted }]}>
                    Session paused
                </AppText>
                <View style={styles.circleRow}>
                    <CircleBtn icon="play" color={accent} label="Resume" onPress={handleResume} large />
                    <CircleBtn icon="stop" color={danger} label="Stop" onPress={handleStop} />
                </View>
            </View>
        );
    }

    // ── Idle, no clients ──
    if (clients.length === 0) {
        return (
            <View style={styles.center}>
                <PillStartBtn
                    accent={accent}
                    foreground={foreground}
                    onPress={() => handleStart()}
                    disabled={!settings?.currency}
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
                    <PillStartBtn
                        accent={accent}
                        foreground={foreground}
                        onPress={() => setIsOpen(true)}
                        disabled={!settings?.currency}
                    />
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
                                                        <View style={{ backgroundColor: cl.color || accent, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                                                            <AppText style={{ fontSize: 18, fontWeight: 'bold', color: 'black' }}>
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
    },
    circleRow: {
        flexDirection: 'row',
        gap: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleBtn: {
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    circleBtnLabel: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    pillGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 18,
        paddingHorizontal: 24,
        borderRadius: 9999,
    },
    pillLabel: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    actionHint: {
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});

export default Actions;
