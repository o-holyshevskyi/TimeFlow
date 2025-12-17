import { Layout } from "@/constants/layout";
import { Session } from "@/hooks/use-sessions";
import { BlurView } from "expo-blur";
import * as Haptic from 'expo-haptics';
import { LinearGradient } from "expo-linear-gradient";
import { Button, Card, Popover, PopoverTriggerRef, Toast, useThemeColor, useToast } from "heroui-native";
import { useRef } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
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
    if (isNaN(rate) || rate <= 0) {
        return `${currency} 0.00`;
    }
    const totalHours = (elapsedTimeMs / (1000 * 60 * 60)).toFixed(2);
    const amount = parseFloat(totalHours) * rate;
    return `${currency} ${amount.toFixed(2)}`;
};

type SessionCardProps = {
    item: Session;
    foreground: string;
    muted: string;
    isFading: boolean;
    deleteSession: (id: string) => void;
}

const SessionCard = ({ item, foreground, muted, isFading, deleteSession }: SessionCardProps) => {
    const startTimeStr = formatTimestampToTime(item.startTime);
    const endTimeStr = formatTimestampToTime(item.endTime);
    const { duration } = formatTime(item.elapsedTime); 
    
    const amountStr = calculateAmount(item.elapsedTime, item.rate, item.currency);
    const rateStr = `${item.currency}${item.rate}/hr`;
    
    const background = useThemeColor('background');

    return (
        <Card style={[styles.card]}>
            <Card.Body style={{ flexDirection: 'column', gap: Layout.spacing * 2 }}>
                <View style={[styles.cardBody]}>
                    <Text style={[styles.amount, { color: foreground }]}>{amountStr}</Text>
                    <SessionItemPopoverOptions item={item} deleteSession={deleteSession} />
                </View>
                <Text style={[styles.time, { color: muted }]}>
                    {startTimeStr} - {endTimeStr} ({duration})
                </Text>
                <Text style={[styles.rate, { color: muted }]}>{rateStr}</Text>
            </Card.Body>
            {isFading && (
                <LinearGradient
                    colors={[background, `${background}00`]}
                    start={{ x: 0.5, y: 1 }}
                    end={{ x: 0.5, y: 0 }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: Layout.borderRadius,
                        zIndex: 2,
                    }}
                />
            )}
        </Card>
    );
}

const SessionItemPopoverOptions = ({ item, deleteSession }: { item: Session, deleteSession: (id: string) => void }) => {
    const muted = useThemeColor('muted');
    const background = useThemeColor('background');

    const popoverRef = useRef<PopoverTriggerRef>(null);

    const { toast } = useToast();

    const popoverTrigger = () => {
        Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Heavy);
        popoverRef.current?.open();
    }

    const showToast = () => {
        toast.show({
            component: (props) => (
                <Toast variant="default" placement="top" className="bg-[#0f172aff] border-[#334155] border-1 p-5" {...props}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Toast.Label style={{ fontSize: 22 }}>Session Deleted</Toast.Label>
                            <Toast.Description style={{ fontSize: 16 }}>Your session has been deleted.</Toast.Description>
                        </View>
                    </View>
                </Toast>
            ),
        });
    }

    const handleDelete = () => {
        popoverRef.current?.close();
        Alert.alert("Delete Session", "Are you sure you want to delete this session?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => {
                deleteSession(item.id);
                Haptic.notificationAsync(Haptic.NotificationFeedbackType.Warning);
                showToast();
            }}
        ]);
    }

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
                                variant="tertiary" 
                                style={{ 
                                    backgroundColor: 'transparent', 
                                    marginTop: Layout.spacing * 2,
                                    borderColor: '#334155',
                                    borderWidth: 1,
                                    borderRadius: 9999,
                                    paddingHorizontal: Layout.spacing * 3,
                                    paddingVertical: Layout.spacing / 1.5, 
                                }}
                            >
                                <Icon name="pencil-outline" color="white" />
                                <Button.Label style={{ fontSize: 18, fontWeight: '700' }}>
                                    Edit Session
                                </Button.Label>
                            </Button>
                            <Button 
                                variant="destructive" 
                                style={{ marginTop: Layout.spacing * 2 }} 
                                onPress={handleDelete}
                            >
                                <Icon name="trash-outline" color="white" />
                                <Button.Label style={{ fontSize: 18, fontWeight: '700' }}>
                                    Delete Session
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
    groupContainer: {
        marginBottom: Layout.spacing * 4,
    },
    card: {
        marginTop: Layout.spacing * 2,
        backgroundColor: '#1C2D23',
        borderRadius: Layout.borderRadius
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    amount: {
        fontSize: 35,
        fontWeight: 800
    },
    time: {
        fontSize: 24
    },
    rate: {
        fontSize: 22
    }
})

export default SessionCard;