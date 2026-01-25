import { Expo, ExpoPushMessage } from "expo-server-sdk";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";

// Ініціалізація Firebase Admin
admin.initializeApp();

const expo = new Expo();

// Функція-тригер на створення користувача
export const sendWelcomePush = functions.firestore
  .document("users/{userId}")
  .onCreate(async (snapshot, context) => {
    // Отримуємо дані документа
    const userData = snapshot.data();
    
    // Безпечна перевірка на існування даних
    if (!userData) {
      console.log("User data missing");
      return;
    }

    const pushToken = userData.pushToken;

    // 1. Перевірка токена
    if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
      console.log(`⚠️ Token missing or invalid for user ${context.params.userId}`);
      return;
    }

    console.log(`📨 Sending welcome push to: ${pushToken}`);

    // 2. Створення масиву повідомлень (використовуємо тип ExpoPushMessage)
    const messages: ExpoPushMessage[] = [];
    
    messages.push({
      to: pushToken,
      sound: "default",
      title: "Welcome to ClariRate! 🚀",
      body: "We're glad to have you! Try creating your first timer to get started.",
      data: { screen: "Home" },
    });

    // 3. Відправка через Expo (пачками)
    const chunks = expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log("✅ Push sent successfully!", ticketChunk);
      } catch (error) {
        console.error("❌ Error sending push:", error);
      }
    }
});

export const checkInactiveUsers = functions.pubsub
    .schedule("every day 10:00")
    .timeZone("UTC") 
    .onRun(async (context) => {

    const now = new Date();
    // 3 дні тому
    const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));
    
    // Перетворюємо JS Date на Firestore Timestamp для точного порівняння
    const thresholdDate = admin.firestore.Timestamp.fromDate(threeDaysAgo);

    console.log("🔍 Checking for inactive users since (Timestamp):", threeDaysAgo.toISOString());

    // 1. ПОШУК: Шукаємо тих, хто був активний раніше, ніж 3 дні тому
    // 🔥 ВАЖЛИВО: Ми прибрали .toISOString(). Порівнюємо Timestamp з Timestamp.
    const inactiveUsersSnapshot = await admin.firestore()
      .collection("users")
      .where("lastActive", "<", thresholdDate) 
      .get();

    if (inactiveUsersSnapshot.empty) {
      console.log("✅ No inactive users found.");
      return null;
    }

    const messages: ExpoPushMessage[] = [];
    const batch = admin.firestore().batch(); // Для масового оновлення БД
    let batchCount = 0;

    inactiveUsersSnapshot.forEach((doc) => {
      const userData = doc.data();

      // 2. ФІЛЬТР СПАМУ: 
      // Перевіряємо, чи ми вже відправляли нагадування за останні 3 дні.
      // Якщо так — пропускаємо, щоб не набридати щодня.
      if (userData.lastReminderSent) {
         const lastReminder = userData.lastReminderSent.toDate();
         const daysSinceLastReminder = (now.getTime() - lastReminder.getTime()) / (1000 * 3600 * 24);
         
         // Якщо нагадування було менше 3 днів тому — пропускаємо цього юзера
         if (daysSinceLastReminder < 3) return;
      }

      if (userData.pushToken && Expo.isExpoPushToken(userData.pushToken)) {
        messages.push({
          to: userData.pushToken,
          title: "We miss you! 🥺",
          body: "You haven't tracked any time recently. Keep your streak alive!",
          data: { screen: "Timer" },
        });

        // 3. ОНОВЛЕННЯ: Записуємо, що ми відправили нагадування саме зараз
        // Це запобіжить повторній відправці завтра
        const userRef = admin.firestore().collection("users").doc(doc.id);
        batch.update(userRef, { 
            lastReminderSent: admin.firestore.FieldValue.serverTimestamp() 
        });
        batchCount++;
      }
    });

    // 4. ВІДПРАВКА ПУШІВ
    if (messages.length > 0) {
      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
        } catch (e) {
          console.error(e);
        }
      }
      console.log(`📨 Sent reminders to ${messages.length} users.`);
      
      // 5. ЗБЕРЕЖЕННЯ ОНОВЛЕНЬ У БД
      if (batchCount > 0) {
          await batch.commit();
          console.log(`📝 Updated lastReminderSent for ${batchCount} users.`);
      }
    }

    return null;
});