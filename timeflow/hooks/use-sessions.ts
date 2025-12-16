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

export const SESSIONS_STORAGE_KEY = 'timerSessions';

export const useSessions = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadSessions = useCallback(async () => {
        try {
            setIsLoading(true);
            const stored = await AsyncStorage.getItem(SESSIONS_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as Session[];
                
                const sortedSessions = parsed.sort((a, b) => a.startTime - b.startTime);
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

    const addManualSession = useCallback(async (
        startTime: number,
        endTime: number,
        rate: number,
        currency: string
    ) => {
        try {
            const newSession: Session = {
                id: Date.now().toString(),
                startTime,
                endTime,
                elapsedTime: endTime - startTime,
                rate: rate.toString(),
                currency
            };

            const stored = await AsyncStorage.getItem(SESSIONS_STORAGE_KEY);
            let parsedSessions: Session[] = [];

            if (stored) {
                parsedSessions = JSON.parse(stored) as Session[];
            }

            const updatedSessions = [...parsedSessions, newSession];
            await AsyncStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updatedSessions));
            loadSessions();
            return true;
        } catch (error) {
            console.error("Failed to add manual session:", error);
            return false;
        }
    }, [loadSessions]);

    useFocusEffect(
        useCallback(() => {
            loadSessions();
        }, [loadSessions])
    );

    return { sessions, isLoading, loadSessions, addManualSession };
};