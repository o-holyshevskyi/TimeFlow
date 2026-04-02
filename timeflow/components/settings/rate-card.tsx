import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import * as StoreReview from 'expo-store-review';
import { useThemeColor } from 'heroui-native';
import { Linking, Platform, PlatformColor, Pressable, StyleSheet, View } from 'react-native';

const CELL_BG: any = Platform.OS === 'ios'
    ? PlatformColor('secondarySystemGroupedBackground')
    : undefined;

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
                style={({ pressed }) => [styles.row, { backgroundColor: CELL_BG ?? surface, opacity: pressed ? 0.7 : 1 }]}
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
        fontSize: 13,
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
        marginLeft: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        minHeight: 44,
        paddingVertical: 10,
        borderRadius: 10,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowTitle: {
        fontSize: 17,
        fontWeight: '400',
    },
    rowSubtitle: {
        fontSize: 13,
    },
});
