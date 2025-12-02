import { Layout } from "@/constants/layout";
import { StyleSheet, View } from "react-native";
import EarnedAmount from "./amount";
import Timer from "./timer";

const MainContent = () => {
    return <View style={[styles.container]}>
        <Timer />
        <EarnedAmount />
    </View>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: Layout.spacing * 6
    },
});

export default MainContent;
