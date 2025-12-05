import { Layout } from "@/constants/layout";
import { useTimer } from "@/contexts/timer-context";
import { Button } from "heroui-native";
import { Dimensions, StyleSheet, View } from "react-native";
import { Icon } from "../ui/icon";

const CARD_WIDTH = Dimensions.get('screen').width * .9;

const Actions = () => {
    const { isTracking, startTimer, stopTimer } = useTimer();
    
    const StartButton = (
        <Button 
            key="start"
            size="lg" 
            style={{ minWidth: CARD_WIDTH }}
            feedbackVariant="ripple"
            onPress={startTimer} // <-- Функція Start
            animation={{
                ripple: {
                    backgroundColor: { value: 'black' },
                    opacity: { value: [0, 0.3, 0] },
                },
            }}
        >
            <Icon name="play-outline" color="black" />
            <Button.Label style={{ fontSize: 24, fontWeight: '600' as '600' | 'bold', color: 'black' }}>Start</Button.Label>
        </Button>
    );

    const StopButton = (
        <Button 
            key="stop"
            variant="secondary" 
            size="lg" 
            style={{ minWidth: CARD_WIDTH }}
            feedbackVariant="ripple"
            onPress={stopTimer} // <-- Функція Stop
            animation={{
                ripple: {
                    backgroundColor: { value: 'white' },
                    opacity: { value: [0, 0.3, 0] },
                },
            }}
        >
            <Icon name="stop-outline" />
            <Button.Label style={{ fontSize: 24, fontWeight: '600' as '600' | 'bold', color: 'white' }}>Stop</Button.Label>
        </Button>
    );

    return <View style={[styles.container]}>
        {isTracking ? StopButton : StartButton}
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
