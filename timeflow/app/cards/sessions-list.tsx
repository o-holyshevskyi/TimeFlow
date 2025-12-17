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
import { useEffect, useMemo, useRef } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const groupSessionsByDate = (sessions: Session[]) => {
    const sortedSessions = [...sessions].sort((a, b) => b.startTime - a.startTime);

    const dateFormatter = new Intl.DateTimeFormat('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
    });

    const today = new Date().toDateString();

    return sortedSessions.reduce((acc, session) => {
        const sessionDate = new Date(session.startTime);
        const dateKey = sessionDate.toDateString();
        
        let group = acc.find(g => g.date === dateKey);
        
        if (!group) {
            let displayDate = dateFormatter.format(sessionDate);
            if (dateKey === today) {
                const parts = displayDate.split(' ');
                if (parts.length >= 3) {
                    displayDate = `Today, ${parts[1]} ${parts[2]}`;
                } else {
                    displayDate = "Today";
                }
            }
            
            group = {
                date: dateKey,
                displayDate,
                data: [],
            };
            acc.push(group); 
        }

        group.data.push(session);
        return acc;
    }, [] as { date: string; displayDate: string; data: Session[] }[]);
};

export default function SessionsList() {
    const { sessions, isLoading, deleteSession } = useSessions();
    const { isPro, isChecking } = useUserStatus();
    const { push } = useRouter();
    
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');

    const visibleSessions = useMemo(() => {
        const sorted = [...sessions].sort((a, b) => b.startTime - a.startTime);
        return isPro ? sorted : sorted.slice(0, 5);
    }, [sessions, isPro]);

    const groupedSessions = useMemo(() => groupSessionsByDate(visibleSessions), [visibleSessions]);

    let globalSessionIndexRef = useRef(-1);

    useEffect(() => {
        globalSessionIndexRef.current = -1;
    }, [visibleSessions]);

    const handleAddSession = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
        push('/modals/new-session');
    }

    const renderGroup = ({ item }: { item: { date: string; displayDate: string; data: Session[] } }) => (
        <View key={item.date} style={styles.groupContainer}>
            <Text style={[styles.date, { color: foreground }]}>
                {item.displayDate}
            </Text>
            {item.data.map((session) => {
                globalSessionIndexRef.current++;
                const isFifthSession = !isPro && globalSessionIndexRef.current === 4;
                
                return <SessionCard 
                    key={session.id} 
                    item={session} 
                    foreground={foreground} 
                    muted={muted}
                    isFading={isFifthSession}
                    deleteSession={deleteSession} 
                />
            })}
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Spinner size="lg" color={foreground} />
            </SafeAreaView>
        );
    }

    if (groupedSessions.length === 0) {
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

    return <SafeAreaView style={[styles.container]}>
        <SessionHeader />
        <FlatList
            data={groupedSessions}
            keyExtractor={item => item.date}
            renderItem={renderGroup}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
            ListFooterComponent={!isChecking && !isPro ? <PremiumCard /> : <View style={{ height: 50 }} />}
        />
        <AddManualSession handleAddSession={handleAddSession} />
    </SafeAreaView>
}

const AddManualSession = ({ handleAddSession }: { handleAddSession: () => void }) => <View
    style={{ 
        position: 'absolute',
        bottom: 0,
        right: 0,
        margin: Layout.spacing * 5,
    }}
>
    <Button isIconOnly variant="primary" size="lg" onPress={handleAddSession}>
        <Icon name="add-outline" color="black" />
    </Button>
</View>

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        paddingHorizontal: Layout.spacing * 3
    },
    scrollContainer: {
        paddingVertical: Layout.spacing * 2,
        paddingBottom: Layout.spacing * 10
    },
    groupContainer: {
        marginBottom: Layout.spacing * 4,
    },
    date: {
        fontSize: 30,
        fontWeight: '600',
        marginBottom: Layout.spacing * 2,
        paddingHorizontal: Layout.spacing 
    }
});