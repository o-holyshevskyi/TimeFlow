import { Layout } from "@/constants/layout";
import { useRouter } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "../ui/app-text";
import { Icon } from "../ui/icon";

const ClientHeader = () => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const surface = useThemeColor('surface');
    const router = useRouter();

    return (
        <View>
            <View style={styles.headerContainer}>
                <Pressable
                    onPress={() => router.back()}
                    style={[styles.backBtn, { backgroundColor: surface, borderColor: muted + '25', borderWidth: 1 }]}
                >
                    <Icon name="chevron-back-outline" color={foreground} size={18} />
                </Pressable>
                <AppText style={[styles.titleText, { color: foreground }]}>Clients</AppText>
                {/* spacer to balance the back button */}
                <View style={{ width: 36 }} />
            </View>
            <View style={[styles.divider, { backgroundColor: muted + '15', marginHorizontal: Layout.spacing * 4 }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Layout.spacing * 4,
        paddingTop: Layout.spacing * 2,
        paddingBottom: Layout.spacing * 2,
    },
    divider: {
        height: 1,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
});

export default ClientHeader;
