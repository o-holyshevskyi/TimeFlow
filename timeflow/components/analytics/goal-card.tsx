import { Layout } from "@/constants/layout";
import { Session } from "@/hooks/use-sessions";
import { useSettings } from "@/hooks/use-settings";
import { BlurView } from "expo-blur";
import { Card, useThemeColor } from "heroui-native";
import { useMemo } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { formatCurrency } from "react-native-format-currency";
import { GetProLabel } from "../sessions/header";
import { usePremiumToast } from "../ui/premium-toast";
import { calculatePeriodData } from "./summary-cards";

interface GoalCardProps {
    sessions: Session[];
    isPro: boolean; 
}

export const GoalCard = ({ sessions, isPro }: GoalCardProps) => {
    const { settings, saveGoal } = useSettings();
    const { showToast } = usePremiumToast();
    
    const targetAmount = parseInt(settings?.monthlyGoal || '0') || 5000;

    const muted = useThemeColor('muted');
    const foreground = useThemeColor('foreground');
    const accent = useThemeColor('accent');
    
    const { money: earnedThisMonth } = useMemo(() => 
        calculatePeriodData(sessions, 'month'), 
    [sessions]);

    const progress = Math.min((earnedThisMonth / targetAmount) * 100, 100);
    
    const formattedEarned = formatCurrency({ amount: parseFloat(earnedThisMonth.toFixed(2)), code: settings?.currency || 'USD' });
    const formattedTarget = formatCurrency({ amount: targetAmount, code: settings?.currency || 'USD' });

    const handlePress = () => {
        if (isPro) {
            Alert.prompt(
                "Set Monthly Goal",
                "Enter your target earnings for the month:",
                [
                    { text: "Cancel", style: "cancel" },
                    { 
                        text: "Save", 
                        onPress: (text?: string) => {
                            const newGoal = parseFloat(text || '');
                            if (!isNaN(newGoal) && newGoal > 0) {
                                saveGoal(newGoal);
                            }
                        }
                    }
                ],
                "plain-text",
                targetAmount.toString(),
                "numeric"
            );
        } else {
            showToast(
                '✨ PRO Feature Locked', 
                'Set Monthly Goal require PRO. Upgrade to unlock!'
            );
        }
    };

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
            <Card style={[styles.card, { backgroundColor: '#1C2D23' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Layout.spacing }}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: muted }}>Monthly Goal</Text>
                        {isPro && <Text style={{ fontSize: 12, color: accent, opacity: 0.8 }}>(Edit)</Text>}
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: accent }}>{progress.toFixed(0)}%</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: Layout.spacing * 2 }}>
                    <Text style={{ fontSize: 24, fontWeight: '900', color: foreground }}>
                        {formattedEarned[0]}
                    </Text>
                    <Text style={{ fontSize: 16, color: muted }}>
                        / {formattedTarget[0]}
                    </Text>
                </View>

                <View style={{ height: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 99 }}>
                    <View 
                        style={{ 
                            height: '100%', 
                            width: `${progress}%`, 
                            backgroundColor: accent, 
                            borderRadius: 99 
                        }} 
                    />
                </View>
                
                {!isPro && (
                    <BlurView
                        intensity={30}
                        tint="dark"
                        style={styles.blurOverlay}
                    >
                        <GetProLabel left={155} top={40} />
                    </BlurView>
                )}
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        paddingVertical: Layout.spacing * 3,
        minWidth: 150,
        borderRadius: Layout.borderRadius,
    },
    blurOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
