import { Layout } from "@/constants/layout";
import { Button, Card, useThemeColor } from "heroui-native";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "../ui/icon";

const PremiumCard = () => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    
    return <Card style={[styles.premiumCard]}>
        <Card.Header style={[styles.premiumCardHeader]}>
            <View style={[styles.premiumTextContainer]}>
                <Icon name="star" color="#2bee6c" />
                <Text style={[{ color: foreground }, styles.premiumCardTitle]}>Go Premium</Text>
            </View>
            <Text style={[{ color: muted }, styles.premiumCardDescription]}>
                Unlock powerful features to boost your productivity.
            </Text>
        </Card.Header>
        <Card.Body style={{ paddingHorizontal: Layout.spacing }}>
            <View style={{ flexDirection: "column", gap: Layout.spacing * 5 }}>
                <View style={[styles.premiumTextContainer]}>
                    <Icon name="checkmark-circle" color="#2bee6c" />
                    <Text style={[{ color: foreground }, styles.premiumCardDescription]}>Add-Free Experience</Text>
                </View>
                <View style={[styles.premiumTextContainer]}>
                    <Icon name="checkmark-circle" color="#2bee6c" />
                    <Text style={[{ color: foreground }, styles.premiumCardDescription]}>Full Session History</Text>
                </View>
                <View style={[styles.premiumTextContainer]}>
                    <Icon name="checkmark-circle" color="#2bee6c" />
                    <Text style={[{ color: foreground }, styles.premiumCardDescription]}>Export Data (CSV)</Text>
                </View>
            </View>
        </Card.Body>
        <Card.Footer style={{ paddingHorizontal: Layout.spacing }}>
            <Button 
                feedbackVariant="ripple" 
                size="lg"
                animation={{
                    ripple: {
                        backgroundColor: { value: 'black' },
                        opacity: { value: [0, 0.3, 0] },
                    },
                }}
            >
                <Button.Label style={{ fontSize: 24, fontWeight: 600, color: 'black' }}>Unlock Pro for $4.99</Button.Label>
            </Button>
        </Card.Footer>
    </Card>
}

const styles = StyleSheet.create({
    premiumCard: {
        marginTop: Layout.spacing * 2,
        backgroundColor: '#1C2D23',
        borderRadius: Layout.borderRadius,
        gap: Layout.spacing * 5
    },
    premiumCardHeader: {
        gap: Layout.spacing * 2,
        flexDirection: 'column',
        alignItems: 'center',
        alignContent: 'center'
    },
    premiumCardTitle: {
        fontSize: 28, 
        fontWeight: 700
    },
    premiumCardDescription: {
        fontSize: 22, 
        fontWeight: 500, 
        textAlign: 'center'
    },
    premiumTextContainer: {
        flexDirection: 'row', 
        gap: Layout.spacing * 2, 
        alignItems: 'center'
    }
});

export default PremiumCard;
