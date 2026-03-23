import AdBanner from '@/components/advertisment/ad-banner';
import Actions from '@/components/home/actions';
import MainContent from '@/components/home/content';
import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { Layout } from '@/constants/layout';
import { useTimer } from '@/contexts/timer-context';
import { useUserStatus } from '@/hooks/user-status';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Button, Card, useThemeColor } from 'heroui-native';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeInDown, FadeInLeft, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from 'react-native-safe-area-context';

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

function getFormattedDate(): string {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });
}

export default function TimerTab() {
    const background = useThemeColor('background');
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const accent = useThemeColor('accent');
    const surface = useThemeColor('surface');

    const { isPro, isChecking } = useUserStatus();
    const { isTracking, isPaused } = useTimer();
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        const checkFirstProTime = async () => {
            if (isPro && !isChecking) {
                const hasSeen = await AsyncStorage.getItem('has_seen_pro_welcome');
                if (!hasSeen) setShowWelcome(true);
            }
        };
        checkFirstProTime();
    }, [isPro, isChecking]);

    const handleCloseWelcome = async () => {
        setShowWelcome(false);
        await AsyncStorage.setItem('has_seen_pro_welcome', 'true');
    };

    const handleAddSession = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/modals/new-session');
    };

    const statusLabel = useMemo(() => {
        if (isTracking && !isPaused) return { text: 'Tracking', color: accent };
        if (isPaused) return { text: 'Paused', color: '#eab308' };
        return null;
    }, [isTracking, isPaused, accent]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
            {/* Top bar */}
            <Animated.View
                style={styles.topBar}
                entering={FadeInUp.delay(200).easing(Easing.ease).duration(500)}
            >
                <View style={styles.topBarLeft}>
                    <AppText style={[styles.greeting, { color: foreground }]}>
                        {getGreeting()}
                    </AppText>
                    <View style={styles.dateRow}>
                        <AppText style={[styles.dateText, { color: muted }]}>
                            {getFormattedDate()}
                        </AppText>
                        {statusLabel && (
                            <View style={[styles.statusChip, { backgroundColor: statusLabel.color + '20' }]}>
                                <View style={[styles.statusDot, { backgroundColor: statusLabel.color }]} />
                                <AppText style={[styles.statusText, { color: statusLabel.color }]}>
                                    {statusLabel.text}
                                </AppText>
                            </View>
                        )}
                    </View>
                </View>
                <Pressable
                    onPress={handleAddSession}
                    style={[styles.addButton, { backgroundColor: surface }]}
                >
                    <Icon name="add-outline" color={muted} size={22} />
                </Pressable>
            </Animated.View>

            {/* Timer + earnings */}
            <Animated.View
                style={{ flex: 1 }}
                entering={FadeInLeft.delay(300).easing(Easing.ease).duration(600).damping(80)}
            >
                <MainContent />
            </Animated.View>

            <AdBanner isPro={!isChecking && isPro} />

            {/* Action buttons */}
            <Animated.View
                entering={FadeInDown.delay(300).easing(Easing.ease).duration(600).damping(80)}
                style={styles.actionsWrapper}
            >
                <Actions />
            </Animated.View>

            {/* PRO welcome modal */}
            <Modal visible={showWelcome} animationType="fade" transparent={true}>
                <BlurView
                    intensity={30}
                    tint="dark"
                    style={[styles.overlay, { backgroundColor: background + '20' }]}
                >
                    <Card style={[styles.welcomeCard, { backgroundColor: background, borderColor: accent }]}>
                        <Card.Body style={styles.welcomeBody}>
                            <View style={[styles.welcomeIconCircle, { backgroundColor: accent + '20' }]}>
                                <Icon name="ribbon" size={44} color={accent} />
                            </View>
                            <AppText style={[styles.welcomeTitle, { color: foreground }]}>
                                You're PRO! 🚀
                            </AppText>
                            <AppText style={[styles.welcomeDesc, { color: muted }]}>
                                Lifetime access is active. Unlimited invoices, clients, and analytics are all yours.
                            </AppText>
                            <Button
                                onPress={handleCloseWelcome}
                                style={[styles.welcomeBtn, { backgroundColor: accent }]}
                            >
                                <Button.Label style={{ color: foreground, fontWeight: '700', fontSize: 16 }}>
                                    Let's Go
                                </Button.Label>
                            </Button>
                        </Card.Body>
                    </Card>
                </BlurView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Layout.spacing * 4,
        paddingTop: Layout.spacing * 2,
        paddingBottom: Layout.spacing,
    },
    topBarLeft: {
        gap: 4,
    },
    greeting: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateText: {
        fontSize: 13,
    },
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    addButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionsWrapper: {
        paddingBottom: Layout.spacing * 3,
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    welcomeCard: {
        width: '100%',
        borderRadius: 24,
        borderWidth: 1,
    },
    welcomeBody: {
        alignItems: 'center',
        padding: 28,
        gap: 16,
    },
    welcomeIconCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: 26,
        fontWeight: '900',
        textAlign: 'center',
    },
    welcomeDesc: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
    welcomeBtn: {
        width: '100%',
        height: 52,
        borderRadius: 14,
        marginTop: 4,
    },
});
