import { Layout } from "@/constants/layout";
import { useRouter } from "expo-router";
import { Button, useThemeColor } from "heroui-native";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from '../ui/icon';

const Header = () => {
    const foreground = useThemeColor('foreground');

    const router = useRouter();

    const handleOnListPress = () => {
        router.push('/cards/sessions-list');
    }

    const handleOnSettingsPress = () => {
        router.push('/cards/settings');
    }

    return <View style={[styles.container]}>
        <Button isIconOnly variant="ghost" onPress={handleOnListPress}>
            <Icon name="calendar-outline"/>
        </Button>
        <Text
            style={[{ color: foreground }, styles.headerText]}
        >
            Time Tracker
        </Text>
        <Button isIconOnly variant="ghost" onPress={handleOnSettingsPress}>
            <Icon name='settings-outline'/>
        </Button>
    </View>;
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Layout.spacing * 3,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerText: {
        fontSize: 28,
        fontWeight: 700
    }
});

export default Header;
