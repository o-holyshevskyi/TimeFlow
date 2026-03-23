import { Layout } from "@/constants/layout";
import { useSettings } from "@/hooks/use-settings";
import * as Notifications from 'expo-notifications';
import { Switch, Toast, useThemeColor, useToast } from "heroui-native";
import { useCallback, useEffect, useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { AppText } from "../ui/app-text";
import { Icon } from "../ui/icon";

const NotificationsCard = () => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const accent = useThemeColor('accent');
    const surface = useThemeColor('surface');
    const background = useThemeColor('background');

    const [isEnabled, setIsEnabled] = useState(true);
    const { settings, saveSettings } = useSettings();
    const { toast } = useToast();

    useEffect(() => {
        const checkStatus = async () => {
            const { status } = await Notifications.getPermissionsAsync();
            const settingsEnabled = settings?.notificationsEnabled ?? true;
            setIsEnabled(status === 'granted' && settingsEnabled);
        };
        checkStatus();
    }, [settings]);

    const showToast = useCallback((title: string, message: string) => {
        toast.show({
            component: (props) => (
                <Toast
                    variant="default"
                    placement="top"
                    style={{ backgroundColor: background, borderColor: accent }}
                    className="border-1 p-5"
                    {...props}
                >
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
    }, [toast, background, accent]);

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
        <View>
            <AppText style={[styles.sectionLabel, { color: muted }]}>NOTIFICATIONS</AppText>
            <View style={[styles.section, { backgroundColor: surface }]}>
                <View style={styles.row}>
                    <View style={[styles.iconBox, { backgroundColor: '#f97316' + '20' }]}>
                        <Icon name="notifications-outline" color="#f97316" size={18} />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                        <AppText style={[styles.rowTitle, { color: foreground }]}>Timer Reminders</AppText>
                        <AppText style={[styles.rowSubtitle, { color: muted }]}>
                            Alert when timer runs &gt; 8 hours
                        </AppText>
                    </View>
                    <Switch isSelected={isEnabled} onSelectedChange={toggleSwitch} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 8,
        marginLeft: 4,
    },
    section: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    rowSubtitle: {
        fontSize: 12,
    },
});

export default NotificationsCard;
