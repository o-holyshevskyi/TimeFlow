import { Layout } from "@/constants/layout";
import { useTimer } from "@/contexts/timer-context";
import { useSettings } from "@/hooks/use-settings";
import { Button, Card, Toast, useThemeColor, useToast } from "heroui-native";
import { useCallback, useEffect, useState } from "react";
import { Keyboard, StyleSheet, Text, View } from "react-native";
import HourlyRateInput from "../ui/hourly-rate";
import CurrencySelect from "./currency-select";

const SettingsCard = () => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');    
    
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
                <Toast variant="default" placement="top" className="bg-[#0f172aff] border-[#334155] border-1 p-5" {...props}>
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
    }, [toast]);

    const handleSaveRate = useCallback(async () => {
        await saveSettings({ currency, rate });
        showToast();

        Keyboard.dismiss();
    }, [currency, rate, saveSettings, showToast]);

    return <Card style={[styles.settingsCard]}>
        <Card.Header style={[styles.settingsCardHeader]}>
            <Text style={[{ color: foreground }, styles.settingsCardTitle]}>Set Your Hourly Rate</Text>
            <Text style={[{ color: muted }, styles.settingsCardDescription]}>This will be used to calculate your earnings.</Text>
        </Card.Header>
        <Card.Body style={{ paddingHorizontal: Layout.spacing }}>
            <View style={{ flexDirection: "row", gap: Layout.spacing * 2 }}>
                <HourlyRateInput rate={rate} setRate={setRate} />
                <View style={{flex: 1}}>
                    <CurrencySelect initialCurrency={currency} onCurrencySelect={setCurrency} />
                </View>
            </View>
        </Card.Body>
        <Card.Footer style={{ paddingHorizontal: Layout.spacing }}>
            <Button 
                isDisabled={isTracking}
                onPress={handleSaveRate}
                feedbackVariant="ripple" 
                size="lg"
                animation={{
                    ripple: {
                        backgroundColor: { value: "black" },
                        opacity: { value: [0, 0.3, 0] },
                    },
                    scale: {
                        value: 1.1
                    }
                }}
            >
                <Button.Label style={{ fontSize: 24, fontWeight: 600, color: 'black' }}>Save Rate</Button.Label>
            </Button>
        </Card.Footer>
    </Card>
}

const styles = StyleSheet.create({
    settingsCard: {
        marginTop: Layout.spacing * 2,
        backgroundColor: '#1C2D23',
        borderRadius: Layout.borderRadius,
        gap: Layout.spacing * 5
    },
    settingsCardHeader: {
        gap: Layout.spacing * 2,
        flexDirection: 'column',
        alignItems: 'center',
        alignContent: 'center'
    },
    settingsCardTitle: {
        fontSize: 28, 
        fontWeight: 700
    },
    settingsCardDescription: {
        fontSize: 22, 
        fontWeight: 500, 
        textAlign: 'center'
    },
});

export default SettingsCard;
