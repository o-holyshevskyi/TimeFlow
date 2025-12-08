import Constats from 'expo-constants';
import { router } from 'expo-router';
import { useThemeColor } from "heroui-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PrivacyLink() {
    const muted = useThemeColor('muted');

    const openLink = async () => {
        router.push('/cards/privacy-policy');
    };
    
    return <View style={styles.container}>
        <View style={styles.linksRow}>
            <TouchableOpacity onPress={openLink}>
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
