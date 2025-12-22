import { Layout } from "@/constants/layout";
import { Session } from "@/hooks/use-sessions";
import { useSettings } from "@/hooks/use-settings";
import * as Haptics from 'expo-haptics';
import { Button, Card, useThemeColor } from "heroui-native";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { formatCurrency } from "react-native-format-currency";
import { BarChart, } from "react-native-gifted-charts";
import { Icon } from "../ui/icon";
import { usePremiumToast } from "../ui/premium-toast";

type PeriodType = 'week' | 'month';

const ChartCard = ({ sessions, isPro }: { sessions: Session[], isPro: boolean }) => {
    const { settings } = useSettings();
    const { showToast } = usePremiumToast()

    const [offset, setOffset] = useState(0);
    const [period, setPeriod] = useState<PeriodType>('week');

    const muted = useThemeColor('muted');
    const foreground = useThemeColor('foreground');
    const accent = useThemeColor('accent');
    
    const { startDate, finishDate, titleDate } = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (period === 'week') {
            now.setDate(now.getDate() + (offset * 7));

            const day = now.getDay();
            const diffToMonday = day === 0 ? 6 : day - 1;
            const monday = new Date(now);
            monday.setDate(now.getDate() - diffToMonday);

            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23, 59, 59, 999);

            const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
            
            return {
                startDate: monday.getTime(),
                finishDate: sunday.getTime(),
                titleDate: `${formatter.format(monday)} - ${formatter.format(sunday)}`
            };
        } else {
            now.setMonth(now.getMonth() + offset);
            
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            lastDay.setHours(23, 59, 59, 999);

            const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

            return {
                startDate: firstDay.getTime(),
                finishDate: lastDay.getTime(),
                titleDate: formatter.format(firstDay)
            };
        }
    }, [offset, period]);

    const { barData, totalMoney, maxValue } = useMemo(() => {
        const currentSessions = sessions.filter(
            s => s.startTime >= startDate && s.startTime <= finishDate
        );

        let data = [];
        let total = 0;

        if (period === 'week') {
            const dailyTotals = new Array(7).fill(0);
            const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

            currentSessions.forEach(session => {
                const dayIndex = (new Date(session.startTime).getDay() + 6) % 7;
                const earnings = (session.elapsedTime / 1000 / 3600) * parseFloat(session.rate);
                dailyTotals[dayIndex] += earnings;
                total += earnings;
            });

            const max = Math.max(...dailyTotals);

            data = dailyTotals.map((val, idx) => ({
                value: parseFloat(val.toFixed(2)),
                label: labels[idx],
                frontColor: (val === max && val > 0) ? accent : 'rgba(255, 255, 255, 0.1)',
            }));

            return { barData: data, totalMoney: total, maxValue: max };

        } else {
            const daysInMonth = new Date(new Date(finishDate).getFullYear(), new Date(finishDate).getMonth() + 1, 0).getDate();
            const dailyTotals = new Array(daysInMonth).fill(0);

            currentSessions.forEach(session => {
                const date = new Date(session.startTime).getDate(); // 1-31
                const earnings = (session.elapsedTime / 1000 / 3600) * parseFloat(session.rate);
                dailyTotals[date - 1] += earnings;
                total += earnings;
            });

            const max = Math.max(...dailyTotals);

            data = dailyTotals.map((val, idx) => {
                const dayNum = idx + 1;
                const label = dayNum === 1 || dayNum % 5 === 0 ? String(dayNum) : '';
                return {
                    value: parseFloat(val.toFixed(2)),
                    label: label,
                    frontColor: (val === max && val > 0) ? accent : 'rgba(255, 255, 255, 0.1)',
                };
            });

            return { barData: data, totalMoney: total, maxValue: max };
        }
    }, [sessions, startDate, finishDate, period, accent]);

    const formattedAmount = formatCurrency({ amount: parseFloat(totalMoney.toFixed(2)), code: settings?.currency || 'USD' });

    const barWidth = period === 'week' ? 35 : 6;
    const spacing = period === 'week' ? 15 : 4;
    
    const handlePeriodChange = (p: PeriodType) => {
        if (!isPro && p === 'month') {
            showToast(
                '✨ PRO Feature Locked', 
                'Weekly stats are free. Monthly trends require PRO. Upgrade to unlock!'
            );
            return;
        }
        setPeriod(p);
        setOffset(0);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handlePrev = () => {
        if (!isPro) {
            showToast(
                '✨ PRO Feature Locked', 
                'History navigation is available in PRO. Upgrade to unlock!'
            );
            return;
        }
        setOffset(o => o - 1);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const handleNext = () => {
        if (!isPro) {
            showToast(
                '✨ PRO Feature Locked', 
                'History navigation is available in PRO. Upgrade to unlock!'
            );
            return;
        }
        setOffset(o => o + 1);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    return (
        <Card style={[styles.card, { backgroundColor: '#1C2D23' }]}>
            <Card.Header style={{ flexDirection: 'column', gap: Layout.spacing, paddingHorizontal: Layout.spacing * 2 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: muted }}>Earnings</Text>
                    <View style={{ flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 2 }}>
                        {(['week', 'month'] as PeriodType[]).map((p) => (
                            <TouchableOpacity 
                                key={p} 
                                onPress={() => handlePeriodChange(p)}
                                style={{
                                    paddingVertical: 4,
                                    paddingHorizontal: 12,
                                    borderRadius: 6,
                                    backgroundColor: period === p ? 'rgba(255,255,255,0.1)' : 'transparent'
                                }}
                            >
                                <Text style={{ 
                                    color: period === p ? foreground : muted, 
                                    fontWeight: period === p ? '700' : '400',
                                    fontSize: 12,
                                    textTransform: 'capitalize'
                                }}>
                                    {p}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
                <View style={{ flexDirection: "row", gap: Layout.spacing, alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 26, fontWeight: '900', color: foreground }}>{formattedAmount[0]}</Text>
                    <Text style={{ fontSize: 16, color: muted, marginBottom: 4 }}>Total</Text>
                </View>
            </Card.Header>

            <Card.Body style={{ marginTop: Layout.spacing }}>
                <View style={{ alignItems: 'center' }}>
                    {sessions.length === 0 ? 
                        <Text 
                            style={{ 
                                height: 200, 
                                color: muted, 
                                marginTop: Layout.spacing * 2, 
                                fontSize: 18, 
                                textAlign: 'center', 
                            }}>
                            No saved data. Start the first session.
                        </Text> :
                            totalMoney === 0 ?
                            <Text 
                                style={{ 
                                    height: 200, 
                                    color: muted, 
                                    marginTop: Layout.spacing * 2, 
                                    fontSize: 18, 
                                    textAlign: 'center', 
                                }}>
                                No saved activity for selected period.
                            </Text> :
                            <BarChart
                                key={period}
                                data={barData}
                                height={200}
                                maxValue={maxValue > 0 ? maxValue * 1.15 : 100}
                                barWidth={barWidth}
                                spacing={spacing}
                                initialSpacing={5}
                                endSpacing={5}
                                barBorderRadius={9999}
                                frontColor="#243e2fff"
                                hideRules={true}
                                yAxisThickness={0}
                                xAxisThickness={0}
                                hideYAxisText={true}
                                yAxisLabelWidth={0}
                                disableScroll={true}
                                xAxisLabelTextStyle={{
                                    color: foreground,
                                    fontSize: 18, 
                                    fontWeight: '700',
                                    textAlign: 'center',
                                    marginTop: 4,
                                    width: 30,
                                    alignSelf: 'center'
                                }}
                            />
                    }
                </View>
            </Card.Body>

            <Card.Footer style={styles.footer}>
                <Button isIconOnly variant="ghost" onPress={handlePrev}>
                    <Icon name="chevron-back-outline" color={foreground} />
                </Button>
                
                <Text style={{ fontSize: 16, fontWeight: '600', color: foreground }}>
                    {titleDate}
                </Text>

                <Button isIconOnly variant="ghost" onPress={handleNext}>
                    <Icon name="chevron-forward-outline" color={foreground} />
                </Button>
            </Card.Footer>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        paddingVertical: Layout.spacing * 3,
        minWidth: 150,
        borderRadius: Layout.borderRadius,
    },
    footer: {
        flexDirection: 'row', 
        gap: Layout.spacing * 2, 
        justifyContent: 'space-between', // Changed to space-between for better alignment
        alignItems: 'center',
        paddingHorizontal: Layout.spacing * 2,
        marginTop: Layout.spacing
    }
});

export default ChartCard;