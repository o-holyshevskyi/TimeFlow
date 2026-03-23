import { Layout } from "@/constants/layout";
import { useClients } from "@/hooks/use-clients";
import { Session } from "@/hooks/use-sessions";
import { BlurView } from "expo-blur";
import * as Haptic from 'expo-haptics';
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Button, Popover, PopoverTriggerRef, Toast, useThemeColor, useToast } from "heroui-native";
import { useRef } from "react";
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { formatCurrency } from "react-native-format-currency";
import { AppText } from "../ui/app-text";
import { Icon } from "../ui/icon";

const formatTimestampToTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

export const formatTime = (ms: number): { hours: string; minutes: string; seconds: string; duration: string } => {
    const totalSeconds = Math.floor(ms / 1000);
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = (totalMinutes % 60).toString().padStart(2, '0');
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours.toString().padStart(2, '0');
    const duration = `${totalHours}h ${minutes}m`;
    return { hours, minutes, seconds, duration };
};

export const calculateAmount = (elapsedTimeMs: number, ratePerHour: string, currency: string): string => {
    const rate = parseFloat(ratePerHour);
    if (isNaN(rate) || rate <= 0) return `${currency} 0.00`;
    const totalHours = (elapsedTimeMs / (1000 * 60 * 60)).toFixed(2);
    const amount = parseFloat(totalHours) * rate;
    const [formatted] = formatCurrency({ amount: parseFloat(amount.toFixed(2)), code: currency });
    return formatted;
};

type SessionCardProps = {
    item: Session;
    foreground: string;
    muted: string;
    isFading: boolean;
    deleteSession: (id: string) => void;
}

const SessionCard = ({ item, foreground, muted, isFading, deleteSession }: SessionCardProps) => {
    const accent = useThemeColor('accent');
    const surface = useThemeColor('surface');
    const background = useThemeColor('background');

    const startTimeStr = formatTimestampToTime(item.startTime);
    const endTimeStr = formatTimestampToTime(item.endTime);
    const { duration } = formatTime(item.elapsedTime);
    const { clients } = useClients();

    const client = item.clientId ? clients.find(c => c.id === item.clientId) : null;
    const rateToUse = client?.defaultRate || item.rate;
    const amountStr = calculateAmount(item.elapsedTime, rateToUse, item.currency);
    const [formattedRate] = formatCurrency({ amount: parseFloat(rateToUse), code: item.currency });
    const clientColor = client?.color || accent;

    return (
        <View style={[styles.card, {
            backgroundColor: surface,
            borderColor: muted + '20',
            borderWidth: 1,
        }]}>
            {/* Client color accent bar */}
            {client && (
                <View style={[styles.clientBar, { backgroundColor: clientColor }]} />
            )}

            <View style={styles.cardContent}>
                {/* Top row: client chip + menu */}
                <View style={styles.topRow}>
                    {client ? (
                        <View style={[styles.clientChip, {
                            backgroundColor: clientColor + '12',
                            borderColor: clientColor + '30',
                            borderWidth: 1,
                        }]}>
                            <View style={[styles.clientDot, { backgroundColor: clientColor }]} />
                            <AppText style={[styles.clientName, { color: clientColor }]}>
                                {client.name}
                            </AppText>
                        </View>
                    ) : (
                        <View />
                    )}
                    <SessionItemPopoverOptions item={item} deleteSession={deleteSession} />
                </View>

                {/* Amount */}
                <AppText style={[styles.amount, { color: foreground }]}>{amountStr}</AppText>

                {/* Meta row: duration + time range */}
                <View style={styles.metaRow}>
                    <View style={[styles.durationChip, {
                        backgroundColor: accent + '12',
                        borderColor: accent + '25',
                        borderWidth: 1,
                    }]}>
                        <Icon name="time-outline" color={accent} size={12} />
                        <AppText style={[styles.durationText, { color: accent }]}>{duration}</AppText>
                    </View>
                    <AppText style={[styles.timeRange, { color: muted }]}>
                        {startTimeStr} – {endTimeStr}
                    </AppText>
                </View>

                {/* Rate */}
                <AppText style={[styles.rate, { color: muted }]}>
                    {formattedRate}/hr
                </AppText>
            </View>

            {isFading && (
                <LinearGradient
                    colors={[background, `${background}00`]}
                    start={{ x: 0.5, y: 1 }}
                    end={{ x: 0.5, y: 0 }}
                    style={[StyleSheet.absoluteFillObject, { borderRadius: 16, zIndex: 2 }]}
                />
            )}
        </View>
    );
}

const SessionItemPopoverOptions = ({ item, deleteSession }: { item: Session, deleteSession: (id: string) => void }) => {
    const muted = useThemeColor('muted');
    const background = useThemeColor('background');
    const foreground = useThemeColor('foreground');
    const accent = useThemeColor('accent');
    const popoverRef = useRef<PopoverTriggerRef>(null);
    const { toast } = useToast();

    const popoverTrigger = () => {
        Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Heavy);
        popoverRef.current?.open();
    };

    const showToast = () => {
        toast.show({
            component: (props) => (
                <Toast
                    variant="default"
                    placement="top"
                    style={{ backgroundColor: background, borderColor: accent }}
                    className="border-1 p-5"
                    {...props}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Toast.Label style={{ fontSize: 22 }}>Session Deleted</Toast.Label>
                            <Toast.Description style={{ fontSize: 16 }}>Your session has been deleted.</Toast.Description>
                        </View>
                    </View>
                </Toast>
            ),
        });
    };

    const handleDelete = () => {
        popoverRef.current?.close();
        Alert.alert("Delete Session", "Are you sure you want to delete this session?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: () => {
                    deleteSession(item.id);
                    Haptic.notificationAsync(Haptic.NotificationFeedbackType.Warning);
                    showToast();
                }
            }
        ]);
    };

    const handleEdit = () => {
        popoverRef.current?.close();
        Haptic.notificationAsync(Haptic.NotificationFeedbackType.Warning);
        router.push({ pathname: '/modals/edit-session', params: { id: item.id } });
    };

    return (
        <Popover>
            <Popover.Trigger ref={popoverRef} asChild>
                <Pressable onPress={popoverTrigger} style={styles.menuButton}>
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
                        <View style={{ paddingHorizontal: Layout.spacing * 2, paddingTop: Layout.spacing * 2, gap: Layout.spacing * 2 }}>
                            <Button
                                variant="tertiary"
                                style={{ backgroundColor: 'transparent', borderColor: accent, borderWidth: 1, borderRadius: 9999 }}
                                onPress={handleEdit}
                            >
                                <Icon name="pencil-outline" color={accent} />
                                <Button.Label style={{ color: accent, fontSize: 18, fontWeight: '700' }}>Edit Session</Button.Label>
                            </Button>
                            <Button variant="destructive" onPress={handleDelete}>
                                <Icon name="trash-outline" color={foreground} />
                                <Button.Label style={{ fontSize: 18, fontWeight: '700', color: foreground }}>Delete Session</Button.Label>
                            </Button>
                        </View>
                    </Popover.Content>
                </BlurView>
            </Popover.Portal>
        </Popover>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        flexDirection: 'row',
    },
    clientBar: {
        width: 4,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    cardContent: {
        flex: 1,
        padding: 16,
        gap: 8,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    clientChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
    },
    clientDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    clientName: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    menuButton: {
        padding: 4,
    },
    amount: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    durationChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
    },
    durationText: {
        fontSize: 12,
        fontWeight: '600',
    },
    timeRange: {
        fontSize: 13,
    },
    rate: {
        fontSize: 12,
        opacity: 0.7,
    },
});

export default SessionCard;
