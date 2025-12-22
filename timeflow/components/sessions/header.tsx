import { useSessions } from "@/hooks/use-sessions";
import { useUserStatus } from "@/hooks/user-status";
import { exportSessionsToCSV } from '@/services/export-csv';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Button, Chip, Spinner, useThemeColor } from "heroui-native";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "../ui/icon";
import { usePremiumToast } from "../ui/premium-toast";

const SessionHeader = () => {
    const foreground = useThemeColor('foreground');
    const { isPro, isChecking } = useUserStatus();
    const { sessions, isLoading } = useSessions();
    const { showToast } = usePremiumToast();
    
    const router = useRouter();

    if (isLoading || isChecking) return <Spinner />;

    const handleOnClose = () => {
        router.back();
    }

    const handleExport = async () => {
        if (!isChecking && !isPro) {
            showToast(
                '✨ PRO Feature Locked', 
                'Exporting history to CSV is available exclusively for PRO users. Upgrade to unlock!',
                false
            );
        } else {
            await exportSessionsToCSV(sessions);
        }    
    };
    
    return <View style={[styles.headerContainer]}>
        <Button variant="ghost" isIconOnly onPress={handleOnClose}>
            <Icon name="chevron-back-outline" />
        </Button>
        <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[styles.titleText, { color: foreground }]}>Sessions History</Text>
        </View>
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
            }}
        >
            {!isChecking && !isPro && <GetProLabel />}
            <Button variant="ghost" isIconOnly onPress={handleExport}>
                <Icon name="share-outline" />
            </Button>
        </View>

    </View>
}

export const GetProLabel = ({left = -25, top = 30 }: {left?: number, top?: number}) => <LinearGradient
    colors={["#f7f455ff", "#22cea9ff"]}
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
        <Chip.Label style={{ color: "black", fontWeight: 'bold', fontSize: 12 }}>
            Go PRO
        </Chip.Label>
        {/* <Ionicons name="star-outline" color='black' size={12} /> */}
    </Chip>
</LinearGradient>;

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
