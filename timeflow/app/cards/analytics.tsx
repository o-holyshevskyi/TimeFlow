import ChartCard from "@/components/analytics/chart-card"
import { GoalCard } from "@/components/analytics/goal-card"
import { InsightsCard } from "@/components/analytics/insights"
import { RecentHistory } from "@/components/analytics/recent-history"
import { SummaryCards } from "@/components/analytics/summary-cards"
import { Layout } from "@/constants/layout"
import { useSessions } from "@/hooks/use-sessions"
import { useUserStatus } from "@/hooks/user-status"
import { View } from "react-native"
import { BaseCard } from "./base-card"

export default function Analytics() {    
    const { sessions } = useSessions();
    const { isChecking, isPro } = useUserStatus();

    if (isChecking) return null;

    return <BaseCard title="Analytics">
        <View style={{ paddingVertical: Layout.spacing * 2, gap: Layout.spacing * 5 }}>
            <SummaryCards sessions={sessions} isPro={isPro} />
            <ChartCard sessions={sessions} isPro={isPro} />
            <InsightsCard sessions={sessions} />
            <GoalCard sessions={sessions} isPro={isPro} />
            <RecentHistory sessions={sessions} />
        </View>
    </BaseCard>
}
