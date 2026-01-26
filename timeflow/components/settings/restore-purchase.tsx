import { Layout } from '@/constants/layout';
import { useRouter } from 'expo-router';
import { Button, Spinner, Toast, useThemeColor, useToast } from 'heroui-native';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import Purchases from 'react-native-purchases';
import { Icon } from '../ui/icon';

type Props = {
    isDisabled?: boolean;
    onRestoreSuccess?: () => void;
};

const RestorePurchase = ({ isDisabled, onRestoreSuccess }: Props) => {
    const [isRestoring, setIsRestoring] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const accent = useThemeColor('accent');
    const background = useThemeColor('background');

    const handleRestore = async () => {
        setIsRestoring(true);
        try {
            const customerInfo = await Purchases.restorePurchases();

            if (customerInfo.entitlements.active['PROductive']) {
                toast.show({
                    component: (props) => (
                        <Toast 
                            variant="default" 
                            placement="top" 
                            style={{ backgroundColor: background, borderColor: accent }}
                            className="border-1 p-5" {...props}
                        >
                            <View>
                                <Toast.Label style={{ fontSize: 22, color: accent }}>Restored!</Toast.Label>
                                <Toast.Description style={{ fontSize: 16 }}>Your PROductive subscription has been successfully restored.</Toast.Description>
                            </View>
                        </Toast>
                    ),
                });

                if (onRestoreSuccess) {
                    onRestoreSuccess();
                } else {
                    router.push('/');
                }
            } else {
                Alert.alert('No Purchase Found', "We didn't find any active PROductive purchase to restore.");
            }
        } catch (error: any) {
            Alert.alert('Restore Error', error.message);
        } finally {
            setIsRestoring(false);
        }
    };

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Button
                onPress={handleRestore}
                size="lg"
                style={{
                    borderRadius: 9999,
                    borderWidth: 1,
                    borderColor: accent,
                    backgroundColor: 'transparent',
                    width: '100%',
                    paddingHorizontal: Layout.spacing * 3,
                    paddingVertical: Layout.spacing / 1.5,
                }}
                isDisabled={isDisabled || isRestoring}
                testID="restore-button"
            >
                {isRestoring ? (
                    <Spinner color="default" />
                ) : (
                    <View style={{ flexDirection: 'row', gap: Layout.spacing, alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="refresh" color={accent} />
                        <Button.Label style={{ fontSize: 24, fontWeight: '600', color: accent }}>
                            Restore Purchases
                        </Button.Label>
                    </View>
                )}
            </Button>
        </View>
    );
};

export default RestorePurchase;
