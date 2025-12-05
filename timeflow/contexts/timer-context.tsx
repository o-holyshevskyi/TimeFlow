import { Session, SESSIONS_STORAGE_KEY } from '@/hooks/use-sessions';
import { useSettings } from '@/hooks/use-settings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

// --- Константи ---
const MAX_TIME_MS = 16 * 60 * 60 * 1000; // 16 годин у мілісекундах
const START_TIME_KEY = 'timerStartTime';
const ELAPSED_TIME_KEY = 'timerElapsedTime';
const IS_TRACKING_KEY = 'timerIsTracking';

interface TimerContextType {
    isTracking: boolean;
    elapsedTime: number; // Час у мілісекундах
    startTimer: () => void;
    stopTimer: () => void;
    sessionStoppedByLimit: boolean;
}

// --- Початкові значення ---
const TimerContext = createContext<TimerContextType | undefined>(undefined);

// --- Допоміжні функції ---
const formatTime = (ms: number): { hours: string; minutes: string; seconds: string } => {
    const totalSeconds = Math.floor(ms / 1000);
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = (totalMinutes % 60).toString().padStart(2, '0');
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours.toString().padStart(2, '0');
    return { hours, minutes, seconds };
};

// --- Провайдер Таймера ---
export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { settings } = useSettings();
    const [isTracking, setIsTracking] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [sessionStoppedByLimit, setSessionStoppedByLimit] = useState(false);

    // 1. Асинхронне відновлення стану при запуску (запобігання втраті даних)
    useEffect(() => {
        const loadState = async () => {
            try {
                const storedIsTracking = await AsyncStorage.getItem(IS_TRACKING_KEY);
                const storedStartTime = await AsyncStorage.getItem(START_TIME_KEY);
                const storedElapsedTime = await AsyncStorage.getItem(ELAPSED_TIME_KEY);

                if (storedIsTracking === 'true' && storedStartTime) {
                    const startTs = parseInt(storedStartTime, 10);
                    const now = Date.now();
                    const restoredTime = now - startTs;

                    // Перевірка ліміту при відновленні
                    if (restoredTime >= MAX_TIME_MS) {
                        setElapsedTime(MAX_TIME_MS);
                        setSessionStoppedByLimit(true);
                        await AsyncStorage.removeItem(IS_TRACKING_KEY);
                        await AsyncStorage.removeItem(START_TIME_KEY);
                    } else {
                        setStartTime(startTs);
                        setElapsedTime(restoredTime);
                        setIsTracking(true);
                    }
                } else if (storedElapsedTime) {
                    // Якщо таймер не відстежується, але час збережено (остання сесія)
                    setElapsedTime(parseInt(storedElapsedTime, 10));
                }
            } catch (error) {
                console.error("Failed to load timer state:", error);
            }
        };
        loadState();
    }, []);

    // 2. Реалізація Таймера та Обробка Ліміту
    useEffect(() => {
        if (!isTracking) {
            return;
        }

        const interval = setInterval(() => {
            if (startTime) {
                const newElapsedTime = Date.now() - startTime;
                
                // 🛑 16-ГОДИННИЙ ЛІМІТ ЗУПИНКИ
                if (newElapsedTime >= MAX_TIME_MS) {
                    setIsTracking(false);
                    setElapsedTime(MAX_TIME_MS);
                    setSessionStoppedByLimit(true);
                    clearInterval(interval);
                    AsyncStorage.removeItem(IS_TRACKING_KEY);
                    AsyncStorage.removeItem(START_TIME_KEY);
                    AsyncStorage.setItem(ELAPSED_TIME_KEY, String(MAX_TIME_MS));
                    return;
                }

                setElapsedTime(newElapsedTime);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isTracking, startTime]);

    // 3. Обробка Фонового Режиму (для Android/iOS)
    useEffect(() => {
        const handleAppStateChange = async (nextAppState: string) => {
            if (isTracking && AppState.currentState.match(/inactive|background/) && nextAppState === 'active') {
                // Відновлення таймера після повернення з фону
                const storedStartTime = await AsyncStorage.getItem(START_TIME_KEY);
                if (storedStartTime) {
                    const startTs = parseInt(storedStartTime, 10);
                    const now = Date.now();
                    const timeSinceStart = now - startTs;

                    if (timeSinceStart >= MAX_TIME_MS) {
                        stopTimer(true); // Зупинити, якщо ліміт перевищено у фоні
                        setElapsedTime(MAX_TIME_MS);
                        setSessionStoppedByLimit(true);
                    } else {
                        setElapsedTime(timeSinceStart);
                    }
                }
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        // 🛑 FIX: Додаємо stopTimer до масиву залежностей.
        return () => subscription.remove();
    }, [isTracking, startTime]);


    // 4. Функції Start/Stop
    const startTimer = useCallback(async () => {
        const now = Date.now();
        setStartTime(now);
        setIsTracking(true);
        setSessionStoppedByLimit(false);
        
        await AsyncStorage.setItem(START_TIME_KEY, String(now));
        await AsyncStorage.setItem(IS_TRACKING_KEY, 'true');
        // При старті ми також скидаємо старий збережений час
        await AsyncStorage.removeItem(ELAPSED_TIME_KEY);
    }, []);

    const stopTimer = useCallback(async (isAutoStop = false) => {
        setIsTracking(false);
        
        if (startTime && elapsedTime > 1000 && settings?.rate && settings?.currency) {
            const endTime = Date.now();
            const newSession: Session = {
                id: Date.now().toString(),
                startTime: startTime,
                endTime: endTime,
                elapsedTime: elapsedTime,
                rate: settings.rate,
                currency: settings.currency,
            };

            try {
                const storedSessions = await AsyncStorage.getItem(SESSIONS_STORAGE_KEY);
                let sessions: Session[] = storedSessions ? JSON.parse(storedSessions) : [];

                sessions.unshift(newSession);

                await AsyncStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
                console.log(`Session successfully saved: ${formatTime(elapsedTime).hours}:${formatTime(elapsedTime).minutes}:${formatTime(elapsedTime).seconds}`);
            } catch (error) {
                console.error("Failed to save session to history:", error);
            }
        } else {
            console.log("Session stopped but not saved (too short or missing rate settings).");
        }
        
        await AsyncStorage.removeItem(IS_TRACKING_KEY);
        await AsyncStorage.removeItem(START_TIME_KEY);
        
        if (!isAutoStop) {
            await AsyncStorage.removeItem(ELAPSED_TIME_KEY); // Видаляємо, щоб на старті бачити 00:00:00
            setElapsedTime(0);
            setSessionStoppedByLimit(false);
        } else {
            await AsyncStorage.setItem(ELAPSED_TIME_KEY, String(MAX_TIME_MS)); 
        }

    }, [elapsedTime, settings, startTime]); // Removed [elapsedTime]
    
    // Експорт форматованого часу для Timer.tsx
    const timeDisplay = useMemo(() => formatTime(elapsedTime), [elapsedTime]);

    return (
        <TimerContext.Provider 
            value={{ 
                isTracking, 
                elapsedTime, 
                startTimer, 
                stopTimer, 
                sessionStoppedByLimit,
                ...timeDisplay,
            } as TimerContextType & { hours: string; minutes: string; seconds: string }}
        >
            {children}
        </TimerContext.Provider>
    );
};

// Хук для використання контексту
export const useTimer = () => {
    const context = useContext(TimerContext);
    if (context === undefined) {
        throw new Error('useTimer must be used within a TimerProvider');
    }
    return context as TimerContextType & { hours: string; minutes: string; seconds: string };
};

// Експортуємо formatTime для використання в інших компонентах (як EarnedAmount)
export { formatTime };

