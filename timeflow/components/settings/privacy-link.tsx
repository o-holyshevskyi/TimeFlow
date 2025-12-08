import Constats from 'expo-constants';
import { useThemeColor } from "heroui-native";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PrivacyLink() {
    const muted = useThemeColor('muted');

    const PRIVACY_URL = 'https://github.com/o-holyshevskyi/TimeFlow/blob/main/public/README.md';

    const openLink = async (url: string) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            console.error("Don't know how to open this URL: " + url);
        }
    };
    
    return <View style={styles.container}>
        <View style={styles.linksRow}>
            <TouchableOpacity onPress={() => openLink(PRIVACY_URL)}>
                <Text style={[styles.linkText, { color: muted }]}>Privacy Policy</Text>
            </TouchableOpacity>
            
            <Text style={[styles.separator, { color: muted }]}>•</Text>

            <Text style={{ alignSelf: 'center', color: muted, fontWeight: 500 }}>v. {Constats.expoConfig?.version}</Text>
        </View>
    </View>
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    linksRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    linkText: {
        fontSize: 12,
        textDecorationLine: 'underline',
    },
    separator: {
        fontSize: 12,
    },
    versionText: {
        fontSize: 10,
        opacity: 0.6,
    }
});
