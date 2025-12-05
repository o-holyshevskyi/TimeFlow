import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

export type Settings = {
    currency?: string;
    rate?: string;
}

export const useSettings = () => {
    const [settings, setSettings] = useState<Settings | undefined>();
    
    const loadSettings = useCallback(async () => {
        const stored = await AsyncStorage.getItem('settings');        
        if (stored) {
            const parsed = JSON.parse(stored) as Settings;
            if (parsed) setSettings(parsed);
        }
    }, []);
    
    const saveSettings = useCallback(async (settings: Settings) => {
        await AsyncStorage.setItem('settings', JSON.stringify(settings));
        setSettings(settings);
    }, []);

    useEffect(() => {
        loadSettings();
    }, []);
    
    return {
        settings,

        saveSettings,
    };
}