import { calculateAmount, formatTime } from "@/components/sessions/session-card";
import CurrencySelect from "@/components/settings/currency-select";
import DateTimeSelect from "@/components/ui/date-time-select";
import { DurationInput } from "@/components/ui/duration-input";
import { EarningsInput } from "@/components/ui/earnings-input";
import HourlyRateInput from "@/components/ui/hourly-rate";
import { Layout } from "@/constants/layout";
import { useSessions } from "@/hooks/use-sessions";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Toast, useToast } from "heroui-native";
import { useEffect, useMemo, useState } from "react";
import { Dimensions, Text, View } from "react-native";
import BaseModal from "./base-modal";

const WIDTH = Dimensions.get('window').width * .85;

export default function EditSessionModal() {
    const { id } = useLocalSearchParams();

    const sessionId = Array.isArray(id) ? id[0] : id;
    const { getSessionById, editSession } = useSessions();

    const session = getSessionById(sessionId);

    const [startTime, setStartTime] = useState<number>(0);
    const [endTime, setEndTime] = useState<number>(0);
    const [rate, setRate] = useState<string>('');
    const [currency, setCurrency] = useState<string>('');
    
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
    
    const showToast = () => {
        toast.show({
            component: (props) => (
                <Toast variant="default" placement="top" className="bg-[#0f172aff] border-[#334155] border-1 p-5" {...props}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Toast.Label style={{ fontSize: 22 }}>Session Updated</Toast.Label>
                            <Toast.Description style={{ fontSize: 16 }}>Your session has been updated.</Toast.Description>
                        </View>
                    </View>
                </Toast>
            ),
        });
    }

    const handleEdit = async () => {
        if (!session) return;
        const success = await editSession(
            sessionId,
            startTime,
            endTime,
            parseFloat(rate),
            currency
        );

        if (success) {
            router.back();
            showToast();
        } else {
            setSaveError("An error occurred while saving the session.");
        }
    };

    if (!session) return null;

    return <BaseModal>
        <DateTimeSelect value={new Date(startTime)} label="Start Time" onDateChange={(date) => setStartTime(date.getTime())} />
        <DateTimeSelect value={new Date(endTime)} label="End Time" onDateChange={(date) => setEndTime(date.getTime())} />
        <View style={{ flexDirection: "row", gap: Layout.spacing * 2 }}>
            <HourlyRateInput rate={rate} setRate={setRate} />
            <View style={{flex: 1}}>
                <CurrencySelect initialCurrency={currency} onCurrencySelect={setCurrency} />
            </View>
        </View>
        <View style={{ flexDirection: "row", gap: Layout.spacing * 2 }}>
            <DurationInput duration={duration} />
            <View style={{ flex: 2 }}>
                <EarningsInput amount={amount} />
            </View>
        </View>
        <Button isDisabled={!canSave} style={{ width: WIDTH, marginTop: Layout.spacing * 5 }} onPress={handleEdit}>
            <Button.Label style={{ color: 'black', fontSize: 22, fontWeight: '700' }}>Save Session</Button.Label>
        </Button>
        {saveError && 
            <Text style={{ color: '#b91c1c', fontSize: 16, fontWeight: '600' }}>{saveError}</Text>
        }
    </BaseModal>;
}