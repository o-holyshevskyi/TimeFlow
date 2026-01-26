import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { Layout } from '@/constants/layout';
import * as StoreReview from 'expo-store-review';
import { Card, useThemeColor } from 'heroui-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function RateCard() {
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const accent = useThemeColor('accent');
    const warning = useThemeColor('warning');

    const handleRate = async () => {
        // Отримуємо посилання на App Store
        const url = StoreReview.storeUrl();
        
        if (url) {
            // Використовуємо Linking для відкриття сторінки додатка
            const { Linking } = require('react-native');
            Linking.openURL(url);
        }
    };

    return (
        <TouchableOpacity onPress={handleRate} activeOpacity={0.7}>
            <Card style={[styles.card, { backgroundColor: accent + '20' }]}>
                <Card.Body style={styles.body}>
                    <View style={[styles.iconContainer, {backgroundColor: warning + '50' }]}>
                        <Icon name="star" size={24} color={warning} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <AppText style={[styles.title, { color: foreground }]}>
                            Rate ClariRate
                        </AppText>
                        <AppText style={[styles.subtitle, { color: muted }]}>
                            Support an indie developer
                        </AppText>
                    </View>
                    <Icon name="chevron-forward" size={20} color={muted} />
                </Card.Body>
            </Card>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: Layout.borderRadius,
    },
    body: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Layout.spacing * 4,
        gap: Layout.spacing * 4,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 13,
    }
});