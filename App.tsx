import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RotasDaPilha } from './src/navegacao/Tipos';
import { TelaPets } from './src/telas/TelaPets';

const Pilha = createNativeStackNavigator<RotasDaPilha>();

export default function App() {
  return (
    <NavigationContainer>
      <Pilha.Navigator>
        <Pilha.Screen name="Pets" component={TelaPets} />
      </Pilha.Navigator>
    </NavigationContainer>
  );
}