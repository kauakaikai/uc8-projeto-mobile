import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Pet } from '../types/entidades';

interface CartaoPetProps {
  pet: Pet;
}

export function CartaoPet({ pet }: CartaoPetProps) {
  const [mostrarRaca, setMostrarRaca] = useState(false);

  return (
    <View style={estilos.cartao}>
      <Text style={estilos.nome}>{pet.nome}</Text>
      <Text style={estilos.especie}>{pet.especie}</Text>
      <Pressable onPress={() => setMostrarRaca(!mostrarRaca)}>
        <Text style={estilos.acao}>{mostrarRaca ? 'Esconder raça' : 'Ver raça'}</Text>
      </Pressable>
      {mostrarRaca && <Text style={estilos.raca}>{pet.raca ?? 'Raça não informada'}</Text>}
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12 },
  nome: { fontSize: 18, fontWeight: 'bold' },
  especie: { color: '#5B6B7C' },
  acao: { color: '#004A8D', marginTop: 8 },
  raca: { marginTop: 8 },
});