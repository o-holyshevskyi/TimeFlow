import { Layout } from "@/constants/layout";
import { Card, useThemeColor } from "heroui-native";
import { StyleSheet, Text, View } from "react-native";

const TEXT_SIZE = 45;

const Timer = () => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    
    return <View style={[styles.timerContainer]}>
        <View style={[styles.timeItem]}>
            <Card style={[styles.card]}>
                <Card.Body>
                    <Text style={[{ color: foreground }, styles.cardBodyText]}>00</Text>
                </Card.Body>
            </Card>
            <Text style={[{ color: muted }, styles.timeItemDescription]}>
                Hours
            </Text>
        </View>
        <View style={[styles.timeItem]}>
            <Card style={[styles.card]}>
                <Card.Body>
                    <Text style={[{ color: foreground }, styles.cardBodyText]}>25</Text>
                </Card.Body>
            </Card>
            <Text style={[{ color: muted }, styles.timeItemDescription]}>
                Minutes
            </Text>
        </View>
        <View style={[styles.timeItem]}>
            <Card style={[styles.card]}>
                <Card.Body>
                    <Text style={[{ color: foreground }, styles.cardBodyText]}>47</Text>
                </Card.Body>
            </Card>
            <Text style={[{ color: muted }, styles.timeItemDescription]}>
                Seconds
            </Text>
        </View>
    </View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: Layout.spacing * 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Layout.spacing * 3,
    },
    card: {
        padding: Layout.spacing * 4,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: Layout.borderRadius,
    },
    timeItem: {
        gap: Layout.spacing * 3, 
        flexDirection: 'column', 
        alignItems: 'center'
    },
    timeItemDescription: {
        fontSize: TEXT_SIZE / 2,
        fontWeight: 600
    },
    cardBodyText: {
        fontWeight: 900,
        fontSize: TEXT_SIZE
    }
});

export default Timer;
