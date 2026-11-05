import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TelaDetalhePet } from '../telas/TelaDetalhePet';
import { TelaNovoPet } from '../telas/TelaNovoPet';
import { TelaPets } from '../telas/TelaPets';
import type { RotasDaPilha } from './tipos';

const Pilha = createNativeStackNavigator<RotasDaPilha>();

export function PilhaPets() {
  return (
    <Pilha.Navigator>
      <Pilha.Screen name="Pets" component={TelaPets} />
      <Pilha.Screen name="DetalhePet" component={TelaDetalhePet} options={{ title: 'Detalhe do pet' }} />
      <Pilha.Screen name="NovoPet" component={TelaNovoPet} options={{ title: 'Novo pet' }} />
    </Pilha.Navigator>
  );
}