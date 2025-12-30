import { ColorSelector } from "@/components/ui/color-selector";
import HourlyRateInput from "@/components/ui/hourly-rate";
import { TextInput } from "@/components/ui/text-input";
import { Layout } from "@/constants/layout";
import { useClients } from "@/hooks/use-clients";
import { router } from "expo-router";
import { Button, Switch, Toast, useThemeColor, useToast } from "heroui-native";
import { useEffect, useState } from "react";
import { Dimensions, Text, View } from "react-native";
import BaseModal from "./base-modal";

const WIDTH = Dimensions.get('window').width * .9;

export default function NewClientModal() {
    const accent = useThemeColor('accent');

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
                    <Toast variant="default" placement="top" className="bg-[#0f172aff] border-[#334155] border-1 p-5" {...props}>
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
            <Text style={{ color: 'white', fontSize: 18 }}>Set as Default Client</Text>
            <Switch 
                isSelected={isDefault} 
                onSelectedChange={setIsDefault}
            />
        </View>
        <Button isDisabled={!canSave} style={{ width: WIDTH, marginTop: Layout.spacing * 5 }} onPress={handleSave}>
            <Button.Label style={{ color: 'black', fontSize: 22, fontWeight: '700' }}>Save New Session</Button.Label>
        </Button>
        {saveError && 
            <Text style={{ color: '#b91c1c', fontSize: 16, fontWeight: '600' }}>{saveError}</Text>
        }
    </BaseModal>
}
