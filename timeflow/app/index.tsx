// import AdBanner from '@/components/advertisment/ad-banner';
import Actions from '@/components/home/actions';
import MainContent from '@/components/home/content';
import Header from '@/components/home/header';
import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { useUserStatus } from '@/hooks/user-status';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { Button, Card, useThemeColor } from 'heroui-native';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeInDown, FadeInLeft, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
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

    return <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
        <Animated.View
            entering={FadeInUp.delay(500).easing(Easing.ease).duration(600).damping(80)}
        >
            <Header />
        </Animated.View>
        <Animated.View
            style={{ flex: 1 }}
            entering={FadeInLeft.delay(500).easing(Easing.ease).duration(600).damping(80)}
        >
            <MainContent />
        </Animated.View>
        {/* <AdBanner isPro={!isChecking && isPro} /> */}
        <Animated.View
            entering={FadeInDown.delay(500).easing(Easing.ease).duration(600).damping(80)}
        >
            <Actions />
        </Animated.View>

        <Modal visible={showWelcome} animationType="fade" transparent={true}>
            <BlurView
                intensity={30}
                tint="dark"
                style={styles.overlay}
            >
                <Card style={[styles.welcomeCard, { backgroundColor: background }]}>
                    <Card.Body style={styles.center}>
                        <View style={styles.iconCircle}>
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
                            style={styles.button}
                        >
                            <Button.Label style={{ color: 'black', fontWeight: '800' }}>
                                Start Tracking
                            </Button.Label>
                        </Button>
                    </Card.Body>
                </Card>
            </BlurView>
        </Modal>
    </SafeAreaView>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(23, 23, 23, 0.62)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    welcomeCard: {
        width: '100%',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#2bee6c',
    },
    center: {
        alignItems: 'center',
        padding: 32,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(78, 250, 21, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 12,
        textAlign: 'center'
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24
    },
    button: {
        width: '100%',
        height: 56,
        backgroundColor: '#2bee6c',
        borderRadius: 16
    }
});