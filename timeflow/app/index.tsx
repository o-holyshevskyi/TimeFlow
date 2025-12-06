import AdBanner from '@/components/advertisment/ad-banner';
import Actions from '@/components/home/actions';
import MainContent from '@/components/home/content';
import Header from '@/components/home/header';
import { useThemeColor } from 'heroui-native';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const background = useThemeColor('background');

  return <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
    <Header />
    <MainContent />
    <AdBanner isPremiumUser={false} />
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