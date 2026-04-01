import BackupCard from "@/components/settings/backup-card";
import NotificationsCard from "@/components/settings/notifications-card";
import PremiumCard from "@/components/settings/premium-card";
import PrivacyLink from "@/components/settings/privacy-link";
import RateCard from "@/components/settings/rate-card";
import SettingsCard from "@/components/settings/settings-card";
import ThemesCard from "@/components/settings/themes-card";
import { AppText } from "@/components/ui/app-text";
import { Icon } from "@/components/ui/icon";
import { router } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsTab() {
    const background = useThemeColor('background');
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const surface = useThemeColor('surface');
    const accent = useThemeColor('accent');

    const handleManageClients = () => {
        router.push('/cards/clients');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
            <View style={styles.header}>
                <AppText style={[styles.title, { color: foreground }]}>Settings</AppText>
                <View style={[styles.headerDivider, { backgroundColor: muted + '20' }]} />
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>

                    {/* Appearance */}
                    <View>
                        <AppText style={[styles.sectionLabel, { color: muted }]}>APPEARANCE</AppText>
                        <ThemesCard />
                    </View>

                    {/* Rate & Currency */}
                    <SettingsCard />

                    {/* Clients shortcut */}
                    <View>
                        <AppText style={[styles.sectionLabel, { color: muted }]}>CLIENTS</AppText>
                        <Pressable
                            onPress={handleManageClients}
                            style={({ pressed }) => [styles.row, { backgroundColor: surface, opacity: pressed ? 0.7 : 1 }]}
                        >
                            <View style={[styles.iconBox, { backgroundColor: accent + '18' }]}>
                                <Icon name="briefcase-outline" color={accent} size={18} />
                            </View>
                            <View style={{ flex: 1, gap: 2 }}>
                                <AppText style={[styles.rowTitle, { color: foreground }]}>Manage Clients</AppText>
                                <AppText style={[styles.rowSubtitle, { color: muted }]}>
                                    Add, edit, or remove clients
                                </AppText>
                            </View>
                            <Icon name="chevron-forward-outline" color={muted} size={16} />
                        </Pressable>
                    </View>

                    {/* Notifications */}
                    <NotificationsCard />

                    {/* Data */}
                    <BackupCard />

                    {/* Premium */}
                    <PremiumCard />

                    {/* App rating */}
                    <RateCard />

                </View>
                <PrivacyLink />
                <View style={{ height: 120 }} />
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
        gap: 32,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: 8,
        marginLeft: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: 16,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    rowSubtitle: {
        fontSize: 13,
    },
});
