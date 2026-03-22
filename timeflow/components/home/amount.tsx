import { Layout } from "@/constants/layout";
import { useTimer } from "@/contexts/timer-context";
import { useClients } from "@/hooks/use-clients";
import { useSettings } from "@/hooks/use-settings";
import { useThemeColor } from "heroui-native";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { formatCurrency } from "react-native-format-currency";
import { AppText } from "../ui/app-text";
import { Ticker } from "./timer";

const EarnedAmount = () => {
    const muted = useThemeColor('muted');
    const accent = useThemeColor('accent');
    const danger = useThemeColor('danger');
    const foreground = useThemeColor('foreground');

    const { clientId } = useTimer();
    const { clients } = useClients();
    const { settings } = useSettings();
    const { elapsedTime, sessionStoppedByLimit } = useTimer();

    const [rate, setRate] = useState<string | undefined>(undefined);

    const selectedClient = useMemo(() => clients.find(cl => cl.id === clientId), [clients, clientId]);

    useEffect(() => {
        if (clientId) {
            if (selectedClient) {
                setRate(selectedClient.defaultRate);
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

    return (
        <View style={styles.container}>
            <AppText style={[styles.label, { color: muted }]}>EARNED</AppText>
            <Ticker value={formattedAmount} />
            <View style={styles.metaRow}>
                {selectedClient && (
                    <View style={styles.clientChip}>
                        <View style={[styles.clientDot, { backgroundColor: selectedClient?.color || accent }]} />
                        <AppText style={[styles.clientName, { color: selectedClient?.color || accent }]}>
                            {selectedClient?.name}
                        </AppText>
                    </View>
                )}
                <AppText style={[styles.rateText, { color: muted }]}>
                    {formattedRate}/hr
                </AppText>
            </View>
            {sessionStoppedByLimit && (
                <View style={[styles.limitWarning, { backgroundColor: danger + '20' }]}>
                    <AppText style={[styles.limitWarningText, { color: danger }]}>
                        Timer auto-stopped (16h limit exceeded).
                    </AppText>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: Layout.spacing * 2,
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 2,
        textTransform: 'uppercase',
        opacity: 0.6,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Layout.spacing * 3,
    },
    clientChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Layout.spacing,
    },
    clientDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    clientName: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    rateText: {
        fontSize: 14,
    },
    limitWarning: {
        marginTop: Layout.spacing * 2,
        padding: Layout.spacing * 4,
        borderRadius: 16,
        alignItems: 'center',
    },
    limitWarningText: {
        fontWeight: '600',
        fontSize: 14,
    },
});

export default EarnedAmount;
