import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Botao } from './Botao';
import { Campo } from './Campo';
import { SeletorEspecie } from './SeletorEspecie';
import { espacos } from '../tema/tema';
import type { Especie } from '../tipos/entidades';

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

export function FormularioPet({ aoAdicionar, inicial, rotuloDoBotao = 'Adicionar' }: FormularioPetProps) {
  const [nome, setNome] = useState(inicial?.nome ?? '');
  const [raca, setRaca] = useState(inicial?.raca ?? '');
  const [especie, setEspecie] = useState<Especie>(inicial?.especie ?? 'cachorro');
  const [tocado, setTocado] = useState(false);

  const nomeVazio = nome.trim() === '';
  const erroNome = tocado && nomeVazio ? 'Informe o nome' : undefined;

  function mudarNome(texto: string) {
    setTocado(true);
    setNome(texto);
  }

  function enviar() {
    // O formulário não conhece a lista: quem a guarda define o id.
    aoAdicionar({ nome: nome.trim(), raca, especie });
    if (inicial === undefined) {
      setNome('');
      setRaca('');
      setEspecie('cachorro');
      setTocado(false);
    }
  }

  return (
    <View style={estilos.formulario}>
      <Campo rotulo="Nome" valor={nome} aoMudar={mudarNome} erro={erroNome} />
      <SeletorEspecie valor={especie} aoMudar={setEspecie} />
      <Campo rotulo="Raça (opcional)" valor={raca} aoMudar={setRaca} />
      <View style={estilos.acoes}>
        <Botao titulo={rotuloDoBotao} onPress={enviar} desabilitado={nomeVazio} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  formulario: { marginBottom: espacos.md },
  acoes: { flexDirection: 'row', marginTop: espacos.sm },
});