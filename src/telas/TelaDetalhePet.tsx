import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RotasDaPilha } from "../navegacao/tipos";
import { buscarPet } from "../servicos/pets";
import { cores, espacos } from "../tema/tema";
import type { Pet } from "../tipos/entidades";

type TelaDetalhePetProps = NativeStackScreenProps<RotasDaPilha, "DetalhePet">;

export function TelaDetalhePet({ route }: TelaDetalhePetProps) {
  const { id } = route.params;
  const [pet, setPet] = useState<Pet | undefined>(undefined);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    buscarPet(id).then((resultado) => {
      if (cancelado) {
        return;
      }
      setPet(resultado);
      setCarregando(false);
    });
    return () => {
      cancelado = true;
    };
  }, [id]);

  if (carregando) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" />
        <Text>Carregando o pet...</Text>
      </View>
    );
  }

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
      <Text style={estilos.raca}>{pet.raca ?? "Raça não informada"}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, padding: espacos.md },
  centro: { flex: 1, alignItems: "center", justifyContent: "center" },
  nome: { fontSize: 24, fontWeight: "bold" },
  especie: { color: cores.textoSecundario, marginBottom: espacos.md },
  raca: { marginBottom: espacos.md },
});
