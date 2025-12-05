import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export type Settings = {
    currency?: string;
    rate?: string;
}

export const SETTINGS_STORAGE_KEY = 'settingsTest';

export const useSettings = () => {
    const [settings, setSettings] = useState<Settings | undefined>();
    
    const loadSettings = useCallback(async () => {
        const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);        
        if (stored) {
            const parsed = JSON.parse(stored) as Settings;
            if (parsed) setSettings(parsed);
        }
        // await AsyncStorage.clear();
    }, []);
    
    const saveSettings = useCallback(async (settings: Settings) => {
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        setSettings(settings);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadSettings();
        }, [loadSettings])
    );
    
    return {
        settings,

        saveSettings,
    };
}