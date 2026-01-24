import { Layout } from "@/constants/layout";
import { useClients } from "@/hooks/use-clients";
import { useSessions } from "@/hooks/use-sessions";
import { useSettings } from "@/hooks/use-settings";
import * as Haptics from 'expo-haptics';
import { Card, useThemeColor } from "heroui-native";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { formatCurrency } from "react-native-format-currency";
import { PieChart } from "react-native-gifted-charts";
import { AppText } from "../ui/app-text";
import { usePremiumToast } from "../ui/premium-toast";

type PeriodType = 'week' | 'month' | 'all';

export const ClientStats = ({ isPro }: { isPro: boolean }) => {
    const { sessions } = useSessions();
    const { clients } = useClients();
    const { settings } = useSettings();
    const { showToast } = usePremiumToast();
    
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const cardBg = '#1C2D23';

    // Стан для періоду і вибраного шматка пирога
    const [period, setPeriod] = useState<PeriodType>('week');
    const [selectedSlice, setSelectedSlice] = useState<{ name: string; percentage: string; amount: string } | null>(null);

    // 1. Логіка дат для фільтрації
    const { startDate, finishDate } = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Скидаємо час на початок дня

        if (period === 'week') {
            const day = now.getDay();
            const diffToMonday = day === 0 ? 6 : day - 1; // Коригуємо, щоб тиждень починався з понеділка
            const monday = new Date(now);
            monday.setDate(now.getDate() - diffToMonday);
            
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23, 59, 59, 999); // Кінець неділі

            return { startDate: monday.getTime(), finishDate: sunday.getTime() };
        } else if (period === 'month') {
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            lastDay.setHours(23, 59, 59, 999);
            return { startDate: firstDay.getTime(), finishDate: lastDay.getTime() };
        }
        
        // Для 'all' повертаємо діапазон, що охоплює все
        return { startDate: 0, finishDate: Infinity };
    }, [period]);

    // 2. Зміна періоду
    const handlePeriodChange = (p: PeriodType) => {
        if (!isPro && (p === 'month' || p === 'all')) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            showToast(
                '✨ PRO Feature Locked', 
                'Weekly stats are free. Monthly trends require PRO. Upgrade to unlock!'
            );
            return;
        }
        if (p === period) return;
        setPeriod(p);
        setSelectedSlice(null); // Скидаємо вибір, щоб не показувати старі дані
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    // 3. Основна логіка підрахунку
    const { data, totalMoney } = useMemo(() => {
        const clientMap: Record<string, { totalAmount: number; color: string; name: string }> = {};
        let grandTotalAmount = 0;

        // 🔥 Фільтруємо сесії по даті ПЕРЕД обробкою
        const filteredSessions = sessions.filter(s => {
            if (period === 'all') return true;
            return s.startTime >= startDate && s.startTime <= finishDate;
        });

        filteredSessions.forEach(session => {
            if (session.clientId) {
                const client = clients.find(c => c.id === session.clientId);
                if (client) {
                    if (!clientMap[client.id]) {
                        clientMap[client.id] = {
                            totalAmount: 0,
                            color: client.color || '#2bee6c',
                            name: client.name
                        };
                    }

                    const rate = parseFloat(session.rate || '0');
                    if (!isNaN(rate) && rate > 0) {
                        const hours = session.elapsedTime / (1000 * 60 * 60);
                        const rawAmount = hours * rate;
                        clientMap[client.id].totalAmount += rawAmount;
                        grandTotalAmount += rawAmount;
                    }
                }
            }
        });

        const data = Object.values(clientMap)
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .map((item, index) => {
                const percentage = grandTotalAmount > 0 ? (item.totalAmount / grandTotalAmount) * 100 : 0;
                const [formattedAmount] = formatCurrency({ 
                    amount: Number(item.totalAmount.toFixed(2)), 
                    code: settings?.currency || 'USD' 
                });

                return {
                    value: item.totalAmount,
                    color: item.color,
                    gradientCenterColor: item.color,
                    focused: index === 0,
                    name: item.name,
                    percentage: `${percentage.toFixed(1)}%`,
                    amount: formattedAmount
                };
            });

        return { data, totalMoney: grandTotalAmount };
    }, [sessions, clients, settings, period, startDate, finishDate]);

    // Встановлюємо дефолтний вибір (центр бублика)
    useEffect(() => {
        if (data.length > 0 && !selectedSlice) {
            setSelectedSlice({
                name: data[0].name,
                percentage: data[0].percentage,
                amount: data[0].amount
            });
        }
    }, [data]); // Видалив selectedSlice з залежностей, щоб уникнути loop

    const renderDot = (color: string) => (
        <View style={[styles.dot, { backgroundColor: color }]} />
    );

    const [formattedTotal] = formatCurrency({ 
        amount: Number(totalMoney.toFixed(2)), 
        code: settings?.currency || 'USD' 
    });

    // Якщо сесій взагалі немає, не рендеримо нічого
    if (sessions.length === 0) return null;

    return (
        <Card style={[styles.card, { backgroundColor: cardBg }]}>
            <Card.Header style={{ flexDirection: 'column', gap: Layout.spacing, paddingHorizontal: Layout.spacing * 2 }}>
                
                {/* Верхній рядок: Заголовок + Перемикач */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <AppText style={{ fontSize: 16, fontWeight: '600', color: muted }}>Distribution</AppText>
                    
                    {/* Перемикач періодів */}
                    <View style={{ flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 2 }}>
                        {(['week', 'month', 'all'] as PeriodType[]).map((p) => (
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
                                <AppText style={{ 
                                    color: period === p ? foreground : muted, 
                                    fontWeight: period === p ? '700' : '400',
                                    fontSize: 12,
                                    textTransform: 'capitalize'
                                }}>
                                    {p}
                                </AppText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Загальна сума */}
                <View style={{ flexDirection: "row", gap: Layout.spacing, alignItems: 'flex-end' }}>
                    <AppText style={{ fontSize: 26, fontWeight: '900', color: foreground }}>{formattedTotal}</AppText>
                    <AppText style={{ fontSize: 16, color: muted, marginBottom: 4 }}>Total</AppText>
                </View>
            </Card.Header>
            
            <Card.Body style={{ marginTop: Layout.spacing, alignItems: 'center' }}>
                {data.length === 0 ? (
                    // Стан "Немає даних за цей період"
                    <View style={{ height: 180, justifyContent: 'center', alignItems: 'center' }}>
                         <AppText style={{ color: muted, fontSize: 16 }}>No data for this period</AppText>
                    </View>
                ) : (
                    // Графік
                    <View style={{ alignItems: 'center' }}>
                         <PieChart
                            data={data}
                            donut
                            showGradient
                            sectionAutoFocus
                            radius={100}
                            innerRadius={70}
                            innerCircleColor={cardBg}
                            onPress={(item: any) => {
                                Haptics.selectionAsync();
                                setSelectedSlice({
                                    name: item.name,
                                    percentage: item.percentage,
                                    amount: item.amount
                                });
                            }}
                            centerLabelComponent={() => {
                                if (!selectedSlice) return null;
                                return (
                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <AppText style={{ fontSize: 24, color: foreground, fontWeight: 'bold' }}>
                                            {selectedSlice.percentage}
                                        </AppText>
                                        <AppText style={{ fontSize: 13, color: muted, textAlign: 'center', paddingHorizontal: 4, maxWidth: 80 }} numberOfLines={1}>
                                            {selectedSlice.name}
                                        </AppText>
                                        <AppText style={{ fontSize: 12, color: muted, marginTop: 4 }}>
                                            {selectedSlice.amount}
                                        </AppText>
                                    </View>
                                );
                            }}
                        />
                    </View>
                )}
            </Card.Body>

            {/* Легенда (тільки якщо є дані) */}
            {data.length > 0 && (
                <Card.Footer style={styles.footer}>
                     <View style={styles.legendContainer}>
                        {data.map((item, index) => (
                            <View key={index} style={styles.legendItem}>
                                {renderDot(item.color)}
                                <AppText style={{ color: foreground, fontSize: 14 }}>
                                    {item.name}
                                </AppText>
                            </View>
                        ))}
                    </View>
                </Card.Footer>
            )}
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginTop: Layout.spacing * 3,
        paddingVertical: Layout.spacing * 3,
        borderRadius: Layout.borderRadius,
    },
    footer: {
        paddingHorizontal: Layout.spacing * 2,
        marginTop: Layout.spacing
    },
    legendContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)', // Легкий фон для тегів легенди
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    dot: {
        height: 8,
        width: 8,
        borderRadius: 4,
        marginRight: 8,
    },
});