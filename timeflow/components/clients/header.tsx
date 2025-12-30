import { useRouter } from "expo-router";
import { Button, useThemeColor } from "heroui-native";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "../ui/icon";

const ClientHeader = () => {
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
            <Text style={[styles.titleText, { color: foreground }]}>My Clients</Text>
        </View>
        <View
            style={{
                width: 40
            }}
        />
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

export default ClientHeader;
