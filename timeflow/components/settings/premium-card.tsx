import { Layout } from "@/constants/layout";
import { useUserStatus } from "@/hooks/user-status";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Button, Card, Spinner, Toast, useThemeColor, useToast } from "heroui-native";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import Purchases, { PACKAGE_TYPE, PurchasesPackage } from "react-native-purchases";
import { Icon } from "../ui/icon";
import RestorePurchase from "./restore-purchase";

const PremiumCard = () => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');

    const [availablePackage, setAvailablePackage] = useState<PurchasesPackage | null>(null);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Додали стан завантаження
    const [debugInfo, setDebugInfo] = useState<string>(""); // Для відображення помилки на екрані (тимчасово)

    const { toast } = useToast();
    const { isPro, isChecking } = useUserStatus();

    const priceString = availablePackage ? availablePackage.product.priceString : "";
    const router = useRouter();

    useEffect(() => {
        getOfferings();
    }, []);

    async function getOfferings() {
        try {
            console.log("--- START FETCHING OFFERINGS ---");
            const offerings = await Purchases.getOfferings();
            
            // Логуємо структуру відповіді
            console.log("Offerings Raw:", JSON.stringify(offerings, null, 2));

            let pck: PurchasesPackage | undefined;

            // 1. Спробуємо знайти в Current
            if (offerings.current && offerings.current.availablePackages.length > 0) {
                console.log("Found in CURRENT offering");
                pck = offerings.current.availablePackages.find(p => p.packageType === PACKAGE_TYPE.LIFETIME) 
                      || offerings.current.availablePackages[0];
            } 
            // 2. Якщо Current пустий, шукаємо конкретно 'default' (fallback)
            else if (offerings.all['default'] && offerings.all['default'].availablePackages.length > 0) {
                console.log("Found in DEFAULT offering (fallback)");
                pck = offerings.all['default'].availablePackages.find(p => p.packageType === PACKAGE_TYPE.LIFETIME)
                      || offerings.all['default'].availablePackages[0];
            } else {
                console.log("No offerings found anywhere.");
                setDebugInfo("No offerings found. Check Console.");
            }

            if (pck) {
                console.log("✅ Package Selected:", pck.product.identifier, pck.product.priceString);
                setAvailablePackage(pck);
            }

        } catch (e: any) {
            console.error("❌ Error fetching offerings:", e);
            setDebugInfo(`Error: ${e.message}`);
        } finally {
            setIsLoading(false); // Завжди вимикаємо спінер!
            console.log("--- END FETCHING ---");
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
                        <Toast variant="default" placement="top" className="bg-[#0f172aff] border-[#334155] border-1 p-5" {...props}>
                            <View>
                                <Toast.Label style={{ fontSize: 22, color: '#4caf50' }}>Success!</Toast.Label>
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
            
        router.push('/');
    }

    if (!availablePackage) return null;
    if (isChecking) return null;

    if (isPro) return <Card style={[styles.premiumCard]}>
        <Card.Body style={{ paddingHorizontal: Layout.spacing }}>
            <Text style={[{ color: foreground, textAlign: 'center' }, { fontSize: 14, marginBottom: Layout.spacing }]}>
                Already bought PRO? Tap &quot;Restore Purchases&quot; to recover your subscription on this device.
            </Text>
            <RestorePurchase isDisabled={isPurchasing || isLoading} onRestoreSuccess={() => router.push('/')} />
        </Card.Body>
    </Card>;
    
    return <Card style={[styles.premiumCard]}>
        <Card.Header style={[styles.premiumCardHeader]}>
            <View style={[styles.premiumTextContainer]}>
                <Icon name="star" color="#2bee6c" />
                <Text style={[{ color: foreground }, styles.premiumCardTitle]}>Go PROductive</Text>
            </View>
            <Text style={[{ color: muted }, styles.premiumCardDescription]}>
                Unlock powerful features to boost your productivity.
            </Text>
            {(!availablePackage && !isLoading) && (
                <Text style={{color: 'red', textAlign: 'center', marginTop: 10}}>
                    {debugInfo || "Product Unavailable"}
                </Text>
            )}
        </Card.Header>
        
        <Card.Body style={{ paddingHorizontal: Layout.spacing }}>
             <View style={{ flexDirection: "column", gap: Layout.spacing * 5 }}>
                <View style={[styles.premiumTextContainer]}>
                    <Icon name="checkmark-circle" color="#2bee6c" />
                    <Text style={[{ color: foreground }, styles.premiumCardDescription]}>Ad-Free Experience</Text>
                </View>
                <View style={[styles.premiumTextContainer]}>
                    <Icon name="checkmark-circle" color="#2bee6c" />
                    <Text style={[{ color: foreground }, styles.premiumCardDescription]}>Unlimited History</Text>
                </View>
                <View style={[styles.premiumTextContainer]}>
                    <Icon name="checkmark-circle" color="#2bee6c" />
                    <Text style={[{ color: foreground }, styles.premiumCardDescription]}>Export Data (CSV)</Text>
                </View>
            </View>
        </Card.Body>

        <Card.Footer style={{ paddingHorizontal: Layout.spacing, flexDirection: "column", gap: Layout.spacing * 2 }}>
            <LinearGradient
                colors={["#f7f455ff", "#22cea9ff"]}
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
                            <Icon name="sparkles" color="black" />
                            <Button.Label style={{ fontSize: 24, fontWeight: '600', color: "black" }}>
                                {availablePackage 
                                    ? `Unlock for ${priceString}` 
                                    : "Unavailable"}
                            </Button.Label>
                        </View>
                    )}
                </Button>
            </LinearGradient>

            <Text style={[{ color: muted, textAlign: 'center' }, { fontSize: 14, marginBottom: Layout.spacing }]}>
                Already bought PRO? Tap &quot;Restore Purchases&quot; to recover your subscription on this device.
            </Text>
            <RestorePurchase isDisabled={isPurchasing || isLoading} onRestoreSuccess={() => router.push('/')} />
        </Card.Footer>
    </Card>
}

const styles = StyleSheet.create({
    premiumCard: {
        marginTop: Layout.spacing * 2,
        backgroundColor: '#1C2D23',
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