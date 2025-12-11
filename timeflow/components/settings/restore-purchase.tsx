import { Layout } from '@/constants/layout';
import { useRouter } from 'expo-router';
import { Button, Spinner, Toast, useToast } from 'heroui-native';
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

    const handleRestore = async () => {
        setIsRestoring(true);
        try {
            const customerInfo = await Purchases.restorePurchases();

            if (customerInfo.entitlements.active['PROductive']) {
                toast.show({
                    component: (props) => (
                        <Toast variant="default" placement="top" className="bg-[#0f172aff] border-[#334155] border-1 p-5" {...props}>
                            <View>
                                <Toast.Label style={{ fontSize: 22, color: '#4caf50' }}>Restored!</Toast.Label>
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
                    borderColor: '#2bee6c',
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
                        <Icon name="refresh" color="#2bee6c" />
                        <Button.Label style={{ fontSize: 18, fontWeight: '600', color: '#2bee6c' }}>
                            Restore Purchases
                        </Button.Label>
                    </View>
                )}
            </Button>
        </View>
    );
};

export default RestorePurchase;
