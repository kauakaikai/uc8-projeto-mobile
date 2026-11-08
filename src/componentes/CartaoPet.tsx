import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { cores, espacos, raio } from "../tema/tema";
import type { Pet } from "../tipos/entidades";

interface CartaoPetProps {
  pet: Pet;
}

export function CartaoPet({ pet }: CartaoPetProps) {
  const [mostrarRaca, setMostrarRaca] = useState(false);

  return (
    <View style={estilos.cartao}>
      <View style={estilos.linha}>
        <View style={estilos.coluna}>
          <Text style={estilos.nome}>{pet.nome}</Text>
        </View>
        <View style={estilos.etiqueta}>
          <Text style={estilos.textoEtiqueta}>{pet.especie}</Text>
        </View>
      </View>
      <Pressable onPress={() => setMostrarRaca(!mostrarRaca)}>
        <Text style={estilos.acao}>
          {mostrarRaca ? "Esconder raça" : "Ver raça"}
        </Text>
      </Pressable>
      {mostrarRaca && (
        <Text style={estilos.raca}>{pet.raca ?? "Raça não informada"}</Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raio,
    padding: espacos.md,
    marginBottom: espacos.sm,
  },
  linha: { flexDirection: "row", alignItems: "flex-start", gap: espacos.sm },
  coluna: { flex: 1 },
  nome: { fontSize: 18, fontWeight: "bold", color: cores.texto },
  etiqueta: {
    backgroundColor: cores.primaria,
    borderRadius: raio,
    paddingHorizontal: espacos.sm,
    paddingVertical: espacos.xs,
  },
  textoEtiqueta: { color: cores.textoClaro, fontWeight: "bold" },
  acao: { color: cores.primaria, marginTop: espacos.sm },
  raca: { marginTop: espacos.sm, color: cores.texto },
});
