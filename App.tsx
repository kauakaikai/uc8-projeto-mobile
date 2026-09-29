import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CartaoPet } from './src/components/CartaoPet';
import type { Pet } from './src/types/entidades';

const pets: Pet[] = [
  { id: 1, nome: 'Rex', especie: 'cachorro', raca: 'Vira-lata', clienteId: 1 },
  { id: 2, nome: 'Mimi', especie: 'gato', clienteId: 2 },
  { id: 3, nome: 'Piu', especie: 'ave', raca: 'Calopsita', clienteId: 1 },
];

export default function App() {
  const [nome, setNome] = useState<string>('');

  return (
    <View style={estilos.tela}>
      <Text style={estilos.cabecalho}>Pets</Text>
      <TextInput
        style={estilos.campo}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />
      <Text style={estilos.digitado}>Digitado: {nome}</Text>
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
  campo: { backgroundColor: '#fff', borderRadius: 6, padding: 10, marginBottom: 8 },
  digitado: { marginBottom: 16 },
});