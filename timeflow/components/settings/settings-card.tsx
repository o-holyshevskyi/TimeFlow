import { useTimer } from "@/contexts/timer-context";
import { useSettings } from "@/hooks/use-settings";
import { useThemeColor } from "heroui-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import { AppText } from "../ui/app-text";
import HourlyRateInput from "../ui/hourly-rate";
import CurrencySelect from "./currency-select";

const SettingsCard = () => {
    const muted = useThemeColor('muted');
    const surface = useThemeColor('surface');

    const [rate, setRate] = useState<undefined | string>(undefined);
    const [currency, setCurrency] = useState<undefined | string>(undefined);

    const { settings, saveSettings } = useSettings();
    const { isTracking } = useTimer();

    const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        if (settings) {
            setRate(settings.rate);
            setCurrency(settings.currency);
        }
    }, [settings]);

    const triggerSave = useCallback((newRate: string | undefined, newCurrency: string | undefined) => {
        clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = setTimeout(() => {
            if (!isTracking && newRate && newCurrency) {
                saveSettings({
                    rate: newRate,
                    currency: newCurrency,
                    notificationsEnabled: settings?.notificationsEnabled ?? true,
                });
                Keyboard.dismiss();
            }
        }, 600);
    }, [isTracking, saveSettings, settings?.notificationsEnabled]);

    const handleRateChange = (newRate: string) => {
        setRate(newRate);
        triggerSave(newRate, currency);
    };

    const handleCurrencyChange = (newCurrency: string) => {
        setCurrency(newCurrency);
        triggerSave(rate, newCurrency);
    };

    return (
        <View>
            <AppText style={[styles.sectionLabel, { color: muted }]}>HOURLY RATE</AppText>
            <View style={[styles.section, { backgroundColor: surface }]}>
                <View style={styles.inputRow}>
                    <View style={{ flex: 1 }}>
                        <HourlyRateInput rate={rate} setRate={handleRateChange} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <CurrencySelect initialCurrency={currency} onCurrencySelect={handleCurrencyChange} />
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionLabel: {
        fontSize: 13,
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
        marginLeft: 16,
    },
    section: {
        borderRadius: 10,
        overflow: 'hidden',
        padding: 16,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 16,
    },
});

export default SettingsCard;
