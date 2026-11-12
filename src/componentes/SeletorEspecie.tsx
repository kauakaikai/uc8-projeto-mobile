import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores, espacos, raio } from '../tema/tema';
import type { Especie } from '../tipos/entidades';

const ESPECIES: Especie[] = ['cachorro', 'gato', 'ave', 'outro'];

interface SeletorEspecieProps {
  valor: Especie;
  aoMudar: (especie: Especie) => void;
}

export function SeletorEspecie({ valor, aoMudar }: SeletorEspecieProps) {
  return (
    <View style={estilos.grupo}>
      <Text style={estilos.rotulo}>Espécie</Text>
      <View style={estilos.opcoes}>
        {ESPECIES.map((especie) => {
          const selecionada = especie === valor;
          return (
            <Pressable
              key={especie}
              accessibilityRole="button"
              accessibilityState={{ selected: selecionada }}
              onPress={() => aoMudar(especie)}
              style={[estilos.opcao, selecionada && estilos.opcaoSelecionada]}
            >
              <Text style={[estilos.texto, selecionada && estilos.textoSelecionado]}>{especie}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: { marginBottom: espacos.sm },
  rotulo: { color: cores.textoSecundario, marginBottom: espacos.xs },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: espacos.sm },
  opcao: {
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.primaria,
    borderRadius: raio,
    paddingHorizontal: espacos.md,
    paddingVertical: espacos.sm,
  },
  opcaoSelecionada: { backgroundColor: cores.primaria },
  texto: { color: cores.primaria, fontWeight: 'bold' },
  textoSelecionado: { color: cores.textoClaro },
});