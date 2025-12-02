import { Icon } from "@/components/ui/icon";
import { Layout } from "@/constants/layout";
import { useRouter } from "expo-router";
import { Button, Card, useThemeColor } from "heroui-native";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MIN_WEIGHT_SCROLL_VIEW = Dimensions.get('screen').height * .85

const data = [
    {
        id: 1,
        amount: "$400.00",
        startDate: "09:00 AM",
        endDate: "05:00 PM",
        rate: "$50/hr",
    },
    {
        id: 2,
        amount: "$150.00",
        startDate: "06:00 PM",
        endDate: "09:00 PM",
        rate: "$50/hr",
    },
    {
        id: 3,
        amount: "$225.00",
        startDate: "10:30 AM",
        endDate: "03:00 PM",
        rate: "$50/hr",
    },
    {
        id: 4,
        amount: "$345.00",
        startDate: "12:00 PM",
        endDate: "05:00 PM",
        rate: "$50/hr",
    }
]

export default function SessionsList() {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    
    const router = useRouter();

    const handleOnClose = () => {
        router.back();
    }

    return <SafeAreaView style={[styles.container]}>
        <Button isIconOnly variant="ghost" onPress={handleOnClose}>
            <Icon name="close-outline" />
        </Button>
        <View style={[styles.scrollContainer]}>
            <Text style={[styles.date, { color: foreground }]}>
                Today, Nov 26
            </Text>
            <FlatList
                data={data}
                keyExtractor={item => item.id.toString()}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                renderItem={({ item, index }) => {
                    return <Card key={index} style={[styles.card]}>
                        <Card.Body style={{ flexDirection: 'column', gap: Layout.spacing * 2 }}>
                            <Text style={[styles.amount, { color: foreground }]}>{item.amount}</Text>
                            <Text style={[styles.time, { color: muted }]}>{item.startDate} - {item.endDate} (8h 0m)</Text>
                            <Text style={[styles.rate, { color: muted }]}>{item.rate}</Text>
                        </Card.Body>
                    </Card>
                }}
            />
        </View>
    </SafeAreaView>
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        paddingHorizontal: Layout.spacing * 3
    },
    scrollContainer: {
        paddingVertical: Layout.spacing * 2,
    },
    date: {
        fontSize: 30,
        fontWeight: 600,
        paddingHorizontal: Layout.spacing * 3
    },
    card: {
        marginTop: Layout.spacing * 2,
        backgroundColor: '#1C2D23',
        borderRadius: Layout.borderRadius
    },
    amount: {
        fontSize: 35,
        fontWeight: 800
    },
    time: {
        fontSize: 24
    },
    rate: {
        fontSize: 22
    }
})
