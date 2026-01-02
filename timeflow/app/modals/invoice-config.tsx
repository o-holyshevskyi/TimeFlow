import { DateRangeSelect } from "@/components/ui/date-range-select";
import { Icon } from "@/components/ui/icon";
import { TextInput } from "@/components/ui/text-input";
import { Layout } from "@/constants/layout";
import { useClients } from "@/hooks/use-clients";
import { useSessions } from "@/hooks/use-sessions";
import { useSettings } from "@/hooks/use-settings";
import { generateInvoice } from "@/services/generate-invoice";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Spinner, useThemeColor } from "heroui-native";
import { useMemo, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import BaseModal from "./base-modal";

const WIDTH = Dimensions.get('window').width * .9;

export default function InvoiceConfigModal() {
    const { id } = useLocalSearchParams();
    
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const { settings } = useSettings();
    const { sessions } = useSessions();
    const { clients } = useClients();

    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [endDate, setEndDate] = useState(new Date());
    
    const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}01`);
    const [isGenerating, setIsGenerating] = useState(false);

    const clientId = Array.isArray(id) ? id[0] : id;
    const client = useMemo(() => clients.find(cl => cl.id === clientId), [clients, clientId]);

    const filteredSessions = useMemo(() => {
        const start = new Date(startDate).setHours(0,0,0,0);
        const end = new Date(endDate).setHours(23,59,59,999);

        if (!client) return [];

        return sessions.filter(s => {
            const isClient = s.clientId === client.id || (s.clientId && s.clientId === client.id);
            const inRange = s.startTime >= start && s.startTime <= end;
            return isClient && inRange;
        });
    }, [sessions, client, startDate, endDate]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            if (!client) throw new Error("Client not found.");

            await generateInvoice({
                client,
                sessions: filteredSessions,
                currency: settings?.currency || 'USD',
                invoiceNumber,
                startDate,
                endDate
            });
            router.back();
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <BaseModal >
            <View style={styles.form}>
                <TextInput
                    label="Invoice Number"
                    placeholder="e.g. INV-0001"
                    text={invoiceNumber}
                    onChangeText={setInvoiceNumber}
                />
                <DateRangeSelect
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                />
                <View style={[styles.summary, { backgroundColor: '#1e293b', borderColor: muted }]}>
                    <Text style={{ color: muted, fontSize: 24, fontWeight: '700' }}>Selected Period:</Text>
                    <Text style={{ color: foreground, fontSize: 20, fontWeight: 'bold', marginVertical: 4 }}>
                        {filteredSessions.length} Sessions
                    </Text>
                    {filteredSessions.length === 0 && (
                        <Text style={{ color: '#ef4444', fontSize: 12 }}>
                            No sessions found for this client in this range.
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.footer}>
                <Button 
                    size="lg" 
                    onPress={handleGenerate} 
                    isDisabled={isGenerating || filteredSessions.length === 0 || invoiceNumber.length === 0}
                    style={{ width: WIDTH }}
                >
                    {isGenerating ? (
                        <Spinner color="black"/>
                    ) : (
                        <>
                            <Icon name="document-outline" size={22} color="black" />
                            <Button.Label style={{ color: 'black', fontSize: 22, fontWeight: '700' }}>Generate PDF</Button.Label>
                        </>
                    )}
                </Button>
            </View>
        </BaseModal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Layout.spacing * 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20,
    },
    form: {
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 18,
    },
    dateBtn: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'flex-start'
    },
    summary: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        marginTop: 20,
    },
    footer: {
        marginTop: 'auto',
        marginBottom: 20,
    }
});