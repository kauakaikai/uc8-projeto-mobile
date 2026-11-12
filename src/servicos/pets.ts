import type { Especie, Pet } from '../tipos/entidades';

export interface DadosNovoPet {
  nome: string;
  raca: string;
  especie: Especie;
}

interface PetRemoto {
  id: number;
  nome: string;
  especie: Especie;
  raca: string | null;
  cliente_id: number;
}

interface CorpoDeEscrita {
  nome: string;
  especie: Especie;
  raca: string | null;
  cliente_id?: number;
}

export class ErroDaApi extends Error {
  readonly status: number;

  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.name = 'ErroDaApi';
    this.status = status;
  }
}

export function descreverErro(erro: unknown): string {
  if (erro instanceof ErroDaApi) {
    return `A API respondeu ${erro.status}: ${erro.message}`;
  }
  if (erro instanceof Error) {
    return erro.message;
  }
  return 'Erro desconhecido';
}

function ehMensagemDeErro(valor: unknown): valor is { message: string } {
  return typeof valor === 'object' && valor !== null && typeof (valor as Record<string, unknown>).message === 'string';
}

async function lerMensagemDeErro(resposta: Response): Promise<string> {
  const corpo: unknown = await resposta.json().catch(() => undefined);
  return ehMensagemDeErro(corpo) ? corpo.message : 'sem detalhe no corpo da resposta';
}

function configuracao(): { url: string; chave: string } {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const chave = process.env.EXPO_PUBLIC_SUPABASE_KEY;
  if (url === undefined || chave === undefined) {
    throw new Error('Defina EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_KEY em .env.local');
  }
  return { url, chave };
}

function ehEspecie(valor: unknown): valor is Especie {
  return valor === 'cachorro' || valor === 'gato' || valor === 'ave' || valor === 'outro';
}

function ehPetRemoto(valor: unknown): valor is PetRemoto {
  if (typeof valor !== 'object' || valor === null) {
    return false;
  }
  const campos = valor as Record<string, unknown>;
  return (
    typeof campos.id === 'number' &&
    typeof campos.nome === 'string' &&
    ehEspecie(campos.especie) &&
    typeof campos.cliente_id === 'number' &&
    (campos.raca === null || typeof campos.raca === 'string')
  );
}

function ehListaDePets(valor: unknown): valor is PetRemoto[] {
  return Array.isArray(valor) && valor.every(ehPetRemoto);
}

function paraPet(remoto: PetRemoto): Pet {
  return {
    id: remoto.id,
    nome: remoto.nome,
    especie: remoto.especie,
    raca: remoto.raca ?? undefined,
    clienteId: remoto.cliente_id,
  };
}

async function requisitar(caminho: string, metodo: 'GET' | 'POST' | 'PATCH' = 'GET', corpo?: CorpoDeEscrita): Promise<unknown> {
  const { url, chave } = configuracao();
  const resposta = await fetch(`${url}/rest/v1/${caminho}`, {
    method: metodo,
    headers: { apikey: chave, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  if (!resposta.ok) {
    throw new ErroDaApi(resposta.status, await lerMensagemDeErro(resposta));
  }
  return resposta.json();
}

export async function carregarPets(): Promise<Pet[]> {
  const corpo = await requisitar('pets?select=*&order=id.desc');
  if (!ehListaDePets(corpo)) {
    throw new Error('Resposta inesperada da API');
  }
  return corpo.map(paraPet);
}

export async function buscarPet(id: number): Promise<Pet | undefined> {
  const corpo = await requisitar(`pets?select=*&id=eq.${id}`);
  if (!ehListaDePets(corpo)) {
    throw new Error('Resposta inesperada da API');
  }
  return corpo.map(paraPet)[0];
}

export async function incluirPet(dados: DadosNovoPet): Promise<Pet> {
  const corpo = await requisitar('pets?select=*', 'POST', {
    nome: dados.nome,
    especie: dados.especie,
    raca: dados.raca === '' ? null : dados.raca,
    cliente_id: 1,
  });
  if (!ehListaDePets(corpo) || corpo.length !== 1) {
    throw new Error('Resposta inesperada da API');
  }
  return paraPet(corpo[0]);
}

export async function atualizarPet(id: number, dados: DadosNovoPet): Promise<Pet> {
  const corpo = await requisitar(`pets?select=*&id=eq.${id}`, 'PATCH', {
    nome: dados.nome,
    especie: dados.especie,
    raca: dados.raca === '' ? null : dados.raca,
  });
  if (!ehListaDePets(corpo) || corpo.length !== 1) {
    throw new Error('Resposta inesperada da API');
  }
  return paraPet(corpo[0]);
}