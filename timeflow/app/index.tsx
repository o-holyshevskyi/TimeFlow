import DynamicAdBanner from '@/components/advertisment/dynamic-ad-banner';
import Actions from '@/components/home/actions';
import MainContent from '@/components/home/content';
import Header from '@/components/home/header';
import Constants from 'expo-constants';
import { useThemeColor } from 'heroui-native';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const IS_EXPO_GO = Constants.appOwnership === 'expo';

export default function HomeScreen() {
  const background = useThemeColor('background');

  return <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
    <Header />
    <MainContent />
    {!IS_EXPO_GO && <DynamicAdBanner isPremiumUser={false} />}
    <Actions />
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
});