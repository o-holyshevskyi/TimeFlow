import { Layout } from "@/constants/layout";
import { Session } from "@/hooks/use-sessions";
import { LinearGradient } from "expo-linear-gradient";
import { Card, useThemeColor } from "heroui-native";
import { StyleSheet, Text } from 'react-native';

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
}

const SessionCard = ({ item, foreground, muted, isFading }: SessionCardProps) => {
    const startTimeStr = formatTimestampToTime(item.startTime);
    const endTimeStr = formatTimestampToTime(item.endTime);
    const { duration } = formatTime(item.elapsedTime); 
    
    const amountStr = calculateAmount(item.elapsedTime, item.rate, item.currency);
    const rateStr = `${item.currency}${item.rate}/hr`;
    
    const background = useThemeColor('background');

    return (
        <Card style={[styles.card]}>
            <Card.Body style={{ flexDirection: 'column', gap: Layout.spacing * 2 }}>
                <Text style={[styles.amount, { color: foreground }]}>{amountStr}</Text>
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

const styles = StyleSheet.create({
    groupContainer: {
        marginBottom: Layout.spacing * 4,
    },
    card: {
        marginTop: Layout.spacing * 2,
        backgroundColor: '#1C2D23',
        borderRadius: Layout.borderRadius
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