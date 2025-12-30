import ChartCard from "@/components/analytics/chart-card"
import { ClientStats } from "@/components/analytics/client-stats"
import { GoalCard } from "@/components/analytics/goal-card"
import { InsightsCard } from "@/components/analytics/insights"
import { RecentHistory } from "@/components/analytics/recent-history"
import { SummaryCards } from "@/components/analytics/summary-cards"
import { WorkHeatmap } from "@/components/analytics/work-heatmap"
import { Layout } from "@/constants/layout"
import { useSessions } from "@/hooks/use-sessions"
import { useUserStatus } from "@/hooks/user-status"
import { View } from "react-native"
import Animated, { Easing, FadeInLeft, FadeInRight } from "react-native-reanimated"
import { BaseCard } from "./base-card"

export default function Analytics() {    
    const { sessions } = useSessions();
    const { isChecking, isPro } = useUserStatus();

    if (isChecking) return null;

    return <BaseCard title="Analytics">
        <View style={{ paddingVertical: Layout.spacing * 2, gap: Layout.spacing * 5 }}>
            <Animated.View
                entering={FadeInRight.delay(500).easing(Easing.ease).duration(600).damping(80)}
            >
                <SummaryCards sessions={sessions} isPro={isPro} />
            </Animated.View>
            <Animated.View
                entering={FadeInLeft.delay(500).easing(Easing.ease).duration(600).damping(80)}
            >
                <ChartCard sessions={sessions} isPro={isPro} />
            </Animated.View>
            <Animated.View
                entering={FadeInRight.delay(500).easing(Easing.ease).duration(600).damping(80)}
            >
                <ClientStats isPro={isPro} />
            </Animated.View>
            <WorkHeatmap sessions={sessions} isPro={isPro} />
            <InsightsCard sessions={sessions} />
            <GoalCard sessions={sessions} isPro={isPro} />
            <RecentHistory sessions={sessions} />
        </View>
    </BaseCard>
}
