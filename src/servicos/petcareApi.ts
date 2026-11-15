export interface Cliente {
  id: number;
  nome: string;
  telefone: string | null;
  email: string | null;
}

export interface Pet {
  id: number;
  nome: string;
  especie: string;
  raca: string | null;
  id_cliente: number;
}

export interface Consulta {
  id: number;
  id_pet: number;
  data: string;
  hora: string;
  descricao_sintomas: string | null;
  valor: number;
}

export interface PetComTutor extends Pet {
  nome_cliente: string;
}

export interface NovoCliente { nome: string; telefone: string; email: string; }
export type NovoPet = Omit<Pet, 'id'>;
export type NovaConsulta = Omit<Consulta, 'id'>;

export class ErroDaApi extends Error {
  readonly status: number;

  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.name = 'ErroDaApi';
    this.status = status;
  }
}

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

async function requisitar<T>(caminho: string, metodo: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', corpo?: unknown): Promise<T> {
  if (!API_URL) {
    throw new Error('Configure EXPO_PUBLIC_API_URL no arquivo .env.local do aplicativo.');
  }

  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  } catch {
    throw new Error('Não foi possível alcançar o servidor PetCare. Confira se a API está ligada e se o celular está na mesma rede Wi-Fi do computador.');
  }

  if (!resposta.ok) {
    const detalhe: unknown = await resposta.json().catch(() => undefined);
    const mensagem = typeof detalhe === 'object' && detalhe !== null && 'message' in detalhe && typeof detalhe.message === 'string'
      ? detalhe.message
      : 'Não foi possível concluir a operação.';
    throw new ErroDaApi(resposta.status, mensagem);
  }

  if (resposta.status === 204) return undefined as T;
  return resposta.json() as Promise<T>;
}

export const petCareApi = {
  listarClientes: () => requisitar<Cliente[]>('/clientes'),
  criarCliente: (dados: NovoCliente) => requisitar<Cliente>('/clientes', 'POST', dados),
  atualizarCliente: (id: number, dados: NovoCliente) => requisitar<Cliente>(`/clientes/${id}`, 'PUT', dados),
  excluirCliente: (id: number) => requisitar<void>(`/clientes/${id}`, 'DELETE'),

  listarPets: (idCliente?: number) => requisitar<Pet[]>(`/pets${idCliente ? `?cliente_id=${idCliente}` : ''}`),
  criarPet: (dados: NovoPet) => requisitar<Pet>('/pets', 'POST', dados),
  atualizarPet: (id: number, dados: NovoPet) => requisitar<Pet>(`/pets/${id}`, 'PUT', dados),
  excluirPet: (id: number) => requisitar<void>(`/pets/${id}`, 'DELETE'),
  buscarPets: (termo: string) => requisitar<PetComTutor[]>(`/pets/buscar?termo=${encodeURIComponent(termo)}`),

  listarConsultas: (idPet: number) => requisitar<Consulta[]>(`/consultas?pet_id=${idPet}`),
  criarConsulta: (dados: NovaConsulta) => requisitar<Consulta>('/consultas', 'POST', dados),
  atualizarConsulta: (id: number, dados: NovaConsulta) => requisitar<Consulta>(`/consultas/${id}`, 'PUT', dados),
  excluirConsulta: (id: number) => requisitar<void>(`/consultas/${id}`, 'DELETE'),
};
