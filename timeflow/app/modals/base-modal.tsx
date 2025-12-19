import { Layout } from "@/constants/layout";
import { StyleSheet, View } from "react-native";

const BaseModal = ({ children }: { children: React.ReactNode }) => {
    return <View style={styles.container}>
        <View style={styles.content}>
            {children}
        </View>
    </View>
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center', 
        alignItems: 'center',
    },
    content: {
        padding: Layout.spacing * 4, 
        gap: Layout.spacing * 4, 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center' 
    }
});

export default BaseModal;
