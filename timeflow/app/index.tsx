import AdBanner from '@/components/advertisment/ad-banner';
import Actions from '@/components/home/actions';
import MainContent from '@/components/home/content';
import Header from '@/components/home/header';
import { useUserStatus } from '@/hooks/user-status';
import { useThemeColor } from 'heroui-native';
import { StyleSheet } from 'react-native';
import Animated, { Easing, FadeInDown, FadeInLeft, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
    const background = useThemeColor('background');

    const { isPro, isChecking } = useUserStatus();

    return <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
        <Animated.View
            entering={FadeInUp.delay(500).easing(Easing.ease).duration(600).damping(80)}
        >
            <Header />
        </Animated.View>
        <Animated.View
            style={{ flex: 1 }}
            entering={FadeInLeft.delay(500).easing(Easing.ease).duration(600).damping(80)}
        >
            <MainContent />
        </Animated.View>
        <AdBanner isPro={!isChecking && isPro} />
        <Animated.View
            entering={FadeInDown.delay(500).easing(Easing.ease).duration(600).damping(80)}
        >
            <Actions />
        </Animated.View>
    </SafeAreaView>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
});