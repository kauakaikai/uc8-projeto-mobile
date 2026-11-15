import type { Especie, Pet } from "../tipos/entidades";
import { ErroDaApi, petCareApi, type Pet as PetRemoto } from "./petcareApi";

export interface DadosNovoPet {
  nome: string;
  raca: string;
  especie: Especie;
  clienteId?: number;
}

export { ErroDaApi };

export function descreverErro(erro: unknown): string {
  if (erro instanceof ErroDaApi)
    return `A API respondeu ${erro.status}: ${erro.message}`;
  if (erro instanceof Error) return erro.message;
  return "Erro desconhecido";
}

function paraPet(remoto: PetRemoto): Pet {
  return {
    id: remoto.id,
    nome: remoto.nome,
    especie: remoto.especie as Especie,
    raca: remoto.raca ?? undefined,
    clienteId: remoto.id_cliente,
  };
}

export async function carregarPets(): Promise<Pet[]> {
  return (await petCareApi.listarPets()).map(paraPet);
}

export async function buscarPet(id: number): Promise<Pet | undefined> {
  return (await petCareApi.listarPets())
    .map(paraPet)
    .find((pet) => pet.id === id);
}

export async function incluirPet(dados: DadosNovoPet): Promise<Pet> {
  const novo = await petCareApi.criarPet({
    nome: dados.nome.trim(),
    especie: dados.especie,
    raca: dados.raca.trim(),
    id_cliente: dados.clienteId ?? 1,
  });
  return paraPet(novo);
}

export async function atualizarPet(
  id: number,
  dados: DadosNovoPet,
): Promise<Pet> {
  const existente = await buscarPet(id);
  const atualizado = await petCareApi.atualizarPet(id, {
    nome: dados.nome.trim(),
    especie: dados.especie,
    raca: dados.raca.trim(),
    id_cliente: dados.clienteId ?? existente?.clienteId ?? 1,
  });
  return paraPet(atualizado);
}
