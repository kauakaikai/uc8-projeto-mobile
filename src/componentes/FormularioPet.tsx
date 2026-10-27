import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export interface DadosPet {
  nome: string;
  raca: string;
}

interface FormularioPetProps {
  aoAdicionar: (dados: DadosPet) => void;
}

export function FormularioPet({ aoAdicionar }: FormularioPetProps) {
  const [nome, setNome] = useState('');
  const [raca, setRaca] = useState('');

  function enviar() {
    aoAdicionar({ nome, raca });
    setNome('');
    setRaca('');
  }

  return (
    <View style={estilos.formulario}>
      <TextInput
        style={estilos.campo}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={estilos.campo}
        placeholder="Raça (opcional)"
        value={raca}
        onChangeText={setRaca}
      />
      <Pressable style={estilos.botao} onPress={enviar}>
        <Text style={estilos.textoBotao}>Adicionar</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  formulario: { marginBottom: 16 },
  campo: { backgroundColor: '#fff', borderRadius: 6, padding: 10, marginBottom: 8 },
  botao: { backgroundColor: '#004A8D', borderRadius: 6, padding: 12, alignItems: 'center' },
  textoBotao: { color: '#fff', fontWeight: 'bold' },
});