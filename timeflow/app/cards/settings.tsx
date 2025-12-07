import PremiumCard from "@/components/settings/premium-card";
import SettingsCard from "@/components/settings/settings-card";
import { Icon } from "@/components/ui/icon";
import { Layout } from "@/constants/layout";
import { useUserStatus } from "@/hooks/user-status";
import Constats from 'expo-constants';
import { useRouter } from "expo-router";
import { Button, useThemeColor } from "heroui-native";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Settings() {
    const foreground = useThemeColor('foreground');
    
    const router = useRouter();

    const { isPro, isChecking } = useUserStatus();
    
    const handleOnClose = () => {
        router.back();
    }
    
    return <SafeAreaView style={[styles.container]}>
        <View style={[styles.headerContainer]}>
            <Button isIconOnly variant="ghost" onPress={handleOnClose}>
                <Icon name="chevron-back-outline" />
            </Button>
            <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[styles.titleText, { color: foreground }]}>Settings</Text>
            </View>
            <View style={{ width: 40 }} />
        </View>
        <View style={[styles.contentContainer]}>
            <SettingsCard />
            {!isChecking && !isPro && <PremiumCard />}
        </View>
        <Text style={{ alignSelf: 'center', color: foreground, fontWeight: 500 }}>v. {Constats.expoConfig?.version}</Text>
    </SafeAreaView>
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        paddingHorizontal: Layout.spacing * 3
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Layout.spacing * 3,
    },
    titleText: {
        fontSize: 28,
        fontWeight: 800,
    },
    contentContainer: {
        paddingVertical: Layout.spacing * 1.5,
        gap: Layout.spacing * 5
    },
});
