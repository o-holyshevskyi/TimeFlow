import { Layout } from "@/constants/layout";
import { Session } from "@/hooks/use-sessions";
import { Link } from "expo-router";
import { Card, useThemeColor } from "heroui-native";
import { StyleSheet, Text, View } from "react-native";
import { formatCurrency } from "react-native-format-currency";
import { calculateAmount } from "../sessions/session-card";
import { Icon } from "../ui/icon";

export const RecentHistory = ({ sessions }: { sessions: Session[] }) => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const accent = useThemeColor('accent');

    const recentSessions = sessions
        .sort((a, b) => b.startTime - a.startTime)
        .slice(0, 3);

    const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

    return (
        <View style={{ gap: Layout.spacing * 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: "space-between", paddingHorizontal: Layout.spacing * 2 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: foreground }}>
                    Recent Activity
                </Text>
                <Link href="/cards/sessions-list" style={{ fontSize: 18, fontWeight: '700', color: accent }}>
                    View All
                </Link>
            </View>
            
            {recentSessions.length === 0 &&
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Icon name="timer-outline" color={muted} />
                    <Text style={{ color: muted, marginTop: Layout.spacing * 2, fontSize: 18, textAlign: 'center' }}>
                        No saved session. Start the timer to save the first session.
                    </Text>
                </View>
            }

            {recentSessions.map((session) => {
                const amount = calculateAmount(session.elapsedTime, session.rate, session.currency);
                const hours = (session.elapsedTime / 1000 / 3600).toFixed(1);

                const [formatted] = formatCurrency({
                    amount: parseFloat(session.rate),
                    code: session.currency,
                });
                const rateStr = `${formatted} / hr`;

                return (
                    <Card key={session.id} style={[styles.item, { backgroundColor: '#1C2D23' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Layout.spacing * 2 }}>
                            <View style={{ padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                                <Icon name="briefcase-outline" color={muted} size={20} />
                            </View>
                            <View>
                                <Text style={{ color: foreground, fontWeight: '600', fontSize: 16 }}>
                                    {dateFormatter.format(new Date(session.startTime))}
                                </Text>
                                <Text style={{ color: muted, fontSize: 14 }}>
                                    {hours} hrs • {rateStr}
                                </Text>
                            </View>
                        </View>
                        <Text style={{ color: accent, fontWeight: '700', fontSize: 16 }}>
                            +{amount}
                        </Text>
                    </Card>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Layout.spacing * 2,
        borderRadius: Layout.borderRadius,
        paddingHorizontal: Layout.spacing * 4
    }
});