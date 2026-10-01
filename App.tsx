import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { CartaoPet } from './src/components/CartaoPet';
import { FormularioPet, type DadosPet } from './src/components/FormularioPet';
import { carregarPets } from './src/services/pets';
import type { Pet } from './src/types/entidades';

export default function App() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarPets().then((resultado) => {
      setPets(resultado);
      setCarregando(false);
    });
  }, []);

  function adicionar(dados: DadosPet) {
    const proximoId = pets.reduce((maior, atual) => Math.max(maior, atual.id), 0) + 1;
    setPets([
      { id: proximoId, nome: dados.nome, especie: 'outro', raca: dados.raca || undefined, clienteId: 1 },
      ...pets,
    ]);
  }

  if (carregando) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" />
        <Text>Carregando os pets...</Text>
      </View>
    );
  }

  return (
    <View style={estilos.tela}>
      <Text style={estilos.cabecalho}>Pets</Text>
      <FormularioPet aoAdicionar={adicionar} />
      <FlatList
        data={pets}
        keyExtractor={(pet) => String(pet.id)}
        renderItem={({ item }) => <CartaoPet pet={item} />}
        ListEmptyComponent={<Text>Nenhum pet cadastrado.</Text>}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#F6F8FA', paddingTop: 48, paddingHorizontal: 16 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cabecalho: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
});