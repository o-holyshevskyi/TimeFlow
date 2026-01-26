import { useSessions } from "@/hooks/use-sessions";
import { useUserStatus } from "@/hooks/user-status";
import { exportSessionsToCSV } from '@/services/export-csv';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Button, Chip, Spinner, useThemeColor } from "heroui-native";
import { StyleSheet, View } from "react-native";
import { useUniwind } from "uniwind";
import { THEMES } from "../settings/themes-card";
import { AppText } from "../ui/app-text";
import { Icon } from "../ui/icon";

const SessionHeader = () => {
    const foreground = useThemeColor('foreground');
    const { isPro, isChecking } = useUserStatus();
    const { sessions, isLoading } = useSessions();
    
    const router = useRouter();

    if (isLoading || isChecking) return <Spinner />;

    const handleOnClose = () => {
        router.back();
    }

    const handleExport = async () => {
        const sorted = [...sessions].sort((a, b) => b.startTime - a.startTime);
        const visibleSessions = isPro ? sorted : sorted.slice(0, 5);
        await exportSessionsToCSV(visibleSessions);    
    };
    
    return <View style={[styles.headerContainer]}>
        <Button variant="ghost" isIconOnly onPress={handleOnClose}>
            <Icon name="chevron-back-outline" />
        </Button>
        <View style={{ flex: 1, alignItems: 'center' }}>
            <AppText style={[styles.titleText, { color: foreground }]}>Sessions History</AppText>
        </View>
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
            }}
        >
            <Button variant="ghost" isIconOnly onPress={handleExport}>
                <Icon name="share-outline" />
            </Button>
        </View>

    </View>
}

export const GetProLabel = ({left = -25, top = 30 }: {left?: number, top?: number}) => {
    const foreground = useThemeColor('foreground');
    const accent = useThemeColor('accent');

    const { theme } = useUniwind();
    
    const activeTheme = THEMES.find(t => t.id === theme);
    
    return <LinearGradient
        colors={(activeTheme?.colors || [accent + '50', accent]) as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
            borderRadius: 999,
            position: "absolute",
            left: left,
            top: top,
            zIndex: 1,
        }}
    >
        <Chip
            size="sm"
            style={{ backgroundColor: "transparent" }}
        >
            <Chip.Label style={{ color: foreground, fontWeight: 'bold', fontSize: 10 }}>
                Go PRO
            </Chip.Label>
            {/* <Ionicons name="star-outline" color='black' size={12} /> */}
        </Chip>
    </LinearGradient>;
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 28,
        fontWeight: 800,
    },
});

export default SessionHeader;
