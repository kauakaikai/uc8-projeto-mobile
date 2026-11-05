import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CartaoPet } from '../componentes/CartaoPet';
import type { RotasDaPilha } from '../navegacao/tipos';
import { carregarPets } from '../servicos/pets';
import type { Pet } from '../tipos/entidades';

type TelaPetsProps = NativeStackScreenProps<RotasDaPilha, 'Pets'>;

export function TelaPets({ navigation }: TelaPetsProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [tentativa, setTentativa] = useState(0);

  // Recarrega sempre que a tela volta ao foco (ao voltar do cadastro, o pet novo aparece).
  useFocusEffect(
    useCallback(() => {
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
    }, [tentativa]),
  );

  return (
    <View style={estilos.tela}>
      <View style={estilos.barra}>
        <Pressable style={estilos.botao} onPress={() => setTentativa(tentativa + 1)}>
          <Text style={estilos.textoBotao}>Recarregar</Text>
        </Pressable>
        <Pressable style={estilos.botao} onPress={() => navigation.navigate('NovoPet')}>
          <Text style={estilos.textoBotao}>Novo pet</Text>
        </Pressable>
      </View>
      {carregando ? (
        <View style={estilos.centro}>
          <ActivityIndicator size="large" />
          <Text>Carregando os pets...</Text>
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(pet) => String(pet.id)}
          renderItem={({ item }) => (
            <View>
              <CartaoPet pet={item} />
              <Pressable onPress={() => navigation.navigate('DetalhePet', { id: item.id })}>
                <Text style={estilos.detalhes}>Ver detalhes</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={<Text>Nenhum pet cadastrado.</Text>}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#F6F8FA', padding: 16 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  barra: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  botao: { flex: 1, backgroundColor: '#004A8D', borderRadius: 6, padding: 12, alignItems: 'center' },
  textoBotao: { color: '#fff', fontWeight: 'bold' },
  detalhes: { color: '#004A8D', fontWeight: 'bold', marginBottom: 16 },
});