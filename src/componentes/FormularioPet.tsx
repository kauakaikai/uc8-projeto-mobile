import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Botao } from "./Botao";
import { Campo } from "./Campo";
import { espacos } from "../tema/tema";

export interface DadosPet {
  nome: string;
  raca: string;
}

interface FormularioPetProps {
  aoAdicionar: (dados: DadosPet) => void;
}

export function FormularioPet({ aoAdicionar }: FormularioPetProps) {
  const [nome, setNome] = useState("");
  const [raca, setRaca] = useState("");
  const [tocado, setTocado] = useState(false);

  const nomeVazio = nome.trim() === "";
  const erroNome = tocado && nomeVazio ? "Informe o nome" : undefined;

  function mudarNome(texto: string) {
    setTocado(true);
    setNome(texto);
  }

  function enviar() {
    aoAdicionar({ nome: nome.trim(), raca });
    setNome("");
    setRaca("");
    setTocado(false);
  }

  return (
    <View style={estilos.formulario}>
      <Campo rotulo="Nome" valor={nome} aoMudar={mudarNome} erro={erroNome} />
      <Campo rotulo="Raça (opcional)" valor={raca} aoMudar={setRaca} />
      <View style={estilos.acoes}>
        <Botao titulo="Adicionar" onPress={enviar} desabilitado={nomeVazio} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  formulario: { marginBottom: espacos.md },
  acoes: { flexDirection: "row", marginTop: espacos.sm },
});
