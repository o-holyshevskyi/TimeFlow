import AdBanner from '@/components/advertisment/ad-banner';
import Actions from '@/components/home/actions';
import MainContent from '@/components/home/content';
import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { useTimer } from '@/contexts/timer-context';
import { useUserStatus } from '@/hooks/user-status';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Button, Card, useThemeColor } from 'heroui-native';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

function getFormattedDate(): string {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
    });
}

export default function TimerTab() {
    const background = useThemeColor('background');
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const accent = useThemeColor('accent');
    const surface = useThemeColor('surface');
    const { theme } = useUniwind();
    const { isPro, isChecking } = useUserStatus();
    const { isTracking, isPaused } = useTimer();
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        if (isPro && !isChecking) {
            AsyncStorage.getItem('has_seen_pro_welcome').then(v => {
                if (!v) setShowWelcome(true);
            });
        }
    }, [isPro, isChecking]);

    const handleCloseWelcome = async () => {
        setShowWelcome(false);
        await AsyncStorage.setItem('has_seen_pro_welcome', 'true');
    };

    const statusLabel = useMemo(() => {
        if (isTracking && !isPaused) return { text: 'Tracking', color: accent };
        if (isPaused) return { text: 'Paused', color: '#F59E0B' };
        return null;
    }, [isTracking, isPaused, accent]);

    const isLightTheme = theme === 'light' || theme === 'nord';
    const blurTint = isLightTheme ? 'systemThinMaterialLight' : 'systemThinMaterialDark';

    return (
        <View style={[styles.root, { backgroundColor: background }]}>
            <SafeAreaView style={styles.safeArea}>

                {/* ── Header ── */}
                <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
                    <View style={styles.headerLeft}>
                        <AppText style={[styles.greeting, { color: foreground }]}>
                            {getGreeting()}
                        </AppText>
                        <View style={styles.subRow}>
                            <AppText style={[styles.dateLabel, { color: muted }]}>
                                {getFormattedDate()}
                            </AppText>
                            {statusLabel && (
                                <View style={[styles.statusPill, {
                                    backgroundColor: statusLabel.color + '18',
                                    borderColor: statusLabel.color + '50',
                                }]}>
                                    <View style={[styles.statusDot, { backgroundColor: statusLabel.color }]} />
                                    <AppText style={[styles.statusText, { color: statusLabel.color }]}>
                                        {statusLabel.text}
                                    </AppText>
                                </View>
                            )}
                        </View>
                    </View>
                    <Pressable
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            router.push('/modals/new-session');
                        }}
                        style={({ pressed }) => [styles.addBtn, {
                            backgroundColor: surface,
                            opacity: pressed ? 0.6 : 1,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.08,
                            shadowRadius: 8,
                        }]}
                    >
                        <Icon name="add" color={foreground} size={20} />
                    </Pressable>
                </Animated.View>

                <View style={[styles.hairline, { backgroundColor: 'rgba(84,84,88,0.2)' }]} />

                {/* ── Timer + Earnings ── */}
                <Animated.View entering={FadeIn.delay(100).duration(500)} style={styles.centerContent}>
                    <MainContent />
                </Animated.View>

                <AdBanner isPro={!isChecking && isPro} />

                {/* ── Actions ── */}
                <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.actionsArea}>
                    <Actions />
                </Animated.View>

            </SafeAreaView>

            {/* ── PRO Welcome Modal ── */}
            <Modal visible={showWelcome} animationType="slide" transparent presentationStyle="overFullScreen">
                <BlurView intensity={40} tint={blurTint} style={styles.overlay}>
                    <Card style={[styles.welcomeCard, {
                        backgroundColor: surface,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 16 },
                        shadowOpacity: 0.24,
                        shadowRadius: 32,
                    }]}>
                        <Card.Body style={styles.welcomeBody}>
                            <View style={[styles.welcomeIconWrap, { backgroundColor: accent + '18' }]}>
                                <Icon name="ribbon" size={32} color={accent} />
                            </View>
                            <AppText style={[styles.welcomeTitle, { color: foreground }]}>
                                You're PRO
                            </AppText>
                            <AppText style={[styles.welcomeBody2, { color: muted }]}>
                                Lifetime access active. Unlimited invoices, clients, and analytics.
                            </AppText>
                            <Button
                                onPress={handleCloseWelcome}
                                style={[styles.welcomeBtn, { backgroundColor: accent }]}
                            >
                                <Button.Label style={styles.welcomeBtnLabel}>Let's Go</Button.Label>
                            </Button>
                        </Card.Body>
                    </Card>
                </BlurView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    safeArea: { flex: 1, justifyContent: 'space-between' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 16,
    },
    headerLeft: { gap: 4 },
    greeting: {
        fontFamily: 'System',
        fontSize: 22,
        fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
        letterSpacing: -0.3,
    },
    subRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dateLabel: {
        fontFamily: 'System',
        fontSize: 13,
        fontWeight: '400',
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        borderWidth: StyleSheet.hairlineWidth,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: {
        fontFamily: 'System',
        fontSize: 12,
        fontWeight: '600',
    },
    addBtn: {
        width: 40,
        height: 40,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hairline: { height: StyleSheet.hairlineWidth, marginHorizontal: 24 },
    centerContent: { flex: 1 },
    actionsArea: { paddingBottom: 32, paddingHorizontal: 24 },
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 16,
        paddingBottom: 48,
    },
    welcomeCard: { borderRadius: 24, overflow: 'hidden' },
    welcomeBody: { alignItems: 'center', padding: 32, gap: 16 },
    welcomeIconWrap: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeTitle: {
        fontFamily: 'System',
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    welcomeBody2: {
        fontFamily: 'System',
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
    welcomeBtn: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        marginTop: 8,
    },
    welcomeBtnLabel: {
        fontFamily: 'System',
        color: 'white',
        fontWeight: '600',
        fontSize: 17,
    },
});
