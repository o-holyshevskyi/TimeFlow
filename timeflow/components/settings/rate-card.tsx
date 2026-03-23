import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { Layout } from '@/constants/layout';
import * as StoreReview from 'expo-store-review';
import { useThemeColor } from 'heroui-native';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

export default function RateCard() {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const surface = useThemeColor('surface');
    const warning = '#eab308';

    const handleRate = async () => {
        const url = StoreReview.storeUrl();
        if (url) Linking.openURL(url);
    };

    return (
        <View>
            <AppText style={[styles.sectionLabel, { color: muted }]}>FEEDBACK</AppText>
            <Pressable
                onPress={handleRate}
                style={({ pressed }) => [styles.row, { backgroundColor: surface, opacity: pressed ? 0.7 : 1 }]}
            >
                <View style={[styles.iconBox, { backgroundColor: warning + '25' }]}>
                    <Icon name="star" size={18} color={warning} />
                </View>
                <View style={{ flex: 1 }}>
                    <AppText style={[styles.rowTitle, { color: foreground }]}>Rate ClariRate</AppText>
                    <AppText style={[styles.rowSubtitle, { color: muted }]}>Support an indie developer ❤️</AppText>
                </View>
                <Icon name="chevron-forward-outline" size={16} color={muted} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 8,
        marginLeft: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: 16,
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
});
