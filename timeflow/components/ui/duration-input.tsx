import { TextField, useThemeColor } from "heroui-native";

export const DurationInput = ({ duration, isDisabled = false, editable = false }: { duration: string, isDisabled?: boolean, editable?: boolean }) => {
    const foreground = useThemeColor('foreground');
    const accent = useThemeColor('accent');
    const danger = useThemeColor('danger');
    
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