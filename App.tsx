import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { CartaoPet } from './src/components/CartaoPet';
import { FormularioPet, type DadosPet } from './src/components/FormularioPet';
import { carregarPets } from './src/services/pets';
import type { Pet } from './src/types/entidades';

export default function App() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    carregarPets().then((resultado) => {
      if (cancelado) {
        return;
      }
      setPets(resultado);
      setCarregando(false);
    });
    return () => {
      cancelado = true;
    };
  }, [tentativa]);

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
      <Pressable style={estilos.botao} onPress={() => setTentativa(tentativa + 1)}>
        <Text style={estilos.textoBotao}>Recarregar</Text>
      </Pressable>
      {carregando ? (
        <View style={estilos.centro}>
          <ActivityIndicator size="large" />
          <Text>Carregando os pets...</Text>
        </View>
      ) : (
        <>
          <FormularioPet aoAdicionar={adicionar} />
          <FlatList
            data={pets}
            keyExtractor={(pet) => String(pet.id)}
            renderItem={({ item }) => <CartaoPet pet={item} />}
            ListEmptyComponent={<Text>Nenhum pet cadastrado.</Text>}
          />
        </>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#F6F8FA', paddingTop: 48, paddingHorizontal: 16 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cabecalho: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  botao: { backgroundColor: '#004A8D', borderRadius: 6, padding: 12, alignItems: 'center', marginBottom: 16 },
  textoBotao: { color: '#fff', fontWeight: 'bold' },
});