import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Botao } from '../componentes/Botao';
import { CartaoPet } from '../componentes/CartaoPet';
import { usePets } from '../contexto/PetsContexto';
import type { RotasDaPilha } from '../navegacao/tipos';
import { cores, espacos, larguraLarga } from '../tema/tema';

type TelaPetsProps = NativeStackScreenProps<RotasDaPilha, 'Pets'>;

export function TelaPets({ navigation }: TelaPetsProps) {
  const { estado, recarregar } = usePets();
  const { width } = useWindowDimensions();
  const duasColunas = width >= larguraLarga;

  function conteudo() {
    switch (estado.tipo) {
      case 'carregando':
        return (
          <View style={estilos.centro}>
            <ActivityIndicator size="large" />
            <Text>Carregando os pets...</Text>
          </View>
        );
      case 'erro':
        return (
          <View style={estilos.centro}>
            <Text style={estilos.erro}>Não foi possível carregar os pets.</Text>
            <Text style={estilos.detalheDoErro}>{estado.mensagem}</Text>
            <View style={estilos.barra}>
              <Botao titulo="Tentar de novo" onPress={recarregar} />
            </View>
          </View>
        );
      case 'pronto':
        return (
          <>
            {estado.origem === 'aparelho' && (
              <Text style={estilos.aviso}>Mostrando os pets guardados no aparelho: {estado.motivo}</Text>
            )}
            {estado.pendentes.length > 0 && (
              <Text style={estilos.aviso}>
                A enviar ({estado.pendentes.length}): {estado.pendentes.map((pendente) => pendente.nome).join(', ')}
              </Text>
            )}
            <FlatList
              key={duasColunas ? 'duas' : 'uma'}
              data={estado.pets}
              numColumns={duasColunas ? 2 : 1}
              columnWrapperStyle={duasColunas ? estilos.linhaDeColunas : undefined}
              keyExtractor={(pet) => String(pet.id)}
              renderItem={({ item }) => (
                <View style={estilos.celula}>
                  <CartaoPet pet={item} />
                  <View style={estilos.acoesDoCartao}>
                    <Pressable onPress={() => navigation.navigate('DetalhePet', { id: item.id })}>
                      <Text style={estilos.detalhes}>Ver detalhes</Text>
                    </Pressable>
                    <Pressable onPress={() => navigation.navigate('EditarPet', { id: item.id })}>
                      <Text style={estilos.detalhes}>Editar</Text>
                    </Pressable>
                  </View>
                </View>
              )}
              ListEmptyComponent={<Text>Nenhum pet cadastrado.</Text>}
            />
          </>
        );
    }
  }

  return (
    <View style={estilos.tela}>
      <View style={estilos.barra}>
        <Botao titulo="Recarregar" variante="secundario" onPress={recarregar} />
        <Botao titulo="Novo pet" onPress={() => navigation.navigate('NovoPet')} />
      </View>
      {conteudo()}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, padding: espacos.md },
  barra: { flexDirection: 'row', gap: espacos.sm, marginBottom: espacos.md },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: espacos.sm },
  erro: { color: cores.erro, fontWeight: 'bold' },
  aviso: { color: cores.alerta, marginBottom: espacos.sm },
  detalheDoErro: { color: cores.textoSecundario, textAlign: 'center' },
  linhaDeColunas: { gap: espacos.sm },
  celula: { flex: 1 },
  acoesDoCartao: { flexDirection: 'row', gap: espacos.md },
  detalhes: { color: cores.primaria, fontWeight: 'bold', marginBottom: espacos.md },
});