import { Layout } from "@/constants/layout";
import { Session } from "@/hooks/use-sessions";
import { useSettings } from "@/hooks/use-settings";
import { BlurView } from "expo-blur";
import { useThemeColor } from "heroui-native";
import { StyleSheet, View } from "react-native";
import { formatCurrency } from "react-native-format-currency";
import { ScrollView } from "react-native-gesture-handler";
import { GetProLabel } from "../sessions/header";
import { AppText } from "../ui/app-text";
import { Icon } from "../ui/icon";

const getHours = (ms: number) => ms / 1000 / 3600;
const getSessionEarnings = (session: Session) => getHours(session.elapsedTime) * parseFloat(session.rate);

export const calculatePeriodData = (sessions: Session[], period: 'week' | 'month' | 'year') => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let currentPeriodStart = new Date(now);
    let previousPeriodStart = new Date(now);

    if (period === 'week') {
        const day = now.getDay();
        const diffToMonday = day === 0 ? 6 : day - 1;
        currentPeriodStart.setDate(now.getDate() - diffToMonday);
        previousPeriodStart = new Date(currentPeriodStart);
        previousPeriodStart.setDate(currentPeriodStart.getDate() - 7);
    } else if (period === 'month') {
        currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    } else {
        currentPeriodStart = new Date(now.getFullYear(), 0, 1);
        previousPeriodStart = new Date(now.getFullYear() - 1, 0, 1);
    }

    const currentStartTime = currentPeriodStart.getTime();
    const previousStartTime = previousPeriodStart.getTime();

    const thisPeriodSessions = sessions.filter(s => s.startTime >= currentStartTime);
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

export const SummaryCards = ({ sessions, isPro }: { sessions: Session[], isPro: boolean }) => {
    const weekData = calculatePeriodData(sessions, 'week');
    const monthData = calculatePeriodData(sessions, 'month');
    const yearData = calculatePeriodData(sessions, 'year');
    const { settings } = useSettings();

    const [wAmount] = formatCurrency({ amount: parseFloat(weekData.money.toFixed(2)), code: settings?.currency || 'USD' });
    const [mAmount] = formatCurrency({ amount: parseFloat(monthData.money.toFixed(2)), code: settings?.currency || 'USD' });
    const [yAmount] = formatCurrency({ amount: parseFloat(yearData.money.toFixed(2)), code: settings?.currency || 'USD' });

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            <SummaryCard
                title="This Week"
                value={wAmount}
                icon="wallet-outline"
                percent={weekData.percentChange}
                accentColor="#f97316"
            />
            <SummaryCard
                title="This Month"
                value={mAmount}
                icon="calendar-outline"
                percent={monthData.percentChange}
                accentColor="#eab308"
                isBlurred={!isPro}
            />
            <SummaryCard
                title="This Year"
                value={yAmount}
                icon="earth-outline"
                percent={yearData.percentChange}
                accentColor="#3b82f6"
                isBlurred={!isPro}
            />
            <SummaryCard
                title="Hours / Week"
                value={`${weekData.hours.toFixed(1)}h`}
                icon="time-outline"
                subText="Total time worked"
                accentColor="#64748b"
            />
        </ScrollView>
    );
};

const SummaryCard = ({ title, value, icon, percent, subText, accentColor, isBlurred }: {
    title: string;
    value: string;
    icon: string;
    percent?: number;
    subText?: string;
    accentColor: string;
    isBlurred?: boolean;
}) => {
    const muted = useThemeColor('muted');
    const accent = useThemeColor('accent');
    const danger = useThemeColor('danger');
    const foreground = useThemeColor('foreground');
    const surface = useThemeColor('surface');

    return (
        <View style={[styles.cardWrapper, { overflow: 'hidden' }]}>
            <View style={[styles.card, { backgroundColor: surface, borderColor: muted + '20', borderWidth: 1 }]}>
                {/* Accent top bar */}
                <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

                {/* Icon + title row */}
                <View style={[styles.cardTop, { marginTop: 10 }]}>
                    <View style={[styles.iconBox, { backgroundColor: accentColor + '18' }]}>
                        <Icon name={icon as any} color={accentColor} size={15} />
                    </View>
                    <AppText style={[styles.cardTitle, { color: muted }]}>{title}</AppText>
                </View>

                {/* Value */}
                <AppText style={[styles.cardValue, { color: foreground }]}>{value}</AppText>

                {/* Footer: trend or subtext */}
                <View style={styles.cardFooter}>
                    {percent !== undefined ? (
                        <>
                            <Icon
                                name={percent >= 0 ? 'trending-up-outline' : 'trending-down-outline'}
                                color={percent >= 0 ? accent : danger}
                                size={14}
                            />
                            <AppText style={[styles.trendText, { color: percent >= 0 ? accent : danger }]}>
                                {Math.abs(percent).toFixed(1)}%
                            </AppText>
                            <AppText style={[styles.trendLabel, { color: muted }]}>vs last period</AppText>
                        </>
                    ) : (
                        <AppText style={[styles.trendLabel, { color: muted }]}>{subText}</AppText>
                    )}
                </View>
            </View>

            {isBlurred && (
                <BlurView
                    intensity={20}
                    tint="dark"
                    style={styles.blurOverlay}
                >
                    <GetProLabel left={50} top={50} />
                </BlurView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        flexDirection: 'row',
        gap: Layout.spacing * 2,
        paddingVertical: 4,
    },
    cardWrapper: {
        borderRadius: 16,
    },
    card: {
        width: 160,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingBottom: 14,
        paddingTop: 0,
        gap: 8,
        overflow: 'hidden',
    },
    accentBar: {
        height: 3,
        marginHorizontal: -14,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconBox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 12,
        fontWeight: '600',
        flex: 1,
    },
    cardValue: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    trendText: {
        fontSize: 12,
        fontWeight: '700',
    },
    trendLabel: {
        fontSize: 11,
    },
    blurOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
