import SessionHeader from "@/components/sessions/header";
import SessionCard from "@/components/sessions/session-card";
import PremiumCard from "@/components/settings/premium-card";
import { AppText } from "@/components/ui/app-text";
import { Icon } from "@/components/ui/icon";
import { Layout } from "@/constants/layout";
import { Session, useSessions } from "@/hooks/use-sessions";
import { useUserStatus } from "@/hooks/user-status";
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from "expo-router";
import { Button, Spinner, useThemeColor } from "heroui-native";
import { useCallback, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    Extrapolation,
    SharedValue,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const SESSION_ITEM_HEIGHT = 160;
const HEADER_ITEM_HEIGHT = 60;

type ListItem =
    | { type: 'header'; date: string; displayDate: string }
    | { type: 'session'; data: Session };

const groupAndFlattenSessions = (sessions: Session[]): ListItem[] => {
    const sortedSessions = [...sessions].sort((a, b) => b.startTime - a.startTime);
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    });
    const today = new Date().toDateString();
    const result: ListItem[] = [];
    let lastDateKey = '';

    sortedSessions.forEach((session) => {
        const sessionDate = new Date(session.startTime);
        const dateKey = sessionDate.toDateString();
        if (dateKey !== lastDateKey) {
            let displayDate = dateFormatter.format(sessionDate);
            if (dateKey === today) {
                const parts = displayDate.split(' ');
                displayDate = parts.length >= 3 ? `Today, ${parts[1]} ${parts[2]}` : "Today";
            }
            result.push({ type: 'header', date: dateKey, displayDate });
            lastDateKey = dateKey;
        }
        result.push({ type: 'session', data: session });
    });

    return result;
};

export default function SessionsTab() {
    const { sessions, isLoading, deleteSession } = useSessions();
    const { isPro, isChecking } = useUserStatus();
    const { push } = useRouter();

    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const scrollY = useSharedValue(0);
    const listRef = useRef<Animated.FlatList>(null);

    const visibleSessions = useMemo(() => {
        const sorted = [...sessions].sort((a, b) => b.startTime - a.startTime);
        return isPro ? sorted : sorted.slice(0, 5);
    }, [sessions, isPro]);

    const flatData = useMemo(() => groupAndFlattenSessions(visibleSessions), [visibleSessions]);

    const fadingSessionId = useMemo(() => {
        if (!isPro && visibleSessions.length === 5) return visibleSessions[4].id;
        return null;
    }, [visibleSessions, isPro]);

    const handleAddSession = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
        push('/modals/new-session');
    };

    useFocusEffect(
        useCallback(() => {
            listRef.current?.scrollToOffset({ offset: 0, animated: true });
            scrollY.value = 0;
        }, [scrollY])
    );

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => { scrollY.value = event.contentOffset.y; },
    });

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Spinner size="lg" color={foreground} />
            </SafeAreaView>
        );
    }

    if (flatData.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <SessionHeader />
                <View style={[styles.scrollContainer, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
                    <Icon name="timer-outline" color={muted} />
                    <AppText style={{ color: muted, marginTop: Layout.spacing * 2, fontSize: 16, textAlign: 'center' }}>
                        No saved sessions. Start the timer to record your first session.
                    </AppText>
                    {!isChecking && !isPro && <PremiumCard />}
                </View>
                <AddManualSession handleAddSession={handleAddSession} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <SessionHeader />
            <Animated.FlatList
                data={flatData}
                ref={listRef}
                getItemLayout={(_, index) => {
                    const item = flatData[index];
                    const length = item?.type === 'header' ? HEADER_ITEM_HEIGHT : SESSION_ITEM_HEIGHT;
                    return { length, offset: index * SESSION_ITEM_HEIGHT, index };
                }}
                onScroll={scrollHandler}
                keyExtractor={(item) =>
                    item.type === 'header' ? `header-${item.date}` : `session-${item.data.id}`
                }
                renderItem={({ item, index }) => {
                    if (item.type === 'header') {
                        return (
                            <AppText style={[styles.dateHeader, { color: foreground }]}>
                                {item.displayDate}
                            </AppText>
                        );
                    }
                    return (
                        <AnimatedSessionCard
                            session={item.data}
                            index={index}
                            scrollY={scrollY}
                            isFading={item.data.id === fadingSessionId}
                            deleteSession={deleteSession}
                            foreground={foreground}
                            muted={muted}
                        />
                    );
                }}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                initialNumToRender={10}
                windowSize={5}
                scrollEventThrottle={16}
                contentContainerClassName="px-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
                ListFooterComponent={!isChecking && !isPro ? <PremiumCard /> : <View style={{ height: 50 }} />}
            />
            <View style={styles.fabContainer}>
                <AddManualSession handleAddSession={handleAddSession} />
            </View>
        </SafeAreaView>
    );
}

const ITEM_SIZE = 140;

const AnimatedSessionCard = ({
    session, index, scrollY, isFading, deleteSession, foreground, muted
}: {
    session: Session;
    index: number;
    scrollY: SharedValue<number>;
    isFading: boolean;
    deleteSession: (id: string) => Promise<void>;
    foreground: string;
    muted: string;
}) => {
    const animatedStyle = useAnimatedStyle(() => {
        const itemOffset = index * SESSION_ITEM_HEIGHT;
        const scale = interpolate(
            scrollY.value,
            [-1, 0, itemOffset - SESSION_ITEM_HEIGHT * 0.5, itemOffset + SESSION_ITEM_HEIGHT * 4],
            [1, 1, 1, 0.85],
            Extrapolation.CLAMP
        );
        const opacity = interpolate(
            scrollY.value,
            [-1, 0, ITEM_SIZE * index, ITEM_SIZE * (index + 0.5)],
            [1, 1, 1, 0],
            Extrapolation.CLAMP
        );
        return { opacity, transform: [{ scale }] };
    });

    return (
        <Animated.View style={[styles.cardContainer, animatedStyle]}>
            <SessionCard
                item={session}
                foreground={foreground}
                muted={muted}
                isFading={isFading}
                deleteSession={deleteSession}
            />
        </Animated.View>
    );
};

const AddManualSession = ({ handleAddSession }: { handleAddSession: () => void }) => {
    const foreground = useThemeColor('foreground');
    return (
        <View>
            <Button isIconOnly variant="primary" size="lg" onPress={handleAddSession}>
                <Icon name="add-outline" color={foreground} />
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContainer: {
        paddingVertical: Layout.spacing * 2,
        paddingBottom: Layout.spacing * 10,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        margin: Layout.spacing * 5,
    },
    cardContainer: {
        marginBottom: Layout.spacing * 2,
    },
    dateHeader: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginTop: Layout.spacing * 3,
        marginBottom: Layout.spacing,
        paddingHorizontal: Layout.spacing,
        opacity: 0.5,
    },
});
