import { Layout } from "@/constants/layout";
import { useTimer } from "@/contexts/timer-context";
import { Card, useThemeColor } from "heroui-native";
import { MotiView } from 'moti';
import { StyleSheet, TextProps, View } from "react-native";
import { AppText } from "../ui/app-text";

// Фіксований розмір для стабільної анімації
const TEXT_SIZE = 36;
const LINE_HEIGHT = TEXT_SIZE * 1.1; // Трохи більше для візуального комфорту

const Timer = () => {
    const muted = useThemeColor('muted');
    const { hours, minutes, seconds } = useTimer();
    
    return (
        <View style={styles.timerContainer}>
            <TimeBox value={hours} label="Hours" mutedColor={muted} />
            <TimeBox value={minutes} label="Minutes" mutedColor={muted} />
            <TimeBox value={seconds} label="Seconds" mutedColor={muted} />
        </View>
    );
}

const TimeBox = ({ value, label, mutedColor }: { value: string, label: string, mutedColor: string }) => {
    const accent = useThemeColor('accent');

    return <View style={styles.timeItem}>
        <Card style={[styles.card, { backgroundColor: accent + '20' }]}>
            <Card.Body style={styles.cardBody}>
                <Ticker value={value} />
            </Card.Body>
        </Card>
        <AppText style={[{ color: mutedColor }, styles.timeItemDescription]}>
            {label}
        </AppText>
    </View>
};

export const Ticker = ({ value }: { value: string }) => {
    const splitValue = value.split('');
    const foreground = useThemeColor('foreground');

    return (
        <View style={styles.tickerRow}>
            {splitValue.map((number, index) => {
                const _number = parseInt(number);
                if (!isNaN(_number)) {
                    return <TickerList key={index} number={_number} index={index} />;
                } else {
                    return (
                        <Tick key={index} fontSize={TEXT_SIZE} style={{ color: foreground }}>
                            {number}
                        </Tick>
                    );
                }
            })}
        </View>
    );
}

const numbersToNice = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const TickerList = ({ number, index }: { number: number; index: number }) => {
    const foreground = useThemeColor('foreground');

    return (
        <View style={{ height: LINE_HEIGHT, overflow: "hidden" }}>
            <MotiView
                animate={{
                    // Рухаємо на точну висоту рядка
                    translateY: -LINE_HEIGHT * number
                }}
                transition={{
                    delay: index * 50, // Швидша реакція
                    type: 'spring',
                    damping: 20,
                    stiffness: 90
                }}
            >
                {numbersToNice.map((num) => (
                    <Tick key={num} fontSize={TEXT_SIZE} style={{ color: foreground }}>
                        {num}
                    </Tick>
                ))}
            </MotiView>
        </View>
    );
}

const Tick = ({ children, fontSize, style, ...rest }: TextProps & { fontSize: number }) => {
    return (
        <AppText 
            {...rest} 
            style={[
                style, 
                {
                    fontSize,
                    lineHeight: LINE_HEIGHT,
                    fontVariant: ['tabular-nums'],
                    fontWeight: '900', // Важливо: стрінг для fontWeight в деяких версіях
                    textAlign: 'center',
                    minWidth: fontSize * 0.6, // Запобігає "стрибкам" ширини
                }
            ]}
        >
            {children}
        </AppText>
    );
}

const styles = StyleSheet.create({
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Layout.spacing * 3,
    },
    tickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        borderRadius: Layout.borderRadius,
        minWidth: TEXT_SIZE * 2, // Фіксована ширина карток
    },
    cardBody: {
        padding: Layout.spacing * 2.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeItem: {
        gap: Layout.spacing * 2, 
        flexDirection: 'column', 
        alignItems: 'center'
    },
    timeItemDescription: {
        fontSize: 12, // Фіксований розмір для підписів
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});

export default Timer;