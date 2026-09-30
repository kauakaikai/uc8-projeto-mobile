import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CartaoPet } from './src/componentes/CartaoPet';
import type { Pet } from './src/types/entidades';

const pets: Pet[] = [
  { id: 1, nome: 'Rex', especie: 'cachorro', raca: 'Vira-lata', clienteId: 1 },
  { id: 2, nome: 'Mimi', especie: 'gato', clienteId: 2 },
  { id: 3, nome: 'Piu', especie: 'ave', raca: 'Calopsita', clienteId: 1 },
];

export default function App() {
  return (
    <View style={estilos.tela}>
      <Text style={estilos.cabecalho}>Pets</Text>
      <ScrollView>
        {pets.map((pet) => (
          <CartaoPet key={pet.id} pet={pet} />
        ))}
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#F6F8FA', paddingTop: 48, paddingHorizontal: 16 },
  cabecalho: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
});