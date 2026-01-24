import { Layout } from "@/constants/layout";
import { useDataBackup } from "@/hooks/use-data-backup";
import { Button, Card, Spinner, Toast, useThemeColor, useToast } from "heroui-native";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "../ui/app-text";
import { Icon } from "../ui/icon";

const BackupCard = () => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');    
    const accent = useThemeColor('accent');

    const { createBackup, restoreBackup, isLoading } = useDataBackup();
    const { toast } = useToast();

    const showToast = useCallback((label: string, description: string) => {
        toast.show({
            component: (props) => (
                <Toast variant="default" placement="top" className="bg-[#0f172aff] border-[#334155] border-1 p-5" {...props}>
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
    }, [toast]);

    const handleCreateBackup = useCallback(async () => {
        await createBackup();
        showToast("Backup created", "Your data has been successfully backed up.");
    }, [createBackup, showToast]);

    const handleRestoreBackup = useCallback(async () => {
        await restoreBackup();
        showToast("Backup restored", "Your data has been successfully restored.");
    }, [restoreBackup, showToast]);

    return (
        <Card style={[styles.settingsCard]}>
            <Card.Header style={[styles.settingsCardHeader]}>
                <AppText style={[{ color: foreground }, styles.settingsCardTitle]}>Data Backup</AppText>
                <AppText style={[{ color: muted }, styles.settingsCardDescription]}>
                    Save your history to a file or restore from one.
                </AppText>
            </Card.Header>

            <Card.Body style={{ paddingHorizontal: Layout.spacing }}>
                {/* <View style={styles.restoreRow}>
                    <View style={{ flex: 1, gap: 4 }}>
                        <AppText style={{ color: foreground, fontSize: 18, fontWeight: '600' }}>Restore Data</AppText>
                        <AppText style={{ color: muted, fontSize: 14 }}>Import .json file</AppText>
                    </View>
                    
                    <Button 
                        size="lg" 
                        variant="ghost" 
                        onPress={handleRestoreBackup}
                        isDisabled={isLoading}
                        style={{ borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 }}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={accent} /> 
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Icon name="cloud-download-outline" color={accent} size={24} />
                                <AppText style={{ color: accent, fontWeight: '600' }}>Import</AppText>
                            </View>
                        )}
                    </Button>
                </View> */}
                <Button
                    onPress={handleRestoreBackup}
                    size="lg"
                    style={{
                        borderRadius: 9999,
                        borderWidth: 1,
                        borderColor: '#2bee6c',
                        backgroundColor: 'transparent',
                        width: '100%',
                        paddingHorizontal: Layout.spacing * 3,
                        paddingVertical: Layout.spacing / 1.5,
                    }}
                    isDisabled={isLoading}
                    testID="restore-button"
                >
                    {isLoading ? (
                        <Spinner color="default" />
                    ) : (
                        <View style={{ flexDirection: 'row', gap: Layout.spacing, alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="cloud-download-outline" color="#2bee6c" />
                            <Button.Label style={{ fontSize: 24, fontWeight: '600', color: '#2bee6c' }}>
                                Import Backup
                            </Button.Label>
                        </View>
                    )}
                </Button>
            </Card.Body>

            <Card.Footer style={{ paddingHorizontal: Layout.spacing }}>
                <Button 
                    isDisabled={isLoading}
                    onPress={handleCreateBackup}
                    feedbackVariant="ripple" 
                    size="lg"
                    animation={{
                        ripple: {
                            backgroundColor: { value: "black" },
                            opacity: { value: [0, 0.3, 0] },
                        },
                        scale: {
                            value: 1.05
                        }
                    }}
                >
                    {isLoading ? (
                        <Spinner color="default" />
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                             <Icon name="cloud-upload-outline" color="black" size={24} />
                            <Button.Label style={{ fontSize: 24, fontWeight: '600', color: 'black' }}>
                                Create Backup
                            </Button.Label>
                        </View>
                    )}
                </Button>
            </Card.Footer>
        </Card>
    );
}

const styles = StyleSheet.create({
    settingsCard: {
        marginTop: Layout.spacing * 2,
        backgroundColor: '#1C2D23',
        borderRadius: Layout.borderRadius,
        gap: Layout.spacing * 4
    },
    settingsCardHeader: {
        gap: Layout.spacing * 2,
        flexDirection: 'column',
        alignItems: 'center',
        alignContent: 'center'
    },
    settingsCardTitle: {
        fontSize: 28, 
        fontWeight: '700'
    },
    settingsCardDescription: {
        fontSize: 22, 
        fontWeight: '500', 
        textAlign: 'center'
    },
    restoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    }
});

export default BackupCard;