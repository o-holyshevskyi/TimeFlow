import { calculateAmount, formatTime } from "@/components/sessions/session-card";
import CurrencySelect from "@/components/settings/currency-select";
import DateTimeSelect from "@/components/ui/date-time-select";
import HourlyRateInput from "@/components/ui/hourly-rate";
import { Layout } from "@/constants/layout";
import { useSessions } from "@/hooks/use-sessions";
import { useSettings } from "@/hooks/use-settings";
import { router } from "expo-router";
import { Button, TextField, Toast, useThemeColor, useToast } from "heroui-native";
import { useEffect, useState } from "react";
import { Dimensions, Text, View } from "react-native";

const WIDTH = Dimensions.get('window').width * .85;

export default function NewSessionModal() {
    const [startTime, setStartTime] = useState<Date>(new Date());
    const [endTime, setEndTime] = useState<Date>(new Date(new Date().getTime() + 60 * 60 * 1000));
    const [rate, setRate] = useState<undefined | string>(undefined);
    const [currency, setCurrency] = useState<undefined | string>(undefined);

    const [saveError, setSaveError] = useState<undefined | string>(undefined);
    const [canSave, setCanSave] = useState(false);

    const { settings } = useSettings();
    const { addManualSession } = useSessions();
    const { toast } = useToast();

    useEffect(() => {
        if (settings) {
            setRate(settings.rate);
            setCurrency(settings.currency);
        }
    }, [settings]);

    useEffect(() => {
        if (startTime.getTime() > endTime.getTime()) {
            setSaveError("End time must be after start time.");
            setCanSave(false);
        } else if (startTime.getTime() === endTime.getTime()) {
            setSaveError("Start and end times must be different.");
            setCanSave(false);
        } else {
            setSaveError(undefined);
            setCanSave(true);
        }
    }, [startTime, endTime]);

    const { duration } = formatTime(endTime.getTime() - startTime.getTime());
    const amount = calculateAmount(endTime.getTime() - startTime.getTime(), rate || '0', currency || '$');

    const handleSave = async () => {
        if (!rate || !currency) return;
        
        const success = await addManualSession(
            startTime.getTime(),
            endTime.getTime(),
            parseFloat(rate),
            currency
        );

        if (success) {
            router.back();
            toast.show({
                component: (props) => (
                    <Toast variant="default" placement="top" className="bg-[#0f172aff] border-[#334155] border-1 p-5" {...props}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View>
                                <Toast.Label style={{ fontSize: 22 }}>Session Saved</Toast.Label>
                                <Toast.Description style={{ fontSize: 16 }}>Your session has been added.</Toast.Description>
                            </View>
                        </View>
                    </Toast>
                ),
            });
        } else {
            setSaveError("Failed to save session");
        }
    };

    return <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: 'white', width: 140, height: 5, margin: Layout.spacing * 2, borderRadius: 50 }} />
        <View style={{
            padding: Layout.spacing * 4, 
            gap: Layout.spacing * 4, 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center' 
        }}>
            <DateTimeSelect value={startTime} label="Start Time" onDateChange={setStartTime} />
            <DateTimeSelect value={endTime} label="End Time" onDateChange={setEndTime} />
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
            <Button isDisabled={!canSave} style={{ width: WIDTH, marginTop: Layout.spacing * 5 }} onPress={handleSave}>
                <Button.Label style={{ color: 'black', fontSize: 22, fontWeight: '700' }}>Save New Session</Button.Label>
            </Button>
            {saveError && 
                <Text style={{ color: '#b91c1c', fontSize: 16, fontWeight: '600' }}>{saveError}</Text>
            }
        </View>
    </View>;
}

const DurationInput = ({ duration, isDisabled = false, editable = false }: { duration: string, isDisabled?: boolean, editable?: boolean }) => {
    const foreground = useThemeColor('foreground');
    
    return <TextField isDisabled={isDisabled} style={{ flex: 2 }}>
        <TextField.Label style={{ color: foreground, fontSize: 20 }}>Duration</TextField.Label>
        <TextField.Input 
            placeholder="25.00"
            keyboardType="decimal-pad"
            returnKeyType="done"
            editable={editable}
            submitBehavior='blurAndSubmit'
            className="rounded-full"
            value={duration}
            style={{
                fontWeight: '900',
                fontSize: 24,
                textAlignVertical: 'center',
                color: 'white',
            }}
            animation={{
                backgroundColor: {
                    value: {
                        blur: '#0f172abf',
                        focus: '#0f172abf',
                        error: '#0f172abf',
                    },
                    
                },
                borderColor: {
                    value: {
                        blur: '#334155',
                        focus: '#334155',
                        error: '#dc2626',
                    },
                },
            }}
        />
    </TextField>;
}

const EarningsInput = ({ amount, isDisabled = false, editable = false }: { amount: string, isDisabled?: boolean, editable?: boolean }) => {
    const foreground = useThemeColor('foreground');

    return <TextField isDisabled={isDisabled} style={{ flex: 2 }}>
        <TextField.Label style={{ color: foreground, fontSize: 20 }}>Earnings</TextField.Label>
        <TextField.Input 
            placeholder="25.00"
            keyboardType="decimal-pad"
            returnKeyType="done"
            editable={editable}
            submitBehavior='blurAndSubmit'
            className="rounded-full"
            value={amount}
            style={{
                fontWeight: '900',
                fontSize: 24,
                textAlignVertical: 'center',
                color: 'white',
            }}
            animation={{
                backgroundColor: {
                    value: {
                        blur: '#0f172abf',
                        focus: '#0f172abf',
                        error: '#0f172abf',
                    },
                    
                },
                borderColor: {
                    value: {
                        blur: '#334155',
                        focus: '#334155',
                        error: '#dc2626',
                    },
                },
            }}
        />
    </TextField>;
}
