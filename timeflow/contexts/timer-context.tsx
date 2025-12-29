import { useClients } from '@/hooks/use-clients';
import { Session, SESSIONS_STORAGE_KEY } from '@/hooks/use-sessions';
import { useSettings } from '@/hooks/use-settings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

// --- Константи ---
const MAX_TIME_MS = 16 * 60 * 60 * 1000; // 16 годин
const START_TIME_KEY = 'timerStartTime';
const ELAPSED_TIME_KEY = 'timerElapsedTime';
const IS_TRACKING_KEY = 'timerIsTracking';
const PAUSE_START_KEY = 'timerPauseStartTime';
const TOTAL_PAUSED_KEY = 'timerTotalPausedDuration';
const CLIENT_ID_KEY = 'timerClientId'; 
const MIN_SAVE_TIME_MS = 1000;

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

interface TimerContextType {
    isTracking: boolean;
    isPaused: boolean;
    elapsedTime: number;
    clientId?: string;
    setClientId: (clientId?: string) => void;
    // 🔥 FIX: startTimer тепер приймає необов'язковий ID клієнта
    startTimer: (clientId?: string) => void;
    stopTimer: (isAutoStop?: boolean) => void;
    pauseTimer: () => void;
    resumeTimer: () => void;
    sessionStoppedByLimit: boolean;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

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
    const { clients } = useClients();

    const [isTracking, setIsTracking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [sessionStoppedByLimit, setSessionStoppedByLimit] = useState(false);
    const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
    const [totalPausedDuration, setTotalPausedDuration] = useState(0);
    const [clientId, _setClientId] = useState<string | undefined>(undefined);

    useEffect(() => {
        const requestPermissions = async () => {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            
            if (finalStatus !== 'granted') {
                console.warn('Notification permissions not granted!');
            }
        };
        
        requestPermissions();
    }, []);

    useEffect(() => {
        if (settings?.notificationsEnabled === false) {
            Notifications.cancelAllScheduledNotificationsAsync();
        }
    }, [settings?.notificationsEnabled]);

    // 1. Асинхронне відновлення стану
    useEffect(() => {
        const loadState = async () => {
            try {
                const storedIsTracking = await AsyncStorage.getItem(IS_TRACKING_KEY);
                const storedStartTime = await AsyncStorage.getItem(START_TIME_KEY);
                const storedElapsedTime = await AsyncStorage.getItem(ELAPSED_TIME_KEY);
                const storedPauseStart = await AsyncStorage.getItem(PAUSE_START_KEY);
                const storedTotalPaused = await AsyncStorage.getItem(TOTAL_PAUSED_KEY);
                // 🔥 FIX: Відновлюємо збереженого клієнта
                const storedClientId = await AsyncStorage.getItem(CLIENT_ID_KEY);

                if (storedClientId) {
                    _setClientId(storedClientId);
                }

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
        // 🔥 FIX: Видаляємо клієнта при ліміті
        await AsyncStorage.multiRemove([IS_TRACKING_KEY, START_TIME_KEY, PAUSE_START_KEY, CLIENT_ID_KEY]);
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

    const setClientId = useCallback((clientId?: string) => {
        _setClientId(clientId);
    }, []);

    const scheduleProgressNotifications = useCallback(async (currentElapsedTimeMs: number) => {
        const shouldNotify = settings?.notificationsEnabled ?? true;
        if (!shouldNotify) return;

        const fourHoursMs = 4 * 60 * 60 * 1000;
        const eightHoursMs = 8 * 60 * 60 * 1000;

        if (currentElapsedTimeMs < fourHoursMs) {
            const secondsRemaining = (fourHoursMs - currentElapsedTimeMs) / 1000;
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'The timer is still running ⏱️',
                    body: '4 hours have already passed. Don\'t forget to stop the timer if you\'ve finished.',
                    sound: 'default'
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: secondsRemaining, 
                    repeats: false,
                },
            });
        }

        if (currentElapsedTimeMs < eightHoursMs) {
            const secondsRemaining = (eightHoursMs - currentElapsedTimeMs) / 1000;
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'The timer is still running ⏱️',
                    body: '8 hours have already passed. Don\'t forget to stop the timer if you\'ve finished.',
                    sound: 'default'
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: secondsRemaining,
                    repeats: false,
                },
            });
        }
    }, [settings]);

    // 🔥 FIX: Оновлений startTimer приймає аргумент
    const startTimer = useCallback(async (selectedClientId?: string) => {
        const now = Date.now();
        setStartTime(now);
        setIsTracking(true);
        setIsPaused(false);
        setSessionStoppedByLimit(false);
        setElapsedTime(0);
        setTotalPausedDuration(0);
        setPauseStartTime(null);
        
        // Логіка збереження ID клієнта
        if (selectedClientId) {
            _setClientId(selectedClientId);
            await AsyncStorage.setItem(CLIENT_ID_KEY, selectedClientId);
        } else {
            _setClientId(undefined);
            await AsyncStorage.removeItem(CLIENT_ID_KEY);
        }
        
        await AsyncStorage.multiSet([
            [START_TIME_KEY, String(now)],
            [IS_TRACKING_KEY, 'true']
        ]);
        await AsyncStorage.multiRemove([ELAPSED_TIME_KEY, PAUSE_START_KEY, TOTAL_PAUSED_KEY]);

        await scheduleProgressNotifications(0);
    }, [scheduleProgressNotifications]);

    const pauseTimer = useCallback(async () => {
        if (isTracking && !isPaused) {
            const now = Date.now();
            setIsPaused(true);
            setIsTracking(false);
            setPauseStartTime(now);
            await AsyncStorage.setItem(IS_TRACKING_KEY, 'false');
            await AsyncStorage.setItem(PAUSE_START_KEY, String(now));

            await Notifications.cancelAllScheduledNotificationsAsync();

            const shouldNotify = settings?.notificationsEnabled ?? true;
            if (shouldNotify) {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: 'Don\'t lose your hours! 💸',
                        body: 'You have an unsaved session on pause. Save it now to keep your history accurate.',
                        sound: 'default'
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                        seconds: 1 * 60 * 60,
                        repeats: false,
                    },
                });
            }
        }
    }, [isTracking, isPaused, settings]);

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

            await Notifications.cancelAllScheduledNotificationsAsync();
            await scheduleProgressNotifications(elapsedTime);
        }
    }, [isPaused, pauseStartTime, totalPausedDuration, elapsedTime, scheduleProgressNotifications]);

    const stopTimer = useCallback(async (isAutoStop = false) => {
        let finalElapsedTime = 0;
        const now = Date.now();

        if (startTime) {
            if (isPaused && pauseStartTime) {
                finalElapsedTime = pauseStartTime - startTime - totalPausedDuration;
            } else {
                finalElapsedTime = now - startTime - totalPausedDuration;
            }
        } else {
            finalElapsedTime = elapsedTime;
        }

        if (finalElapsedTime < 0) finalElapsedTime = 0;

        setIsTracking(false);
        setIsPaused(false);

        let rate: string | undefined;
        if (clientId) {
            const selectedClient = clients.find(cl => cl.id === clientId);
            rate = selectedClient?.defaultRate;
        } else {
            rate = settings?.rate;
        }
        
        if (startTime && finalElapsedTime >= MIN_SAVE_TIME_MS && rate && settings?.currency) {
            const endTime = Date.now();
            const newSession: Session = {
                id: Date.now().toString(),
                startTime: startTime,
                endTime: endTime,
                elapsedTime: finalElapsedTime, 
                rate,
                currency: settings.currency,
                clientId: clientId || undefined,
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
            console.log("Session not saved: Too short or missing settings.");
            console.log("startTime: ", startTime, "finalElapsedTime >= MIN_SAVE_TIME_MS: ", finalElapsedTime >= MIN_SAVE_TIME_MS,
                "rate: ", rate, "settings?.currency: ", settings?.currency
            )
        }

        await AsyncStorage.multiRemove([
            IS_TRACKING_KEY, 
            START_TIME_KEY, 
            PAUSE_START_KEY, 
            TOTAL_PAUSED_KEY,
            CLIENT_ID_KEY // 🔥 FIX: Очищаємо клієнта
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
        _setClientId(undefined); // Скидаємо стейт
        
        await Notifications.cancelAllScheduledNotificationsAsync();
    }, [elapsedTime, settings, startTime, isPaused, pauseStartTime, totalPausedDuration, clientId]);
    
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
                setClientId,
                sessionStoppedByLimit,
                clientId,
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

