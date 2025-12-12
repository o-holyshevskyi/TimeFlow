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
    const { isTracking, startTimer, stopTimer, pauseTimer, resumeTimer, isPaused } = useTimer();
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

    const handlePause = useCallback(() => {
        pauseTimer();
        showToast('Timer Paused', 'Time tracking has been paused. Take a break and resume when ready.');
    }, [pauseTimer, showToast]);

    const handleResume = useCallback(() => {
        resumeTimer();
        showToast('Timer Resumed', 'Time tracking has resumed. Welcome back to your productive session!');
    }, [resumeTimer, showToast]);

    const handleSetRate = useCallback(() => {
        router.push('/cards/settings');
    }, []);

    const SetHourlyRateBtn = (
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

    const StartBtn = (
        <Button 
            key="start"
            size="lg" 
            style={{ minWidth: CARD_WIDTH, backgroundColor: '#2bee6c' }}
            isDisabled={settings?.currency === undefined}
            feedbackVariant="ripple"
            onPress={handleStart}
        >
            <Icon name="play-outline" color="black" />
            <Button.Label style={{ fontSize: 24, fontWeight: '600', color: 'black' }}>Start Tracking</Button.Label>
        </Button>
    );

    const PauseBtn = (
        <Button
            key="pause"
            onPress={handlePause}
            size="lg"
            style={[styles.outlineButton, { borderColor: '#FFEB3B' }]} // Yellow for pause
        >
            <Icon name="pause-outline" color="#FFEB3B" />
            <Button.Label style={[styles.outlineButtonText, { color: '#FFEB3B' }]}>Pause Session</Button.Label>
        </Button>
    );
    
    const ResumeBtn = (
        <Button
            key="resume"
            onPress={handleResume}
            size="lg"
            style={[styles.outlineButton, { borderColor: '#2bee6c' }]} // Green for resume
        >
            <Icon name="play-outline" color="#2bee6c" />
            <Button.Label style={[styles.outlineButtonText, { color: '#2bee6c' }]}>Resume Session</Button.Label>
        </Button>
    );

    const StopBtn = (
        <Button
            key="stop"
            onPress={handleStop}
            size="lg"
            style={[styles.outlineButton, { borderColor: '#fe5959ff' }]} // Red for stop
        >
            <Icon name="stop-outline" color="#fe5959ff" />
            <Button.Label style={[styles.outlineButtonText, { color: '#fe5959ff' }]}>Stop Session</Button.Label>
        </Button>
    );

    if (!settings?.currency) {
        return <View style={styles.container}>{SetHourlyRateBtn}</View>;
    }

    if (isTracking && !isPaused) {
        return (
            <View style={styles.container}>
                {PauseBtn}
                {StopBtn}
            </View>
        );
    }

    if (isPaused) {
        return (
            <View style={styles.container}>
                {ResumeBtn}
                {StopBtn}
            </View>
        );
    }

    return <View style={styles.container}>{StartBtn}</View>;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Layout.spacing * 2,
        width: '100%',
    },
    outlineButton: {
        borderRadius: 9999,
        borderWidth: 1,
        backgroundColor: 'transparent',
        minWidth: CARD_WIDTH,
        paddingHorizontal: Layout.spacing * 3,
        paddingVertical: Layout.spacing / 1.5,
    },
    outlineButtonText: {
        fontSize: 24, 
        fontWeight: '600',
    }
});

export default Actions;
