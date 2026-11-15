import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Botao } from "./Botao";
import { Campo } from "./Campo";
import { cores, espacos, raio } from "../tema/tema";
import type { Especie } from "../tipos/entidades";

export interface DadosPet {
  nome: string;
  raca: string;
  especie: Especie;
}

interface FormularioPetProps {
  aoAdicionar: (dados: DadosPet) => void;
  inicial?: DadosPet;
  rotuloDoBotao?: string;
}

const ESPECIES: Especie[] = ["cachorro", "gato", "ave", "outro"];

export function FormularioPet({
  aoAdicionar,
  inicial,
  rotuloDoBotao = "Adicionar",
}: FormularioPetProps) {
  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [raca, setRaca] = useState(inicial?.raca ?? "");
  const [especie, setEspecie] = useState<Especie>(
    inicial?.especie ?? "cachorro",
  );
  const [tocado, setTocado] = useState(false);

  const nomeVazio = nome.trim() === "";
  const erroNome = tocado && nomeVazio ? "Informe o nome" : undefined;

  function mudarNome(texto: string) {
    setTocado(true);
    setNome(texto);
  }

  function enviar() {
    aoAdicionar({
      nome: nome.trim(),
      raca,
      especie,
    });

    if (inicial === undefined) {
      setNome("");
      setRaca("");
      setEspecie("cachorro");
      setTocado(false);
    }
  }

  return (
    <View style={estilos.formulario}>
      <Campo rotulo="Nome" valor={nome} aoMudar={mudarNome} erro={erroNome} />

      <View style={estilos.grupo}>
        <Text style={estilos.rotulo}>Espécie</Text>

        <View style={estilos.opcoes}>
          {ESPECIES.map((item) => {
            const selecionada = item === especie;

            return (
              <Pressable
                key={item}
                onPress={() => setEspecie(item)}
                style={[estilos.opcao, selecionada && estilos.opcaoSelecionada]}
              >
                <Text
                  style={[
                    estilos.textoOpcao,
                    selecionada && estilos.textoSelecionado,
                  ]}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Campo rotulo="Raça (opcional)" valor={raca} aoMudar={setRaca} />

      <View style={estilos.acoes}>
        <Botao
          titulo={rotuloDoBotao}
          onPress={enviar}
          desabilitado={nomeVazio}
        />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  formulario: {
    marginBottom: espacos.md,
  },

  grupo: {
    marginBottom: espacos.sm,
  },

  rotulo: {
    color: cores.textoSecundario,
    marginBottom: espacos.xs,
  },

  opcoes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: espacos.sm,
  },

  opcao: {
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.primaria,
    borderRadius: raio,
    paddingHorizontal: espacos.md,
    paddingVertical: espacos.sm,
  },

  opcaoSelecionada: {
    backgroundColor: cores.primaria,
  },

  textoOpcao: {
    color: cores.primaria,
    fontWeight: "bold",
  },

  textoSelecionado: {
    color: cores.textoClaro,
  },

  acoes: {
    flexDirection: "row",
    marginTop: espacos.sm,
  },
});
