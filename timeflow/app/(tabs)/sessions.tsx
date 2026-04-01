import SessionHeader from '@/components/sessions/header';
import SessionCard from '@/components/sessions/session-card';
import PremiumCard from '@/components/settings/premium-card';
import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { Session, useSessions } from '@/hooks/use-sessions';
import { useUserStatus } from '@/hooks/user-status';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { Spinner, useThemeColor } from 'heroui-native';
import { useCallback, useMemo, useRef } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
    Extrapolation,
    SharedValue,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const SESSION_ITEM_HEIGHT = 152;
const HEADER_ITEM_HEIGHT = 48;
const FAB_SIZE = 56;

type ListItem =
    | { type: 'header'; date: string; displayDate: string }
    | { type: 'session'; data: Session };

const groupAndFlattenSessions = (sessions: Session[]): ListItem[] => {
    const sorted = [...sessions].sort((a, b) => b.startTime - a.startTime);
    const fmt = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const today = new Date().toDateString();
    const result: ListItem[] = [];
    let lastKey = '';

    sorted.forEach(s => {
        const d = new Date(s.startTime);
        const key = d.toDateString();
        if (key !== lastKey) {
            let display = fmt.format(d);
            if (key === today) {
                const p = display.split(' ');
                display = p.length >= 3 ? `Today · ${p[1]} ${p[2]}` : 'Today';
            }
            result.push({ type: 'header', date: key, displayDate: display });
            lastKey = key;
        }
        result.push({ type: 'session', data: s });
    });
    return result;
};

export default function SessionsTab() {
    const { sessions, isLoading, deleteSession } = useSessions();
    const { isPro, isChecking } = useUserStatus();
    const { push } = useRouter();

    const background = useThemeColor('background');
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const accent = useThemeColor('accent');
    const surface = useThemeColor('surface');

    const scrollY = useSharedValue(0);
    const listRef = useRef<Animated.FlatList>(null);

    const visibleSessions = useMemo(() => {
        const s = [...sessions].sort((a, b) => b.startTime - a.startTime);
        return isPro ? s : s.slice(0, 5);
    }, [sessions, isPro]);

    const flatData = useMemo(() => groupAndFlattenSessions(visibleSessions), [visibleSessions]);

    const fadingId = useMemo(() => {
        if (!isPro && visibleSessions.length === 5) return visibleSessions[4].id;
        return null;
    }, [visibleSessions, isPro]);

    const handleAdd = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
        push('/modals/new-session');
    };

    useFocusEffect(useCallback(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
        scrollY.value = 0;
    }, [scrollY]));

    const onScroll = useAnimatedScrollHandler(e => { scrollY.value = e.contentOffset.y; });

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
                <Spinner size="lg" color={foreground} />
            </SafeAreaView>
        );
    }

    if (flatData.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
                <SessionHeader />
                <View style={styles.empty}>
                    <View style={[styles.emptyIcon, { backgroundColor: muted + '18' }]}>
                        <Icon name="timer-outline" color={muted} size={28} />
                    </View>
                    <AppText style={[styles.emptyTitle, { color: foreground }]}>No Sessions Yet</AppText>
                    <AppText style={[styles.emptyBody, { color: muted }]}>
                        Start the timer to record your first session.
                    </AppText>
                    {!isChecking && !isPro && <PremiumCard />}
                </View>
                <FAB accent={accent} foreground={foreground} surface={surface} onPress={handleAdd} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
            <SessionHeader />
            <Animated.FlatList
                ref={listRef}
                data={flatData}
                onScroll={onScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                keyExtractor={item =>
                    item.type === 'header' ? `hdr-${item.date}` : `ses-${item.data.id}`
                }
                getItemLayout={(_, i) => {
                    const it = flatData[i];
                    const len = it?.type === 'header' ? HEADER_ITEM_HEIGHT : SESSION_ITEM_HEIGHT;
                    return { length: len, offset: i * SESSION_ITEM_HEIGHT, index: i };
                }}
                renderItem={({ item, index }) => {
                    if (item.type === 'header') {
                        return (
                            <AppText style={[styles.dateHeader, { color: muted }]}>
                                {item.displayDate}
                            </AppText>
                        );
                    }
                    return (
                        <AnimatedCard
                            session={item.data}
                            index={index}
                            scrollY={scrollY}
                            isFading={item.data.id === fadingId}
                            deleteSession={deleteSession}
                            foreground={foreground}
                            muted={muted}
                        />
                    );
                }}
                maxToRenderPerBatch={10}
                initialNumToRender={10}
                windowSize={5}
                contentContainerStyle={styles.listContent}
                ListFooterComponent={
                    !isChecking && !isPro
                        ? <View style={{ paddingHorizontal: 16 }}><PremiumCard /></View>
                        : <View style={{ height: 40 }} />
                }
            />
            <FAB accent={accent} foreground={foreground} surface={surface} onPress={handleAdd} />
        </SafeAreaView>
    );
}

const AnimatedCard = ({
    session, index, scrollY, isFading, deleteSession, foreground, muted,
}: {
    session: Session; index: number; scrollY: SharedValue<number>;
    isFading: boolean; deleteSession: (id: string) => Promise<void>;
    foreground: string; muted: string;
}) => {
    const anim = useAnimatedStyle(() => {
        const off = index * SESSION_ITEM_HEIGHT;
        return {
            opacity: interpolate(scrollY.value, [-1, 0, off * 0.8, off + SESSION_ITEM_HEIGHT], [1, 1, 1, 0], Extrapolation.CLAMP),
            transform: [{
                scale: interpolate(scrollY.value, [-1, 0, off, off + SESSION_ITEM_HEIGHT * 2], [1, 1, 1, 0.96], Extrapolation.CLAMP),
            }],
        };
    });

    return (
        <Animated.View style={[styles.cardWrap, anim]}>
            <SessionCard item={session} foreground={foreground} muted={muted} isFading={isFading} deleteSession={deleteSession} />
        </Animated.View>
    );
};

const FAB = ({ accent, foreground, surface, onPress }: {
    accent: string; foreground: string; surface: string; onPress: () => void;
}) => (
    <View style={styles.fabWrap}>
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.fab, {
                backgroundColor: accent,
                opacity: pressed ? 0.8 : 1,
                shadowColor: accent,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
            }]}
        >
            <Icon name="add" color="white" size={28} />
        </Pressable>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 120,
    },
    cardWrap: { marginBottom: 12 },
    dateHeader: {
        fontFamily: 'System',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginTop: 24,
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        gap: 12,
    },
    emptyIcon: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    emptyTitle: {
        fontFamily: 'System',
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    emptyBody: {
        fontFamily: 'System',
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
    fabWrap: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 32 : 24,
        right: 24,
    },
    fab: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: FAB_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
