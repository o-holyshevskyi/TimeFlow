import { Layout } from "@/constants/layout";
import { useUserStatus } from "@/hooks/user-status";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Button, Card, Spinner, Toast, useThemeColor, useToast } from "heroui-native";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import Purchases, { PACKAGE_TYPE, PurchasesPackage } from "react-native-purchases";
import { useUniwind } from "uniwind";
import { AppText } from "../ui/app-text";
import { Icon } from "../ui/icon";
import RestorePurchase from "./restore-purchase";
import { THEMES } from "./themes-card";

const PremiumCard = ({ handleSuccess }: {handleSuccess?: () => void}) => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const accent = useThemeColor('accent');
    const danger = useThemeColor('danger');
    const background = useThemeColor('background');

    const [availablePackage, setAvailablePackage] = useState<PurchasesPackage | null>(null);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Додали стан завантаження
    const [debugInfo, setDebugInfo] = useState<string>(""); // Для відображення помилки на екрані (тимчасово)

    const { toast } = useToast();
    const { isPro, isChecking } = useUserStatus();
    const { theme } = useUniwind();

    const activeTheme = THEMES.find(t => t.id === theme);

    const priceString = availablePackage ? availablePackage.product.priceString : "";
    const router = useRouter();

    useEffect(() => {
        getOfferings();
    }, []);

    async function getOfferings() {
        try {
            const offerings = await Purchases.getOfferings();
            
            let pck: PurchasesPackage | undefined;

            // 1. Спробуємо знайти в Current
            if (offerings.current && offerings.current.availablePackages.length > 0) {
                pck = offerings.current.availablePackages.find(p => p.packageType === PACKAGE_TYPE.LIFETIME) 
                      || offerings.current.availablePackages[0];
            } 
            // 2. Якщо Current пустий, шукаємо конкретно 'default' (fallback)
            else if (offerings.all['default'] && offerings.all['default'].availablePackages.length > 0) {
                pck = offerings.all['default'].availablePackages.find(p => p.packageType === PACKAGE_TYPE.LIFETIME)
                      || offerings.all['default'].availablePackages[0];
            } else {
                setDebugInfo("No offerings found. Check Console.");
            }

            if (pck) {
                setAvailablePackage(pck);
            }

        } catch (e: any) {
            console.error("❌ Error fetching offerings:", e);
            setDebugInfo(`Error: ${e.message}`);
        } finally {
            setIsLoading(false); // Завжди вимикаємо спінер!
        }
    }

    const handleSubscribe = async () => {
        if (!availablePackage) return;
        
        setIsPurchasing(true);
        try {
            const { customerInfo } = await Purchases.purchasePackage(availablePackage);
            
            if (customerInfo.entitlements.active["PROductive"]) { 
                toast.show({
                    component: (props) => (
                        <Toast 
                            variant="default" 
                            placement="top" 
                            style={{ backgroundColor: background, borderColor: accent }}
                            className="border-1 p-5" {...props}
                        >
                            <View>
                                <Toast.Label style={{ fontSize: 22, color: accent }}>Success!</Toast.Label>
                                <Toast.Description style={{ fontSize: 16 }}>Premium Activated.</Toast.Description>
                            </View>
                        </Toast>
                    ),
                });
            }
        } catch (error: any) {
            if (!error.userCancelled) {
                Alert.alert("Purchase Error", error.message);
            }
        } finally {
            setIsPurchasing(false);
        }
        
        if (handleSuccess) {
            handleSuccess();
            router.push('/');
        } else 
            router.push('/');
    }

    if (!availablePackage) return null;
    if (isChecking) return null;

    if (isPro) return <Card style={[styles.premiumCard, { backgroundColor: accent + '20' }]}>
        <Card.Body style={{ paddingHorizontal: Layout.spacing }}>
            <AppText style={[{ color: foreground, textAlign: 'center' }, { fontSize: 14, marginBottom: Layout.spacing }]}>
                Already bought PRO? Tap &quot;Restore Purchases&quot; to recover your subscription on this device.
            </AppText>
            <RestorePurchase isDisabled={isPurchasing || isLoading} onRestoreSuccess={() => router.push('/')} />
        </Card.Body>
    </Card>;
    
    return <Card style={[styles.premiumCard, { backgroundColor: accent + '20' }]}>
        <Card.Header style={[styles.premiumCardHeader]}>
            <View style={[styles.premiumTextContainer]}>
                <Icon name="star" color={accent} />
                <AppText style={[{ color: foreground }, styles.premiumCardTitle]}>Go PROductive</AppText>
            </View>
            <AppText style={[{ color: muted }, styles.premiumCardDescription]}>
                Unlock powerful features to boost your productivity.
            </AppText>
            {(!availablePackage && !isLoading) && (
                <AppText style={{color: danger, textAlign: 'center', marginTop: 10}}>
                    {debugInfo || "Product Unavailable"}
                </AppText>
            )}
        </Card.Header>
        
        <Card.Body style={{ paddingHorizontal: Layout.spacing }}>
             <View style={{ flexDirection: "column", gap: Layout.spacing * 5 }}>
                <View style={[styles.premiumTextContainer]}>
                    <Icon name="checkmark-circle" color={accent} />
                    <AppText style={[{ color: foreground }, styles.premiumCardDescription]}>
                        Generate PDF Invoices
                    </AppText>
                </View>
                <View style={[styles.premiumTextContainer]}>
                    <Icon name="checkmark-circle" color={accent} />
                    <AppText style={[{ color: foreground }, styles.premiumCardDescription]}>
                        Backup & Restore
                    </AppText>
                </View>
                <View style={[styles.premiumTextContainer]}>
                    <Icon name="checkmark-circle" color={accent} />
                    <AppText style={[{ color: foreground }, styles.premiumCardDescription]}>
                        Advanced Monthly Analytics
                    </AppText>
                </View>
                <View style={[styles.premiumTextContainer]}>
                    <Icon name="checkmark-circle" color={accent} />
                    <AppText style={[{ color: foreground }, styles.premiumCardDescription]}>
                        Unlimited History/CSV Export
                    </AppText>
                </View>
                <View style={[styles.premiumTextContainer]}>
                    <Icon name="checkmark-circle" color={accent} />
                    <AppText style={[{ color: foreground }, styles.premiumCardDescription]}>
                        Monthly Income Goals
                    </AppText>
                </View>
                <View style={[styles.premiumTextContainer]}>
                    <Icon name="checkmark-circle" color={accent} />
                    <AppText style={[{ color: foreground }, styles.premiumCardDescription]}>
                        Ad-Free Experience
                    </AppText>
                </View>
            </View>
        </Card.Body>

        <Card.Footer style={{ paddingHorizontal: Layout.spacing, flexDirection: "column", gap: Layout.spacing * 2 }}>
            <LinearGradient
                colors={(activeTheme?.colors || [accent + '50', accent]) as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 9999, padding: 2 }}
            >
                <Button
                    feedbackVariant="ripple"
                    size="lg"
                    style={{ borderRadius: 9999, backgroundColor: "transparent" }}
                    onPress={handleSubscribe}
                    isDisabled={isPurchasing || isLoading || !availablePackage}
                >
                    {(isPurchasing || isLoading) ? (
                        <Spinner color="danger" />
                    ) : (
                        <View style={{ flexDirection: "row", gap: Layout.spacing, alignItems: 'center' }}>
                            <Icon name="sparkles" color={foreground} />
                            <Button.Label style={{ fontSize: 24, fontWeight: '600', color: foreground }}>
                                {availablePackage 
                                    ? `Unlock for ${priceString}` 
                                    : "Unavailable"}
                            </Button.Label>
                        </View>
                    )}
                </Button>
            </LinearGradient>

            <AppText style={[{ color: muted, textAlign: 'center' }, { fontSize: 14, marginBottom: Layout.spacing }]}>
                Already bought PRO? Tap &quot;Restore Purchases&quot; to recover your subscription on this device.
            </AppText>
            <RestorePurchase isDisabled={isPurchasing || isLoading} onRestoreSuccess={() => {
                if (handleSuccess) {
                    handleSubscribe();
                    router.replace('/');
                } else
                    router.push('/');
            }} />
        </Card.Footer>
    </Card>
}

const styles = StyleSheet.create({
    premiumCard: {
        marginTop: Layout.spacing * 2,
        borderRadius: Layout.borderRadius,
        gap: Layout.spacing * 5
    },
    premiumCardHeader: {
        gap: Layout.spacing * 2,
        flexDirection: 'column',
        alignItems: 'center',
        alignContent: 'center'
    },
    premiumCardTitle: {
        fontSize: 28, 
        fontWeight: '700'
    },
    premiumCardDescription: {
        fontSize: 22, 
        fontWeight: '500', 
        textAlign: 'center'
    },
    premiumTextContainer: {
        flexDirection: 'row', 
        gap: Layout.spacing * 2, 
        alignItems: 'center'
    }
});

export default PremiumCard;