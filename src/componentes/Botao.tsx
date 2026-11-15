import { Pressable, StyleSheet, Text } from 'react-native';
import { cores, espacos } from '../tema/tema';

interface BotaoProps {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'perigo';
  desabilitado?: boolean;
}

export function Botao({ titulo, onPress, variante = 'primario', desabilitado = false }: BotaoProps) {
  const secundario = variante === 'secundario';
  const perigo = variante === 'perigo';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={desabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.base,
        secundario && estilos.secundario,
        perigo && estilos.perigo,
        pressed && estilos.pressionado,
        desabilitado && estilos.desabilitado,
      ]}
    >
      <Text style={[estilos.texto, secundario && estilos.textoSecundario]}>{titulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    flex: 1,
    minHeight: 42,
    backgroundColor: cores.primaria,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: espacos.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secundario: {
    backgroundColor: cores.superficie,
    borderWidth: 1.5,
    borderColor: cores.borda,
  },
  perigo: { backgroundColor: cores.vinho },
  pressionado: { opacity: 0.78 },
  desabilitado: { opacity: 0.45 },
  texto: { color: cores.textoClaro, fontWeight: '800', fontSize: 13 },
  textoSecundario: { color: cores.primariaEscura },
});
