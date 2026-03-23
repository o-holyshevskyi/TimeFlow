import { Layout } from "@/constants/layout";
import { useSessions } from "@/hooks/use-sessions";
import { useUserStatus } from "@/hooks/user-status";
import { exportSessionsToCSV } from '@/services/export-csv';
import { LinearGradient } from "expo-linear-gradient";
import { Chip, Spinner, useThemeColor } from "heroui-native";
import { Pressable, StyleSheet, View } from "react-native";
import { useUniwind } from "uniwind";
import { THEMES } from "../settings/themes-card";
import { AppText } from "../ui/app-text";
import { Icon } from "../ui/icon";

type SessionHeaderProps = {
    showBack?: boolean;
};

const SessionHeader = ({ showBack = false }: SessionHeaderProps) => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const surface = useThemeColor('surface');
    const accent = useThemeColor('accent');
    const { isPro, isChecking } = useUserStatus();
    const { sessions, isLoading } = useSessions();

    if (isLoading || isChecking) return <Spinner />;

    const handleExport = async () => {
        const sorted = [...sessions].sort((a, b) => b.startTime - a.startTime);
        const visibleSessions = isPro ? sorted : sorted.slice(0, 5);
        await exportSessionsToCSV(visibleSessions);
    };

    return (
        <View>
            <View style={styles.headerContainer}>
                <View style={styles.titleRow}>
                    <AppText style={[styles.titleText, { color: foreground }]}>Sessions</AppText>
                    {!isPro && (
                        <AppText style={[styles.countLabel, { color: muted }]}>
                            Showing last 5
                        </AppText>
                    )}
                </View>
                <Pressable
                    onPress={handleExport}
                    style={[styles.exportButton, {
                        backgroundColor: surface,
                        borderColor: muted + '25',
                        borderWidth: 1,
                    }]}
                >
                    <Icon name="share-outline" color={muted} size={17} />
                </Pressable>
            </View>
            <View style={[styles.headerDivider, { backgroundColor: muted + '15', marginHorizontal: Layout.spacing * 4 }]} />
        </View>
    );
};

export const GetProLabel = ({ left = -25, top = 30 }: { left?: number, top?: number }) => {
    const foreground = useThemeColor('foreground');
    const accent = useThemeColor('accent');
    const { theme } = useUniwind();
    const activeTheme = THEMES.find(t => t.id === theme);

    return (
        <LinearGradient
            colors={(activeTheme?.colors || [accent + '50', accent]) as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 999, position: "absolute", left, top, zIndex: 1 }}
        >
            <Chip size="sm" style={{ backgroundColor: "transparent" }}>
                <Chip.Label style={{ color: foreground, fontWeight: 'bold', fontSize: 10 }}>
                    Go PRO
                </Chip.Label>
            </Chip>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Layout.spacing * 4,
        paddingTop: Layout.spacing * 2,
        paddingBottom: Layout.spacing * 2,
    },
    headerDivider: {
        height: 1,
    },
    titleRow: {
        flexDirection: 'column',
        gap: 2,
    },
    titleText: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    countLabel: {
        fontSize: 12,
        fontWeight: '400',
    },
    exportButton: {
        width: 34,
        height: 34,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default SessionHeader;
