import { triggerReview } from "@/components/home/actions";
import { AppText } from "@/components/ui/app-text";
import { DateRangeSelect } from "@/components/ui/date-range-select";
import { Icon } from "@/components/ui/icon";
import { TextInput } from "@/components/ui/text-input";
import { Layout } from "@/constants/layout";
import { useClients } from "@/hooks/use-clients";
import { useSessions } from "@/hooks/use-sessions";
import { useSettings } from "@/hooks/use-settings";
import { generateInvoice, generateInvoiceHTML } from "@/services/generate-invoice";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Spinner, useThemeColor } from "heroui-native";
import { useMemo, useState } from "react";
import { Dimensions, Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from 'react-native-webview';
import BaseModal from "./base-modal";

const WIDTH = Dimensions.get('window').width * .9;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function InvoiceConfigModal() {
    const { id } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const cardBg = useThemeColor('accent');
    const danger = useThemeColor('danger');

    const { settings } = useSettings();
    const { sessions } = useSessions();
    const { clients } = useClients();

    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [endDate, setEndDate] = useState(new Date());
    
    const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}01`);
    const [isGenerating, setIsGenerating] = useState(false);

    const [showPreview, setShowPreview] = useState(false);
    const [previewHtml, setPreviewHtml] = useState('');

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

    const isDisabled = isGenerating || filteredSessions.length === 0 || invoiceNumber.length === 0;

    const handlePreview = () => {
        if (!client) return;
        
        const html = generateInvoiceHTML({
            client,
            sessions: filteredSessions,
            currency: settings?.currency || 'USD',
            invoiceNumber,
            startDate,
            endDate
        });
        
        setPreviewHtml(html);
        setShowPreview(true);
    };

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
            setTimeout(() => triggerReview(), 1000);
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
                <View style={[styles.summary, { backgroundColor: cardBg + '40', borderColor: cardBg }]}>
                    <AppText style={{ color: muted, fontSize: 24, fontWeight: '700' }}>Selected Period:</AppText>
                    <AppText style={{ color: foreground, fontSize: 20, fontWeight: 'bold', marginVertical: 4 }}>
                        {filteredSessions.length} Sessions
                    </AppText>
                    {filteredSessions.length === 0 && (
                        <AppText style={{ color: danger, fontSize: 12 }}>
                            No sessions found for this client in this range.
                        </AppText>
                    )}
                </View>
            </View>

            <View style={styles.footer}>
                <Button 
                    size="lg"
                    variant="secondary"
                    onPress={handlePreview}
                    isDisabled={isDisabled}
                    style={{ width: WIDTH, marginBottom: 12, backgroundColor: 'transparent', borderWidth: 1, borderColor: cardBg }}
                >
                     <Icon name="eye-outline" size={22} color={foreground} />
                     <Button.Label style={{ color: foreground, fontSize: 18, fontWeight: '600' }}>Preview Document</Button.Label>
                </Button>
                <Button 
                    size="lg" 
                    onPress={handleGenerate} 
                    isDisabled={isDisabled}
                    style={{ width: WIDTH }}
                >
                    {isGenerating ? (
                        <Spinner color={foreground} />
                    ) : (
                        <>
                            <Icon name="document-outline" size={22} color={foreground} />
                            <Button.Label style={{ color: foreground, fontSize: 22, fontWeight: '700' }}>Generate PDF</Button.Label>
                        </>
                    )}
                </Button>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={showPreview}
                onRequestClose={() => setShowPreview(false)}
            >
                <View style={[styles.previewModalContainer, { paddingTop: insets.top, backgroundColor: cardBg }]}>
                    <View style={[styles.previewHeader, { borderBottomColor: cardBg + '80' }]}>
                        <AppText style={[styles.previewTitle, {color: foreground}]}>Invoice Preview</AppText>
                        <TouchableOpacity onPress={() => setShowPreview(false)} style={styles.closeBtn}>
                            <Icon name="close" size={24} color={foreground} />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={[styles.webviewWrapper, { backgroundColor: cardBg + '40' }]}>
                        <WebView
                            originWhitelist={['*']}
                            source={{ html: previewHtml }}
                            style={{ flex: 1 }}
                            showsVerticalScrollIndicator={false}
                            scalesPageToFit={true}
                            bounces={false}         // Prevents scrolling past edges unnecessarily
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                        />
                    </View>
                </View>
            </Modal>
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
    },
    previewModalContainer: {
        flex: 1,
        height: SCREEN_HEIGHT,
    },
    previewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
    },
    previewTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    closeBtn: {
        padding: 4,
    },
    webviewWrapper: {
        flex: 1,
        backgroundColor: '#fff',
    }
});