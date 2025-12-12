import { Session, SESSIONS_STORAGE_KEY } from '@/hooks/use-sessions';
import { useSettings } from '@/hooks/use-settings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

// --- Константи ---
const MAX_TIME_MS = 16 * 60 * 60 * 1000; // 16 годин
const START_TIME_KEY = 'timerStartTime';
const ELAPSED_TIME_KEY = 'timerElapsedTime';
const IS_TRACKING_KEY = 'timerIsTracking';
const PAUSE_START_KEY = 'timerPauseStartTime';
const TOTAL_PAUSED_KEY = 'timerTotalPausedDuration';

// Мінімальний час для збереження сесії (в мілісекундах)
// 1000 = 1 секунда. Якщо хочете зберігати ВСЕ, поставте 0.
const MIN_SAVE_TIME_MS = 1000; 

interface TimerContextType {
    isTracking: boolean;
    isPaused: boolean;
    elapsedTime: number;
    startTimer: () => void;
    stopTimer: () => void;
    pauseTimer: () => void;
    resumeTimer: () => void;
    sessionStoppedByLimit: boolean;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

// --- Допоміжні функції ---
const formatTime = (ms: number): { hours: string; minutes: string; seconds: string } => {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = (totalMinutes % 60).toString().padStart(2, '0');
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours.toString().padStart(2, '0');
    return { hours, minutes, seconds };
};

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { settings } = useSettings();
    const [isTracking, setIsTracking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [sessionStoppedByLimit, setSessionStoppedByLimit] = useState(false);
    const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
    const [totalPausedDuration, setTotalPausedDuration] = useState(0);

    // 1. Асинхронне відновлення стану
    useEffect(() => {
        const loadState = async () => {
            try {
                const storedIsTracking = await AsyncStorage.getItem(IS_TRACKING_KEY);
                const storedStartTime = await AsyncStorage.getItem(START_TIME_KEY);
                const storedElapsedTime = await AsyncStorage.getItem(ELAPSED_TIME_KEY);

                const storedPauseStart = await AsyncStorage.getItem(PAUSE_START_KEY);
                const storedTotalPaused = await AsyncStorage.getItem(TOTAL_PAUSED_KEY);

                const savedTotalPaused = storedTotalPaused ? parseInt(storedTotalPaused, 10) : 0;
                setTotalPausedDuration(savedTotalPaused);

                if (storedStartTime) {
                    const startTs = parseInt(storedStartTime, 10);
                    setStartTime(startTs);

                    if (storedPauseStart) {
                        const pauseTs = parseInt(storedPauseStart, 10);
                        setPauseStartTime(pauseTs);
                        setIsPaused(true);
                        setIsTracking(false);
                        const timeBeforePause = pauseTs - startTs - savedTotalPaused;
                        setElapsedTime(timeBeforePause);
                    } 
                    else if (storedIsTracking === 'true') {
                        const now = Date.now();
                        const restoredTime = now - startTs - savedTotalPaused;
                        if (restoredTime >= MAX_TIME_MS) {
                            handleLimitReached();
                        } else {
                            setElapsedTime(restoredTime);
                            setIsTracking(true);
                            setIsPaused(false);
                        }
                    }
                } else if (storedElapsedTime) {
                    setElapsedTime(parseInt(storedElapsedTime, 10));
                }
            } catch (error) {
                console.error("Failed to load timer state:", error);
            }
        };
        loadState();
    }, []);

    const handleLimitReached = async () => {
        setIsTracking(false);
        setIsPaused(false);
        setElapsedTime(MAX_TIME_MS);
        setSessionStoppedByLimit(true);
        await AsyncStorage.multiRemove([IS_TRACKING_KEY, START_TIME_KEY, PAUSE_START_KEY]);
        await AsyncStorage.setItem(ELAPSED_TIME_KEY, String(MAX_TIME_MS));
    };

    // 2. Інтервал таймера
    useEffect(() => {
        if (!isTracking || isPaused || !startTime) {
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            const newElapsedTime = now - startTime - totalPausedDuration;

            if (newElapsedTime >= MAX_TIME_MS) {
                handleLimitReached();
                clearInterval(interval);
                return;
            }

            setElapsedTime(newElapsedTime);
        }, 1000);

        return () => clearInterval(interval);
    }, [isTracking, isPaused, startTime, totalPausedDuration]);

    // 3. AppState (Фон)
    useEffect(() => {
        const handleAppStateChange = async (nextAppState: string) => {
            if (AppState.currentState.match(/inactive|background/) && nextAppState === 'active') {
                if (isTracking && !isPaused && startTime) {
                    const now = Date.now();
                    const timeSinceStart = now - startTime - totalPausedDuration;
                    if (timeSinceStart >= MAX_TIME_MS) {
                        handleLimitReached();
                    } else {
                        setElapsedTime(timeSinceStart);
                    }
                }
            }
        };
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [isTracking, isPaused, startTime, totalPausedDuration]);

    // 4. Дії

    const startTimer = useCallback(async () => {
        const now = Date.now();
        setStartTime(now);
        setIsTracking(true);
        setIsPaused(false);
        setSessionStoppedByLimit(false);
        setElapsedTime(0);
        setTotalPausedDuration(0);
        setPauseStartTime(null);
        
        await AsyncStorage.multiSet([
            [START_TIME_KEY, String(now)],
            [IS_TRACKING_KEY, 'true']
        ]);
        await AsyncStorage.multiRemove([ELAPSED_TIME_KEY, PAUSE_START_KEY, TOTAL_PAUSED_KEY]);
    }, []);

    const pauseTimer = useCallback(async () => {
        if (isTracking && !isPaused) {
            const now = Date.now();
            setIsPaused(true);
            setIsTracking(false);
            setPauseStartTime(now);
            await AsyncStorage.setItem(IS_TRACKING_KEY, 'false');
            await AsyncStorage.setItem(PAUSE_START_KEY, String(now));
        }
    }, [isTracking, isPaused]);

    const resumeTimer = useCallback(async () => {
        if (isPaused && pauseStartTime) {
            const now = Date.now();
            const thisPauseDuration = now - pauseStartTime;
            const newTotalPaused = totalPausedDuration + thisPauseDuration;
            
            setTotalPausedDuration(newTotalPaused);
            setIsPaused(false);
            setPauseStartTime(null);
            setIsTracking(true);
            
            await AsyncStorage.setItem(IS_TRACKING_KEY, 'true');
            await AsyncStorage.setItem(TOTAL_PAUSED_KEY, String(newTotalPaused));
            await AsyncStorage.removeItem(PAUSE_START_KEY);
        }
    }, [isPaused, pauseStartTime, totalPausedDuration]);

    // 🔥 ВИПРАВЛЕНА ЛОГІКА STOP 🔥
    const stopTimer = useCallback(async (isAutoStop = false) => {
        // 1. Розраховуємо фінальний час ПРЯМО ЗАРАЗ, а не беремо зі стану elapsedTime
        let finalElapsedTime = 0;
        const now = Date.now();

        if (startTime) {
            if (isPaused && pauseStartTime) {
                // Якщо зупинили, поки стояли на паузі:
                // Час = (Момент паузи - Старт) - (Попередні паузи)
                finalElapsedTime = pauseStartTime - startTime - totalPausedDuration;
            } else {
                // Якщо зупинили під час роботи:
                // Час = (Зараз - Старт) - (Попередні паузи)
                finalElapsedTime = now - startTime - totalPausedDuration;
            }
        } else {
            finalElapsedTime = elapsedTime; // Fallback
        }

        // Захист від від'ємних значень
        if (finalElapsedTime < 0) finalElapsedTime = 0;

        setIsTracking(false);
        setIsPaused(false);
        
        // 2. Перевірка на збереження (використовуємо finalElapsedTime)
        // MIN_SAVE_TIME_MS = 1000 (1 секунда).
        if (startTime && finalElapsedTime >= MIN_SAVE_TIME_MS && settings?.rate && settings?.currency) {
            const endTime = Date.now();
            const newSession: Session = {
                id: Date.now().toString(),
                startTime: startTime,
                endTime: endTime,
                elapsedTime: finalElapsedTime, 
                rate: settings.rate,
                currency: settings.currency,
            };

            try {
                const storedSessions = await AsyncStorage.getItem(SESSIONS_STORAGE_KEY);
                let sessions: Session[] = storedSessions ? JSON.parse(storedSessions) : [];
                sessions.unshift(newSession);
                await AsyncStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
                console.log(`Session saved: ${formatTime(finalElapsedTime).seconds}s`);
            } catch (error) {
                console.error("Failed to save session:", error);
            }
        } else {
            console.log("Session not saved: Too short or missing settings.", { 
                finalElapsedTime, 
                minTime: MIN_SAVE_TIME_MS,
                hasRate: !!settings?.rate 
            });
        }

        // Очищення
        await AsyncStorage.multiRemove([
            IS_TRACKING_KEY, 
            START_TIME_KEY, 
            PAUSE_START_KEY, 
            TOTAL_PAUSED_KEY
        ]);
        
        if (!isAutoStop) {
            await AsyncStorage.removeItem(ELAPSED_TIME_KEY);
            setElapsedTime(0);
            setSessionStoppedByLimit(false);
        } else {
            await AsyncStorage.setItem(ELAPSED_TIME_KEY, String(MAX_TIME_MS));
        }
        
        setStartTime(null);
        setPauseStartTime(null);
        setTotalPausedDuration(0);

    }, [elapsedTime, settings, startTime, isPaused, pauseStartTime, totalPausedDuration]);
    
    const timeDisplay = useMemo(() => formatTime(elapsedTime), [elapsedTime]);

    return (
        <TimerContext.Provider 
            value={{ 
                isTracking, 
                isPaused,
                elapsedTime, 
                startTimer, 
                stopTimer, 
                pauseTimer,
                resumeTimer,
                sessionStoppedByLimit,
                ...timeDisplay,
            } as TimerContextType & { hours: string; minutes: string; seconds: string }}
        >
            {children}
        </TimerContext.Provider>
    );
};

export const useTimer = () => {
    const context = useContext(TimerContext);
    if (context === undefined) {
        throw new Error('useTimer must be used within a TimerProvider');
    }
    return context as TimerContextType & { hours: string; minutes: string; seconds: string };
};

export { formatTime };

