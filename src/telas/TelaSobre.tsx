import { StyleSheet, Text, View } from 'react-native';

export function TelaSobre() {
  return (
    <View style={estilos.tela}>
      <Text style={estilos.titulo}>PetCare</Text>
      <Text>Aplicativo da UC8: lista, cadastro e detalhe de pets de uma clínica veterinária.</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#F6F8FA', padding: 16 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
});