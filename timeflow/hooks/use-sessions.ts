import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export interface Session {
    id: string;
    startTime: number;
    endTime: number;
    elapsedTime: number;
    rate: string;
    currency: string;
}

export const SESSIONS_STORAGE_KEY = 'timerSessionsTest';

export const useSessions = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadSessions = useCallback(async () => {
        try {
            setIsLoading(true);
            const stored = await AsyncStorage.getItem(SESSIONS_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as Session[];
                
                const sortedSessions = parsed.sort((a, b) => b.startTime - a.startTime);
                setSessions(sortedSessions);
            } else {
                setSessions([]);
            }
        } catch (error) {
            console.error("Failed to load sessions:", error);
            setSessions([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadSessions();
        }, [loadSessions])
    );

    return { sessions, isLoading, loadSessions };
};