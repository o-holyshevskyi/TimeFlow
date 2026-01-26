import { TimerProvider } from '@/contexts/timer-context';
import '@/global.css';
import { notificationService } from '@/services/notification-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { Uniwind, useUniwind } from 'uniwind';

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
    const { theme } = useUniwind();

    const [appIsReady, setAppIsReady] = useState(false);
    const [isConfigured, setIsConfigured] = useState(false);

    const isLightTheme = theme === 'nord' || theme === 'light';

    const loadSavedTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('user_theme');
            if (savedTheme) {
                console.log("Loading saved theme:", savedTheme);
                Uniwind.setTheme(savedTheme as any);
            }
        } catch (e) {
            console.error("Failed to load theme:", e);
        }
    };

    useEffect(() => {
        const prepare = async () => {
            try {
                // 1. Спочатку вантажимо тему (щоб не було "блимання" інтерфейсу)
                await loadSavedTheme();
                
                // 2. Потім ініціалізуємо рекламу і пермішени
                await initializeAdMobAndATT();
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
                // 3. Прибираємо сплеш скрін тільки коли все готово
                await SplashScreen.hideAsync();
            }
        };

        prepare();

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
        <GestureHandlerRootView style={{ flex: 1, }} className="bg-background">
            <HeroUINativeProvider
                config={{
                    textProps: {
                        allowFontScaling: false,
                        maxFontSizeMultiplier: 1.2,
                    }
                }}
            >
                <TimerProvider>
                    <ThemeProvider value={isLightTheme ? DefaultTheme : DarkTheme}>
                        <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="index" options={{ headerShown: false }} />
                            <Stack.Screen name="cards" options={{ headerShown: false, presentation: 'card' }} />
                            <Stack.Screen name="modals" options={{ headerShown: false, presentation: 'modal' }} />
                        </Stack>
                        <StatusBar style={isLightTheme ? 'dark' : 'light'} />
                    </ThemeProvider>
                </TimerProvider>
            </HeroUINativeProvider>
        </GestureHandlerRootView>
    );
}
