import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FormularioPet, type DadosPet } from '../componentes/FormularioPet';
import { usePets } from '../contexto/PetsContexto';
import { registrarErro } from '../erros/erros';
import type { RotasDaPilha } from '../navegacao/tipos';
import { cores, espacos } from '../tema/tema';

type TelaEditarPetProps = NativeStackScreenProps<RotasDaPilha, 'EditarPet'>;

export function TelaEditarPet({ route, navigation }: TelaEditarPetProps) {
  const { id } = route.params;
  const { buscar, atualizar } = usePets();
  const [erro, setErro] = useState<string | undefined>(undefined);
  const pet = buscar(id);

  if (pet === undefined) {
    return (
      <View style={estilos.centro}>
        <Text>Pet não encontrado.</Text>
      </View>
    );
  }

  function salvar(dados: DadosPet) {
    setErro(undefined);
    atualizar(id, dados)
      .then(() => {
        navigation.goBack();
      })
      .catch((falha: unknown) => {
        setErro(registrarErro('edicao', falha).mensagem);
      });
  }

  return (
    <View style={estilos.tela}>
      <FormularioPet
        aoAdicionar={salvar}
        rotuloDoBotao="Salvar"
        inicial={{ nome: pet.nome, raca: pet.raca ?? '', especie: pet.especie }}
      />
      {erro !== undefined && <Text style={estilos.erro}>{erro}</Text>}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, padding: espacos.md },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  erro: { color: cores.erro, fontWeight: 'bold', marginTop: espacos.sm },
});