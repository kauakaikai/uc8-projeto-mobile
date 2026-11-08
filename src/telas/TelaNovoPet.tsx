import { StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FormularioPet, type DadosPet } from "../componentes/FormularioPet";
import type { RotasDaPilha } from "../navegacao/tipos";
import { incluirPet } from "../servicos/pets";
import { cores, espacos } from "../tema/tema";

type TelaNovoPetProps = NativeStackScreenProps<RotasDaPilha, "NovoPet">;

export function TelaNovoPet({ navigation }: TelaNovoPetProps) {
  function adicionar(dados: DadosPet) {
    incluirPet(dados);
    navigation.goBack();
  }

  return (
    <View style={estilos.tela}>
      <FormularioPet aoAdicionar={adicionar} />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, padding: espacos.md },
});
