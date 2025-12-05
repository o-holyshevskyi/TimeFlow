import { Layout } from "@/constants/layout";
import { useTimer } from "@/contexts/timer-context";
import { useSettings } from "@/hooks/use-settings";
import { router } from "expo-router";
import { Button, Toast, useToast } from "heroui-native";
import { useCallback } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Icon } from "../ui/icon";

const CARD_WIDTH = Dimensions.get('screen').width * .9;

const Actions = () => {
    const { isTracking, startTimer, stopTimer } = useTimer();
    const { toast } = useToast();
    const { settings } = useSettings();

    const showToast = useCallback((label: string, description: string) => {
        toast.show({
            component: (props) => (
                <Toast variant="default" placement="top" className="bg-[#0f172aff] border-[#334155] border-1 p-5" {...props}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Toast.Label style={{ fontSize: 22 }}>{label}</Toast.Label>
                            <Toast.Description style={{ fontSize: 16 }}>{description}</Toast.Description>
                        </View>
                    </View>
                </Toast>
            ),
        });
    }, [toast]);

    const handleStart = useCallback(() => {
        startTimer();
        showToast('Timer Started', 'Time tracking has begun. Wishing you a productive session!');
    }, [startTimer, showToast]);

    const handleStop = useCallback(() => {
        stopTimer();
        showToast('Session Saved', 'Your work time has been recorded and added to the session history.');
    }, [stopTimer, showToast]);

    const handleSetRate = useCallback(() => {
        router.push('/cards/settings');
    }, []);

    const SetHourlyRate = (
        <Button 
            key="start"
            size="lg" 
            style={{ minWidth: CARD_WIDTH }}
            feedbackVariant="ripple"
            onPress={handleSetRate}
            animation={{
                ripple: {
                    backgroundColor: { value: 'black' },
                    opacity: { value: [0, 0.3, 0] },
                },
            }}
        >
            <Icon name="time-outline" color="black" />
            <Button.Label style={{ fontSize: 24, fontWeight: '600' as '600' | 'bold', color: 'black' }}>Set Hourly Rate</Button.Label>
        </Button>
    );

    const StartButton = (
        <Button 
            key="start"
            size="lg" 
            style={{ minWidth: CARD_WIDTH }}
            isDisabled={settings?.currency === undefined}
            feedbackVariant="ripple"
            onPress={handleStart}
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
            onPress={handleStop}
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
        {settings?.currency === undefined ? SetHourlyRate : isTracking ? StopButton : StartButton}
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
