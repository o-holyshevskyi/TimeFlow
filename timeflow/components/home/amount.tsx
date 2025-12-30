import { Layout } from "@/constants/layout";
import { useTimer } from "@/contexts/timer-context";
import { useClients } from "@/hooks/use-clients";
import { useSettings } from "@/hooks/use-settings";
import { Card, useThemeColor } from "heroui-native";
import { useEffect, useMemo, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { formatCurrency } from "react-native-format-currency";
import { Ticker } from "./timer";

const CARD_WIDTH = Dimensions.get('screen').width * .9;

const EarnedAmount = () => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');

    const { clientId } = useTimer();
    const { clients } = useClients();
    const { settings } = useSettings();
    const { elapsedTime, sessionStoppedByLimit } = useTimer();

    const [rate, setRate] = useState<string | undefined>(undefined);

    const selectedClient = useMemo(() => clients.find(cl => cl.id === clientId), [clients, clientId])

    useEffect(() => {
        if (clientId) {
            if (selectedClient) {
                const rate = selectedClient.defaultRate;
                setRate(rate);
            }
        } else if (settings?.rate) {
            setRate(settings.rate);
        }
    }, [clientId, selectedClient, settings]);
    
    const amount = useMemo(() => {
        if (!rate || elapsedTime === 0) return 0;

        const _rate = Number(rate);
        const timeInHours = elapsedTime / (1000 * 60 * 60);
        
        return _rate * timeInHours;
    }, [elapsedTime, rate]);

    const formattedAmount = useMemo(() => {
        if (!settings?.currency) return "$0.00";
        
        const roundedAmount = Math.round(amount * 100) / 100;

        const [formatted] = formatCurrency({
            amount: parseInt(roundedAmount.toFixed()),
            code: settings.currency,
        });
        return formatted;
    }, [amount, settings?.currency]);

    const formattedRate = useMemo(() => {
        if (!settings?.currency || !rate) return "$0.00";
        
        const _rate = parseInt(rate);
        const roundedRate = Math.round(_rate * 100) / 100;

        const [formatted] = formatCurrency({
            amount: roundedRate,
            code: settings.currency,
        });
        return formatted;
    }, [settings, rate]);

    return <View>
        <Card style={[styles.card]}>
            <Card.Header>
                <Text style={[{ color: muted }, styles.title]}>
                    Earned Money
                </Text>
            </Card.Header>
            <Card.Body>
                {/* <Text style={[{ color: foreground }, styles.description]}>
                    {formattedAmount}
                </Text> */}
                <Ticker value={formattedAmount} />
            </Card.Body>
            <Card.Footer style={{ flexDirection: 'row', gap: Layout.spacing * 2, alignItems: 'center' }}>
                {selectedClient && (<>
                    <View style={{ 
                        width: 10, 
                        height: 10, 
                        borderRadius: 5, 
                        backgroundColor: selectedClient?.color || '#2bee6c' 
                    }} />
                    <Text style={{ 
                        color: selectedClient?.color || '#2bee6c', 
                        fontSize: 18, 
                        fontWeight: '700',
                        textTransform: 'uppercase',
                    }}>
                        {selectedClient?.name}
                    </Text>
                </>
                )}
                <Text style={{ color: muted, fontSize: 18 }}>
                    Rate: {formattedRate} / hour
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
