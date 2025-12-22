import { Layout } from "@/constants/layout";
import { Session } from "@/hooks/use-sessions";
import { useSettings } from "@/hooks/use-settings";
import { BlurView } from "expo-blur";
import { Card, useThemeColor } from "heroui-native";
import { StyleSheet, Text, View } from "react-native";
import { formatCurrency } from "react-native-format-currency";
import { ScrollView } from "react-native-gesture-handler";
import { GetProLabel } from "../sessions/header";
import { Icon } from "../ui/icon";

const getHours = (ms: number) => ms / 1000 / 3600;

const getSessionEarnings = (session: Session) => 
    getHours(session.elapsedTime) * parseFloat(session.rate);

export const calculatePeriodData = (sessions: Session[], period: 'week' | 'month' | 'year') => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let currentPeriodStart = new Date(now);
    let previousPeriodStart = new Date(now);

    if (period === 'week') {
        // ... (ваш код для тижня)
        const day = now.getDay(); 
        const diffToMonday = day === 0 ? 6 : day - 1;
        currentPeriodStart.setDate(now.getDate() - diffToMonday);
        previousPeriodStart = new Date(currentPeriodStart);
        previousPeriodStart.setDate(currentPeriodStart.getDate() - 7);
    } else if (period === 'month') {
        // ... (ваш код для місяця)
        currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    } else {
        // 🔥 НОВА ЛОГІКА ДЛЯ РОКУ
        currentPeriodStart = new Date(now.getFullYear(), 0, 1); // 1 січня цього року
        previousPeriodStart = new Date(now.getFullYear() - 1, 0, 1); // 1 січня минулого року
    }

    // ... (решта функції calculatePeriodData залишається такою ж)
    const currentStartTime = currentPeriodStart.getTime();
    const previousStartTime = previousPeriodStart.getTime();

    const thisPeriodSessions = sessions.filter(s => s.startTime >= currentStartTime);
    // Для року порівнюємо з повним минулим роком (або тим самим періодом минулого року - тут повний)
    const lastPeriodSessions = sessions.filter(s => 
        s.startTime >= previousStartTime && s.startTime < currentStartTime
    );

    const thisPeriodMoney = thisPeriodSessions.reduce((sum, s) => sum + getSessionEarnings(s), 0);
    const lastPeriodMoney = lastPeriodSessions.reduce((sum, s) => sum + getSessionEarnings(s), 0);
    const thisPeriodHours = thisPeriodSessions.reduce((sum, s) => sum + getHours(s.elapsedTime), 0);

    let percentChange = 0;
    if (lastPeriodMoney === 0) {
        percentChange = thisPeriodMoney > 0 ? 100 : 0;
    } else {
        percentChange = ((thisPeriodMoney - lastPeriodMoney) / lastPeriodMoney) * 100;
    }

    return { money: thisPeriodMoney, hours: thisPeriodHours, percentChange };
};

export const SummaryCards = ({ sessions, isPro }: {sessions: Session[], isPro: boolean}) => {
    const weekData = calculatePeriodData(sessions, 'week');
    const monthData = calculatePeriodData(sessions, 'month');
    const yearData = calculatePeriodData(sessions, 'year');

    const { settings } = useSettings();
    
    const wFormattedAmount = formatCurrency({ amount: parseFloat(weekData.money.toFixed(2)), code: settings?.currency || 'USD' });
    const mFormattedAmount = formatCurrency({ amount: parseFloat(monthData.money.toFixed(2)), code: settings?.currency || 'USD' });
    const yFormatted = formatCurrency({ amount: parseFloat(yearData.money.toFixed(2)), code: settings?.currency || 'USD' });

    return <ScrollView 
        contentContainerStyle={{
            flexDirection: 'row',
            gap: Layout.spacing * 2,
        }} 
        horizontal
        showsHorizontalScrollIndicator={false}
    >
        {/* Картка 1: Гроші за тиждень */}
        <SummaryCard 
            title="THIS WEEK" 
            value={wFormattedAmount[0]} 
            icon="wallet-outline"
            percent={weekData.percentChange}
            color={"rgba(70, 183, 0, 0.53)"}
        />
        
        <SummaryCard 
            title="THIS YEAR" 
            value={yFormatted[0]} 
            icon="earth-outline" // або trophy-outline
            percent={yearData.percentChange}
            color={"rgba(255, 179, 0, 0.53)"} // Золотий колір
            isBlurred={!isPro} // Теж робимо PRO фічею
        />

        <SummaryCard 
            title="THIS MONTH" 
            value={mFormattedAmount[0]} 
            icon="calendar-outline"
            percent={monthData.percentChange}
            color={"rgba(224, 57, 255, 0.53)"}
            isBlurred={!isPro}
        />

        <SummaryCard 
            title="HOURS PER WEEK" 
            value={`${weekData.hours.toFixed(1)} h`} 
            icon="time-outline"
            // Тут можна додати порівняння годин, якщо розширити логіку, 
            // або просто приховати відсотки
            subText="Total time worked"
            color={"rgba(0, 173, 214, 0.53)"}
        />
        
    </ScrollView>;
};

const SummaryCard = ({ title, value, icon, percent, subText, color, isBlurred }: any) => {   
    const muted = useThemeColor('muted');
    const accent = useThemeColor('accent');
    const danger = useThemeColor('danger');
    const foreground = useThemeColor('foreground');

    return (
        <View style={styles.wrapper}>
            {/* Основний контент картки */}
            <Card style={styles.card}>
                <Card.Header style={styles.header}>
                    <View style={[styles.iconWrapper, { backgroundColor: color }]}>
                        <Icon name={icon} color={muted} />
                    </View>
                    <Text style={{ color: muted }}>{title}</Text>
                </Card.Header>

                <Card.Body>
                    <Text style={{ fontSize: 26, fontWeight: '900', color: foreground }}>
                        {value}
                    </Text>
                </Card.Body>

                <Card.Footer style={styles.footer}>
                    {percent !== undefined ? (
                        <>
                            <Icon
                                name={percent >= 0 ? 'trending-up-outline' : 'trending-down-outline'}
                                color={percent >= 0 ? accent : danger}
                                size={20}
                            />
                            <Text style={{ color: percent >= 0 ? accent : danger }}>
                                {Math.abs(percent).toFixed(1)}%
                            </Text>
                        </>
                    ) : (
                        <Text style={{ color: muted }}>{subText}</Text>
                    )}
                </Card.Footer>
            </Card>

            {isBlurred && (
                <BlurView
                    intensity={30}
                    tint="dark"
                    style={styles.blurOverlay}
                >
                    <GetProLabel left={50} top={50} />
                </BlurView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#1C2D23',
    },
    card: {
        borderRadius: 20, 
        backgroundColor: '#1C2D23',
    },
    blurOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Layout.spacing,
    },
    iconWrapper: {
        borderRadius: 999,
        padding: Layout.spacing,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Layout.spacing,
        marginTop: Layout.spacing,
    },
});