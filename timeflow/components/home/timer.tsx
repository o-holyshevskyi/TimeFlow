import { useTimer } from "@/contexts/timer-context";
import { useThemeColor } from "heroui-native";
import { MotiView } from 'moti';
import { StyleSheet, TextProps, View } from "react-native";
import { AppText } from "../ui/app-text";

const TEXT_SIZE = 72;
const LINE_HEIGHT = TEXT_SIZE * 1.15;

const Timer = () => {
    const muted = useThemeColor('muted');
    const foreground = useThemeColor('foreground');
    const surface = useThemeColor('surface');
    const accent = useThemeColor('accent');
    const { hours, minutes, seconds } = useTimer();

    return (
        <View style={[styles.timerShell, {
            backgroundColor: surface,
            borderColor: muted + '20',
            borderWidth: 1,
        }]}>
            {/* Thin top accent line */}
            <View style={[styles.accentBar, { backgroundColor: accent }]} />
            <View style={styles.timerContainer}>
                <TimeBox value={hours} label="HRS" mutedColor={muted} />
                <AppText style={[styles.colon, { color: muted }]}>:</AppText>
                <TimeBox value={minutes} label="MIN" mutedColor={muted} />
                <AppText style={[styles.colon, { color: muted }]}>:</AppText>
                <TimeBox value={seconds} label="SEC" mutedColor={muted} />
            </View>
        </View>
    );
};

const TimeBox = ({ value, label, mutedColor }: { value: string, label: string, mutedColor: string }) => (
    <View style={styles.timeItem}>
        <Ticker value={value} />
        <AppText style={[{ color: mutedColor }, styles.timeItemDescription]}>
            {label}
        </AppText>
    </View>
);

export const Ticker = ({ value }: { value: string }) => {
    const splitValue = value.split('');
    const foreground = useThemeColor('foreground');

    return (
        <View style={styles.tickerRow}>
            {splitValue.map((char, index) => {
                const num = parseInt(char);
                if (!isNaN(num)) {
                    return <TickerList key={index} number={num} index={index} />;
                }
                return (
                    <Tick key={index} fontSize={TEXT_SIZE} style={{ color: foreground }}>
                        {char}
                    </Tick>
                );
            })}
        </View>
    );
};

const numbersToNice = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const TickerList = ({ number, index }: { number: number; index: number }) => {
    const foreground = useThemeColor('foreground');

    return (
        <View style={{ height: LINE_HEIGHT, overflow: "hidden" }}>
            <MotiView
                animate={{ translateY: -LINE_HEIGHT * number }}
                transition={{ delay: index * 50, type: 'spring', damping: 20, stiffness: 90 }}
            >
                {numbersToNice.map((num) => (
                    <Tick key={num} fontSize={TEXT_SIZE} style={{ color: foreground }}>
                        {num}
                    </Tick>
                ))}
            </MotiView>
        </View>
    );
};

const Tick = ({ children, fontSize, style, ...rest }: TextProps & { fontSize: number }) => (
    <AppText
        {...rest}
        style={[style, {
            fontSize,
            lineHeight: LINE_HEIGHT,
            fontVariant: ['tabular-nums'],
            fontWeight: '800',
            textAlign: 'center',
            minWidth: fontSize * 0.6,
        }]}
    >
        {children}
    </AppText>
);

const styles = StyleSheet.create({
    timerShell: {
        borderRadius: 24,
        overflow: 'hidden',
        alignSelf: 'center',
    },
    accentBar: {
        height: 3,
        width: '100%',
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 4,
        paddingHorizontal: 28,
        paddingVertical: 20,
        paddingTop: 18,
    },
    tickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    colon: {
        fontSize: TEXT_SIZE * 0.5,
        fontWeight: '300',
        lineHeight: LINE_HEIGHT,
        marginBottom: 24,
        opacity: 0.35,
    },
    timeItem: {
        gap: 8,
        flexDirection: 'column',
        alignItems: 'center',
    },
    timeItemDescription: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 2,
        opacity: 0.45,
    },
});

export default Timer;
