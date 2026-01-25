import { getAnalytics, isSupported } from "firebase/analytics";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Ваші ключі з консолі Firebase (Web)
const firebaseConfig = {
    apiKey: "AIzaSyCErll2bnCeIlkoxWYb5k1XeXV8GgctPAk",
    authDomain: "clari-rate.firebaseapp.com",
    projectId: "clari-rate",
    storageBucket: "clari-rate.firebasestorage.app",
    messagingSenderId: "122163582147",
    appId: "1:122163582147:web:5ab33b58d9021881777e76",
    measurementId: "G-LEKRB552LD"
};

// Перевірка, щоб не ініціалізувати двічі
let app: any;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

// Ініціалізація сервісів
const db = getFirestore(app);

// Аналітика може не працювати в Expo Go без додаткових налаштувань,
// тому ініціалізуємо її обережно
let analytics;
isSupported().then((supported) => {
    if (supported) {
        analytics = getAnalytics(app);
    }
});

export { analytics, app, db };

