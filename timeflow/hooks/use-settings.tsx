import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast, useToast } from 'heroui-native';
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";

export type Settings = {
    currency?: string;
    rate?: string;
}

export const useSettings = () => {
    const [settings, setSettings] = useState<Settings | undefined>();

    const { toast } = useToast();
    
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
        
        toast.show({
            component: (props) => (
                <Toast variant="default" placement="top" className="bg-[#0f172aff] border-[#334155] border-1 p-5" {...props}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Toast.Label style={{ fontSize: 22 }}>Settings saved!</Toast.Label>
                            <Toast.Description style={{ fontSize: 16 }}>Your preferences were updated</Toast.Description>
                        </View>                       
                        <Toast.Close />
                    </View>
                </Toast>
            ),
        });

    }, [toast]);

    useEffect(() => {
        loadSettings();
    }, []);
    
    return {
        settings,

        saveSettings,
    };
}