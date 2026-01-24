const admin = require('firebase-admin');
const { Expo } = require('expo-server-sdk');

// 1. Налаштування доступу до бази
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const expo = new Expo();

// 2. Головна функція розсилки
const sendBroadcast = async () => {
  console.log("🔄 Читаємо базу даних...");
  
  // Отримуємо всіх користувачів
  const usersSnapshot = await db.collection('users').get();
  
  let pushTokens = [];
  
  usersSnapshot.forEach(doc => {
    const userData = doc.data();
    // Перевіряємо, чи є токен і чи він валідний
    if (userData.pushToken && Expo.isExpoPushToken(userData.pushToken)) {
      pushTokens.push(userData.pushToken);
    }
  });

  console.log(`✅ Знайдено ${pushTokens.length} токенів для відправки.`);

  if (pushTokens.length === 0) return;

  // 3. Формуємо повідомлення
  let messages = [];
  for (let token of pushTokens) {
    messages.push({
        to: token,
        sound: 'default',
        title: 'ClariRate Update 🚀', // Ваш заголовок
        body: 'Ми додали темну тему та виправили баги. Зацініть!', // Ваш текст
        data: { withSome: 'data' },
        badge: 1, 
    });
  }

  // 4. Відправка через Expo (пачками)
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log('📨 Пачка відправлена:', ticketChunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('❌ Помилка відправки:', error);
    }
  }
  
  console.log("🎉 Розсилка завершена!");
};

sendBroadcast();