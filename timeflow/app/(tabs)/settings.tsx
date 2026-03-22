import BackupCard from "@/components/settings/backup-card";
import NotificationsCard from "@/components/settings/notifications-card";
import PremiumCard from "@/components/settings/premium-card";
import PrivacyLink from "@/components/settings/privacy-link";
import RateCard from "@/components/settings/rate-card";
import SettingsCard from "@/components/settings/settings-card";
import ThemesCard from "@/components/settings/themes-card";
import { AppText } from "@/components/ui/app-text";
import { Layout } from "@/constants/layout";
import { useThemeColor } from "heroui-native";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsTab() {
    const foreground = useThemeColor('foreground');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <AppText style={[styles.title, { color: foreground }]}>Settings</AppText>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <SettingsCard />
                    <ThemesCard />
                    <NotificationsCard />
                    <BackupCard />
                    <RateCard />
                    <PremiumCard />
                </View>
                <PrivacyLink />
                <View style={{ height: Layout.spacing * 8 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: Layout.spacing * 4,
        paddingVertical: Layout.spacing * 2,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
    },
    content: {
        paddingHorizontal: Layout.spacing * 3,
        paddingVertical: Layout.spacing * 1.5,
        gap: Layout.spacing * 5,
    },
});
