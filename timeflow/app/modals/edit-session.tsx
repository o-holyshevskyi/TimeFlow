import { calculateAmount, formatTime } from "@/components/sessions/session-card";
import CurrencySelect from "@/components/settings/currency-select";
import { AppText } from "@/components/ui/app-text";
import ClientSelect from "@/components/ui/client-select";
import DateTimeSelect from "@/components/ui/date-time-select";
import { DurationInput } from "@/components/ui/duration-input";
import { EarningsInput } from "@/components/ui/earnings-input";
import HourlyRateInput from "@/components/ui/hourly-rate";
import { Layout } from "@/constants/layout";
import { useClients } from "@/hooks/use-clients";
import { useSessions } from "@/hooks/use-sessions";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Toast, useThemeColor, useToast } from "heroui-native";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import BaseModal from "./base-modal";

export default function EditSessionModal() {
    const { id } = useLocalSearchParams();
    const { clients } = useClients();

    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const danger = useThemeColor('danger');
    const accent = useThemeColor('accent');
    const surface = useThemeColor('surface');
    const background = useThemeColor('background');

    const sessionId = Array.isArray(id) ? id[0] : id;
    const { getSessionById, editSession } = useSessions();
    const session = getSessionById(sessionId);

    const [startTime, setStartTime] = useState<number>(0);
    const [endTime, setEndTime] = useState<number>(0);
    const [rate, setRate] = useState<string>('');
    const [currency, setCurrency] = useState<string>('');
    const [clientId, setClientId] = useState<string | undefined>(undefined);

    const [saveError, setSaveError] = useState<undefined | string>(undefined);
    const [canSave, setCanSave] = useState(false);

    const { duration } = formatTime(endTime - startTime);
    const amount = useMemo(() => {
        return calculateAmount(endTime - startTime, rate || '0', session?.currency || 'USD');
    }, [endTime, startTime, rate, session?.currency]);

    const { toast } = useToast();

    useEffect(() => {
        if (session) {
            setStartTime(session.startTime);
            setEndTime(session.endTime);
            setRate(session.rate);
            setCurrency(session.currency);
            setClientId(session.clientId);
        }
    }, [session]);

    useEffect(() => {
        if (startTime > endTime) {
            setSaveError("End time must be after start time.");
            setCanSave(false);
        } else if (startTime === endTime) {
            setSaveError("Start and end times must be different.");
            setCanSave(false);
        } else if (parseFloat(rate) === 0 || isNaN(parseFloat(rate))) {
            setSaveError("Please enter a valid hourly rate.");
            setCanSave(false);
        } else {
            setSaveError(undefined);
            setCanSave(true);
        }
    }, [startTime, endTime, rate]);

    useEffect(() => {
        if (clientId) {
            const client = clients.find(c => c.id === clientId);
            if (client?.defaultRate && parseFloat(client.defaultRate) > 0) {
                setRate(client.defaultRate);
            }
        }
    }, [clientId, clients]);

    const showToast = () => {
        toast.show({
            component: (props) => (
                <Toast
                    variant="default"
                    placement="top"
                    style={{ backgroundColor: background, borderColor: muted + '30' }}
                    className="border-1 p-5" {...props}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Toast.Label style={{ fontSize: 22 }}>Session Updated</Toast.Label>
                            <Toast.Description style={{ fontSize: 16 }}>Your session has been updated.</Toast.Description>
                        </View>
                    </View>
                </Toast>
            ),
        });
    };

    const handleEdit = async () => {
        if (!session) return;
        const success = await editSession(sessionId, startTime, endTime, parseFloat(rate), currency, clientId);
        if (success) {
            router.back();
            showToast();
        } else {
            setSaveError("An error occurred while saving the session.");
        }
    };

    if (!session) return null;

    return (
        <BaseModal>
            {/* Time section */}
            <View style={styles.section}>
                <AppText style={[styles.sectionLabel, { color: muted }]}>TIME</AppText>
                <View style={[styles.sectionCard, { backgroundColor: surface, borderColor: muted + '20', borderWidth: 1 }]}>
                    <DateTimeSelect value={new Date(startTime)} label="Start Time" onDateChange={(d) => setStartTime(d.getTime())} />
                    <View style={[styles.divider, { backgroundColor: muted + '15' }]} />
                    <DateTimeSelect value={new Date(endTime)} label="End Time" onDateChange={(d) => setEndTime(d.getTime())} />
                </View>
            </View>

            {/* Client section */}
            {clients.length > 0 && (
                <View style={styles.section}>
                    <AppText style={[styles.sectionLabel, { color: muted }]}>CLIENT</AppText>
                    <View style={[styles.sectionCard, { backgroundColor: surface, borderColor: muted + '20', borderWidth: 1 }]}>
                        <ClientSelect selectedClientId={clientId} onClientSelect={setClientId} />
                    </View>
                </View>
            )}

            {/* Rate section */}
            <View style={styles.section}>
                <AppText style={[styles.sectionLabel, { color: muted }]}>RATE</AppText>
                <View style={[styles.sectionCard, { backgroundColor: surface, borderColor: muted + '20', borderWidth: 1 }]}>
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
                <View style={[styles.sectionCard, { backgroundColor: surface, borderColor: muted + '20', borderWidth: 1 }]}>
                    <View style={styles.summaryRow}>
                        <DurationInput duration={duration} />
                        <View style={{ flex: 2 }}>
                            <EarningsInput amount={amount} />
                        </View>
                    </View>
                </View>
            </View>

            {/* Save button */}
            <View style={styles.saveContainer}>
                {saveError && (
                    <AppText style={[styles.errorText, { color: danger }]}>{saveError}</AppText>
                )}
                <Button
                    isDisabled={!canSave}
                    onPress={handleEdit}
                    style={[styles.saveBtn, { backgroundColor: canSave ? accent : muted + '40' }]}
                >
                    <Button.Label style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
                        Save Changes
                    </Button.Label>
                </Button>
            </View>
        </BaseModal>
    );
}

const styles = StyleSheet.create({
    section: {
        gap: 6,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginLeft: 2,
    },
    sectionCard: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    divider: {
        height: 1,
    },
    rateRow: {
        flexDirection: 'row',
        gap: Layout.spacing * 2,
        padding: 4,
    },
    summaryRow: {
        flexDirection: 'row',
        gap: Layout.spacing * 2,
    },
    saveContainer: {
        gap: 10,
        marginTop: Layout.spacing * 2,
    },
    errorText: {
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
    },
    saveBtn: {
        height: 52,
        borderRadius: 14,
    },
});
