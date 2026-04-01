import { Session } from "@/hooks/use-sessions";
import { useSettings } from "@/hooks/use-settings";
import * as Haptics from 'expo-haptics';
import { useThemeColor } from "heroui-native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { formatCurrency } from "react-native-format-currency";
import { BarChart, } from "react-native-gifted-charts";
import { AppText } from "../ui/app-text";
import { Icon } from "../ui/icon";
import { usePremiumToast } from "../ui/premium-toast";

type PeriodType = 'week' | 'month';

const ChartCard = ({ sessions, isPro }: { sessions: Session[], isPro: boolean }) => {
    const { settings } = useSettings();
    const { showToast } = usePremiumToast();

    const [offset, setOffset] = useState(0);
    const [period, setPeriod] = useState<PeriodType>('week');

    const muted = useThemeColor('muted');
    const foreground = useThemeColor('foreground');
    const accent = useThemeColor('accent');
    const surface = useThemeColor('surface');
    
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
                frontColor: (val === max && val > 0) ? accent : foreground + '30',
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
                    frontColor: (val === max && val > 0) ? accent : foreground + '30',
                };
            });

            return { barData: data, totalMoney: total, maxValue: max };
        }
    }, [sessions, startDate, finishDate, period, accent, foreground]);

    const formattedAmount = formatCurrency({ amount: parseFloat(totalMoney.toFixed(2)), code: settings?.currency || 'USD' });

    const barWidth = period === 'week' ? 35 : 6;
    const spacing = period === 'week' ? 15 : 4;
    
    const handlePeriodChange = (p: PeriodType) => {
        if (!isPro && p === 'month') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
        <View style={[styles.card, { backgroundColor: surface, borderColor: muted + '20' }]}>
            {/* Header */}
            <View style={styles.cardHeader}>
                <View style={styles.headerTop}>
                    <AppText style={[styles.cardLabel, { color: muted }]}>Earnings</AppText>
                    <View style={[styles.segmented, { backgroundColor: muted + '12' }]}>
                        {(['week', 'month'] as PeriodType[]).map((p) => (
                            <Pressable
                                key={p}
                                onPress={() => handlePeriodChange(p)}
                                style={[styles.segment, period === p && { backgroundColor: surface }]}
                            >
                                <AppText style={[styles.segmentLabel, {
                                    color: period === p ? foreground : muted,
                                    fontWeight: period === p ? '600' : '400',
                                }]}>
                                    {p === 'week' ? 'Week' : 'Month'}
                                </AppText>
                            </Pressable>
                        ))}
                    </View>
                </View>
                <View style={styles.amountRow}>
                    <AppText style={[styles.totalAmount, { color: foreground }]}>{formattedAmount[0]}</AppText>
                    <AppText style={[styles.totalLabel, { color: muted }]}>total</AppText>
                </View>
            </View>

            {/* Chart */}
            <View style={styles.chartArea}>
                {sessions.length === 0 ? (
                    <View style={styles.emptyChart}>
                        <AppText style={[styles.emptyText, { color: muted }]}>
                            No saved data. Start the first session.
                        </AppText>
                    </View>
                ) : totalMoney === 0 ? (
                    <View style={styles.emptyChart}>
                        <AppText style={[styles.emptyText, { color: muted }]}>
                            No activity for selected period.
                        </AppText>
                    </View>
                ) : (
                    <BarChart
                        key={period}
                        data={barData}
                        height={180}
                        maxValue={maxValue > 0 ? maxValue * 1.15 : 100}
                        barWidth={barWidth}
                        spacing={spacing}
                        initialSpacing={5}
                        endSpacing={5}
                        barBorderRadius={9999}
                        frontColor={accent}
                        hideRules={true}
                        yAxisThickness={0}
                        xAxisThickness={0}
                        hideYAxisText={true}
                        yAxisLabelWidth={0}
                        disableScroll={true}
                        xAxisLabelTextStyle={{
                            color: muted,
                            fontSize: 11,
                            fontWeight: '500',
                            textAlign: 'center',
                            marginTop: 4,
                            width: 24,
                        }}
                    />
                )}
            </View>

            {/* Footer nav */}
            <View style={[styles.footer, { borderTopColor: muted + '15' }]}>
                <Pressable onPress={handlePrev} style={styles.navBtn} hitSlop={8}>
                    <Icon name="chevron-back-outline" color={muted} size={18} />
                </Pressable>
                <AppText style={[styles.dateLabel, { color: foreground }]}>{titleDate}</AppText>
                <Pressable onPress={handleNext} style={styles.navBtn} hitSlop={8}>
                    <Icon name="chevron-forward-outline" color={muted} size={18} />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
    },
    cardHeader: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        gap: 8,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardLabel: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    segmented: {
        flexDirection: 'row',
        borderRadius: 8,
        padding: 2,
        gap: 2,
    },
    segment: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    segmentLabel: {
        fontSize: 12,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 6,
    },
    totalAmount: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.5,
        fontVariant: ['tabular-nums'],
    },
    totalLabel: {
        fontSize: 14,
        marginBottom: 3,
    },
    chartArea: {
        paddingHorizontal: 8,
        paddingBottom: 8,
        alignItems: 'center',
    },
    emptyChart: {
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    navBtn: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
});

export default ChartCard;