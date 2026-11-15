import { Pressable, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TelaPetCare } from './src/telas/TelaPetCare';
import { TelaSobre } from './src/telas/TelaSobre';

export type RotasPrincipais = {
  Principal: undefined;
  Sobre: undefined;
};

const Pilha = createNativeStackNavigator<RotasPrincipais>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Pilha.Navigator
          initialRouteName="Principal"
          screenOptions={{
            headerStyle: { backgroundColor: '#F6FAF7' },
            headerTintColor: '#205B3B',
            headerTitleStyle: { fontWeight: '800' },
            contentStyle: { backgroundColor: '#F6FAF7' },
          }}
        >
          <Pilha.Screen
            name="Principal"
            component={TelaPetCare}
            options={({ navigation }) => ({
              title: 'PetCare',
              headerRight: () => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Abrir tela Sobre"
                  onPress={() => navigation.navigate('Sobre')}
                  style={{ paddingHorizontal: 8, paddingVertical: 6 }}
                >
                  <Text style={{ color: '#205B3B', fontWeight: '800' }}>Sobre</Text>
                </Pressable>
              ),
            })}
          />
          <Pilha.Screen
            name="Sobre"
            component={TelaSobre}
            options={{ title: 'Sobre a PetCare' }}
          />
        </Pilha.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
