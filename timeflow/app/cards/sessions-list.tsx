import SessionHeader from "@/components/sessions/header";
import SessionCard from "@/components/sessions/session-card";
import PremiumCard from "@/components/settings/premium-card";
import { Icon } from "@/components/ui/icon";
import { Layout } from "@/constants/layout";
import { Session, useSessions } from "@/hooks/use-sessions";
import { useUserStatus } from "@/hooks/user-status";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import { Button, Spinner, useThemeColor } from "heroui-native";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// 1. Define specific heights for smoother animation calculations
const SESSION_ITEM_HEIGHT = 160; 
const HEADER_ITEM_HEIGHT = 60;

// Helper Types for the FlatList
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

        // If this is a new date, push a Header item first
        if (dateKey !== lastDateKey) {
            let displayDate = dateFormatter.format(sessionDate);
            if (dateKey === today) {
                const parts = displayDate.split(' ');
                if (parts.length >= 3) {
                    displayDate = `Today, ${parts[1]} ${parts[2]}`;
                } else {
                    displayDate = "Today";
                }
            }
            
            result.push({
                type: 'header',
                date: dateKey,
                displayDate: displayDate
            });
            lastDateKey = dateKey;
        }

        // Push the session item
        result.push({
            type: 'session',
            data: session
        });
    });

    return result;
};

export default function SessionsList() {
    const { sessions, isLoading, deleteSession } = useSessions();
    const { isPro, isChecking } = useUserStatus();
    const { push } = useRouter();
    
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const scrollY = useSharedValue(0);

    const visibleSessions = useMemo(() => {
        const sorted = [...sessions].sort((a, b) => b.startTime - a.startTime);
        return isPro ? sorted : sorted.slice(0, 5);
    }, [sessions, isPro]);

    // 2. Use the flattened data structure
    const flatData = useMemo(() => groupAndFlattenSessions(visibleSessions), [visibleSessions]);

    const fadingSessionId = useMemo(() => {
        if (!isPro && visibleSessions.length === 5) {
            return visibleSessions[4].id;
        }
        return null;
    }, [visibleSessions, isPro]);

    const handleAddSession = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
        push('/modals/new-session');
    }

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
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
             <SafeAreaView style={[styles.container]}>
                <SessionHeader />
                <View style={[styles.scrollContainer, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
                    <Icon name="timer-outline" color={muted} />
                    <Text style={{ color: muted, marginTop: Layout.spacing * 2, fontSize: 18, textAlign: 'center' }}>
                        No saved session. Start the timer to save the first session.
                    </Text>
                    {!isChecking && !isPro && <PremiumCard />}
                </View>        
                <AddManualSession handleAddSession={handleAddSession} />
             </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container]}>
            <SessionHeader />
            <Animated.FlatList
                data={flatData}
                // 3. Dynamic layout calculation based on item type
                getItemLayout={(_, index) => {
                    // This is an approximation. For perfect accuracy with variable types, 
                    // you might need a more complex calculation, but this is usually sufficient.
                    const item = flatData[index];
                    const length = item?.type === 'header' ? HEADER_ITEM_HEIGHT : SESSION_ITEM_HEIGHT;
                    const offset = index * (SESSION_ITEM_HEIGHT); // Simplified offset
                    return { length, offset, index };
                }}
                onScroll={scrollHandler}
                // Create a unique key based on type
                keyExtractor={(item, index) => 
                    item.type === 'header' ? `header-${item.date}` : `session-${item.data.id}`
                }
                renderItem={({ item, index }) => {
                    if (item.type === 'header') {
                        return (
                            <Text style={[styles.date, { color: foreground }]}>
                                {item.displayDate}
                            </Text>
                        );
                    }

                    // 4. Render the Animated Card
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
            
            <View
                style={styles.fabContainer}
            >        
                <AddManualSession handleAddSession={handleAddSession} />
            </View>
        </SafeAreaView>
    );
}

const ITEM_SIZE = 140;

// 5. Extracted Component specifically for the Animated Card
const AnimatedSessionCard = ({ 
    session, 
    index, 
    scrollY, 
    isFading, 
    deleteSession,
    foreground,
    muted
}: {
    session: Session,
    index: number,
    scrollY: SharedValue<number>,
    isFading: boolean,
    deleteSession: (id: string) => Promise<void>,
    foreground: string,
    muted: string
}) => {
    const animatedStyle = useAnimatedStyle(() => {
        const itemOffset = index * SESSION_ITEM_HEIGHT;

        const inputRange = [
            -1,
            0,
            itemOffset - (SESSION_ITEM_HEIGHT * 0.5), // Start animating when item is near top
            itemOffset + (SESSION_ITEM_HEIGHT * 4),
        ];
        
        const opacityInputRange = [
            -1,
            0,
            ITEM_SIZE * index,
            ITEM_SIZE * (index + 0.5),
        ];

        const scale = interpolate(
            scrollY.value,
            inputRange,
            [1, 1, 1, .85],
            Extrapolation.CLAMP
        );

        const opacity = interpolate(
            scrollY.value,
            opacityInputRange,
            [1, 1, 1, 0],
            Extrapolation.CLAMP
        );

        return {
            opacity,
            transform: [{ scale }],
        };
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

const AddManualSession = ({ handleAddSession }: { handleAddSession: () => void }) => (
    <View>
        <Button isIconOnly variant="primary" size="lg" onPress={handleAddSession}>
            <Icon name="add-outline" color="black" />
        </Button>
    </View>
);

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        // paddingHorizontal: Layout.spacing * 3
    },
    scrollContainer: {
        paddingVertical: Layout.spacing * 2,
        paddingBottom: Layout.spacing * 10
    },
    fabContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        margin: Layout.spacing * 5,
    },
    cardContainer: {
        marginBottom: Layout.spacing * 2, // Spacing between cards
    },
    date: {
        fontSize: 30,
        fontWeight: '600',
        marginTop: Layout.spacing * 2,
        marginBottom: Layout.spacing * 2,
        paddingHorizontal: Layout.spacing 
    }
});