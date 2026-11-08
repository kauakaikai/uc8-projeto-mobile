import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Botao } from "../componentes/Botao";
import { CartaoPet } from "../componentes/CartaoPet";
import type { RotasDaPilha } from "../navegacao/tipos";
import { carregarPets } from "../servicos/pets";
import { cores, espacos, larguraLarga } from "../tema/tema";
import type { Pet } from "../tipos/entidades";

type TelaPetsProps = NativeStackScreenProps<RotasDaPilha, "Pets">;

export function TelaPets({ navigation }: TelaPetsProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [tentativa, setTentativa] = useState(0);
  const { width } = useWindowDimensions();
  const duasColunas = width >= larguraLarga;

  // Recarrega sempre que a tela volta ao foco (ao voltar do cadastro, o pet novo aparece).
  useFocusEffect(
    useCallback(() => {
      let cancelado = false;
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

  function recarregar() {
    setCarregando(true);
    setTentativa(tentativa + 1);
  }

  return (
    <View style={estilos.tela}>
      <View style={estilos.barra}>
        <Botao titulo="Recarregar" variante="secundario" onPress={recarregar} />
        <Botao
          titulo="Novo pet"
          onPress={() => navigation.navigate("NovoPet")}
        />
      </View>
      {carregando ? (
        <View style={estilos.centro}>
          <ActivityIndicator size="large" />
          <Text>Carregando os pets...</Text>
        </View>
      ) : (
        <FlatList
          key={duasColunas ? "duas" : "uma"}
          data={pets}
          numColumns={duasColunas ? 2 : 1}
          columnWrapperStyle={duasColunas ? estilos.linhaDeColunas : undefined}
          keyExtractor={(pet) => String(pet.id)}
          renderItem={({ item }) => (
            <View style={estilos.celula}>
              <CartaoPet pet={item} />
              <Pressable
                onPress={() =>
                  navigation.navigate("DetalhePet", { id: item.id })
                }
              >
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
  tela: { flex: 1, backgroundColor: cores.fundo, padding: espacos.md },
  barra: { flexDirection: "row", gap: espacos.sm, marginBottom: espacos.md },
  centro: { flex: 1, alignItems: "center", justifyContent: "center" },
  linhaDeColunas: { gap: espacos.sm },
  celula: { flex: 1 },
  detalhes: {
    color: cores.primaria,
    fontWeight: "bold",
    marginBottom: espacos.md,
  },
});
