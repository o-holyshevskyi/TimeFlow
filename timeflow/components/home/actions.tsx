import { Layout } from "@/constants/layout";
import { Button } from "heroui-native";
import { Dimensions, StyleSheet, View } from "react-native";
import { Icon } from "../ui/icon";

const CARD_WIDTH = Dimensions.get('screen').width * .9;

const Actions = () => {
    return <View style={[styles.container]}>
        <Button variant="secondary" size="lg" style={{ minWidth: CARD_WIDTH }}>
            <Icon name="stop-outline" />
            <Button.Label style={{ fontSize: 24, fontWeight: 600, color: 'white' }}>Stop</Button.Label>
        </Button>
        <Button size="lg" style={{ minWidth: CARD_WIDTH }}>
            <Icon name="play-outline" color="black" />
            <Button.Label style={{ fontSize: 24, fontWeight: 600, color: 'black' }}>Start</Button.Label>
        </Button>
    </View>
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Layout.spacing * 2
    },
});

export default Actions;
