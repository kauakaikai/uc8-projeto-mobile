import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FormularioPet, type DadosPet } from "../componentes/FormularioPet";
import { usePets } from "../contexto/PetsContexto";
import { registrarErro } from "../erros/erros";
import type { RotasDaPilha } from "../navegacao/tipos";
import { cores, espacos } from "../tema/tema";

type TelaNovoPetProps = NativeStackScreenProps<RotasDaPilha, "NovoPet">;

export function TelaNovoPet({ navigation }: TelaNovoPetProps) {
  const { incluir } = usePets();
  const [erro, setErro] = useState<string | undefined>(undefined);

  function adicionar(dados: DadosPet) {
    setErro(undefined);
    incluir(dados)
      .then(() => {
        navigation.goBack();
      })
      .catch((falha: unknown) => {
        setErro(registrarErro("cadastro", falha).mensagem);
      });
  }

  return (
    <View style={estilos.tela}>
      <FormularioPet aoAdicionar={adicionar} />
      {erro !== undefined && <Text style={estilos.erro}>{erro}</Text>}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, padding: espacos.md },
  erro: { color: cores.erro, fontWeight: "bold", marginTop: espacos.sm },
});
