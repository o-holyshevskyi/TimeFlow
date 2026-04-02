import { calculateAmount, formatTime } from "@/components/sessions/session-card";
import CurrencySelect from "@/components/settings/currency-select";
import { AppText } from "@/components/ui/app-text";
import ClientSelect from "@/components/ui/client-select";
import DateTimeSelect from "@/components/ui/date-time-select";
import { DurationInput } from "@/components/ui/duration-input";
import { EarningsInput } from "@/components/ui/earnings-input";
import HourlyRateInput from "@/components/ui/hourly-rate";
import { useClients } from "@/hooks/use-clients";
import { useSessions } from "@/hooks/use-sessions";
import { useSettings } from "@/hooks/use-settings";
import { router } from "expo-router";
import { Button, Toast, useThemeColor, useToast } from "heroui-native";
import { useEffect, useMemo, useState } from "react";
import { Platform, PlatformColor, StyleSheet, View } from "react-native";
import BaseModal from "./base-modal";

const CELL_BG: any = Platform.OS === 'ios'
    ? PlatformColor('secondarySystemGroupedBackground')
    : undefined;

export default function NewSessionModal() {
    const [startTime, setStartTime] = useState<Date>(new Date());
    const [endTime, setEndTime] = useState<Date>(new Date(new Date().getTime() + 60 * 60 * 1000));
    const [rate, setRate] = useState<undefined | string>(undefined);
    const [currency, setCurrency] = useState<undefined | string>(undefined);
    const [clientId, setClientId] = useState<string | undefined>(undefined);
    const [saveError, setSaveError] = useState<undefined | string>(undefined);
    const [canSave, setCanSave] = useState(false);

    const { settings } = useSettings();
    const { addManualSession } = useSessions();
    const { toast } = useToast();
    const { clients } = useClients();

    const muted = useThemeColor('muted');
    const danger = useThemeColor('danger');
    const accent = useThemeColor('accent');
    const surface = useThemeColor('surface');
    const background = useThemeColor('background');

    const cellBg = CELL_BG ?? surface;

    useEffect(() => {
        if (settings) {
            setRate(settings.rate);
            setCurrency(settings.currency);
        }
    }, [settings]);

    useEffect(() => {
        if (clientId) {
            const client = clients.find(c => c.id === clientId);
            if (client?.defaultRate && parseFloat(client.defaultRate) > 0) {
                setRate(client.defaultRate);
            } else {
                if (settings?.rate) setRate(settings.rate);
            }
        } else {
            if (settings?.rate) setRate(settings.rate);
        }
    }, [clientId, clients, settings]);

    useEffect(() => {
        if (startTime.getTime() > endTime.getTime()) {
            setSaveError("End time must be after start time.");
            setCanSave(false);
        } else if (startTime.getTime() === endTime.getTime()) {
            setSaveError("Start and end times must be different.");
            setCanSave(false);
        } else if (!rate || parseFloat(rate) <= 0) {
            setSaveError("Please enter a valid hourly rate.");
            setCanSave(false);
        } else {
            setSaveError(undefined);
            setCanSave(true);
        }
    }, [startTime, endTime, rate]);

    const { duration } = formatTime(endTime.getTime() - startTime.getTime());
    const amount = useMemo(() => {
        return calculateAmount(endTime.getTime() - startTime.getTime(), rate || '0', currency || 'USD');
    }, [endTime, startTime, rate, currency]);

    const handleSave = async () => {
        if (!rate || !currency) return;
        const success = await addManualSession(
            startTime.getTime(),
            endTime.getTime(),
            parseFloat(rate),
            currency,
            clientId
        );
        if (success) {
            router.back();
            toast.show({
                component: (props) => (
                    <Toast
                        variant="default"
                        placement="top"
                        style={{ backgroundColor: background, borderColor: muted + '30' }}
                        className="border-1 p-5" {...props}
                    >
                        <View>
                            <Toast.Label style={{ fontSize: 17, fontWeight: '600' }}>Session Saved</Toast.Label>
                            <Toast.Description style={{ fontSize: 15 }}>Your session has been added.</Toast.Description>
                        </View>
                    </Toast>
                ),
            });
        } else {
            setSaveError("Failed to save session");
        }
    };

    return (
        <BaseModal>
            {/* Time section */}
            <View style={styles.section}>
                <AppText style={[styles.sectionLabel, { color: muted }]}>TIME</AppText>
                <View style={[styles.sectionCard, { backgroundColor: cellBg }]}>
                    <DateTimeSelect value={startTime} label="Start Time" onDateChange={setStartTime} />
                    <View style={[styles.divider, { backgroundColor: muted + '30', marginLeft: 16 }]} />
                    <DateTimeSelect value={endTime} label="End Time" onDateChange={setEndTime} />
                </View>
            </View>

            {/* Client section */}
            {clients.length > 0 && (
                <View style={styles.section}>
                    <AppText style={[styles.sectionLabel, { color: muted }]}>CLIENT</AppText>
                    <View style={[styles.sectionCard, { backgroundColor: cellBg }]}>
                        <ClientSelect selectedClientId={clientId} onClientSelect={setClientId} />
                    </View>
                </View>
            )}

            {/* Rate section */}
            <View style={styles.section}>
                <AppText style={[styles.sectionLabel, { color: muted }]}>RATE</AppText>
                <View style={[styles.sectionCard, { backgroundColor: cellBg }]}>
                    <View style={styles.rateRow}>
                        <View style={{ flex: 1 }}>
                            <HourlyRateInput rate={rate} setRate={setRate} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <CurrencySelect initialCurrency={currency} onCurrencySelect={setCurrency} />
                        </View>
                    </View>
                </View>
            </View>

            {/* Summary section */}
            <View style={styles.section}>
                <AppText style={[styles.sectionLabel, { color: muted }]}>SUMMARY</AppText>
                <View style={[styles.sectionCard, { backgroundColor: cellBg }]}>
                    <View style={styles.summaryRow}>
                        <DurationInput duration={duration} />
                        <View style={{ flex: 2 }}>
                            <EarningsInput amount={amount} />
                        </View>
                    </View>
                </View>
            </View>

            {/* Save */}
            <View style={styles.saveContainer}>
                {saveError && (
                    <AppText style={[styles.errorText, { color: danger }]}>{saveError}</AppText>
                )}
                <Button
                    isDisabled={!canSave}
                    onPress={handleSave}
                    style={[styles.saveBtn, { backgroundColor: canSave ? accent : muted + '40' }]}
                >
                    <Button.Label style={{ color: 'white', fontSize: 17, fontWeight: '600' }}>
                        Save Session
                    </Button.Label>
                </Button>
            </View>
        </BaseModal>
    );
}

const styles = StyleSheet.create({
    section: {
        gap: 8,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginLeft: 16,
    },
    sectionCard: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    divider: {
        height: StyleSheet.hairlineWidth,
    },
    rateRow: {
        flexDirection: 'row',
        gap: 16,
        padding: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        gap: 16,
    },
    saveContainer: {
        gap: 8,
        marginTop: 8,
    },
    errorText: {
        fontSize: 13,
        textAlign: 'center',
    },
    saveBtn: {
        height: 50,
        borderRadius: 10,
    },
});
