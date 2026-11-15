import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { TelaPetCare } from './src/telas/TelaPetCare';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F6FAF7' }} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <TelaPetCare />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
