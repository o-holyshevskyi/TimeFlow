import '@/global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { TimerProvider } from '@/contexts/timer-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { HeroUINativeProvider } from 'heroui-native';

import {
    getTrackingPermissionsAsync,
    PermissionStatus,
    requestTrackingPermissionsAsync,
} from 'expo-tracking-transparency';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import mobileAds from 'react-native-google-mobile-ads';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

SplashScreen.preventAutoHideAsync();

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
            <HeroUINativeProvider>
                <TimerProvider>
                    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                        <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="index" options={{ headerShown: false }} />
                        </Stack>
                        <StatusBar style="auto" />
                    </ThemeProvider>
                </TimerProvider>
            </HeroUINativeProvider>
        </GestureHandlerRootView>
    );
}
