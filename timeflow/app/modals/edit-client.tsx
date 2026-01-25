import { AppText } from "@/components/ui/app-text";
import { ColorSelector } from "@/components/ui/color-selector";
import HourlyRateInput from "@/components/ui/hourly-rate";
import { TextInput } from "@/components/ui/text-input";
import { Layout } from "@/constants/layout";
import { useClients } from "@/hooks/use-clients";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Switch, Toast, useThemeColor, useToast } from "heroui-native";
import { useEffect, useMemo, useState } from "react";
import { Dimensions, View } from "react-native";
import BaseModal from "./base-modal";

const WIDTH = Dimensions.get('window').width * .9;

export default function EditClientModal() {
    const { id } = useLocalSearchParams();
    const { clients, saveClient } = useClients();
    const { toast } = useToast();

    const clientId = Array.isArray(id) ? id[0] : id;
    const accent = useThemeColor('accent');

    const client = useMemo(() => clients.find(cl => cl.id === clientId), [clients, clientId]);

    const [clientName, setClientName] = useState<string>('');
    const [rate, setRate] = useState<undefined | string>(undefined);
    const [color, setColor] = useState<string>(accent);
    const [isDefault, setIsDefault] = useState(false);

    const [saveError, setSaveError] = useState<undefined | string>(undefined);
    const [canSave, setCanSave] = useState(false);

    useEffect(() => {
        if (client) {
            setClientName(client.name);
            setColor(client.color || accent);
            setRate(client.defaultRate);
            setIsDefault(client.isDefault || false);
        }
    }, [client, accent]);

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

    const showToast = () => {
        toast.show({
            component: (props) => (
                <Toast variant="default" placement="top" className="bg-[#0f172aff] border-[#334155] border-1 p-5" {...props}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Toast.Label style={{ fontSize: 22 }}>Client Updated</Toast.Label>
                            <Toast.Description style={{ fontSize: 16 }}>Your client has been updated.</Toast.Description>
                        </View>
                    </View>
                </Toast>
            ),
        });
    }

    const handleEdit = async () => {
        if (!clients) return;

        const success = await saveClient({
            id: clientId,
            name: clientName,
            color: color,
            defaultRate: rate,
            isDefault: isDefault,
        });

        if (success) {
            router.back();
            showToast();
        } else {
            setSaveError("An error occurred while saving the session.");
        }
    };

    if (!clients) return null;

    return <BaseModal>
        <TextInput label="Client Name" placeholder="e.g. Google Inc" text={clientName} onChangeText={setClientName} />
        <ColorSelector 
            selectedColor={color} 
            onSelect={setColor} 
            label="Client Color"
        />
        <HourlyRateInput rate={rate} setRate={setRate} width={WIDTH + Layout.spacing * 4 } />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Layout.spacing, width: WIDTH }}>
            <AppText style={{ color: 'white', fontSize: 18 }}>Set as Default Client</AppText>
            <Switch 
                isSelected={isDefault} 
                onSelectedChange={setIsDefault}
            />
        </View>
        <Button isDisabled={!canSave} style={{ width: WIDTH, marginTop: Layout.spacing * 5 }} onPress={handleEdit}>
            <Button.Label style={{ color: 'black', fontSize: 22, fontWeight: '700' }}>Save Client</Button.Label>
        </Button>
        {saveError && 
            <AppText style={{ color: '#b91c1c', fontSize: 16, fontWeight: '600' }}>{saveError}</AppText>
        }
    </BaseModal>
}