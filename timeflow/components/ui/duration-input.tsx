import { TextField, useThemeColor } from "heroui-native";

export const DurationInput = ({ duration, isDisabled = false, editable = false }: { duration: string, isDisabled?: boolean, editable?: boolean }) => {
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