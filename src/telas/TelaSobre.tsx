import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { contarLocal } from '../banco/banco';

export function TelaSobre() {
  const [totalLocal, setTotalLocal] = useState<number | null>(null);

  useEffect(() => {
    contarLocal()
      .then(setTotalLocal)
      .catch(() => setTotalLocal(null));
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.paw}>🐾</Text>
        <Text style={styles.title}>PetCare</Text>
        <Text style={styles.subtitle}>Sua clínica com carinho de verdade</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Sobre o aplicativo</Text>
        <Text style={styles.body}>
          A PetCare é um aplicativo de apoio à gestão veterinária. Ele reúne
          o cadastro de tutores, o cadastro de pets, o histórico de consultas
          e a busca de animais.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Tecnologias utilizadas</Text>
        <Text style={styles.body}>• React Native, Expo e TypeScript</Text>
        <Text style={styles.body}>• API Node.js e Express</Text>
        <Text style={styles.body}>• PostgreSQL hospedado no Neon</Text>
        <Text style={styles.body}>• API publicada no Render</Text>
        <Text style={styles.body}>• SQLite para armazenamento local legado</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Armazenamento local</Text>
        <Text style={styles.body}>
          Registros de pets encontrados no banco local: {
            totalLocal === null ? 'indisponível' : totalLocal
          }
        </Text>
        <Text style={styles.note}>
          Esta contagem representa somente a tabela local de pets existente.
          Ela não significa que todos os módulos já estejam disponíveis offline.
        </Text>
      </View>

      <Text style={styles.footer}>PetCare Mobile · Projeto acadêmico UC8</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 36, gap: 14 },
  hero: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#EAF4ED',
    borderRadius: 20,
  },
  paw: { fontSize: 42 },
  title: { color: '#205B3B', fontSize: 30, fontWeight: '900', marginTop: 4 },
  subtitle: { color: '#617568', fontWeight: '600', marginTop: 4 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DCE9DF',
  },
  heading: { color: '#205B3B', fontSize: 17, fontWeight: '800', marginBottom: 10 },
  body: { color: '#34463A', fontSize: 14, lineHeight: 22 },
  note: { color: '#7B6252', fontSize: 12, lineHeight: 18, marginTop: 8 },
  footer: { color: '#829187', textAlign: 'center', fontSize: 12, marginTop: 8 },
});
