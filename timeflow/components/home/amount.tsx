import { Layout } from "@/constants/layout";
import { useTimer } from "@/contexts/timer-context";
import { useClients } from "@/hooks/use-clients";
import { useSettings } from "@/hooks/use-settings";
import { useThemeColor } from "heroui-native";
import { useEffect, useMemo, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { formatCurrency } from "react-native-format-currency";
import { AppText } from "../ui/app-text";
import { Ticker } from "./timer";

const CARD_WIDTH = Dimensions.get('screen').width * 0.88;

const EarnedAmount = () => {
    const muted = useThemeColor('muted');
    const accent = useThemeColor('accent');
    const danger = useThemeColor('danger');
    const foreground = useThemeColor('foreground');
    const surface = useThemeColor('surface');

    const { clientId } = useTimer();
    const { clients } = useClients();
    const { settings } = useSettings();
    const { elapsedTime, sessionStoppedByLimit } = useTimer();

    const [rate, setRate] = useState<string | undefined>(undefined);
    const selectedClient = useMemo(() => clients.find(cl => cl.id === clientId), [clients, clientId]);

    useEffect(() => {
        if (clientId && selectedClient) {
            setRate(selectedClient.defaultRate);
        } else if (settings?.rate) {
            setRate(settings.rate);
        }
    }, [clientId, selectedClient, settings]);

    const amount = useMemo(() => {
        if (!rate || elapsedTime === 0) return 0;
        return Number(rate) * (elapsedTime / (1000 * 60 * 60));
    }, [elapsedTime, rate]);

    const formattedAmount = useMemo(() => {
        if (!settings?.currency) return "$0.00";
        const [formatted] = formatCurrency({ amount: parseInt(Math.round(amount * 100) / 100 + ''), code: settings.currency });
        return formatted;
    }, [amount, settings?.currency]);

    const formattedRate = useMemo(() => {
        if (!settings?.currency || !rate) return "$0.00";
        const [formatted] = formatCurrency({ amount: Math.round(parseInt(rate) * 100) / 100, code: settings.currency });
        return formatted;
    }, [settings, rate]);

    const clientColor = selectedClient?.color || accent;

    return (
        <View style={styles.wrapper}>
            {/* Clean bordered card */}
            <View style={[styles.card, {
                backgroundColor: surface,
                borderColor: muted + '25',
                borderWidth: 1,
            }]}>
                {/* Label row */}
                <View style={styles.labelRow}>
                    <AppText style={[styles.label, { color: muted }]}>EARNED</AppText>
                    {selectedClient && (
                        <View style={[styles.clientChip, {
                            backgroundColor: clientColor + '15',
                            borderColor: clientColor + '35',
                            borderWidth: 1,
                        }]}>
                            <View style={[styles.clientDot, { backgroundColor: clientColor }]} />
                            <AppText style={[styles.clientName, { color: clientColor }]}>
                                {selectedClient.name}
                            </AppText>
                        </View>
                    )}
                </View>

                {/* Amount ticker */}
                <Ticker value={formattedAmount} />

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: muted + '15' }]} />

                {/* Rate row */}
                <View style={styles.rateRow}>
                    <AppText style={[styles.rateLabel, { color: muted }]}>Hourly rate</AppText>
                    <AppText style={[styles.rateValue, { color: foreground }]}>
                        {formattedRate}/hr
                    </AppText>
                </View>
            </View>

            {sessionStoppedByLimit && (
                <View style={[styles.limitWarning, {
                    backgroundColor: danger + '10',
                    borderColor: danger + '30',
                    borderWidth: 1,
                }]}>
                    <AppText style={[styles.limitWarningText, { color: danger }]}>
                        Timer auto-stopped after 16 hours
                    </AppText>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        gap: 16,
    },
    card: {
        width: CARD_WIDTH,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 24,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    clientChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 20,
    },
    clientDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    clientName: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    divider: {
        height: 1,
    },
    rateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rateLabel: {
        fontSize: 12,
        fontWeight: '400',
    },
    rateValue: {
        fontSize: 13,
        fontWeight: '600',
    },
    limitWarning: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    limitWarningText: {
        fontWeight: '500',
        fontSize: 13,
    },
});

export default EarnedAmount;
