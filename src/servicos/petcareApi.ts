import {
  concluirPendente,
  enfileirar,
  gravarCache,
  gravarUm,
  lerCache,
  listarFila,
  quantidadePendentes,
  removerDoCache,
  resolverId,
  salvarMapaId,
} from "../banco/persistenciaPetCare";

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

export interface NovoCliente {
  nome: string;
  telefone: string;
  email: string;
}
export type NovoPet = Omit<Pet, "id">;
export type NovaConsulta = Omit<Consulta, "id">;

export class ErroDaApi extends Error {
  readonly status: number;
  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.name = "ErroDaApi";
    this.status = status;
  }
}

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

async function requisitar<T>(
  caminho: string,
  metodo: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  corpo?: unknown,
): Promise<T> {
  if (!API_URL) {
    throw new Error("Configure EXPO_PUBLIC_API_URL no ambiente do aplicativo.");
  }

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), 15000);

  let resposta: Response;

  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
      signal: controlador.signal,
    });
  } catch {
    if (controlador.signal.aborted) {
      throw new Error(
        "A API PetCare demorou mais de 15 segundos para responder.",
      );
    }

    throw new Error("Não foi possível alcançar a API PetCare.");
  } finally {
    clearTimeout(temporizador);
  }

  if (!resposta.ok) {
    const detalhe: unknown = await resposta.json().catch(() => undefined);
    const mensagem =
      typeof detalhe === "object" &&
      detalhe !== null &&
      "message" in detalhe &&
      typeof detalhe.message === "string"
        ? detalhe.message
        : "Não foi possível concluir a operação.";

    throw new ErroDaApi(resposta.status, mensagem);
  }

  if (resposta.status === 204) return undefined as T;

  return resposta.json() as Promise<T>;
}

const remoto = {
  listarClientes: () => requisitar<Cliente[]>("/clientes"),
  criarCliente: (dados: NovoCliente) =>
    requisitar<Cliente>("/clientes", "POST", dados),
  atualizarCliente: (id: number, dados: NovoCliente) =>
    requisitar<Cliente>(`/clientes/${id}`, "PUT", dados),
  excluirCliente: (id: number) => requisitar<void>(`/clientes/${id}`, "DELETE"),

  listarPets: (idCliente?: number) =>
    requisitar<Pet[]>(
      `/pets${idCliente !== undefined ? `?cliente_id=${idCliente}` : ""}`,
    ),
  criarPet: (dados: NovoPet) => requisitar<Pet>("/pets", "POST", dados),
  atualizarPet: (id: number, dados: NovoPet) =>
    requisitar<Pet>(`/pets/${id}`, "PUT", dados),
  excluirPet: (id: number) => requisitar<void>(`/pets/${id}`, "DELETE"),
  buscarPets: (termo: string) =>
    requisitar<PetComTutor[]>(
      `/pets/buscar?termo=${encodeURIComponent(termo)}`,
    ),

  listarConsultas: (idPet: number) =>
    requisitar<Consulta[]>(`/consultas?pet_id=${idPet}`),
  criarConsulta: (dados: NovaConsulta) =>
    requisitar<Consulta>("/consultas", "POST", dados),
  atualizarConsulta: (id: number, dados: NovaConsulta) =>
    requisitar<Consulta>(`/consultas/${id}`, "PUT", dados),
  excluirConsulta: (id: number) =>
    requisitar<void>(`/consultas/${id}`, "DELETE"),
};

async function listarComCache<T>(
  entidade: "clientes" | "pets",
  buscar: () => Promise<T[]>,
): Promise<T[]> {
  try {
    const registros = await buscar();
    await gravarCache(entidade, registros as Array<T & { id: number }>);
    return registros;
  } catch (erro) {
    const locais = await lerCache<T>(entidade);
    if (locais.length) return locais;
    throw erro;
  }
}

async function criarComFila<T extends { id: number }>(
  entidade: "clientes" | "pets" | "consultas",
  dados: Record<string, unknown>,
  criar: (dados: Record<string, unknown>) => Promise<T>,
): Promise<T> {
  try {
    const criado = await criar(dados);
    await gravarUm(entidade, criado);
    return criado;
  } catch (erro) {
    // Só enfileira falhas de conexão. Erros HTTP (validação/conflito) devem aparecer ao usuário.
    if (erro instanceof ErroDaApi) throw erro;
    const id = await enfileirar(entidade, dados);
    return { ...dados, id } as T;
  }
}

export async function sincronizarPendentes(): Promise<number> {
  const fila = await listarFila();
  if (!fila.length) return 0;

  let sincronizados = 0;
  for (const item of fila) {
    const dados = { ...item.dados };
    if (item.entidade === "pets" && typeof dados.id_cliente === "number") {
      dados.id_cliente = await resolverId(dados.id_cliente);
      if ((dados.id_cliente as number) < 0) break;
    }
    if (item.entidade === "consultas" && typeof dados.id_pet === "number") {
      dados.id_pet = await resolverId(dados.id_pet);
      if ((dados.id_pet as number) < 0) break;
    }

    try {
      let criado: Cliente | Pet | Consulta;
      if (item.entidade === "clientes")
        criado = await remoto.criarCliente(dados as unknown as NovoCliente);
      else if (item.entidade === "pets")
        criado = await remoto.criarPet(dados as unknown as NovoPet);
      else
        criado = await remoto.criarConsulta(dados as unknown as NovaConsulta);

      await salvarMapaId(Number(item.dados.id), criado.id);
      await concluirPendente(item.id);
      await removerDoCache(item.entidade, Number(item.dados.id));
      await gravarUm(item.entidade, criado);
      sincronizados += 1;
    } catch {
      // Mantém esta operação e as seguintes na fila para nova tentativa.
      break;
    }
  }

  if (sincronizados > 0) {
    const [clientes, pets] = await Promise.all([
      remoto.listarClientes(),
      remoto.listarPets(),
    ]);
    await gravarCache("clientes", clientes);
    await gravarCache("pets", pets);
  }
  return sincronizados;
}

export const petCareApi = {
  listarClientes: () => listarComCache("clientes", remoto.listarClientes),
  criarCliente: (dados: NovoCliente) =>
    criarComFila(
      "clientes",
      dados as unknown as Record<string, unknown>,
      (payload) => remoto.criarCliente(payload as unknown as NovoCliente),
    ),
  atualizarCliente: async (id: number, dados: NovoCliente) => {
    const atualizado = await remoto.atualizarCliente(
      await resolverId(id),
      dados,
    );
    await gravarUm("clientes", atualizado);
    return atualizado;
  },
  excluirCliente: async (id: number) => {
    await remoto.excluirCliente(await resolverId(id));
    await removerDoCache("clientes", id);
  },

  listarPets: async (idCliente?: number) => {
    const lista = await listarComCache("pets", remoto.listarPets);
    if (idCliente === undefined) return lista;
    const idReal = await resolverId(idCliente);
    return lista.filter(
      (pet) => pet.id_cliente === idCliente || pet.id_cliente === idReal,
    );
  },
  criarPet: (dados: NovoPet) =>
    criarComFila(
      "pets",
      dados as unknown as Record<string, unknown>,
      (payload) => remoto.criarPet(payload as unknown as NovoPet),
    ),
  atualizarPet: async (id: number, dados: NovoPet) => {
    const payload = {
      ...dados,
      id_cliente: await resolverId(dados.id_cliente),
    };
    const atualizado = await remoto.atualizarPet(await resolverId(id), payload);
    await gravarUm("pets", atualizado);
    return atualizado;
  },
  excluirPet: async (id: number) => {
    await remoto.excluirPet(await resolverId(id));
    await removerDoCache("pets", id);
  },
  criarConsulta: (dados: NovaConsulta) =>
    criarComFila(
      "consultas",
      dados as unknown as Record<string, unknown>,
      (payload) => remoto.criarConsulta(payload as unknown as NovaConsulta),
    ),

  atualizarConsulta: async (id: number, dados: NovaConsulta) => {
    const payload = {
      ...dados,
      id_pet: await resolverId(dados.id_pet),
    };

    const atualizado = await remoto.atualizarConsulta(
      await resolverId(id),
      payload,
    );

    await gravarUm("consultas", atualizado);
    return atualizado;
  },

  excluirConsulta: async (id: number) => {
    await remoto.excluirConsulta(await resolverId(id));
    await removerDoCache("consultas", id);
  },
  buscarPets: async (termo: string) => {
    try {
      return await remoto.buscarPets(termo);
    } catch (erro) {
      const [pets, clientes] = await Promise.all([
        lerCache<Pet>("pets"),
        lerCache<Cliente>("clientes"),
      ]);
      const busca = termo.trim().toLocaleLowerCase("pt-BR");
      return pets
        .filter((pet) => {
          const tutor = clientes.find(
            (cliente) => cliente.id === pet.id_cliente,
          );
          return (
            pet.nome.toLocaleLowerCase("pt-BR").includes(busca) ||
            (tutor?.nome ?? "").toLocaleLowerCase("pt-BR").includes(busca)
          );
        })
        .map((pet) => ({
          ...pet,
          nome_cliente:
            clientes.find((cliente) => cliente.id === pet.id_cliente)?.nome ??
            "Tutor local",
        }));
    }
  },

  listarConsultas: async (idPet: number) => {
    const idReal = await resolverId(idPet);

    try {
      const lista = await remoto.listarConsultas(idReal);
      const todas = await lerCache<Consulta>("consultas");

      const outras = todas.filter(
        (consulta) => consulta.id_pet !== idPet && consulta.id_pet !== idReal,
      );

      await gravarCache("consultas", [...outras, ...lista]);

      // Combina os dados locais e remotos sem repetir IDs.
      const combinadas = new Map<number, Consulta>();

      for (const consulta of todas) {
        if (consulta.id_pet === idPet || consulta.id_pet === idReal) {
          combinadas.set(consulta.id, consulta);
        }
      }

      // A versão remota tem prioridade quando o ID já existe.
      for (const consulta of lista) {
        combinadas.set(consulta.id, consulta);
      }

      return Array.from(combinadas.values());
    } catch (erro) {
      const locais = await lerCache<Consulta>("consultas");

      const filtradas = locais.filter(
        (consulta) => consulta.id_pet === idPet || consulta.id_pet === idReal,
      );

      if (filtradas.length) return filtradas;

      throw erro;
    }
  },
};

export async function obterPendenciasPetCare(): Promise<number> {
  return quantidadePendentes();
}
