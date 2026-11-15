import { StyleSheet, Text, TextInput, View } from "react-native";
import type { KeyboardTypeOptions } from "react-native";
import { cores, espacos } from "../tema/tema";

interface CampoProps {
  rotulo: string;
  valor: string;
  aoMudar: (texto: string) => void;
  erro?: string;
  tipoDeTeclado?: KeyboardTypeOptions;
  teclado?: KeyboardTypeOptions;
  placeholder?: string;
  multiline?: boolean;
}

export function Campo({
  rotulo,
  valor,
  aoMudar,
  erro,
  tipoDeTeclado = "default",
  teclado,
  placeholder,
  multiline = false,
}: CampoProps) {
  return (
    <View style={estilos.grupo}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <TextInput
        style={[
          estilos.entrada,
          multiline && estilos.multilinha,
          erro !== undefined && estilos.entradaComErro,
        ]}
        value={valor}
        onChangeText={aoMudar}
        keyboardType={teclado ?? tipoDeTeclado}
        autoCapitalize={
          (teclado ?? tipoDeTeclado) === "email-address" ? "none" : "sentences"
        }
        placeholder={placeholder}
        placeholderTextColor={cores.textoClaroSecundario}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
      {erro !== undefined && <Text style={estilos.erro}>{erro}</Text>}
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: { marginBottom: espacos.sm + 4 },
  rotulo: {
    color: cores.textoSecundario,
    marginBottom: espacos.xs,
    fontWeight: "700",
    fontSize: 13,
  },
  entrada: {
    minHeight: 46,
    backgroundColor: cores.fundo,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: cores.borda,
    paddingHorizontal: 13,
    paddingVertical: 10,
    color: cores.texto,
    fontSize: 15,
  },
  multilinha: { minHeight: 86 },
  entradaComErro: { borderColor: cores.erro },
  erro: { color: cores.erro, marginTop: espacos.xs },
});
