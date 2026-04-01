import { useDataBackup } from "@/hooks/use-data-backup";
import { Spinner, Toast, useThemeColor, useToast } from "heroui-native";
import { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "../ui/app-text";
import { Icon } from "../ui/icon";

const BackupCard = () => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const accent = useThemeColor('accent');
    const surface = useThemeColor('surface');
    const background = useThemeColor('background');

    const { createBackup, restoreBackup, isLoading } = useDataBackup();
    const { toast } = useToast();

    const showToast = useCallback((label: string, description: string) => {
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
                            <Toast.Label style={{ fontSize: 22 }}>{label}</Toast.Label>
                            <Toast.Description style={{ fontSize: 16 }}>{description}</Toast.Description>
                        </View>
                        <Toast.Close />
                    </View>
                </Toast>
            ),
        });
    }, [toast, background, accent]);

    const handleCreateBackup = useCallback(async () => {
        await createBackup();
        showToast("Backup created", "Your data has been successfully backed up.");
    }, [createBackup, showToast]);

    const handleRestoreBackup = useCallback(async () => {
        await restoreBackup();
        showToast("Backup restored", "Your data has been successfully restored.");
    }, [restoreBackup, showToast]);

    return (
        <View>
            <AppText style={[styles.sectionLabel, { color: muted }]}>DATA & BACKUP</AppText>
            <View style={[styles.section, { backgroundColor: surface }]}>
                <Pressable
                    onPress={handleCreateBackup}
                    disabled={isLoading}
                    style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
                >
                    <View style={[styles.iconBox, { backgroundColor: '#3b82f6' + '20' }]}>
                        {isLoading
                            ? <Spinner size="sm" />
                            : <Icon name="cloud-upload-outline" color="#3b82f6" size={18} />
                        }
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                        <AppText style={[styles.rowTitle, { color: foreground }]}>Create Backup</AppText>
                        <AppText style={[styles.rowSubtitle, { color: muted }]}>
                            Export your data to a file
                        </AppText>
                    </View>
                    <Icon name="chevron-forward-outline" color={muted} size={16} />
                </Pressable>

                <View style={[styles.divider, { backgroundColor: muted + '20', marginLeft: 64 }]} />

                <Pressable
                    onPress={handleRestoreBackup}
                    disabled={isLoading}
                    style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
                    testID="restore-button"
                >
                    <View style={[styles.iconBox, { backgroundColor: '#22c55e' + '20' }]}>
                        {isLoading
                            ? <Spinner size="sm" />
                            : <Icon name="cloud-download-outline" color="#22c55e" size={18} />
                        }
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                        <AppText style={[styles.rowTitle, { color: foreground }]}>Import Backup</AppText>
                        <AppText style={[styles.rowSubtitle, { color: muted }]}>
                            Restore from a .json file
                        </AppText>
                    </View>
                    <Icon name="chevron-forward-outline" color={muted} size={16} />
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionLabel: {
        fontSize: 13,
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
        marginLeft: 16,
    },
    section: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        minHeight: 44,
        paddingVertical: 10,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowTitle: {
        fontSize: 17,
        fontWeight: '400',
    },
    rowSubtitle: {
        fontSize: 13,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
    },
});

export default BackupCard;
