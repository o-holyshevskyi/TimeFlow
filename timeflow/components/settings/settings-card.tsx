import { Layout } from "@/constants/layout";
import { useTimer } from "@/contexts/timer-context";
import { useSettings } from "@/hooks/use-settings";
import { Button, Toast, useThemeColor, useToast } from "heroui-native";
import { useCallback, useEffect, useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import { AppText } from "../ui/app-text";
import HourlyRateInput from "../ui/hourly-rate";
import CurrencySelect from "./currency-select";

const SettingsCard = () => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const accent = useThemeColor('accent');
    const surface = useThemeColor('surface');
    const background = useThemeColor('background');

    const [rate, setRate] = useState<undefined | string>(undefined);
    const [currency, setCurrency] = useState<undefined | string>(undefined);

    const { settings, saveSettings } = useSettings();
    const { toast } = useToast();
    const { isTracking } = useTimer();

    useEffect(() => {
        if (settings) {
            setRate(settings.rate);
            setCurrency(settings.currency);
        }
    }, [settings]);

    const showToast = useCallback(() => {
        toast.show({
            component: (props) => (
                <Toast
                    variant="default"
                    placement="top"
                    style={{ backgroundColor: background, borderColor: accent }}
                    className="border-1 p-5"
                    {...props}
                >
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
    }, [toast, background, accent]);

    const handleSaveRate = useCallback(async () => {
        await saveSettings({ currency, rate, notificationsEnabled: settings?.notificationsEnabled ?? true });
        showToast();
        Keyboard.dismiss();
    }, [currency, rate, saveSettings, showToast, settings]);

    return (
        <View>
            <AppText style={[styles.sectionLabel, { color: muted }]}>HOURLY RATE</AppText>
            <View style={[styles.section, { backgroundColor: surface }]}>
                <View style={styles.inputRow}>
                    <View style={{ flex: 1 }}>
                        <HourlyRateInput rate={rate} setRate={setRate} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <CurrencySelect initialCurrency={currency} onCurrencySelect={setCurrency} />
                    </View>
                </View>
                <View style={[styles.divider, { backgroundColor: muted + '20' }]} />
                <Button
                    isDisabled={isTracking}
                    onPress={handleSaveRate}
                    feedbackVariant="ripple"
                    size="lg"
                    style={{ borderRadius: 12, backgroundColor: accent }}
                    animation={{
                        ripple: {
                            backgroundColor: { value: foreground },
                            opacity: { value: [0, 0.3, 0] },
                        },
                        scale: { value: 1.02 }
                    }}
                >
                    <Button.Label style={{ fontSize: 16, fontWeight: '600', color: foreground }}>
                        Save Rate
                    </Button.Label>
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 8,
        marginLeft: 4,
    },
    section: {
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    inputRow: {
        flexDirection: 'row',
        gap: Layout.spacing * 2,
    },
    divider: {
        height: 1,
    },
});

export default SettingsCard;
