import BackupCard from "@/components/settings/backup-card";
import NotificationsCard from "@/components/settings/notifications-card";
import PremiumCard from "@/components/settings/premium-card";
import PrivacyLink from "@/components/settings/privacy-link";
import RateCard from "@/components/settings/rate-card";
import SettingsCard from "@/components/settings/settings-card";
import { Layout } from "@/constants/layout";
import { StyleSheet, View } from "react-native";
import { BaseCard } from "./base-card";

export default function Settings() {    
    return <BaseCard title="Settings">
        <View style={[styles.contentContainer]}>
            <SettingsCard />
            <NotificationsCard />
            <BackupCard />
            <RateCard />
            <PremiumCard />
        </View>
        <PrivacyLink />
    </BaseCard>
}

const styles = StyleSheet.create({
    contentContainer: {
        paddingVertical: Layout.spacing * 1.5,
        gap: Layout.spacing * 5
    },
});
