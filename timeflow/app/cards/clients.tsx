import ClientHeader from "@/components/clients/header";
import { GetProLabel } from "@/components/sessions/header";
import { AppText } from "@/components/ui/app-text";
import { Icon } from "@/components/ui/icon";
import { usePremiumToast } from "@/components/ui/premium-toast";
import { Layout } from "@/constants/layout";
import { Client, useClients } from "@/hooks/use-clients";
import { useSessions } from "@/hooks/use-sessions";
import { useSettings } from "@/hooks/use-settings";
import { useUserStatus } from "@/hooks/user-status";
import { BlurView } from "expo-blur";
import * as Haptics from 'expo-haptics';
import { router } from "expo-router";
import { push } from "expo-router/build/global-state/routing";
import { Button, Card, Popover, PopoverTriggerRef, Spinner, Toast, useThemeColor, useToast } from "heroui-native";
import { useEffect, useRef, useState } from "react";
import { Alert, Dimensions, FlatList, Pressable, StyleSheet, View } from "react-native";
import { formatCurrency } from "react-native-format-currency";
import { SafeAreaView } from "react-native-safe-area-context";

const HEIGHT = Dimensions.get('window').height * .35;

export default function Clients() {
    const { clients, deleteClient, isLoading } = useClients();
    const { settings } = useSettings();
    const { isPro, isChecking } = useUserStatus();
    const { showToast } = usePremiumToast();
    const { sessions, unlinkClientFromSessions, deleteSessionsByClientId } = useSessions();

    const [showGetProLabel, setShowGetProLabel] = useState(false);

    const muted = useThemeColor('muted');
    const accent = useThemeColor('accent');
    const foreground = useThemeColor('foreground');

    const handleAddClient = () => {
        if (isPro || clients.length < 3) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
            push('/modals/new-client');
        } else {
            showToast(
                '✨ PRO Feature Locked', 
                'Free version is limited to 3 clients. Upgrade to PRO for unlimited clients!'
            );
        }
    }

    useEffect(() => {
        if (!isPro && clients.length >= 3) setShowGetProLabel(true);
    }, [isPro, clients]);

    if (isChecking || isLoading) return <Spinner />;

    const renderItem = ({ item }: { item: Client }) => {
        const sessionsCount = sessions.filter(s => s.clientId === item.id).length;

        return (
            <Card style={[styles.card, item.isDefault && { borderColor: accent, borderWidth: 1 }, { backgroundColor: accent + '20' }]}>
                <Card.Body style={{ flexDirection: 'column', gap: Layout.spacing * 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Layout.spacing, justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "space-between", gap: Layout.spacing }}>
                            <View style={{ 
                                width: 14, 
                                height: 14, 
                                borderRadius: 999, 
                                backgroundColor: item.color || accent + '20' 
                            }} />
                            <AppText style={{ 
                                color: item.color || accent + '20', 
                                fontSize: 28, 
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5
                            }}>
                                {item.name}
                            </AppText>
                        </View>
                        <ClientItemPopoverOptions 
                            item={item} 
                            deleteClient={deleteClient} 
                            hasSessions={sessionsCount > 0}
                            unlinkClientFromSessions={unlinkClientFromSessions}
                            deleteSessionsByClientId={deleteSessionsByClientId} 
                        />
                    </View>
                    
                    <AppText style={[styles.rate, { color: muted }]}>
                    {item.defaultRate && item.defaultRate !== '0' ? 
                            `${formatCurrency({ amount: parseFloat(item.defaultRate || '0'), code: settings?.currency || 'USD' })[0]} / hr` : 
                            'Global Rate'}
                    </AppText>

                    <View style={[styles.cardBody]}>
                        <AppText style={[styles.rate, { color: muted }]}>{sessionsCount > 0 ? 
                            `Total sessions: ${sessionsCount}` : 
                            'No saved sessions for this client'}</AppText>
                    </View>
                </Card.Body>
            </Card>
        );
    }

    return <SafeAreaView style={[styles.container]}>
        <ClientHeader />
        <FlatList
            data={clients}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
                <View style={{ marginTop: HEIGHT, justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }}>
                    <Icon name="briefcase-outline" color={muted} />
                    <AppText style={{ color: muted, marginTop: Layout.spacing * 2, fontSize: 18, textAlign: 'center' }}>
                        No saved clients. Click + button to save the first client.
                    </AppText>
                </View>
            }
        />
        <View
            style={{ 
                position: 'absolute',
                bottom: 0,
                right: 0,
                margin: Layout.spacing * 5,
            }}
        >
            {showGetProLabel && <GetProLabel left={15} top={-5} />}
            <Button isIconOnly variant="primary" size="lg" onPress={handleAddClient}>
                <Icon name="add-outline" color={foreground} />
            </Button>
        </View>
    </SafeAreaView>
}

type ClientItemPopoverOptionsProps = {
    item: Client;
    hasSessions?: boolean;
    deleteClient: (id: string) => void;
    unlinkClientFromSessions: (id: string) => void;
    deleteSessionsByClientId: (id: string) => void;
}

const ClientItemPopoverOptions = ({ 
    item, 
    hasSessions, 
    deleteClient, 
    unlinkClientFromSessions, 
    deleteSessionsByClientId 
}: ClientItemPopoverOptionsProps) => {
    const muted = useThemeColor('muted');
    const background = useThemeColor('background');
    const foreground = useThemeColor('foreground');
    const accent = useThemeColor('accent');

    const popoverRef = useRef<PopoverTriggerRef>(null);

    const { toast } = useToast();
    const { isPro } = useUserStatus();
    const { showToast: showPremiumToast } = usePremiumToast();

    const popoverTrigger = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        popoverRef.current?.open();
    }

    const showToast = (label: string) => {
        toast.show({
            component: (props) => (
                <Toast 
                    variant="default" 
                    placement="top"
                    style={{ backgroundColor: background, borderColor: accent }} 
                    className="border-1 p-5" {...props}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Toast.Label style={{ fontSize: 22 }}>{label}</Toast.Label>
                            <Toast.Description style={{ fontSize: 16 }}>Your client has been deleted.</Toast.Description>
                        </View>
                    </View>
                </Toast>
            ),
        });
    }

    const handleDelete = () => {
        popoverRef.current?.close();
        if (!hasSessions) {
            Alert.alert("Delete Client", "Are you sure you want to delete this client?", [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: () => {
                        deleteClient(item.id);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        showToast('Client Deleted');
                    }
                }
            ]);
            return;
        }

            Alert.alert(
            "Client has active sessions",
            `This client is linked to active sessions. How do you want to proceed?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete Client Only",
                    onPress: () => {
                        unlinkClientFromSessions(item.id); 
                        
                        deleteClient(item.id);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        showToast('Client deleted, history kept');
                    }
                },
                {
                    text: "Delete Everything",
                    style: "destructive",
                    onPress: () => {
                        deleteSessionsByClientId(item.id);
                        
                        deleteClient(item.id);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        showToast('Client and history deleted');
                    }
                }
            ]
        );
    }

    const handleViewSessions = () => {
        popoverRef.current?.close();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.navigate('/cards/sessions-list');
    }

    const handleEdit = () => {
        popoverRef.current?.close();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        router.push({ 
            pathname: '/modals/edit-client', 
            params: { id: item.id } }
        );
    }    

    const handleCreateInvoice = async () => {
        popoverRef.current?.close();
        if (!isPro) {
            showPremiumToast('✨ PRO Feature Locked', 'Generate Invoice requires PRO. Upgrade to unlock!');        
            
            return;
        }
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push({ 
            pathname: '/modals/invoice-config', 
            params: { id: item.id } 
        });
    };

    return (
        <Popover>
            <Popover.Trigger ref={popoverRef} asChild>
                <Pressable onPress={popoverTrigger}>
                    <Icon name="ellipsis-horizontal-outline" color={muted} />
                </Pressable>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Overlay />
                <BlurView
                    intensity={25}
                    tint="dark"
                    style={{
                        ...StyleSheet.absoluteFillObject,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        overflow: 'hidden',
                    }}
                >
                    <Popover.Content 
                        backgroundStyle={{ 
                            backgroundColor: background, 
                            borderTopLeftRadius: Layout.borderRadius,
                            borderTopRightRadius: Layout.borderRadius, 
                        }}
                        presentation='bottom-sheet'
                        snapPoints={['60%']}
                    >
                        <View style={{ paddingHorizontal: Layout.spacing }}>
                            <Button
                                style={{ 
                                    backgroundColor: 'transparent', 
                                    marginTop: Layout.spacing * 2,
                                    borderColor: accent,
                                    borderWidth: 1,
                                    borderRadius: 9999,
                                    paddingHorizontal: Layout.spacing * 3,
                                    paddingVertical: Layout.spacing / 1.5, 
                                }}
                                onPress={handleEdit}
                            >
                                <Icon name="pencil-outline" color={accent} />
                                <Button.Label style={{ color: accent, fontSize: 18, fontWeight: '700' }}>
                                    Edit Client
                                </Button.Label>
                            </Button>
                            {hasSessions && <Button
                                style={{ 
                                    backgroundColor: 'transparent', 
                                    marginTop: Layout.spacing * 2,
                                    borderColor: accent,
                                    borderWidth: 1,
                                    borderRadius: 9999,
                                    paddingHorizontal: Layout.spacing * 3,
                                    paddingVertical: Layout.spacing / 1.5, 
                                }}
                                onPress={handleCreateInvoice}
                            >
                                <Icon name="document-text-outline" color={accent} />
                                <Button.Label style={{ color: accent, fontSize: 18, fontWeight: '700' }}>Create Invoice</Button.Label>
                            </Button>}
                            {hasSessions && <Button 
                                variant="tertiary" 
                                style={{ 
                                    backgroundColor: 'transparent', 
                                    marginTop: Layout.spacing * 2,
                                    borderColor: accent,
                                    borderWidth: 1,
                                    borderRadius: 9999,
                                    paddingHorizontal: Layout.spacing * 3,
                                    paddingVertical: Layout.spacing / 1.5, 
                                }}
                                onPress={handleViewSessions}
                            >
                                <Icon name="list-outline" color={accent} />
                                <Button.Label style={{ color: accent, fontSize: 18, fontWeight: '700' }}>
                                    View Sessions
                                </Button.Label>
                            </Button>}
                            <Button 
                                variant="destructive" 
                                style={{ marginTop: Layout.spacing * 2 }} 
                                onPress={handleDelete}
                            >
                                <Icon name="trash-outline" color={foreground} />
                                <Button.Label style={{ fontSize: 18, fontWeight: '700' }}>
                                    Delete Client
                                </Button.Label>
                            </Button>
                        </View>
                    </Popover.Content>
                </BlurView>
            </Popover.Portal>
        </Popover>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: Layout.spacing * 3
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Layout.spacing,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    listContent: {
        paddingHorizontal: Layout.spacing * 2,
        paddingBottom: 100,
    },
    clientRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        padding: Layout.spacing
    },
    clientName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    clientDetails: {
        fontSize: 14,
    },
    emptyState: {
        marginTop: 100,
        alignItems: 'center',
        gap: 8,
    },
    fab: {
        position: 'absolute',
        bottom: 40,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    card: {
        marginTop: Layout.spacing * 2,
        borderRadius: Layout.borderRadius
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    rate: {
        fontSize: 22
    },
});
