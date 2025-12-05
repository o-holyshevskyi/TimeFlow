import { Layout } from "@/constants/layout";
import { useTimer } from "@/contexts/timer-context";
import { useSettings } from "@/hooks/use-settings";
import { Card, useThemeColor } from "heroui-native";
import { useMemo } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { formatCurrency } from "react-native-format-currency";

const CARD_WIDTH = Dimensions.get('screen').width * .9;

const EarnedAmount = () => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');

    const { settings } = useSettings();
    const { elapsedTime, sessionStoppedByLimit } = useTimer();
    
    const amount = useMemo(() => {
        if (!settings?.rate || elapsedTime === 0) return 0;

        const rate = Number(settings.rate); // Погодинна ставка
        const timeInHours = elapsedTime / (1000 * 60 * 60); // Переведення мс у години
        
        return rate * timeInHours;
    }, [elapsedTime, settings?.rate]);

    const formattedAmount = useMemo(() => {
        if (!settings?.currency) return "$0.00";
        
        const roundedAmount = Math.round(amount * 100) / 100;

        const [formatted] = formatCurrency({
            amount: roundedAmount,
            code: settings.currency,
        });
        return formatted;
    }, [amount, settings?.currency]);

    const formattedRate = useMemo(() => {
        if (!settings?.currency || !settings.rate) return "$0.00";
        
        const rate = parseInt(settings.rate);
        const roundedRate = Math.round(rate * 100) / 100;

        const [formatted] = formatCurrency({
            amount: roundedRate,
            code: settings.currency,
        });
        return formatted;
    }, [settings]);

    return <View>
        <Card style={[styles.card]}>
            <Card.Header>
                <Text style={[{ color: muted }, styles.title]}>
                    Earned Money
                </Text>
            </Card.Header>
            <Card.Body>
                <Text style={[{ color: foreground }, styles.description]}>
                    {formattedAmount}
                </Text>
            </Card.Body>
            <Card.Footer>
                <Text style={{ color: muted, fontSize: 18 }}>
                    {formattedRate}/hour
                </Text>
            </Card.Footer>
        </Card>
        {sessionStoppedByLimit && (
            <View style={styles.limitWarning}>
                <Text style={styles.limitWarningText}>
                    Timer auto-stopped (16h limit exceeded).
                </Text>
            </View>
        )}
    </View>;
}

const styles = StyleSheet.create({
    card: {
        gap: Layout.spacing, 
        alignItems: 'center', 
        minWidth: CARD_WIDTH, 
        padding: Layout.spacing * 4, 
        backgroundColor: "rgba(43, 238, 108, 0.2)", 
        borderRadius: Layout.borderRadius
    },
    title: {
        fontSize: 24,
        fontWeight: 500
    },
    description: {
        fontSize: 45,
        fontWeight: 800
    },
    limitWarning: {
        marginTop: Layout.spacing * 2,
        padding: Layout.spacing * 4,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        borderRadius: Layout.borderRadius,
        alignItems: 'center',
    },
    limitWarningText: {
        color: '#FF4500',
        fontWeight: '600' as '600' | 'bold',
        fontSize: 16,
    }
});

export default EarnedAmount;
