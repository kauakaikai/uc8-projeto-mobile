import { StyleSheet, Text, View } from 'react-native';
import type { Pet } from '../types/entidades';

interface CartaoPetProps {
  pet: Pet;
}

export function CartaoPet({ pet }: CartaoPetProps) {
  return (
    <View style={estilos.cartao}>
      <Text style={estilos.nome}>{pet.nome}</Text>
      <Text style={estilos.especie}>{pet.especie}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12 },
  nome: { fontSize: 18, fontWeight: 'bold' },
  especie: { color: '#5B6B7C' },
});