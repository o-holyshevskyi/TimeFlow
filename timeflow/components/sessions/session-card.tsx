import { useClients } from "@/hooks/use-clients";
import { Session } from "@/hooks/use-sessions";
import * as Haptic from 'expo-haptics';
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useThemeColor } from "heroui-native";
import { useRef } from "react";
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import ContextMenu from 'react-native-context-menu-view';
import { formatCurrency } from "react-native-format-currency";
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
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
    const danger = useThemeColor('danger');

    const swipeableRef = useRef<any>(null);
    const { clients } = useClients();

    const startTimeStr = formatTimestampToTime(item.startTime);
    const endTimeStr = formatTimestampToTime(item.endTime);
    const { duration } = formatTime(item.elapsedTime);

    const client = item.clientId ? clients.find(c => c.id === item.clientId) : null;
    const rateToUse = client?.defaultRate || item.rate;
    const amountStr = calculateAmount(item.elapsedTime, rateToUse, item.currency);
    const [formattedRate] = formatCurrency({ amount: parseFloat(rateToUse), code: item.currency });
    const clientColor = client?.color || accent;

    const handleEdit = () => {
        Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Light);
        router.push({ pathname: '/modals/edit-session', params: { id: item.id } });
    };

    const handleDelete = () => {
        swipeableRef.current?.close();
        Alert.alert(
            'Delete Session',
            'This session will be permanently removed.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        deleteSession(item.id);
                        Haptic.notificationAsync(Haptic.NotificationFeedbackType.Warning);
                    },
                },
            ]
        );
    };

    return (
        <ReanimatedSwipeable
            ref={swipeableRef}
            friction={2}
            overshootRight={false}
            rightThreshold={72}
            renderRightActions={() => (
                <Pressable
                    style={[styles.deleteAction, { backgroundColor: danger }]}
                    onPress={handleDelete}
                >
                    <Icon name="trash-outline" color="white" size={20} />
                    <AppText style={styles.deleteLabel}>Delete</AppText>
                </Pressable>
            )}
        >
            <ContextMenu
                actions={[
                    { title: 'Edit', systemIcon: 'pencil' },
                    { title: 'Delete', systemIcon: 'trash', destructive: true },
                ]}
                onPress={(e) => {
                    if (e.nativeEvent.index === 0) handleEdit();
                    if (e.nativeEvent.index === 1) handleDelete();
                }}
                previewBackgroundColor="transparent"
            >
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
                        {/* Client chip (no three-dot menu — use long-press context menu) */}
                        {client && (
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
                        )}

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
            </ContextMenu>
        </ReanimatedSwipeable>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
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
    clientChip: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
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
    deleteAction: {
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
        borderRadius: 16,
        marginLeft: 8,
    },
    deleteLabel: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default SessionCard;
