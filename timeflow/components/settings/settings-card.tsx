import { Layout } from "@/constants/layout";
import { useSettings } from "@/hooks/use-settings";
import { Button, Card, TextField, useThemeColor } from "heroui-native";
import { useCallback, useEffect, useState } from "react";
import { Keyboard, StyleSheet, Text, View } from "react-native";
import CurrencySelect from "./currency-select";

const SettingsCard = () => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');    
    
    const [rate, setRate] = useState<undefined | string>(undefined);
    const [currency, setCurrency] = useState<undefined | string>(undefined);

    const { settings, saveSettings } = useSettings();

    useEffect(() => {
        if (settings) {
            setRate(settings.rate);
            setCurrency(settings.currency);
        }
    }, [settings]);

    const handleAmountChange = (text: string) => {
        let cleanText = text.replace(/[^0-9.,]/g, '');
        
        cleanText = cleanText.replace(',', '.');
        
        const decimalIndex = cleanText.indexOf('.');
        if (decimalIndex !== -1) {
            const beforeDecimal = cleanText.substring(0, decimalIndex);
            const afterDecimal = cleanText.substring(decimalIndex + 1).replace(/\./g, '');
            cleanText = beforeDecimal + '.' + afterDecimal;
        }
        
        if (cleanText.startsWith('.')) {
            cleanText = '0' + cleanText;
        }
        
        if (cleanText.includes('.')) {
            const [integer, decimal] = cleanText.split('.');
            cleanText = integer + '.' + decimal.slice(0, 2);
            
            if (integer.length > 10) {
                cleanText = integer.slice(0, 10) + '.' + decimal.slice(0, 2);
            }
        } else {
            if (cleanText.length > 10) {
                cleanText = cleanText.slice(0, 10);
            }
        }
        
        if (cleanText === '.') {
            cleanText = '0.';
        }

        setRate(cleanText);
    }

    const handleSaveRate = useCallback(async () => {
        await saveSettings({ currency, rate })

        Keyboard.dismiss();
    }, [currency, rate, saveSettings]);

    return <Card style={[styles.settingsCard]}>
        <Card.Header style={[styles.settingsCardHeader]}>
            <Text style={[{ color: foreground }, styles.settingsCardTitle]}>Set Your Hourly Rate</Text>
            <Text style={[{ color: muted }, styles.settingsCardDescription]}>This will be used to calculate your earnings.</Text>
        </Card.Header>
        <Card.Body style={{ paddingHorizontal: Layout.spacing }}>
            <View style={{ flexDirection: "row", gap: Layout.spacing * 2 }}>
                <TextField style={{ flex: 2 }}>
                    <TextField.Label style={{ color: foreground, fontSize: 20 }}>Rate per Hour</TextField.Label>
                    <TextField.Input 
                        placeholder="25.00"
                        keyboardType="decimal-pad"
                        returnKeyType="done"
                        submitBehavior='blurAndSubmit'
                        className="rounded-full"
                        onChangeText={handleAmountChange}
                        value={rate}
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
                </TextField>
                <View style={{flex: 1}}>
                    <CurrencySelect initialCurrency={currency} onCurrencySelect={setCurrency} />
                </View>
            </View>
        </Card.Body>
        <Card.Footer style={{ paddingHorizontal: Layout.spacing }}>
            <Button 
                onPress={handleSaveRate}
                feedbackVariant="ripple" 
                size="lg"
                animation={{
                    ripple: {
                        backgroundColor: { value: 'black' },
                        opacity: { value: [0, 0.3, 0] },
                    },
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
