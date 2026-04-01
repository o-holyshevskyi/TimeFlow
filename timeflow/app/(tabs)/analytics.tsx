import ChartCard from "@/components/analytics/chart-card";
import { ClientStats } from "@/components/analytics/client-stats";
import { GoalCard } from "@/components/analytics/goal-card";
import { InsightsCard } from "@/components/analytics/insights";
import { RecentHistory } from "@/components/analytics/recent-history";
import { SummaryCards } from "@/components/analytics/summary-cards";
import { WorkHeatmap } from "@/components/analytics/work-heatmap";
import { AppText } from "@/components/ui/app-text";
import { useSessions } from "@/hooks/use-sessions";
import { useUserStatus } from "@/hooks/user-status";
import { useThemeColor } from "heroui-native";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated, { Easing, FadeInLeft, FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AnalyticsTab() {
    const { sessions } = useSessions();
    const { isChecking, isPro } = useUserStatus();
    const background = useThemeColor('background');
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');

    if (isChecking) return null;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
            <View style={styles.header}>
                <AppText style={[styles.title, { color: foreground }]}>Analytics</AppText>
                <View style={[styles.headerDivider, { backgroundColor: muted + '20' }]} />
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <Animated.View
                        entering={FadeInRight.delay(200).easing(Easing.ease).duration(600).damping(80)}
                    >
                        <SummaryCards sessions={sessions} isPro={isPro} />
                    </Animated.View>
                    <Animated.View
                        entering={FadeInLeft.delay(300).easing(Easing.ease).duration(600).damping(80)}
                    >
                        <ChartCard sessions={sessions} isPro={isPro} />
                    </Animated.View>
                    <Animated.View
                        entering={FadeInRight.delay(400).easing(Easing.ease).duration(600).damping(80)}
                    >
                        <ClientStats isPro={isPro} />
                    </Animated.View>
                    <WorkHeatmap sessions={sessions} isPro={isPro} />
                    <InsightsCard sessions={sessions} />
                    <GoalCard sessions={sessions} isPro={isPro} />
                    <RecentHistory sessions={sessions} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 0,
        gap: 8,
    },
    headerDivider: {
        height: StyleSheet.hairlineWidth,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 16,
        gap: 24,
        paddingBottom: 120,
    },
});
