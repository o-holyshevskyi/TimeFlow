import { Toast, useThemeColor } from "heroui-native";
import { View } from "react-native";

interface AppToastProps {
    label: string;
    description: string;
    actionElement?: React.ReactElement;
    [key: string]: any;
}

export default function AppToast({ label, description, actionElement, ...props }: AppToastProps) {
    const foreground = useThemeColor('foreground');
    const accent = useThemeColor('accent');
    const muted = useThemeColor('muted');
    
    return (
        <Toast 
            variant="default" 
            placement="top" 
            style={{ 
                backgroundColor: accent + '20', 
                borderColor: accent, 
                borderWidth: 1, 
                padding: 20 
            }} 
            {...(props as any)}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 3 }}>
                    <Toast.Label style={{ fontSize: 22, color: foreground }}>{label}</Toast.Label>
                    <Toast.Description style={{ fontSize: 16, color: muted }}>{description}</Toast.Description>
                </View>
                {actionElement}
            </View>
        </Toast>
    );
}