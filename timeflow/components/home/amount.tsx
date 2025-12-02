import { Layout } from "@/constants/layout";
import { Card, useThemeColor } from "heroui-native";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const CARD_WIDTH = Dimensions.get('screen').width * .9;

const EarnedAmount = () => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    
    return <View>
        <Card style={[styles.card]}>
            <Card.Header>
                <Text style={[{ color: muted }, styles.title]}>
                    Earned Money
                </Text>
            </Card.Header>
            <Card.Body>
                <Text style={[{ color: foreground }, styles.description]}>
                    $12.34
                </Text>
            </Card.Body>
        </Card>
    </View>;
}

const styles = StyleSheet.create({
    card: {
        gap: Layout.spacing, 
        alignItems: 'center', 
        minWidth: CARD_WIDTH, 
        padding: Layout.spacing * 4, 
        backgroundColor: "rgba(43, 238, 108, 0.2)", 
        borderRadius: Layout.borderRadius
    },
    title: {
        fontSize: 24,
        fontWeight: 500
    },
    description: {
        fontSize: 45,
        fontWeight: 800
    }
});

export default EarnedAmount;
