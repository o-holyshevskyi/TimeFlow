import { TextField, useThemeColor } from "heroui-native";
import { Dimensions } from "react-native";

interface TextInputProps {
    label: string; 
    text: string;
    placeholder: string;
    isEditable?: boolean;
    onChangeText: (val: string) => void;
    width?: number;
}

const WIDTH = Dimensions.get('window').width * .9;

export const TextInput = ({label, text, onChangeText, placeholder, isEditable = true, width}: TextInputProps) => {
    const foreground = useThemeColor('foreground');
    const accent = useThemeColor('accent');
    const danger = useThemeColor('danger');

    return <TextField isDisabled={false} style={{ width: width || WIDTH }}>
        <TextField.Label style={{ color: foreground, fontSize: 20 }}>{label}</TextField.Label>
        <TextField.Input 
            placeholder={placeholder}
            keyboardType="default"
            returnKeyType="done"
            editable={isEditable}
            submitBehavior='blurAndSubmit'
            className="rounded-full"
            onChangeText={onChangeText}
            value={text}
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