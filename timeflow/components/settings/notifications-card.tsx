import { Layout } from "@/constants/layout";
import { useSettings } from "@/hooks/use-settings";
import * as Notifications from 'expo-notifications';
import { Card, Switch, Toast, useThemeColor, useToast } from "heroui-native";
import { useCallback, useEffect, useState } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";

const NotificationsCard = () => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    
    const [isEnabled, setIsEnabled] = useState(true);
    
    const { settings, saveSettings } = useSettings();
    const { toast } = useToast();

    useEffect(() => {
        const checkStatus = async () => {
            const { status } = await Notifications.getPermissionsAsync();
            console.log(settings)
            const settingsEnabled = settings?.notificationsEnabled ?? true;
            setIsEnabled(status === 'granted' && settingsEnabled);
        };
        checkStatus();
    }, [settings]);

    const showToast = useCallback((title: string, message: string) => {
        toast.show({
            component: (props) => (
                <Toast variant="default" placement="top" className="bg-[#0f172aff] border-[#334155] border-1 p-5" {...props}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Toast.Label style={{ fontSize: 22 }}>{title}</Toast.Label>
                            <Toast.Description style={{ fontSize: 16 }}>{message}</Toast.Description>
                        </View>                      
                        <Toast.Close />
                    </View>
                </Toast>
            ),
        });
    }, [toast]);

    const toggleSwitch = async (value: boolean) => {
        if (value) {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status === 'granted') {
                setIsEnabled(true);
                await saveSettings({ ...settings, notificationsEnabled: true });
                showToast("Notifications Enabled", "You will be reminded about long sessions.");
            } else {
                setIsEnabled(false);
                Linking.openSettings();
                showToast("Permission Required", "Please enable notifications in system settings.");
            }
        } else {
            setIsEnabled(false);
            await saveSettings({ ...settings, notificationsEnabled: false });
            await Notifications.cancelAllScheduledNotificationsAsync();
            showToast("Notifications Disabled", "You won't receive timer reminders.");
        }
    };

    return (
        <Card style={[styles.card]}>
            <Card.Header style={[styles.cardHeader]}>
                <Text style={[{ color: foreground }, styles.cardTitle]}>Notifications</Text>
                <Text style={[{ color: muted }, styles.cardDescription]}>
                    Get reminders if your timer runs for too long (e.g. 8+ hours).
                </Text>
            </Card.Header>
            
            <Card.Body style={{ paddingHorizontal: Layout.spacing }}>
                <View style={styles.row}>
                    <View style={{ flex: 2, gap: 4 }}>
                        <Text style={{ fontSize: 20, fontWeight: '600', color: foreground }}>
                            Enable Reminders
                        </Text>
                        <Text style={{ fontSize: 16, color: muted }}>
                            Send a push notification if timer is running &gt; 8h
                        </Text>
                    </View>
                    
                    <Switch isSelected={isEnabled} onSelectedChange={toggleSwitch} />
                </View>

                {/* Тут можна додати ще світчери в майбутньому, наприклад "Weekly Report" */}
            </Card.Body>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginTop: Layout.spacing * 2,
        backgroundColor: '#1C2D23',
        borderRadius: Layout.borderRadius,
        gap: Layout.spacing * 3
    },
    cardHeader: {
        gap: Layout.spacing * 2,
        flexDirection: 'column',
        alignItems: 'center',
        alignContent: 'center'
    },
    cardTitle: {
        fontSize: 28, 
        fontWeight: '700'
    },
    cardDescription: {
        fontSize: 20, 
        fontWeight: '500', 
        textAlign: 'center'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Layout.spacing,
        gap: Layout.spacing * 5
        // borderBottomWidth: 1, // Якщо буде кілька рядків
        // borderBottomColor: 'rgba(255,255,255,0.1)'
    }
});

export default NotificationsCard;