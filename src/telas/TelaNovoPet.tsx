import { StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FormularioPet, type DadosPet } from "../componentes/FormularioPet";
import { usePets } from "../contexto/PetsContexto";
import type { RotasDaPilha } from "../navegacao/tipos";
import { cores, espacos } from "../tema/tema";

type TelaNovoPetProps = NativeStackScreenProps<RotasDaPilha, "NovoPet">;

export function TelaNovoPet({ navigation }: TelaNovoPetProps) {
  const { incluir } = usePets();

  function adicionar(dados: DadosPet) {
    incluir(dados).then(() => {
      navigation.goBack();
    });
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
