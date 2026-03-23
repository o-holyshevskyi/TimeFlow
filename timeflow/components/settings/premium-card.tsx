import { Layout } from "@/constants/layout";
import { useUserStatus } from "@/hooks/user-status";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Button, Spinner, Toast, useThemeColor, useToast } from "heroui-native";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import Purchases, { PACKAGE_TYPE, PurchasesPackage } from "react-native-purchases";
import { useUniwind } from "uniwind";
import { AppText } from "../ui/app-text";
import { Icon } from "../ui/icon";
import RestorePurchase from "./restore-purchase";
import { THEMES } from "./themes-card";

const FEATURES = [
    { icon: "document-text-outline", label: "PDF Invoice Generation", color: "#f97316" },
    { icon: "cloud-outline", label: "Backup & Restore", color: "#3b82f6" },
    { icon: "stats-chart-outline", label: "Advanced Analytics", color: "#8b5cf6" },
    { icon: "list-outline", label: "Unlimited History & CSV Export", color: "#22c55e" },
    { icon: "trophy-outline", label: "Monthly Income Goals", color: "#eab308" },
    { icon: "ban-outline", label: "Ad-Free Experience", color: "#ef4444" },
];

const PremiumCard = ({ handleSuccess }: { handleSuccess?: () => void }) => {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const accent = useThemeColor('accent');
    const surface = useThemeColor('surface');
    const background = useThemeColor('background');

    const [availablePackage, setAvailablePackage] = useState<PurchasesPackage | null>(null);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { toast } = useToast();
    const { isPro, isChecking } = useUserStatus();
    const { theme } = useUniwind();
    const router = useRouter();

    const activeTheme = THEMES.find(t => t.id === theme);
    const priceString = availablePackage?.product.priceString ?? "";

    useEffect(() => { getOfferings(); }, []);

    async function getOfferings() {
        try {
            const offerings = await Purchases.getOfferings();
            let pck: PurchasesPackage | undefined;
            if (offerings.current?.availablePackages.length > 0) {
                pck = offerings.current.availablePackages.find(p => p.packageType === PACKAGE_TYPE.LIFETIME)
                    || offerings.current.availablePackages[0];
            } else if (offerings.all['default']?.availablePackages.length > 0) {
                pck = offerings.all['default'].availablePackages.find(p => p.packageType === PACKAGE_TYPE.LIFETIME)
                    || offerings.all['default'].availablePackages[0];
            }
            if (pck) setAvailablePackage(pck);
        } catch (e: any) {
            console.error("Error fetching offerings:", e);
        } finally {
            setIsLoading(false);
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
                        <Toast variant="default" placement="top"
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
            if (!error.userCancelled) Alert.alert("Purchase Error", error.message);
        } finally {
            setIsPurchasing(false);
        }
        if (handleSuccess) { handleSuccess(); router.push('/'); }
        else router.push('/');
    };

    if (!availablePackage) return null;
    if (isChecking) return null;

    if (isPro) {
        return (
            <View>
                <AppText style={[styles.sectionLabel, { color: muted }]}>SUBSCRIPTION</AppText>
                <View style={[styles.section, { backgroundColor: surface }]}>
                    <View style={styles.proRow}>
                        <View style={[styles.iconBox, { backgroundColor: accent + '20' }]}>
                            <Icon name="checkmark-circle" color={accent} size={18} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <AppText style={[styles.rowTitle, { color: foreground }]}>PRO Active</AppText>
                            <AppText style={[styles.rowSubtitle, { color: muted }]}>
                                Lifetime access — all features unlocked
                            </AppText>
                        </View>
                    </View>
                    <View style={[styles.divider, { backgroundColor: muted + '20', marginLeft: 64 }]} />
                    <View style={{ padding: 16, paddingTop: 8 }}>
                        <RestorePurchase
                            isDisabled={isPurchasing || isLoading}
                            onRestoreSuccess={() => router.push('/')}
                        />
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View>
            <AppText style={[styles.sectionLabel, { color: muted }]}>GO PRO</AppText>
            <View style={[styles.premiumContainer, { backgroundColor: surface }]}>
                {/* Header */}
                <View style={styles.premiumHeader}>
                    <LinearGradient
                        colors={(activeTheme?.colors || [accent + '50', accent]) as [string, string, ...string[]]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.premiumIconGradient}
                    >
                        <Icon name="star" color="white" size={22} />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                        <AppText style={[styles.premiumTitle, { color: foreground }]}>Go PROductive</AppText>
                        <AppText style={[styles.premiumSubtitle, { color: muted }]}>
                            One-time purchase · Lifetime access
                        </AppText>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: muted + '20' }]} />

                {/* Feature list */}
                <View style={styles.featureList}>
                    {FEATURES.map((feature) => (
                        <View key={feature.label} style={styles.featureRow}>
                            <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                                <Icon name={feature.icon as any} color={feature.color} size={15} />
                            </View>
                            <AppText style={[styles.featureLabel, { color: foreground }]}>{feature.label}</AppText>
                        </View>
                    ))}
                </View>

                <View style={[styles.divider, { backgroundColor: muted + '20' }]} />

                {/* CTA */}
                <View style={styles.ctaContainer}>
                    <LinearGradient
                        colors={(activeTheme?.colors || [accent + '50', accent]) as [string, string, ...string[]]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={{ borderRadius: 14, padding: 1.5 }}
                    >
                        <Button
                            feedbackVariant="ripple"
                            size="lg"
                            style={{ borderRadius: 12, backgroundColor: 'transparent' }}
                            onPress={handleSubscribe}
                            isDisabled={isPurchasing || isLoading || !availablePackage}
                        >
                            {(isPurchasing || isLoading) ? (
                                <Spinner color="danger" />
                            ) : (
                                <View style={{ flexDirection: "row", gap: 8, alignItems: 'center' }}>
                                    <Icon name="sparkles" color={foreground} size={18} />
                                    <Button.Label style={{ fontSize: 16, fontWeight: '700', color: foreground }}>
                                        {availablePackage ? `Unlock for ${priceString}` : "Unavailable"}
                                    </Button.Label>
                                </View>
                            )}
                        </Button>
                    </LinearGradient>

                    <AppText style={[styles.restoreNote, { color: muted }]}>
                        Already purchased?
                    </AppText>
                    <RestorePurchase
                        isDisabled={isPurchasing || isLoading}
                        onRestoreSuccess={() => {
                            if (handleSuccess) { handleSubscribe(); router.replace('/'); }
                            else router.push('/');
                        }}
                    />
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
    proRow: {
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
    divider: {
        height: 1,
    },
    premiumContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        gap: 0,
    },
    premiumHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
    },
    premiumIconGradient: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    premiumTitle: {
        fontSize: 17,
        fontWeight: '700',
    },
    premiumSubtitle: {
        fontSize: 12,
    },
    featureList: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    featureIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    ctaContainer: {
        padding: 16,
        gap: 10,
        alignItems: 'stretch',
    },
    restoreNote: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 4,
    },
});

export default PremiumCard;
