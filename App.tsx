import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CartaoPet } from './src/components/CartaoPet';
import { FormularioPet, type DadosPet } from './src/components/FormularioPet';
import type { Pet } from './src/types/entidades';

const petsIniciais: Pet[] = [
  { id: 1, nome: 'Rex', especie: 'cachorro', raca: 'Vira-lata', clienteId: 1 },
  { id: 2, nome: 'Mimi', especie: 'gato', clienteId: 2 },
  { id: 3, nome: 'Piu', especie: 'ave', raca: 'Calopsita', clienteId: 1 },
];

export default function App() {
  const [pets, setPets] = useState<Pet[]>(petsIniciais);

  function adicionar(dados: DadosPet) {
    const proximoId = pets.reduce((maior, atual) => Math.max(maior, atual.id), 0) + 1;
    setPets([
      { id: proximoId, nome: dados.nome, especie: 'outro', raca: dados.raca || undefined, clienteId: 1 },
      ...pets,
    ]);
  }

  return (
    <View style={estilos.tela}>
      <Text style={estilos.cabecalho}>Pets</Text>
      <FormularioPet aoAdicionar={adicionar} />
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