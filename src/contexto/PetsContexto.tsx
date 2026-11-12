import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { atualizarLocal, guardarLocal, guardarPendente, listarLocal, listarPendentes, removerPendente, type Pendente } from '../banco/banco';
import { ErroDeValidacao, registrarErro } from '../erros/erros';
import { ErroDaApi, atualizarPet, carregarPets, incluirPet, type DadosNovoPet } from '../servicos/pets';
import type { Pet } from '../tipos/entidades';

export type EstadoPets =
  | { tipo: 'carregando' }
  | { tipo: 'erro'; mensagem: string }
  | { tipo: 'pronto'; pets: Pet[]; pendentes: Pendente[]; origem: 'nuvem' }
  | { tipo: 'pronto'; pets: Pet[]; pendentes: Pendente[]; origem: 'aparelho'; motivo: string };

interface ValorDosPets {
  estado: EstadoPets;
  recarregar: () => void;
  incluir: (dados: DadosNovoPet) => Promise<void>;
  atualizar: (id: number, dados: DadosNovoPet) => Promise<void>;
  buscar: (id: number) => Pet | undefined;
}

const PetsContexto = createContext<ValorDosPets | undefined>(undefined);

export function PetsProvedor({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoPets>({ tipo: 'carregando' });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setEstado({ tipo: 'carregando' });
    sincronizar()
      .catch((erro: unknown) => {
        registrarErro('sincronizar', erro);
      })
      .then(() => carregarPets())
      .then(async (pets) => {
        const pendentes = await listarPendentes().catch((erro: unknown) => {
          registrarErro('pendentes', erro);
          return [];
        });
        if (!cancelado) {
          setEstado({ tipo: 'pronto', pets, pendentes, origem: 'nuvem' });
        }
        guardarLocal(pets).catch((erro: unknown) => {
          registrarErro('guardar no aparelho', erro);
        });
      })
      .catch((erro: unknown) => {
        const motivo = registrarErro('carga', erro).mensagem;
        Promise.all([listarLocal(), listarPendentes()])
          .then(([guardados, pendentes]) => {
            if (cancelado) {
              return;
            }
            if (guardados.length > 0 || pendentes.length > 0) {
              setEstado({ tipo: 'pronto', pets: guardados, pendentes, origem: 'aparelho', motivo });
            } else {
              setEstado({ tipo: 'erro', mensagem: motivo });
            }
          })
          .catch((erroLocal: unknown) => {
            if (!cancelado) {
              setEstado({ tipo: 'erro', mensagem: registrarErro('leitura do aparelho', erroLocal).mensagem });
            }
          });
      });
    return () => {
      cancelado = true;
    };
  }, [tentativa]);

  function recarregar() {
    setTentativa(tentativa + 1);
  }

  // Envia os cadastros feitos sem rede. Recusa da API: descarta (repetir não muda a resposta).
  // Falta de rede: para e deixa os pendentes para a próxima vez.
  async function sincronizar(): Promise<void> {
    for (const pendente of await listarPendentes()) {
      try {
        await incluirPet(pendente);
      } catch (erro: unknown) {
        if (erro instanceof ErroDaApi) {
          registrarErro('pendente descartado', erro);
        } else {
          return;
        }
      }
      await removerPendente(pendente.id);
    }
  }

  async function incluir(dados: DadosNovoPet): Promise<void> {
    if (dados.nome.trim() === '') {
      throw new ErroDeValidacao('Informe o nome.');
    }
    try {
      const novo = await incluirPet(dados);
      setEstado((atual) => (atual.tipo === 'pronto' ? { ...atual, pets: [novo, ...atual.pets] } : atual));
    } catch (erro: unknown) {
      if (erro instanceof ErroDaApi) {
        throw erro;
      }
      const pendente = await guardarPendente(dados);
      setEstado((atual) => (atual.tipo === 'pronto' ? { ...atual, pendentes: [...atual.pendentes, pendente] } : atual));
    }
  }

  // Editar exige conexão: sem rede o erro sobe para a tela (não há fila de edição).
  async function atualizar(id: number, dados: DadosNovoPet): Promise<void> {
    if (dados.nome.trim() === '') {
      throw new ErroDeValidacao('Informe o nome.');
    }
    const atualizado = await atualizarPet(id, dados);
    setEstado((atual) =>
      atual.tipo === 'pronto' ? { ...atual, pets: atual.pets.map((pet) => (pet.id === id ? atualizado : pet)) } : atual,
    );
    atualizarLocal(atualizado).catch((erro: unknown) => {
      registrarErro('atualizar no aparelho', erro);
    });
  }

  function buscar(id: number): Pet | undefined {
    return estado.tipo === 'pronto' ? estado.pets.find((pet) => pet.id === id) : undefined;
  }

  return <PetsContexto.Provider value={{ estado, recarregar, incluir, atualizar, buscar }}>{children}</PetsContexto.Provider>;
}

export function usePets(): ValorDosPets {
  const valor = useContext(PetsContexto);
  if (valor === undefined) {
    throw new Error('usePets só funciona dentro de PetsProvedor');
  }
  return valor;
}