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
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Button, Card, useThemeColor } from 'heroui-native';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeInDown, FadeInLeft, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

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

    const { theme } = useUniwind();

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
        if (isTracking && !isPaused) return { text: '● Tracking', color: accent };
        if (isPaused) return { text: '⏸ Paused', color: '#eab308' };
        return null;
    }, [isTracking, isPaused, accent]);

    const isLightTheme = theme === 'light' || theme === 'nord';

    return (
        <View style={styles.root}>
            {/* Full-screen gradient */}
            <LinearGradient
                colors={[background, accent + '28', background]}
                locations={[0.0, 0.42, 1.0]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={styles.container}>
                {/* Top bar */}
                <Animated.View
                    style={styles.topBar}
                    entering={FadeInUp.delay(150).easing(Easing.ease).duration(500)}
                >
                    <View>
                        <AppText style={[styles.greeting, { color: foreground }]}>
                            {getGreeting()}
                        </AppText>
                        <View style={styles.dateRow}>
                            <AppText style={[styles.dateText, { color: muted }]}>
                                {getFormattedDate()}
                            </AppText>
                            {statusLabel && (
                                <AppText style={[styles.statusText, { color: statusLabel.color }]}>
                                    {statusLabel.text}
                                </AppText>
                            )}
                        </View>
                    </View>
                    <Pressable
                        onPress={handleAddSession}
                        style={[styles.addButton, { backgroundColor: surface, borderColor: muted + '30', borderWidth: 1 }]}
                    >
                        <Icon name="add-outline" color={muted} size={20} />
                    </Pressable>
                </Animated.View>

                {/* Timer + earnings */}
                <Animated.View
                    style={{ flex: 1 }}
                    entering={FadeInLeft.delay(250).easing(Easing.ease).duration(600).damping(80)}
                >
                    <MainContent />
                </Animated.View>

                <AdBanner isPro={!isChecking && isPro} />

                {/* Action buttons */}
                <Animated.View
                    entering={FadeInDown.delay(250).easing(Easing.ease).duration(600).damping(80)}
                    style={styles.actionsWrapper}
                >
                    <Actions />
                </Animated.View>
            </SafeAreaView>

            {/* PRO welcome modal */}
            <Modal visible={showWelcome} animationType="fade" transparent={true}>
                <BlurView
                    intensity={30}
                    tint={isLightTheme ? 'systemThinMaterialLight' : 'systemThinMaterialDark'}
                    style={[styles.overlay]}
                >
                    <Card style={[styles.welcomeCard, { backgroundColor: background, borderColor: accent + '50', borderWidth: 1 }]}>
                        <Card.Body style={styles.welcomeBody}>
                            <LinearGradient
                                colors={[accent + '40', accent + '10']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.welcomeIconCircle}
                            >
                                <Icon name="ribbon" size={44} color={accent} />
                            </LinearGradient>
                            <AppText style={[styles.welcomeTitle, { color: foreground }]}>
                                You're PRO! 🚀
                            </AppText>
                            <AppText style={[styles.welcomeDesc, { color: muted }]}>
                                Lifetime access is active. Unlimited invoices, clients, and analytics — all yours.
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
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
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
    greeting: {
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 2,
    },
    dateText: {
        fontSize: 13,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionsWrapper: {
        paddingBottom: Layout.spacing * 4,
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    welcomeCard: {
        width: '100%',
        borderRadius: 28,
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
