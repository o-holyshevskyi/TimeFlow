import { useThemeColor } from "heroui-native";
import { KeyboardAvoidingView, Platform, PlatformColor, ScrollView, StyleSheet } from "react-native";

const BaseModal = ({ children }: { children: React.ReactNode }) => {
    const background = useThemeColor('background');

    const bgColor: any = Platform.OS === 'ios'
        ? PlatformColor('systemGroupedBackground')
        : background;

    return (
        <KeyboardAvoidingView
            style={[styles.root, { backgroundColor: bgColor }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={80}
        >
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
    scrollContent: {
        padding: 24,
        gap: 24,
        flexDirection: 'column',
        alignItems: 'stretch',
        paddingBottom: 64,
    },
});

export default BaseModal;
