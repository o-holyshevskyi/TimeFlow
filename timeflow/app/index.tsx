import { useThemeColor } from 'heroui-native';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function HomeScreen() {
  const background = useThemeColor('background');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
      <Text>
        asdasds
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // This is critical - makes it fill the screen
  },
});