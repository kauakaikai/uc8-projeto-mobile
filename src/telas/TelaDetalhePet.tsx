import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Botao } from '../componentes/Botao';
import { usePets } from '../contexto/PetsContexto';
import type { RotasDaPilha } from '../navegacao/tipos';
import { cores, espacos } from '../tema/tema';

type TelaDetalhePetProps = NativeStackScreenProps<RotasDaPilha, 'DetalhePet'>;

export function TelaDetalhePet({ route, navigation }: TelaDetalhePetProps) {
  const { id } = route.params;
  const { buscar } = usePets();
  const pet = buscar(id);

  if (pet === undefined) {
    return (
      <View style={estilos.centro}>
        <Text>Pet não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={estilos.tela}>
      <Text style={estilos.nome}>{pet.nome}</Text>
      <Text style={estilos.especie}>{pet.especie}</Text>
      <Text style={estilos.raca}>{pet.raca ?? 'Raça não informada'}</Text>
      <View style={estilos.acoes}>
        <Botao titulo="Editar" onPress={() => navigation.navigate('EditarPet', { id })} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, padding: espacos.md },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  nome: { fontSize: 24, fontWeight: 'bold' },
  especie: { color: cores.textoSecundario, marginBottom: espacos.md },
  raca: { marginBottom: espacos.md },
  acoes: { flexDirection: 'row' },
});