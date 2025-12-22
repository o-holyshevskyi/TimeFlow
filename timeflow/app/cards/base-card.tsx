import { Icon } from "@/components/ui/icon";
import { Layout } from "@/constants/layout";
import { router } from "expo-router";
import { Button, useThemeColor } from "heroui-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const BaseCard = ({ title, children }: {title: string, children: React.ReactNode}) => {
    const foreground = useThemeColor('foreground');

    const handleOnClose = () => {
        router.back();
    }

    return <SafeAreaView style={[styles.container]}>
        <View style={[styles.headerContainer]}>
            <Button isIconOnly variant="ghost" onPress={handleOnClose}>
                <Icon name="chevron-back-outline" />
            </Button>
            <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[styles.titleText, { color: foreground }]}>{title}</Text>
            </View>
            <View style={{ width: 40 }} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
            {children}
        </ScrollView>
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
});