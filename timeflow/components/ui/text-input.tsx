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