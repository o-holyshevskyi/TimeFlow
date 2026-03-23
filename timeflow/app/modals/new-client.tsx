import { AppText } from "@/components/ui/app-text";
import { ColorSelector } from "@/components/ui/color-selector";
import HourlyRateInput from "@/components/ui/hourly-rate";
import { TextInput } from "@/components/ui/text-input";
import { Layout } from "@/constants/layout";
import { useClients } from "@/hooks/use-clients";
import { router } from "expo-router";
import { Button, Switch, Toast, useThemeColor, useToast } from "heroui-native";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import BaseModal from "./base-modal";

export default function NewClientModal() {
    const accent = useThemeColor('accent');
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const danger = useThemeColor('danger');
    const surface = useThemeColor('surface');
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
            color,
            isDefault,
        });
        if (success) {
            router.back();
            toast.show({
                component: (props) => (
                    <Toast
                        variant="default"
                        placement="top"
                        style={{ backgroundColor: background, borderColor: muted + '30' }}
                        className="border-1 p-5" {...props}
                    >
                        <View>
                            <Toast.Label style={{ fontSize: 22 }}>Client Saved</Toast.Label>
                            <Toast.Description style={{ fontSize: 16 }}>Your client has been added.</Toast.Description>
                        </View>
                    </Toast>
                ),
            });
        } else {
            setSaveError("Failed to save client");
        }
    };

    return (
        <BaseModal>
            {/* Client info section */}
            <View style={styles.section}>
                <AppText style={[styles.sectionLabel, { color: muted }]}>CLIENT INFO</AppText>
                <View style={[styles.sectionCard, { backgroundColor: surface, borderColor: muted + '20', borderWidth: 1 }]}>
                    <TextInput label="Client Name" placeholder="e.g. Acme Corp" text={clientName} onChangeText={setClientName} />
                    <View style={[styles.divider, { backgroundColor: muted + '15' }]} />
                    <HourlyRateInput rate={rate} setRate={setRate} />
                </View>
            </View>

            {/* Color section */}
            <View style={styles.section}>
                <AppText style={[styles.sectionLabel, { color: muted }]}>COLOR</AppText>
                <View style={[styles.sectionCard, { backgroundColor: surface, borderColor: muted + '20', borderWidth: 1, padding: 16 }]}>
                    <ColorSelector selectedColor={color} onSelect={setColor} label="Client Color" />
                </View>
            </View>

            {/* Preferences section */}
            <View style={styles.section}>
                <AppText style={[styles.sectionLabel, { color: muted }]}>PREFERENCES</AppText>
                <View style={[styles.sectionCard, { backgroundColor: surface, borderColor: muted + '20', borderWidth: 1 }]}>
                    <View style={styles.switchRow}>
                        <View>
                            <AppText style={[styles.switchLabel, { color: foreground }]}>Set as Default</AppText>
                            <AppText style={[styles.switchSub, { color: muted }]}>Use as default client for new sessions</AppText>
                        </View>
                        <Switch isSelected={isDefault} onSelectedChange={setIsDefault} />
                    </View>
                </View>
            </View>

            {/* Save button */}
            <View style={styles.saveContainer}>
                {saveError && (
                    <AppText style={[styles.errorText, { color: danger }]}>{saveError}</AppText>
                )}
                <Button
                    isDisabled={!canSave}
                    onPress={handleSave}
                    style={[styles.saveBtn, { backgroundColor: canSave ? accent : muted + '40' }]}
                >
                    <Button.Label style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
                        Save Client
                    </Button.Label>
                </Button>
            </View>
        </BaseModal>
    );
}

const styles = StyleSheet.create({
    section: {
        gap: 6,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginLeft: 2,
    },
    sectionCard: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    divider: {
        height: 1,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        gap: 12,
    },
    switchLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
    switchSub: {
        fontSize: 12,
        marginTop: 2,
    },
    saveContainer: {
        gap: 10,
        marginTop: Layout.spacing * 2,
    },
    errorText: {
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
    },
    saveBtn: {
        height: 52,
        borderRadius: 14,
    },
});
