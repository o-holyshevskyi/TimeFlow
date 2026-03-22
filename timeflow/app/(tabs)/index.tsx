import AdBanner from '@/components/advertisment/ad-banner';
import Actions from '@/components/home/actions';
import MainContent from '@/components/home/content';
import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { Layout } from '@/constants/layout';
import { useUserStatus } from '@/hooks/user-status';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Button, Card, useThemeColor } from 'heroui-native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeInDown, FadeInLeft } from "react-native-reanimated";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TimerTab() {
    const background = useThemeColor('background');
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const accent = useThemeColor('accent');

    const { isPro, isChecking } = useUserStatus();
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        const checkFirstProTime = async () => {
            if (isPro && !isChecking) {
                const hasSeen = await AsyncStorage.getItem('has_seen_pro_welcome');
                if (!hasSeen) {
                    setShowWelcome(true);
                }
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

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
            <View style={styles.topBar}>
                <AppText style={[styles.appName, { color: foreground }]}>TimeFlow</AppText>
                <Pressable onPress={handleAddSession} style={[styles.addButton, { backgroundColor: accent + '20' }]}>
                    <Icon name="add-outline" color={accent} size={22} />
                </Pressable>
            </View>

            <Animated.View
                style={{ flex: 1 }}
                entering={FadeInLeft.delay(300).easing(Easing.ease).duration(600).damping(80)}
            >
                <MainContent />
            </Animated.View>

            <AdBanner isPro={!isChecking && isPro} />

            <Animated.View
                entering={FadeInDown.delay(300).easing(Easing.ease).duration(600).damping(80)}
                style={styles.actionsWrapper}
            >
                <Actions />
            </Animated.View>

            <Modal visible={showWelcome} animationType="fade" transparent={true}>
                <BlurView
                    intensity={30}
                    tint="dark"
                    style={[styles.overlay, { backgroundColor: background + '20' }]}
                >
                    <Card style={[styles.welcomeCard, { backgroundColor: background, borderColor: accent }]}>
                        <Card.Body style={styles.center}>
                            <View style={[styles.iconCircle, { backgroundColor: accent + '20' }]}>
                                <Icon name="ribbon" size={50} color={accent} />
                            </View>
                            <AppText style={[styles.title, { color: foreground }]}>
                                You are PRO! 🚀
                            </AppText>
                            <AppText style={[styles.description, { color: muted }]}>
                                Your lifetime access is active. Generate unlimited PDF invoices and manage your clients with no limits.
                            </AppText>
                            <Button
                                onPress={handleCloseWelcome}
                                style={[styles.button, { backgroundColor: accent }]}
                            >
                                <Button.Label style={{ color: foreground, fontWeight: '800' }}>
                                    Start Tracking
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
        paddingVertical: Layout.spacing * 2,
    },
    appName: {
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: -0.5,
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
    center: {
        alignItems: 'center',
        padding: 32,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    button: {
        width: '100%',
        height: 56,
        borderRadius: 16,
    },
});
