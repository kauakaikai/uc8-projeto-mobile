import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RotasDaPilha } from './src/navegacao/Tipos';
import { TelaDetalhePet } from './src/telas/TelaDetalhePet';
import { TelaPets } from './src/telas/TelaPets';

const Pilha = createNativeStackNavigator<RotasDaPilha>();

export default function App() {
  return (
    <NavigationContainer>
      <Pilha.Navigator>
        <Pilha.Screen name="Pets" component={TelaPets} />
        <Pilha.Screen name="DetalhePet" component={TelaDetalhePet} options={{ title: 'Detalhe do pet' }} />
      </Pilha.Navigator>
    </NavigationContainer>
  );
}