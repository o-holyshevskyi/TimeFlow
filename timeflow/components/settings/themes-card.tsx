import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, useThemeColor } from "heroui-native";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Uniwind, useUniwind } from "uniwind";
import { AppText } from "../ui/app-text";

export const THEMES = [
    { id: 'midnight', name: 'Midnight', color: '#83e797', colors: ['#83e797', '#2bee6c'] },
    { id: 'ocean', name: 'Ocean', color: '#4da6ff', colors: ['#4da6ff', '#0066cc'] },
    { id: 'aura', name: 'Aura', color: '#b366ff', colors: ['#e0b3ff', '#b366ff'] },
    { id: 'nord', name: 'Nord', color: '#5e81ac', colors: ['#8db5e2', '#5e81ac'] },
];

export default function ThemesCard() {
    const { theme } = useUniwind();
    const accent = useThemeColor('accent');
    const foreground = useThemeColor('foreground');

    const handleThemeChange = async (themeId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Uniwind.setTheme(themeId as any);

        try {
            await AsyncStorage.setItem('user_theme', themeId);
            
            // Тут можна також додати збереження у Firestore, якщо користувач залогінений
            // saveThemeToCloud(themeId); 
        } catch (e) {
            console.error('Failed to save theme', e);
        }
    };

    return <Card className="bg-transparent border-none shadow-none">
        <Card.Body className="p-0">
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="px-4 py-2 gap-6"
            >
                {THEMES.map((t) => {
                    const isActive = t.id === theme;
                    
                    return (
                        <View key={t.id} className="items-center gap-2">
                            <TouchableOpacity 
                                onPress={() => handleThemeChange(t.id)}
                                className={`w-14 h-14 rounded-full items-center justify-center`}
                                activeOpacity={0.7}
                                style={{
                                    borderWidth: isActive ? 3 : 1,
                                    borderColor: isActive ? accent + '80' : 'transparent',
                                }}
                            >
                                <LinearGradient
                                    colors={t.colors as [string, string, ...string[]]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={{ 
                                        width: 45, // приблизно w-13
                                        height: 45, 
                                        borderRadius: 26,
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 4.65,
                                        elevation: 8,
                                    }}
                                />
                            </TouchableOpacity>
                            <AppText 
                                className={`text-xs font-medium`}
                                style={{ color: isActive ? accent : foreground }}
                            >
                                {t.name}
                            </AppText>
                        </View>
                    );
                })}
            </ScrollView>
        </Card.Body>
    </Card>
}