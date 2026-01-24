import { Layout } from "@/constants/layout";
import { Session } from "@/hooks/use-sessions";
import { Button, Card, useThemeColor } from "heroui-native";
import { useEffect, useMemo, useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "../ui/app-text";
import { Icon } from "../ui/icon"; // 🔥 IMPORT ICON
import { usePremiumToast } from "../ui/premium-toast";

const HEATMAP_COLORS = {
    0: 'rgba(255, 255, 255, 0.05)',
    1: '#0e4429', 
    2: '#006d32', 
    3: '#26a641', 
    4: '#39d353', 
};

const SQUARE_SIZE = 14;
const GAP = 4;
const WEEKS_TO_SHOW = 18;

const WEEK_DAYS = [
    { label: 'Mon', show: true },
    { label: '', show: false },
    { label: 'Wed', show: true },
    { label: '', show: false },
    { label: 'Fri', show: true },
    { label: '', show: false },
    { label: 'Sun', show: false },
];

export const WorkHeatmap = ({ sessions, isPro }: { sessions: Session[], isPro: boolean }) => {
    const muted = useThemeColor('muted');
    const foreground = useThemeColor('foreground');
    const accent = useThemeColor('accent');
    const cardBg = '#1C2D23';

    const { showToast } = usePremiumToast();

    const scrollViewRef = useRef<ScrollView>(null);

    const dailyActivity = useMemo(() => {
        const map: Record<string, number> = {};
        sessions.forEach(session => {
            const date = new Date(session.startTime);
            const dateKey = date.toISOString().split('T')[0];
            const hours = session.elapsedTime / (1000 * 60 * 60);
            map[dateKey] = (map[dateKey] || 0) + hours;
        });
        return map;
    }, [sessions]);

    const weeksData = useMemo(() => {
        const weeks = [];
        const today = new Date();
        const dayOfWeek = today.getDay();
        const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        
        const currentWeekMonday = new Date(today);
        currentWeekMonday.setDate(today.getDate() - daysSinceMonday);
        
        const startDay = new Date(currentWeekMonday);
        startDay.setDate(currentWeekMonday.getDate() - (WEEKS_TO_SHOW * 7));

        let currentDay = new Date(startDay);

        for (let w = 0; w <= WEEKS_TO_SHOW; w++) {
            const daysInWeek = [];
            for (let d = 0; d < 7; d++) {                
                const dateKey = currentDay.toISOString().split('T')[0];
                const hours = dailyActivity[dateKey] || 0;
                
                let level: 0 | 1 | 2 | 3 | 4 = 0;
                if (hours === 0) level = 0;
                else if (hours < 2) level = 1;
                else if (hours < 5) level = 2;
                else if (hours < 8) level = 3;
                else level = 4;

                daysInWeek.push({ date: dateKey, hours, level });
                currentDay.setDate(currentDay.getDate() + 1);
            }
            weeks.push(daysInWeek);
        }
        return weeks;
    }, [dailyActivity]);

    useEffect(() => {
        if (isPro) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: false });
            }, 100);
        }
    }, [isPro]);

    const renderLegend = () => (
        <View style={styles.legendContainer}>
            <AppText style={{ color: muted, fontSize: 10, marginRight: 4 }}>Less</AppText>
            {[0, 1, 2, 3, 4].map((level) => (
                <View 
                    key={level} 
                    style={[
                        styles.square, 
                        { backgroundColor: HEATMAP_COLORS[level as keyof typeof HEATMAP_COLORS] }
                    ]} 
                />
            ))}
            <AppText style={{ color: muted, fontSize: 10, marginLeft: 4 }}>More</AppText>
        </View>
    );

    if (!isPro) {
        return (
            <Card style={[styles.card, { backgroundColor: cardBg, overflow: 'hidden' }]}>
                <Card.Header style={{ paddingHorizontal: Layout.spacing * 2, paddingTop: Layout.spacing * 2 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', opacity: 0.5 }}>
                        <AppText style={{ fontSize: 16, fontWeight: '600', color: muted }}>Consistency</AppText>
                        {renderLegend()}
                    </View>
                </Card.Header>

                <View style={{ padding: Layout.spacing * 4, alignItems: 'center', justifyContent: 'center', gap: Layout.spacing }}>
                    <View style={{ 
                        width: 60, height: 60, borderRadius: 30, 
                        backgroundColor: 'rgba(255,255,255,0.1)', 
                        alignItems: 'center', justifyContent: 'center',
                        marginBottom: 4
                    }}>
                        <Icon name="lock-closed" size={30} color={accent} />
                    </View>
                    
                    <AppText style={{ color: foreground, fontSize: 18, fontWeight: '700', textAlign: 'center' }}>
                        Unlock Activity History
                    </AppText>
                    <AppText style={{ color: muted, fontSize: 14, textAlign: 'center', maxWidth: 250 }}>
                        Visualize your work habits and build a streak with the Consistency Graph.
                    </AppText>

                    <Button 
                        style={{ marginTop: Layout.spacing, backgroundColor: accent, paddingHorizontal: 30 }} 
                        onPress={() => {
                            showToast(
                                'Unlock Activity History',
                                'Visualize your work habits and build a streak with the Consistency Graph.'
                            )
                        }}
                    >
                        <AppText style={{ color: '#000', fontWeight: '700', fontSize: 16 }}>Go PRO</AppText>
                    </Button>
                </View>
            </Card>
        );
    }

    return (
        <Card style={[styles.card, { backgroundColor: cardBg }]}>
            <Card.Header style={{ paddingHorizontal: Layout.spacing * 2, paddingTop: Layout.spacing * 2 }}>
                 <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <AppText style={{ fontSize: 16, fontWeight: '600', color: muted }}>Consistency</AppText>
                    {renderLegend()}
                </View>
            </Card.Header>

            <Card.Body>
                <View style={{ flexDirection: 'row', padding: Layout.spacing * 2 }}>
                    <View style={styles.daysLabelColumn}>
                        {WEEK_DAYS.map((day, index) => (
                            <View key={index} style={styles.dayLabelContainer}>
                                {day.show && (
                                    <AppText style={{ color: muted, fontSize: 10, lineHeight: SQUARE_SIZE }}>
                                        {day.label}
                                    </AppText>
                                )}
                            </View>
                        ))}
                    </View>

                    <ScrollView 
                        ref={scrollViewRef}
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingLeft: 4 }}
                    >
                        <View style={styles.grid}>
                            {weeksData.map((week, weekIndex) => (
                                <View key={weekIndex} style={styles.column}>
                                    {week.map((day, dayIndex) => (
                                        <View 
                                            key={day.date} 
                                            style={[
                                                styles.square,
                                                { backgroundColor: HEATMAP_COLORS[day.level] }
                                            ]} 
                                        />
                                    ))}
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </Card.Body>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginTop: Layout.spacing * 3,
        borderRadius: Layout.borderRadius,
    },
    grid: {
        flexDirection: 'row',
        gap: GAP,
    },
    column: {
        flexDirection: 'column',
        gap: GAP,
    },
    square: {
        width: SQUARE_SIZE,
        height: SQUARE_SIZE,
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    legendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    daysLabelColumn: {
        flexDirection: 'column',
        gap: GAP,
        marginRight: 6,
        paddingTop: 0, 
    },
    dayLabelContainer: {
        height: SQUARE_SIZE,
        justifyContent: 'center',
    }
});