import { Layout } from "@/constants/layout";
import { useThemeColor } from "heroui-native";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";

const BaseModal = ({ children }: { children: React.ReactNode }) => {
    const background = useThemeColor('background');
    const muted = useThemeColor('muted');

    return (
        <KeyboardAvoidingView
            style={[styles.root, { backgroundColor: background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={80}
        >
            {/* Thin top divider to distinguish from the header */}
            <View style={[styles.topDivider, { backgroundColor: muted + '15' }]} />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {children}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    topDivider: {
        height: 1,
    },
    scrollContent: {
        padding: Layout.spacing * 4,
        gap: Layout.spacing * 4,
        flexDirection: 'column',
        alignItems: 'stretch',
        paddingBottom: Layout.spacing * 10,
    },
});

export default BaseModal;
