import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export interface Client {
    id: string;
    name: string;
    color?: string;
    defaultRate?: string;
    isDefault?: boolean;
}

export const CLIENTS_STORAGE_KEY = 'clients';

export const useClients = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadClients = useCallback(async () => {
        try {
            const stored = await AsyncStorage.getItem(CLIENTS_STORAGE_KEY);
            if (stored) {
                setClients(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load clients', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveClient = useCallback(async (client: Client) => {
        try {
            setIsLoading(true);

            setClients(prev => {
                // Створюємо копію масиву, щоб не мутувати стан напряму
                let newClients = [...prev];

                // 1. ЛОГІКА EKSKLUZYВНОСТІ (Тільки один Default)
                if (client.isDefault) {
                    // Якщо ми зберігаємо цього клієнта як дефолтного,
                    // то проходимось по всіх існуючих і вимикаємо isDefault
                    newClients = newClients.map(c => ({
                        ...c,
                        isDefault: false
                    }));
                }

                // 2. ДОДАВАННЯ АБО РЕДАГУВАННЯ
                const existingIndex = newClients.findIndex(c => c.id === client.id);

                if (existingIndex !== -1) {
                    // Якщо клієнт існує - оновлюємо його
                    newClients[existingIndex] = client;
                } else {
                    // Якщо новий - додаємо в кінець
                    newClients.push(client);
                }
                
                // 3. ЗБЕРЕЖЕННЯ
                AsyncStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(newClients));
                return newClients;
            });

            // Цей виклик може бути зайвим, якщо ви використовуєте useFocusEffect, 
            // але для надійності можна залишити або прибрати.
            loadClients(); 

            return true;
        } catch (error) {
            console.error("Failed to add client:", error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [loadClients]);

    const deleteClient = useCallback(async (id: string) => {
        setClients(prev => {
            const newClients = prev.filter(c => c.id !== id);
            AsyncStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(newClients));
            return newClients;
        });
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadClients();
        }, [loadClients])
    );

    return { clients, isLoading, saveClient, deleteClient };
}