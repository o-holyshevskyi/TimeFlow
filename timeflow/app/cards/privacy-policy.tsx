import { AppText } from "@/components/ui/app-text";
import { Layout } from "@/constants/layout";
import { useThemeColor } from "heroui-native";
import React from "react";
import { Linking, StyleSheet, View } from "react-native";
import { BaseCard } from "./base-card";

export default function PrivacyPolicyScreen() {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');

    const openLink = async (url: string) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) await Linking.openURL(url);
    };

    const handleEmailPress = () => {
        Linking.openURL('mailto:holyshevskyi.a@gmail.com');
    };

    return (
        <BaseCard title="Privacy Policy">
            <View style={styles.content}>
                <AppText style={[styles.sectionTitle, { color: foreground }]}>Privacy Policy</AppText>
                <AppText style={[styles.paragraph, { color: muted }]}>
                    This privacy policy applies to the ClariRate app (hereby referred to as &quot;Application&quot;) for mobile devices that was created by Oleksandr Holyshevskyi (hereby referred to as &quot;Service Provider&quot;) as a Freemium service. This service is intended for use &quot;AS IS&quot;.
                </AppText>

                <AppText style={[styles.sectionTitle, { color: foreground }]}>Information Collection and Use</AppText>
                <AppText style={[styles.paragraph, { color: muted }]}>
                    The Application collects information when you download and use it. This information may include information such as:
                    {'\n'}• Your device&apos;s Internet Protocol address (e.g. IP address)
                    {'\n'}• The pages of the Application that you visit, the time and date of your visit, the time spent on those pages
                    {'\n'}• The operating system you use on your mobile device
                    {'\n'}• Advertising ID (IDFA/GAID): Used to provide personalized advertisements and analytics.
                </AppText>

                <AppText style={[styles.sectionTitle, { color: foreground }]}>Notifications</AppText>
                <AppText style={[styles.paragraph, { color: muted }]}>
                    The Application uses local notifications to provide Smart Alerts (e.g., long session warnings or pause reminders). These notifications are scheduled locally on your device and do not transmit your usage data to external servers.
                </AppText>

                <AppText style={[styles.sectionTitle, { color: foreground }]}>Location Information</AppText>
                <AppText style={[styles.paragraph, { color: muted }]}>
                    The Application does not request or collect precise geographical location data from your mobile device for its core functionality (time tracking).
                    {'\n\n'}
                    However, the Application integrates third-party services (such as AdMob) which may collect and use approximate location data derived from your IP address to serve relevant advertisements and analyze ad performance.
                </AppText>

                <AppText style={[styles.sectionTitle, { color: foreground }]}>Third Party Access</AppText>
                <AppText style={[styles.paragraph, { color: muted }]}>
                    Only aggregated, anonymized data is periodically transmitted to external services to aid the Service Provider in improving the Application and their service. The Service Provider may share your information with third parties in the ways that are described in this privacy statement.
                    {'\n\n'}
                    Please note that the Application utilizes third-party services that have their own Privacy Policy about handling data. Below are the links to the Privacy Policy of the third-party service providers used by the Application:
                </AppText>

                <View style={styles.linkContainer}>
                    <AppText style={[styles.link, { color: '#3b82f6' }]} onPress={() => openLink('https://support.google.com/admob/answer/6128543?hl=en')}>AdMob</AppText>
                    <AppText style={[styles.link, { color: '#3b82f6' }]} onPress={() => openLink('https://expo.dev/privacy')}>Expo</AppText>
                    <AppText style={[styles.link, { color: '#3b82f6' }]} onPress={() => openLink('https://www.revenuecat.com/privacy')}>RevenueCat</AppText>
                </View>

                <AppText style={[styles.sectionTitle, { color: foreground }]}>In-App Purchases and Payments</AppText>
                <AppText style={[styles.paragraph, { color: muted }]}>
                    The Application offers in-app purchases handled via the Apple App Store. The Service Provider does not collect or store your financial information (e.g., credit card numbers). All financial transactions are processed securely by Apple. The Service Provider only receives a confirmation of the transaction and subscription status via RevenueCat to unlock premium features.
                </AppText>

                <AppText style={[styles.sectionTitle, { color: foreground }]}>Opt-Out Rights</AppText>
                <AppText style={[styles.paragraph, { color: muted }]}>
                    You can stop all collection of information by the Application easily by uninstalling it. You may use the standard uninstall processes as may be available as part of your mobile device or via the mobile application marketplace or network.
                    {'\n\n'}
                    You may also opt-out of personalized advertising tracking through your device settings (Settings {'>'} Privacy {'>'} Tracking on iOS).
                </AppText>

                <AppText style={[styles.sectionTitle, { color: foreground }]}>Data Retention Policy</AppText>
                <AppText style={[styles.paragraph, { color: muted }]}>
                    The Service Provider will retain User Provided data for as long as you use the Application and for a reasonable time thereafter. If you&apos;d like them to delete User Provided Data that you have provided via the Application, please contact them at <AppText style={{ color: '#3b82f6', textDecorationLine: 'underline' }} onPress={handleEmailPress}>holyshevskyi.a@gmail.com</AppText> and they will respond in a reasonable time.
                </AppText>

                <AppText style={[styles.sectionTitle, { color: foreground }]}>Children</AppText>
                <AppText style={[styles.paragraph, { color: muted }]}>
                    The Service Provider does not use the Application to knowingly solicit data from or market to children under the age of 13.
                    {'\n\n'}
                    The Application does not address anyone under the age of 13. The Service Provider does not knowingly collect personally identifiable information from children under 13 years of age. In the case the Service Provider discover that a child under 13 has provided personal information, the Service Provider will immediately delete this from their servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact the Service Provider (<AppText style={{ color: '#3b82f6', textDecorationLine: 'underline' }} onPress={handleEmailPress}>holyshevskyi.a@gmail.com</AppText>) so that they will be able to take the necessary actions.
                </AppText>

                <AppText style={[styles.sectionTitle, { color: foreground }]}>Security</AppText>
                <AppText style={[styles.paragraph, { color: muted }]}>
                    The Service Provider is concerned about safeguarding the confidentiality of your information. The Service Provider provides physical, electronic, and procedural safeguards to protect information the Service Provider processes and maintains.
                </AppText>

                <AppText style={[styles.sectionTitle, { color: foreground }]}>Changes</AppText>
                <AppText style={[styles.paragraph, { color: muted }]}>
                    This Privacy Policy may be updated from time to time for any reason. The Service Provider will notify you of any changes to the Privacy Policy by updating this page with the new Privacy Policy. You are advised to consult this Privacy Policy regularly for any changes, as continued use is deemed approval of all changes.
                    {'\n\n'}
                    This privacy policy is effective as of 2025-12-30
                </AppText>

                <AppText style={[styles.sectionTitle, { color: foreground }]}>Your Consent</AppText>
                <AppText style={[styles.paragraph, { color: muted }]}>
                    By using the Application, you are consenting to the processing of your information as set forth in this Privacy Policy now and as amended by us.
                </AppText>

                <AppText style={[styles.sectionTitle, { color: foreground }]}>Contact Us</AppText>
                <AppText style={[styles.paragraph, { color: muted }]}>
                    If you have any questions regarding privacy while using the Application, or have questions about the practices, please contact the Service Provider via email at <AppText style={{ color: '#3b82f6', textDecorationLine: 'underline' }} onPress={handleEmailPress}>holyshevskyi.a@gmail.com</AppText>.
                </AppText>

                <AppText style={[styles.footer, { color: muted }]}>Effective as of 2025-12-30</AppText>
                <View style={{ height: 40 }} />
            </View>
        </BaseCard>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: Layout.spacing * 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: Layout.spacing * 3,
        marginBottom: Layout.spacing,
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: Layout.spacing,
    },
    linkContainer: {
        marginVertical: Layout.spacing,
    },
    link: {
        fontSize: 14,
        marginBottom: Layout.spacing / 2,
        textDecorationLine: 'underline',
    },
    footer: {
        marginTop: Layout.spacing * 4,
        fontSize: 12,
        textAlign: 'center',
        opacity: 0.6,
    }
});