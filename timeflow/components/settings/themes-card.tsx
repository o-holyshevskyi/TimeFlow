import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from "heroui-native";
import { Platform, PlatformColor, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

const CELL_BG: any = Platform.OS === 'ios'
    ? PlatformColor('secondarySystemGroupedBackground')
    : undefined;
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
    const surface = useThemeColor('surface');

    const handleThemeChange = async (themeId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Uniwind.setTheme(themeId as any);
        try {
            await AsyncStorage.setItem('user_theme', themeId);
        } catch (e) {
            console.error('Failed to save theme', e);
        }
    };

    return (
        <View style={[styles.card, { backgroundColor: CELL_BG ?? surface }]}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {THEMES.map((t) => {
                    const isActive = t.id === theme;
                    return (
                        <View key={t.id} style={styles.themeItem}>
                            <TouchableOpacity
                                onPress={() => handleThemeChange(t.id)}
                                activeOpacity={0.7}
                                style={[
                                    styles.swatch,
                                    isActive && { borderColor: accent, borderWidth: 2.5 },
                                    !isActive && { borderColor: 'transparent', borderWidth: 2.5 },
                                ]}
                            >
                                <LinearGradient
                                    colors={t.colors as [string, string, ...string[]]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.gradient}
                                />
                            </TouchableOpacity>
                            <AppText style={[styles.themeName, { color: isActive ? accent : foreground }]}>
                                {t.name}
                            </AppText>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    scrollContent: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 24,
    },
    themeItem: {
        alignItems: 'center',
        gap: 6,
    },
    swatch: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    gradient: {
        width: 40,
        height: 40,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    themeName: {
        fontSize: 12,
        fontWeight: '500',
    },
});
