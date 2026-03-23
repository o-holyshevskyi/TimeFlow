import { Layout } from "@/constants/layout";
import { useTimer } from "@/contexts/timer-context";
import { useClients } from "@/hooks/use-clients";
import { useSettings } from "@/hooks/use-settings";
import { BlurView } from "expo-blur";
import { useThemeColor } from "heroui-native";
import { useEffect, useMemo, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { formatCurrency } from "react-native-format-currency";
import { useUniwind } from "uniwind";
import { AppText } from "../ui/app-text";
import { Ticker } from "./timer";

const CARD_WIDTH = Dimensions.get('screen').width * 0.88;

const EarnedAmount = () => {
    const muted = useThemeColor('muted');
    const accent = useThemeColor('accent');
    const danger = useThemeColor('danger');
    const foreground = useThemeColor('foreground');

    const { theme } = useUniwind();
    const isLightTheme = theme === 'light' || theme === 'nord';

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
            {/* Glass card */}
            <BlurView
                intensity={isLightTheme ? 40 : 20}
                tint={isLightTheme ? 'systemThinMaterialLight' : 'systemThinMaterialDark'}
                style={[styles.glassCard, { borderColor: accent + '30', borderWidth: 1 }]}
            >
                <AppText style={[styles.label, { color: muted }]}>EARNED</AppText>

                <Ticker value={formattedAmount} />

                <View style={styles.metaRow}>
                    {selectedClient && (
                        <View style={[styles.clientChip, { backgroundColor: clientColor + '25', borderColor: clientColor + '50', borderWidth: 1 }]}>
                            <View style={[styles.clientDot, { backgroundColor: clientColor }]} />
                            <AppText style={[styles.clientName, { color: clientColor }]}>
                                {selectedClient.name}
                            </AppText>
                        </View>
                    )}
                    <AppText style={[styles.rateText, { color: muted }]}>
                        {formattedRate}/hr
                    </AppText>
                </View>
            </BlurView>

            {sessionStoppedByLimit && (
                <View style={[styles.limitWarning, { backgroundColor: danger + '20', borderColor: danger + '40', borderWidth: 1 }]}>
                    <AppText style={[styles.limitWarningText, { color: danger }]}>
                        ⚠ Timer auto-stopped (16h limit exceeded)
                    </AppText>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        gap: Layout.spacing * 2,
    },
    glassCard: {
        width: CARD_WIDTH,
        borderRadius: 28,
        paddingVertical: 24,
        paddingHorizontal: 28,
        alignItems: 'center',
        gap: 10,
        overflow: 'hidden',
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 2.5,
        textTransform: 'uppercase',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 2,
    },
    clientChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    clientDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
    },
    clientName: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    rateText: {
        fontSize: 13,
        fontWeight: '500',
    },
    limitWarning: {
        padding: 12,
        borderRadius: 16,
        alignItems: 'center',
    },
    limitWarningText: {
        fontWeight: '600',
        fontSize: 13,
    },
});

export default EarnedAmount;
