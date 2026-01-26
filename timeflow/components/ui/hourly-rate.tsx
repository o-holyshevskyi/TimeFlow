import { TextField, useThemeColor } from "heroui-native";

type HourlyRateInputProps = {
    setRate: (rate: string) => void;
    rate?: string;
    isDisabled?: boolean;
    width?: number;
}

const HourlyRateInput = ({ setRate, rate, isDisabled = false, width }: HourlyRateInputProps) => {
    const foreground = useThemeColor('foreground');
    const accent = useThemeColor('accent');
    const danger = useThemeColor('danger');

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
    
    return <TextField isDisabled={isDisabled} style={[ width ? { width } : { flex: 2 }]}>
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
                color: foreground,
            }}
            animation={{
                backgroundColor: {
                    value: {
                        blur: accent + '20',
                        focus: accent + '20',
                        error: accent + '20',
                    },
                    
                },
                borderColor: {
                    value: {
                        blur: accent + '20',
                        focus: accent + '20',
                        error: danger,
                    },
                },
            }}
        />
    </TextField>;
}

export default HourlyRateInput;
