import { Icon } from "@/components/ui/icon";
import { Layout } from "@/constants/layout";
import { useRouter } from "expo-router";
import { Button, Card, TextField, useThemeColor } from "heroui-native";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Settings() {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');

    const router = useRouter();

    const [rate, setRate] = useState<undefined | string>(undefined);
    
    const handleOnClose = () => {
        router.back();
    }

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
    
    return <SafeAreaView style={[styles.container]}>
        <View style={[styles.headerContainer]}>
            <Button isIconOnly variant="ghost" onPress={handleOnClose}>
                <Icon name="close-outline" />
            </Button>
            <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[styles.titleText, { color: foreground }]}>Settings</Text>
            </View>
            <View style={{ width: 40 }} />
        </View>
        <View style={[styles.contentContainer]}>
            <Card style={[styles.settingsCard]}>
                <Card.Header style={[styles.settingsCardHeader]}>
                    <Text style={[{ color: foreground }, styles.settingsCardTitle]}>Set Your Hourly Rate</Text>
                    <Text style={[{ color: muted }, styles.settingsCardDescription]}>This will be used to calculate your earnings.</Text>
                </Card.Header>
                <Card.Body style={{ paddingHorizontal: Layout.spacing }}>
                    <View style={{ flexDirection: "row", gap: Layout.spacing * 5 }}>
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
                        <TextField style={{ flex: 1 }}>
                            <TextField.Label style={{ color: foreground, fontSize: 20 }}>Currency</TextField.Label>
                            <TextField.Input 
                                placeholder="USD ($)"
                                keyboardType="decimal-pad"
                                returnKeyType="done"
                                submitBehavior='blurAndSubmit'
                                className="rounded-full"
                                style={{
                                    fontWeight: '900',
                                    fontSize: 20,
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
                    </View>
                </Card.Body>
                <Card.Footer style={{ paddingHorizontal: Layout.spacing }}>
                    <Button 
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
            <Card style={[styles.settingsCard]}>
                <Card.Header style={[styles.settingsCardHeader]}>
                    <View style={[styles.premiumTextContainer]}>
                        <Icon name="star" color="#2bee6c" />
                        <Text style={[{ color: foreground }, styles.settingsCardTitle]}>Go Premium</Text>
                    </View>
                    <Text style={[{ color: muted }, styles.settingsCardDescription]}>
                        Unlock powerful features to boost your productivity.
                    </Text>
                </Card.Header>
                <Card.Body style={{ paddingHorizontal: Layout.spacing }}>
                    <View style={{ flexDirection: "column", gap: Layout.spacing * 5 }}>
                        <View style={[styles.premiumTextContainer]}>
                            <Icon name="checkmark-circle" color="#2bee6c" />
                            <Text style={[{ color: foreground }, styles.settingsCardDescription]}>Add-Free Experience</Text>
                        </View>
                        <View style={[styles.premiumTextContainer]}>
                            <Icon name="checkmark-circle" color="#2bee6c" />
                            <Text style={[{ color: foreground }, styles.settingsCardDescription]}>Full Session History</Text>
                        </View>
                        <View style={[styles.premiumTextContainer]}>
                            <Icon name="checkmark-circle" color="#2bee6c" />
                            <Text style={[{ color: foreground }, styles.settingsCardDescription]}>Export Data (CSV)</Text>
                        </View>
                    </View>
                </Card.Body>
                <Card.Footer style={{ paddingHorizontal: Layout.spacing }}>
                    <Button 
                        feedbackVariant="ripple" 
                        size="lg"
                        animation={{
                            ripple: {
                                backgroundColor: { value: 'black' },
                                opacity: { value: [0, 0.3, 0] },
                            },
                        }}
                    >
                        <Button.Label style={{ fontSize: 24, fontWeight: 600, color: 'black' }}>Subscribe Now</Button.Label>
                    </Button>
                </Card.Footer>
            </Card>
        </View>
    </SafeAreaView>
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        paddingHorizontal: Layout.spacing * 3
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Layout.spacing * 3,
    },
    titleText: {
        fontSize: 28,
        fontWeight: 800,
    },
    contentContainer: {
        paddingVertical: Layout.spacing * 2,
        gap: Layout.spacing * 5
    },
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
    premiumTextContainer: {
        flexDirection: 'row', 
        gap: Layout.spacing * 2, 
        alignItems: 'center'
    }
});
