import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Updates from 'expo-updates';
import { useState } from "react";
import { Alert } from "react-native";
import { CLIENTS_STORAGE_KEY } from "./use-clients";
import { SESSIONS_STORAGE_KEY } from "./use-sessions";
import { SETTINGS_STORAGE_KEY } from "./use-settings";

export const useDataBackup = () => {
    const [isLoading, setIsLoading] = useState(false);

    const createBackup = async () => {
        try {
            setIsLoading(true);

            const sessions = await AsyncStorage.getItem(SESSIONS_STORAGE_KEY);
            const clients = await AsyncStorage.getItem(CLIENTS_STORAGE_KEY);
            const settings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);

            const backupData = {
                metadata: {
                    appName: "ClariRate",
                    version: "1.0",
                    date: new Date().toISOString(),
                },
                data: {
                    sessions: sessions ? JSON.parse(sessions) : [],
                    clients: clients ? JSON.parse(clients) : [],
                    settings: settings ? JSON.parse(settings) : {},
                }
            }

            const fileName = `ClariRate_Backup_${new Date().toISOString().split('T')[0]}.json`;
            const fileUri = FileSystem.documentDirectory + fileName;

            await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData, null, 2));

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    UTI: 'public.json', // Для iOS, щоб він розумів тип файлу
                    mimeType: 'application/json',
                    dialogTitle: 'Save your Backup',
                });
            } else {
                Alert.alert('Error', 'Sharing is not available on this device');
            }
        } catch (error) {
            console.error('Backup failed:', error);
            Alert.alert('Error', 'Failed to create backup');
        } finally {
            setIsLoading(false);
        }
    }

    const restoreBackup = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const fileUri = result.assets[0].uri;

            Alert.alert(
                'Restore Data?',
                'This will OVERWRITE all your current data (sessions, clients, settings). This action cannot be undone.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Restore & Restart',
                        style: 'destructive',
                        onPress: async () => await processRestore(fileUri),
                    },
                ]
            );

        } catch (error) {
            console.error('Pick failed:', error);
            Alert.alert('Error', 'Failed to pick file');
        }
    };

    const processRestore = async (fileUri: string) => {
        try {
            setIsLoading(true);
            
            const content = await FileSystem.readAsStringAsync(fileUri);
            const backup = JSON.parse(content);

            if (!backup.data || !backup.metadata || backup.metadata.appName !== 'ClariRate') {
                throw new Error('Invalid backup file format');
            }

            await AsyncStorage.multiSet([
                [SESSIONS_STORAGE_KEY, JSON.stringify(backup.data.sessions)],
                [CLIENTS_STORAGE_KEY, JSON.stringify(backup.data.clients)],
                [SETTINGS_STORAGE_KEY, JSON.stringify(backup.data.settings)],
            ]);

            Alert.alert('Success', 'Data restored successfully. The app will now reload.', [
                { text: 'OK', onPress: () => Updates.reloadAsync() }
            ]);

        } catch (error) {
            console.error('Restore failed:', error);
            Alert.alert('Error', 'Failed to restore data. The file might be corrupted.');
        } finally {
            setIsLoading(false);
        }
    };

    return { isLoading, createBackup, restoreBackup };
}