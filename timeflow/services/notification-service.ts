import { db } from '@/configs/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Platform } from 'react-native';

class NotificationService {
    constructor() {
        this.configure();
    }

    private configure() {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });
    }

    async requestPermissions(): Promise<boolean> {
        if (!Device.isDevice) {
            console.log('Must use physical device for Push Notifications');
            return false;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.warn('Notification permissions not granted!');
            return false;
        }

        return true;
    }

    async getPushToken(): Promise<string | null> {
        const hasPermission = await this.requestPermissions();
        if (!hasPermission) return null;

        try {
            const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
            const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
            return tokenData.data;
        } catch (error) {
            console.error("Error fetching push token:", error);
            return null;
        }
    }

    async scheduleTimerProgress(currentElapsedTimeMs: number) {
        // Очищаємо старі, щоб не дублювати
        await this.cancelAll();

        const fourHoursMs = 4 * 60 * 60 * 1000;
        const eightHoursMs = 8 * 60 * 60 * 1000;

        // Нагадування через 4 години
        if (currentElapsedTimeMs < fourHoursMs) {
            const secondsRemaining = (fourHoursMs - currentElapsedTimeMs) / 1000;
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'The timer is still running ⏱️',
                    body: "4 hours have already passed. Don't forget to stop the timer if you've finished.",
                    sound: 'default'
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: secondsRemaining > 0 ? secondsRemaining : 1, 
                    repeats: false,
                },
            });
        }

        // Нагадування через 8 годин
        if (currentElapsedTimeMs < eightHoursMs) {
            const secondsRemaining = (eightHoursMs - currentElapsedTimeMs) / 1000;
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'The timer is still running ⏱️',
                    body: "8 hours have already passed. Don't forget to stop the timer if you've finished.",
                    sound: 'default'
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: secondsRemaining > 0 ? secondsRemaining : 1,
                    repeats: false,
                },
            });
        }
    }

    async schedulePauseReminder() {
        await this.cancelAll(); // Прибираємо нагадування про прогрес, бо ми на паузі

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Don't lose your hours! 💸",
                body: 'You have an unsaved session on pause. Save it now to keep your history accurate.',
                sound: 'default'
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 60 * 60, // 1 година
                repeats: false,
            },
        });
    }

    async registerForPushNotifications() {
        const hasPermission = await this.requestPermissions();
        if (!hasPermission) return null;

        try {
            const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
            const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
            const token = tokenData.data;
            
            // Зберігаємо в базу
            await this.saveTokenToFirebase(token);

            return token;
        } catch (error) {
            console.error("Error fetching push token:", error);
            return null;
        }
    }

    private async saveTokenToFirebase(token: string) {
        try {
            let userId = await AsyncStorage.getItem('user_id');
            if (!userId) {
                userId = Math.random().toString(36).substring(7);
                await AsyncStorage.setItem('user_id', userId);
            }

            // Запис в Firestore
            const userRef = doc(db, "users", userId);
            await setDoc(userRef, {
                pushToken: token,
                lastActive: serverTimestamp(),
                platform: Platform.OS,
                updatedAt: serverTimestamp(),
                device: Device.modelName || 'unknown'
            }, { merge: true });

            console.log("✅ Token saved to Firestore:", userId);
        } catch (error) {
            console.error("❌ Error saving to Firebase:", error);
        }
    }

    async updateLastActive() {
        try {
            const userId = await AsyncStorage.getItem('user_id');
            // Якщо ID ще немає (юзер тільки зайшов перший раз), нічого не робимо,
            // бо токен ще не зареєстрований
            if (!userId) return; 

            const userRef = doc(db, "users", userId);

            // Використовуємо setDoc з merge: true. 
            // Це безпечно: якщо документ є - оновить поле, якщо немає - створить (хоча він мав би бути).
            await setDoc(userRef, {
                lastActive: serverTimestamp(),
                // Можна додати метадані, щоб знати, з якої платформи останній раз заходили
                // platform: Platform.OS 
            }, { merge: true });

            console.log("⏱️ lastActive updated inside Firebase");
        } catch (error) {
            // Не блокуємо роботу додатку через помилку статистики
            console.error("Failed to update lastActive:", error);
        }
    }

    async cancelAll() {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }
}

export const notificationService = new NotificationService();
