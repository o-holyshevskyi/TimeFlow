import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Button, Chip, useThemeColor } from "heroui-native";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "../ui/icon";

const SessionHeader = () => {
    const foreground = useThemeColor('foreground');
        
    const router = useRouter();

    const handleOnClose = () => {
        router.back();
    }
    
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
                justifyContent: "center",
            }}
        >
            <LinearGradient
                colors={["#f7f455ff", "#22cea9ff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                    borderRadius: 999,
                    padding: 2,
                }}
            >
                <Chip
                    size="sm"
                    className="bg-transparent"
                    style={{ backgroundColor: "transparent" }}
                >
                    <Chip.Label style={{ color: "black", fontWeight: "600" }}>
                        Go PRO
                    </Chip.Label>
                    <Ionicons name="star-outline" color='black' size={15} />
                </Chip>
            </LinearGradient>
            {/* <Button variant="ghost" isIconOnly onPress={() => {}}>
                <Icon name="share-outline" />
            </Button> */}
        </View>

    </View>
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
