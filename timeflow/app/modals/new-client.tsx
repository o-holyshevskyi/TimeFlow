import { AppText } from "@/components/ui/app-text";
import { ColorSelector } from "@/components/ui/color-selector";
import HourlyRateInput from "@/components/ui/hourly-rate";
import { TextInput } from "@/components/ui/text-input";
import { Layout } from "@/constants/layout";
import { useClients } from "@/hooks/use-clients";
import { router } from "expo-router";
import { Button, Switch, Toast, useThemeColor, useToast } from "heroui-native";
import { useEffect, useState } from "react";
import { Dimensions, View } from "react-native";
import BaseModal from "./base-modal";

const WIDTH = Dimensions.get('window').width * .9;

export default function NewClientModal() {
    const accent = useThemeColor('accent');
    const foreground = useThemeColor('foreground');
    const danger = useThemeColor('danger');
    const background = useThemeColor('background');

    const [clientName, setClientName] = useState<string>('');
    const [rate, setRate] = useState<undefined | string>(undefined);
    const [color, setColor] = useState<string>(accent);
    const [isDefault, setIsDefault] = useState(false);
    
    const [saveError, setSaveError] = useState<undefined | string>(undefined);
    const [canSave, setCanSave] = useState(false);

    const { saveClient } = useClients();
    const { toast } = useToast();

    useEffect(() => {
        if (clientName.length === 0) {
            setSaveError("Client name cannot be empty.");
            setCanSave(false);
        } else if (!rate || parseFloat(rate) <= 0) {
            setSaveError("Please enter a valid hourly rate.");
            setCanSave(false);
        } else {
            setSaveError(undefined);
            setCanSave(true);
        }
    }, [clientName, rate]);

    const handleSave = async () => {
        if (!rate || clientName.length === 0) return;
        
        const success = await saveClient({
            id: Date.now().toString(),
            name: clientName.trim(),
            defaultRate: rate,
            color: color,
            isDefault: isDefault
        });

        if (success) {
            router.back();
            toast.show({
                component: (props) => (
                    <Toast 
                        variant="default" 
                        placement="top" 
                        style={{ backgroundColor: background, borderColor: accent }}
                        className="border-1 p-5" {...props}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View>
                                <Toast.Label style={{ fontSize: 22 }}>Client Saved</Toast.Label>
                                <Toast.Description style={{ fontSize: 16 }}>Your client has been added.</Toast.Description>
                            </View>
                        </View>
                    </Toast>
                ),
            });
        } else {
            setSaveError("Failed to save client");
        }
    };

    return <BaseModal>
        <TextInput label="Client Name" placeholder="e.g. Google Inc" text={clientName} onChangeText={setClientName} />
        <ColorSelector 
            selectedColor={color} 
            onSelect={setColor} 
            label="Client Color"
        />
        <HourlyRateInput rate={rate} setRate={setRate} width={WIDTH } />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Layout.spacing, width: WIDTH }}>
            <AppText style={{ color: foreground, fontSize: 18 }}>Set as Default Client</AppText>
            <Switch 
                isSelected={isDefault} 
                onSelectedChange={setIsDefault}
            />
        </View>
        <Button isDisabled={!canSave} style={{ width: WIDTH, marginTop: Layout.spacing * 5 }} onPress={handleSave}>
            <Button.Label style={{ color: foreground, fontSize: 22, fontWeight: '700' }}>Save New Session</Button.Label>
        </Button>
        {saveError && 
            <AppText style={{ color: danger, fontSize: 16, fontWeight: '600' }}>{saveError}</AppText>
        }
    </BaseModal>
}
