import '@/global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { TimerProvider } from '@/contexts/timer-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { HeroUINativeProvider } from 'heroui-native';

import Constants from 'expo-constants';
import {
    getTrackingPermissionsAsync,
    PermissionStatus,
    requestTrackingPermissionsAsync,
} from 'expo-tracking-transparency';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
    anchor: '(tabs)',
};

const IS_EXPO_GO = Constants.appOwnership === 'expo';
const IS_TESTING_LOCALLY = __DEV__;

const SHOULD_INITIALIZE_ADMOB = !IS_EXPO_GO && IS_TESTING_LOCALLY;

async function initializeAdMobAndATT() {
    try {
        // 1. DYNAMICALLY IMPORT ADMOB HERE
        const AdMobModule = (await import('react-native-google-mobile-ads'));
        const mobileAds = AdMobModule.default; // Get the default export

        // 2. Handle ATT (Keep conditional check for safety, though only runs if !IS_EXPO_GO)
        if (Platform.OS === 'ios') {
            const { status } = await getTrackingPermissionsAsync();
            if (status === PermissionStatus.UNDETERMINED) {
                await requestTrackingPermissionsAsync();
            }
        }
        
        // 3. Initialize AdMob using the dynamically imported module
        await mobileAds().initialize();
        console.log("AdMob initialized successfully.");
    } catch (e) {
        // If the dynamic import or initialization fails (e.g., in a weird environment), 
        // we log the error but allow the app to continue.
        console.error("AdMob initialization failed:", e);
    } finally {
        // Must ensure the splash screen is hidden
        SplashScreen.hideAsync();
    }
}

export default function RootLayout() {
    const colorScheme = useColorScheme();

    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        // Only run the dynamic import and initialization if we are NOT in Expo Go
        if (SHOULD_INITIALIZE_ADMOB) {
            initializeAdMobAndATT().then(() => setAppIsReady(true));
        } else {
            // Immediately set ready and hide splash screen for Expo Go
            SplashScreen.hideAsync();
            setAppIsReady(true);
        }
    }, []);

    if (!appIsReady) {
        return null;
    }

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
