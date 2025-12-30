import { Layout } from "@/constants/layout"
import { useClients } from "@/hooks/use-clients"
import { Session } from "@/hooks/use-sessions"
import { useSettings } from "@/hooks/use-settings"
import { useInsights } from "@/hooks/useInsights"
import { Card, useThemeColor } from "heroui-native"
import { useMemo } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { formatCurrency } from "react-native-format-currency"
import { Icon } from "../ui/icon"

export const InsightsCard = ({sessions}: {sessions: Session[]}) => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const accent = useThemeColor('accent');
    
    const { settings } = useSettings();
    const { clients } = useClients();
    const insights = useInsights(sessions);

    const topClient = useMemo(() => {
        if (!sessions.length || !clients.length) return null;

        const clientEarnings: Record<string, number> = {};

        sessions.forEach(session => {
            if (session.clientId && session.rate) {
                const hours = session.elapsedTime / (1000 * 60 * 60);
                const amount = hours * parseFloat(session.rate);
                
                if (!isNaN(amount)) {
                    clientEarnings[session.clientId] = (clientEarnings[session.clientId] || 0) + amount;
                }
            }
        });

        let bestClientId: any = null;
        let maxAmount = 0;

        Object.entries(clientEarnings).forEach(([id, amount]) => {
            if (amount > maxAmount) {
                maxAmount = amount;
                bestClientId = id;
            }
        });

        if (bestClientId) {
            const client = clients.find(c => c.id === bestClientId);
            return client ? { name: client.name, amount: maxAmount } : null;
        }
        return null;
    }, [sessions, clients]);
    
    return <View style={{ gap: Layout.spacing }}>
        <Text style={[styles.sectionTitle, { color: foreground }]}>Insights 💡</Text>
        
        {sessions.length === 0 &&
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Icon name="timer-outline" color={muted} />
                <Text style={{ color: muted, marginTop: Layout.spacing * 2, fontSize: 18, textAlign: 'center' }}>
                    No saved session. Start the timer to save the first session.
                </Text>
            </View>
        }

        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ 
                gap: Layout.spacing, 
                paddingRight: Layout.spacing * 2
            }}
        >
            <Card style={styles.insightCard}>
                <Text style={[styles.label, { color: muted }]}>Projected Earnings</Text>
                <Text style={[styles.value, { color: foreground }]}>
                    {formatCurrency({ amount: parseFloat(insights?.projected || '0') ?? 0, code: settings?.currency || 'USD' })[0]}
                </Text>
                <Text style={[styles.subtext, { color: accent }]}>by end of month</Text>
            </Card>
            {topClient && (
                <Card style={styles.insightCard}>
                    <Text style={[styles.label, { color: muted }]}>Top Client</Text>
                    <Text numberOfLines={1} style={[styles.value, { color: foreground, fontSize: 22 }]}>
                        {topClient.name}
                    </Text>
                    <Text style={[styles.subtext, { color: accent }]}>
                        {formatCurrency({ amount: topClient.amount, code: settings?.currency || 'USD' })[0]} earned
                    </Text>
                </Card>
            )}
            <Card style={styles.insightCard}>
                <Text style={[styles.label, { color: muted }]}>Most Profitable Day</Text>
                <Text style={[styles.value, { color: foreground }]}>
                    {insights?.bestDay || '—'}
                </Text>
                <Text style={[styles.subtext, { color: accent }]}>keep pushing!</Text>
            </Card>
            <Card style={styles.insightCard}>
                <Text style={[styles.label, { color: muted }]}>Daily Average</Text>
                <Text style={[styles.value, { color: foreground }]}>
                    {formatCurrency({ amount: parseFloat(insights?.dailyAverage ?? '0') ?? 0, code: settings?.currency || 'USD' })[0]}
                </Text>
                <Text style={[styles.subtext, { color: accent }]}>per day</Text>
            </Card>
            <Card style={styles.insightCard}>
                <Text style={[styles.label, { color: muted }]}>Avg Session</Text>
                <Text style={[styles.value, { color: foreground }]}>
                    {insights?.avgSession || '0'} hrs
                </Text>
                <Text style={[styles.subtext, { color: accent }]}>focus time</Text>
            </Card>
            <Card style={styles.insightCard}>
                <Text style={[styles.label, { color: muted }]}>Your Rhythm</Text>
                <Text style={[styles.value, { color: foreground, fontSize: 22 }]}>
                    {insights?.persona?.emoji} {insights?.persona?.title || '—'}
                </Text>
                <Text style={[styles.subtext, { color: accent }]}>most active time</Text>
            </Card>
        </ScrollView>
    </View>
}



const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginLeft: Layout.spacing,
        marginTop: Layout.spacing,
    },
    insightCard: {
        backgroundColor: '#1C2D23',
        borderRadius: Layout.borderRadius,
        padding: Layout.spacing * 4,
        minWidth: 160,
        height: 110,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        textTransform: 'uppercase',
        opacity: 0.8,
        letterSpacing: 0.5,
    },
    value: {
        fontSize: 24,
        fontWeight: '900',
        marginVertical: 4,
    },
    subtext: {
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.9,
    }
});
