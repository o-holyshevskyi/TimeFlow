import { Layout } from "@/constants/layout";
import { useTimer } from "@/contexts/timer-context";
import { Card, useThemeColor } from "heroui-native";
import { MotiView } from 'moti';
import { StyleSheet, Text, TextProps, View } from "react-native";

const TEXT_SIZE = 45;

const Timer = () => {
    const muted = useThemeColor('muted');

    const { hours, minutes, seconds } = useTimer();
    
    return <View style={[styles.timerContainer]}>
        <View style={[styles.timeItem]}>
            <Card style={[styles.card]}>
                <Card.Body>
                    <Ticker value={hours} />
                </Card.Body>
            </Card>
            <Text style={[{ color: muted }, styles.timeItemDescription]}>
                Hours
            </Text>
        </View>
        <View style={[styles.timeItem]}>
            <Card style={[styles.card]}>
                <Card.Body>
                    <Ticker value={minutes} />
                </Card.Body>
            </Card>
            <Text style={[{ color: muted }, styles.timeItemDescription]}>
                Minutes
            </Text>
        </View>
        <View style={[styles.timeItem]}>
            <Card style={[styles.card]}>
                <Card.Body>
                    <Ticker value={seconds} />
                </Card.Body>
            </Card>
            <Text style={[{ color: muted }, styles.timeItemDescription]}>
                Seconds
            </Text>
        </View>
    </View>
}

interface TickerProps {
    value: string;
}

export const Ticker = ({ value }: TickerProps) => {
    const splitValue = value.split('');
    const foreground = useThemeColor('foreground');

    return <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
        {splitValue.map((number, index) => {
            const _number = parseInt(number);
            if (!isNaN(_number)) {
                return <TickerList
                    key={index}
                    number={_number}
                    index={index}
                />
            }  else {
                return <Tick 
                    key={index}
                    fontSize={TEXT_SIZE}
                    style={{
                        color: foreground
                    }}
                >
                    {number}
                </Tick>
            }
        })}
    </View>
}

interface TickerListProps {
    number: number;
    index: number;
}

const numbersToNice = [...Array(10).keys()];

const TickerList = ({ number, index }: TickerListProps) => {
    const foreground = useThemeColor('foreground');

    return <View
        style={{ 
            height: TEXT_SIZE,
            overflow: "hidden",
        }}
    >
        <MotiView
            animate={{
                translateY: -TEXT_SIZE * 0.9 * number
            }}
            transition={{
                delay: index * 100,
                damping: 80,
                stiffness: 200
            }}
        >
            {numbersToNice.map((num) => (
                <Tick 
                    key={`num-${num}`}
                    fontSize={TEXT_SIZE}
                    style={{ color: foreground }}
                >
                    {num}
                </Tick>
            ))}
        </MotiView>
    </View>
}

const Tick = ({children, fontSize, style, ...rest}: TextProps & { fontSize: number }) => {
    return <Text 
        {...rest} 
        style={[style, {
            fontSize,
            lineHeight: fontSize * 1.1,
            fontVariant: ['tabular-nums'],
            fontWeight: 900,
        }]}
    >
        {children}
    </Text>
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
