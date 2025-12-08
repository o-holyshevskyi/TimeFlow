import { Layout } from "@/constants/layout";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Button, Card, Spinner, Toast, useThemeColor, useToast } from "heroui-native";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatCurrency } from "react-native-format-currency";
import Purchases, { PACKAGE_TYPE, PurchasesOfferings, PurchasesPackage } from "react-native-purchases";
import { Icon } from "../ui/icon";

const PremiumCard = () => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');

    const [offerings, setOfferings] = useState<PurchasesOfferings | null>();
    const [price, setPrice] = useState<string | undefined>(undefined);
    const [availablePackage, setAvailablePackage] = useState<PurchasesPackage>();

    const { toast } = useToast();

    useEffect(() => {
        getOfferings();
    });

    const handleSubscribe = async () => {
        try {
            if (availablePackage) {
                const { customerInfo } = await Purchases.purchasePackage(availablePackage);
                if (
                    typeof customerInfo.entitlements.active["PROductive"] !== "undefined"
                ) {
                    toast.show({
                        component: (props) => (
                            <Toast variant="default" placement="top" className="bg-[#0f172aff] border-[#334155] border-1 p-5" {...props}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View>
                                        <Toast.Label style={{ fontSize: 22, color: '#4caf50' }}>Subscription Activated</Toast.Label>
                                        <Toast.Description style={{ fontSize: 16 }}>You now have full access to PROductive features.</Toast.Description>
                                    </View>
                                </View>
                            </Toast>
                        ),
                    });
                    router.push('/');
                }
            }  
        } catch (error) {
            toast.show({
                component: (props) => (
                    <Toast variant="default" placement="top" className="bg-[#0f172aff] border-[#334155] border-1 p-5" {...props}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View>
                                <Toast.Label style={{ fontSize: 22, color: '#fbc02d' }}>Oops!</Toast.Label>
                                <Toast.Description style={{ fontSize: 16 }}>We couldn’t complete your purchase. Please try again.</Toast.Description>
                            </View>
                        </View>
                    </Toast>
                ),
            })
        }
    }

    async function getOfferings() {
        const offerings = await Purchases.getOfferings();

        if (
            offerings.current !== null &&
            offerings.current.availablePackages.length !== 0
        ) {
            setOfferings(offerings);

            const availablePackage = offerings.current.availablePackages.find(pck => pck.packageType === PACKAGE_TYPE.LIFETIME)
            
            if (availablePackage) {
                setAvailablePackage(availablePackage);
            
                const price = availablePackage.product.price;
                const currency = availablePackage.product.currencyCode;

                if (price && currency) {
                    const formattedPrice = formatCurrency({ amount: price, code: currency });
                    setPrice(formattedPrice[0]);
                }
            }
        }
    }

    if (offerings?.current?.availablePackages.length === 0) return;
    
    return offerings ? <Card style={[styles.premiumCard]}>
        <Card.Header style={[styles.premiumCardHeader]}>
            <View style={[styles.premiumTextContainer]}>
                <Icon name="star" color="#2bee6c" />
                <Text style={[{ color: foreground }, styles.premiumCardTitle]}>Go PROductive</Text>
            </View>
            <Text style={[{ color: muted }, styles.premiumCardDescription]}>
                Unlock powerful features to boost your productivity.
            </Text>
        </Card.Header>
        <Card.Body style={{ paddingHorizontal: Layout.spacing }}>
            <View style={{ flexDirection: "column", gap: Layout.spacing * 5 }}>
                <View style={[styles.premiumTextContainer]}>
                    <Icon name="checkmark-circle" color="#2bee6c" />
                    <Text style={[{ color: foreground }, styles.premiumCardDescription]}>Ad-Free Experience</Text>
                </View>
                <View style={[styles.premiumTextContainer]}>
                    <Icon name="checkmark-circle" color="#2bee6c" />
                    <Text style={[{ color: foreground }, styles.premiumCardDescription]}>Full Session History</Text>
                </View>
                <View style={[styles.premiumTextContainer]}>
                    <Icon name="checkmark-circle" color="#2bee6c" />
                    <Text style={[{ color: foreground }, styles.premiumCardDescription]}>Export Data (CSV)</Text>
                </View>
            </View>
        </Card.Body>
        <Card.Footer style={{ paddingHorizontal: Layout.spacing }}>
            <LinearGradient
                colors={["#f7f455ff", "#22cea9ff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                    borderRadius: 9999,
                    padding: 2,
                }}
            >
                <Button
                    feedbackVariant="ripple"
                    size="lg"
                    style={{
                        borderRadius: 9999,
                        backgroundColor: "transparent",
                    }}
                    animation={{
                        ripple: {
                            backgroundColor: { value: "black" },
                            opacity: { value: [0, 0.3, 0] },
                        },
                        scale: {
                            value: 1.1
                        }
                    }}
                    onPress={handleSubscribe}
                >
                    {price ? (<View style={{ flexDirection: "row", gap: Layout.spacing, alignItems: 'center' }}>
                        <Icon name="sparkles" color="black" />
                        <Button.Label style={{ fontSize: 24, fontWeight: 600, color: "black" }}>
                            Unlock Pro for {price}
                        </Button.Label>
                    </View>
                    ) : <Spinner />}
                </Button>
            </LinearGradient>
        </Card.Footer>
    </Card> : <Spinner style={{alignSelf: 'center'}}/>
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
        fontWeight: 700
    },
    premiumCardDescription: {
        fontSize: 22, 
        fontWeight: 500, 
        textAlign: 'center'
    },
    premiumTextContainer: {
        flexDirection: 'row', 
        gap: Layout.spacing * 2, 
        alignItems: 'center'
    }
});

export default PremiumCard;
