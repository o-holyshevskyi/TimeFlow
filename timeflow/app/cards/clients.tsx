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
import { Button, Popover, PopoverTriggerRef, Spinner, Toast, useThemeColor, useToast } from "heroui-native";
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
    const surface = useThemeColor('surface');

    const handleAddClient = () => {
        if (isPro || clients.length < 3) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
            push('/modals/new-client');
        } else {
            showToast('✨ PRO Feature', 'Free version is limited to 3 clients. Upgrade for unlimited clients.');
        }
    };

    useEffect(() => {
        if (!isPro && clients.length >= 3) setShowGetProLabel(true);
    }, [isPro, clients]);

    if (isChecking || isLoading) return <Spinner />;

    const renderItem = ({ item }: { item: Client }) => {
        const sessionsCount = sessions.filter(s => s.clientId === item.id).length;
        const clientColor = item.color || accent;
        const rateDisplay = item.defaultRate && item.defaultRate !== '0'
            ? `${formatCurrency({ amount: parseFloat(item.defaultRate || '0'), code: settings?.currency || 'USD' })[0]}/hr`
            : 'Global rate';

        return (
            <View style={[styles.card, { backgroundColor: surface, borderColor: muted + '20', borderWidth: 1 }]}>
                {/* Left color bar */}
                <View style={[styles.colorBar, { backgroundColor: clientColor }]} />

                <View style={styles.cardContent}>
                    {/* Avatar + info row */}
                    <View style={styles.cardRow}>
                        <View style={[styles.avatar, { backgroundColor: clientColor + '20', borderColor: clientColor + '40', borderWidth: 1 }]}>
                            <AppText style={[styles.avatarText, { color: clientColor }]}>
                                {item.name.charAt(0).toUpperCase()}
                            </AppText>
                        </View>

                        <View style={styles.clientInfo}>
                            <View style={styles.nameRow}>
                                <AppText style={[styles.clientName, { color: foreground }]}>{item.name}</AppText>
                                {item.isDefault && (
                                    <View style={[styles.defaultBadge, { backgroundColor: accent + '15', borderColor: accent + '35', borderWidth: 1 }]}>
                                        <AppText style={[styles.defaultBadgeText, { color: accent }]}>Default</AppText>
                                    </View>
                                )}
                            </View>
                            <AppText style={[styles.clientMeta, { color: muted }]}>
                                {rateDisplay} · {sessionsCount === 0 ? 'No sessions' : `${sessionsCount} session${sessionsCount !== 1 ? 's' : ''}`}
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
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ClientHeader />
            <FlatList
                data={clients}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIconBox, { backgroundColor: muted + '15' }]}>
                            <Icon name="briefcase-outline" color={muted} size={28} />
                        </View>
                        <AppText style={[styles.emptyTitle, { color: foreground }]}>No clients yet</AppText>
                        <AppText style={[styles.emptySubtitle, { color: muted }]}>
                            Tap + to add your first client
                        </AppText>
                    </View>
                }
            />
            <View style={styles.fabContainer}>
                {showGetProLabel && <GetProLabel left={15} top={-5} />}
                <Button isIconOnly variant="primary" size="lg" onPress={handleAddClient}>
                    <Icon name="add-outline" color={foreground} />
                </Button>
            </View>
        </SafeAreaView>
    );
}

type ClientItemPopoverOptionsProps = {
    item: Client;
    hasSessions?: boolean;
    deleteClient: (id: string) => void;
    unlinkClientFromSessions: (id: string) => void;
    deleteSessionsByClientId: (id: string) => void;
};

const ClientItemPopoverOptions = ({
    item,
    hasSessions,
    deleteClient,
    unlinkClientFromSessions,
    deleteSessionsByClientId,
}: ClientItemPopoverOptionsProps) => {
    const muted = useThemeColor('muted');
    const background = useThemeColor('background');
    const foreground = useThemeColor('foreground');
    const accent = useThemeColor('accent');
    const danger = useThemeColor('danger');

    const popoverRef = useRef<PopoverTriggerRef>(null);
    const { toast } = useToast();
    const { isPro } = useUserStatus();
    const { showToast: showPremiumToast } = usePremiumToast();

    const showToast = (label: string) => {
        toast.show({
            component: (props) => (
                <Toast
                    variant="default"
                    placement="top"
                    style={{ backgroundColor: background, borderColor: muted + '30' }}
                    className="border-1 p-5" {...props}
                >
                    <View>
                        <Toast.Label style={{ fontSize: 22 }}>{label}</Toast.Label>
                        <Toast.Description style={{ fontSize: 16 }}>Your client has been deleted.</Toast.Description>
                    </View>
                </Toast>
            ),
        });
    };

    const handleDelete = () => {
        popoverRef.current?.close();
        if (!hasSessions) {
            Alert.alert("Delete Client", "Are you sure you want to delete this client?", [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: "destructive", onPress: () => {
                        deleteClient(item.id);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        showToast('Client Deleted');
                    }
                }
            ]);
            return;
        }
        Alert.alert("Client has sessions", "This client is linked to sessions. How do you want to proceed?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete Client Only", onPress: () => {
                    unlinkClientFromSessions(item.id);
                    deleteClient(item.id);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    showToast('Client deleted, history kept');
                }
            },
            {
                text: "Delete Everything", style: "destructive", onPress: () => {
                    deleteSessionsByClientId(item.id);
                    deleteClient(item.id);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    showToast('Client and history deleted');
                }
            }
        ]);
    };

    const handleViewSessions = () => {
        popoverRef.current?.close();
        router.navigate('/cards/sessions-list');
    };

    const handleEdit = () => {
        popoverRef.current?.close();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        router.push({ pathname: '/modals/edit-client', params: { id: item.id } });
    };

    const handleCreateInvoice = async () => {
        popoverRef.current?.close();
        if (!isPro) {
            showPremiumToast('✨ PRO Feature', 'Generate Invoice requires PRO. Upgrade to unlock!');
            return;
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push({ pathname: '/modals/invoice-config', params: { id: item.id } });
    };

    return (
        <Popover>
            <Popover.Trigger ref={popoverRef} asChild>
                <Pressable
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                        popoverRef.current?.open();
                    }}
                    style={styles.menuBtn}
                >
                    <Icon name="ellipsis-horizontal" color={muted} size={18} />
                </Pressable>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Overlay />
                <BlurView
                    intensity={25}
                    tint="dark"
                    style={{ ...StyleSheet.absoluteFillObject, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' }}
                >
                    <Popover.Content
                        backgroundStyle={{ backgroundColor: background, borderTopLeftRadius: Layout.borderRadius, borderTopRightRadius: Layout.borderRadius }}
                        presentation='bottom-sheet'
                        snapPoints={['60%']}
                    >
                        <View style={styles.popoverContent}>
                            <Button
                                variant="tertiary"
                                style={{ backgroundColor: 'transparent', borderColor: accent, borderWidth: 1, borderRadius: 14 }}
                                onPress={handleEdit}
                            >
                                <Icon name="pencil-outline" color={accent} />
                                <Button.Label style={{ color: accent, fontSize: 16, fontWeight: '600' }}>Edit Client</Button.Label>
                            </Button>
                            {hasSessions && (
                                <Button
                                    variant="tertiary"
                                    style={{ backgroundColor: 'transparent', borderColor: accent, borderWidth: 1, borderRadius: 14 }}
                                    onPress={handleCreateInvoice}
                                >
                                    <Icon name="document-text-outline" color={accent} />
                                    <Button.Label style={{ color: accent, fontSize: 16, fontWeight: '600' }}>Create Invoice</Button.Label>
                                </Button>
                            )}
                            {hasSessions && (
                                <Button
                                    variant="tertiary"
                                    style={{ backgroundColor: 'transparent', borderColor: accent, borderWidth: 1, borderRadius: 14 }}
                                    onPress={handleViewSessions}
                                >
                                    <Icon name="list-outline" color={accent} />
                                    <Button.Label style={{ color: accent, fontSize: 16, fontWeight: '600' }}>View Sessions</Button.Label>
                                </Button>
                            )}
                            <Button
                                variant="destructive"
                                style={{ borderRadius: 14 }}
                                onPress={handleDelete}
                            >
                                <Icon name="trash-outline" color={foreground} />
                                <Button.Label style={{ fontSize: 16, fontWeight: '600' }}>Delete Client</Button.Label>
                            </Button>
                        </View>
                    </Popover.Content>
                </BlurView>
            </Popover.Portal>
        </Popover>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: Layout.spacing * 4,
        paddingTop: Layout.spacing * 2,
        paddingBottom: 100,
        gap: Layout.spacing * 2,
    },
    card: {
        borderRadius: 16,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    colorBar: {
        width: 4,
    },
    cardContent: {
        flex: 1,
        padding: 14,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
    },
    clientInfo: {
        flex: 1,
        gap: 3,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    clientName: {
        fontSize: 16,
        fontWeight: '700',
    },
    defaultBadge: {
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 20,
    },
    defaultBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    clientMeta: {
        fontSize: 13,
        fontWeight: '400',
    },
    menuBtn: {
        padding: 6,
    },
    emptyState: {
        marginTop: HEIGHT * 0.6,
        alignItems: 'center',
        gap: 10,
    },
    emptyIconBox: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    emptySubtitle: {
        fontSize: 14,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        margin: Layout.spacing * 5,
    },
    popoverContent: {
        paddingHorizontal: Layout.spacing * 2,
        paddingTop: Layout.spacing * 2,
        gap: Layout.spacing * 2,
    },
});
