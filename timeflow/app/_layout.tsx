import { TimerProvider } from '@/contexts/timer-context';
import '@/global.css';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { notificationService } from '@/services/notification-service';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
    getTrackingPermissionsAsync,
    PermissionStatus,
    requestTrackingPermissionsAsync,
} from 'expo-tracking-transparency';
import { HeroUINativeProvider } from 'heroui-native';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import mobileAds from 'react-native-google-mobile-ads';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: '(tabs)',
};

const REVENUECAT_API_KEY = Platform.select({
    ios: 'appl_lhCnDHLgksLgTozPyXrXEqQHHcd',
    android: 'test_kQhmpoBQNdkTZEsGYmtSwWUptrS',
});

async function initializeAdMobAndATT() {
    try {
        const { status } = await getTrackingPermissionsAsync();
        if (status === PermissionStatus.UNDETERMINED) {
            await requestTrackingPermissionsAsync();
        }

        await mobileAds().initialize();
        
        console.log("AdMob and ATT initialized successfully.");

    } catch (e) {
        console.error("Initialization failed:", e);
    } finally {
        SplashScreen.hideAsync();
    }
}

export default function RootLayout() {
    const colorScheme = useColorScheme();

    const [appIsReady, setAppIsReady] = useState(false);
    const [isConfigured, setIsConfigured] = useState(false);

    useEffect(() => {
        initializeAdMobAndATT();

        // 🔥 Викликаємо метод, який і отримує токен, І зберігає його в базу
        const setupNotifications = async () => {
            await notificationService.registerForPushNotifications();
        };
        setupNotifications();

        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            console.log("Notification received:", notification);
        });

        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            console.log("Notification tapped:", response);
        });

        return () => {
            notificationListener.remove();
            responseListener.remove();
        };
    }, []);

    useEffect(() => {
        initializeAdMobAndATT().then(() => setAppIsReady(true));
    }, []);

    useEffect(() => {
        if (REVENUECAT_API_KEY) {
            Purchases.setLogLevel(LOG_LEVEL.DEBUG);
            Purchases.configure({ apiKey: REVENUECAT_API_KEY });
        }

        const getConfigured = async () => {
            const configured = await Purchases.isConfigured();
            setIsConfigured(configured);
            await SplashScreen.hideAsync();
        }

        getConfigured();
    }, []);

    if (!isConfigured) return null;
    if (!appIsReady) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <HeroUINativeProvider
                config={{
                    textProps: {
                        allowFontScaling: false,
                        maxFontSizeMultiplier: 1.2,
                    }
                }}
            >
                <TimerProvider>
                    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                        <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="index" options={{ headerShown: false }} />
                            <Stack.Screen name="cards" options={{ headerShown: false, presentation: 'card' }} />
                            <Stack.Screen name="modals" options={{ headerShown: false, presentation: 'modal' }} />
                        </Stack>
                        <StatusBar style="auto" />
                    </ThemeProvider>
                </TimerProvider>
            </HeroUINativeProvider>
        </GestureHandlerRootView>
    );
}
