import * as SQLite from "expo-sqlite";
import type { Cliente, Consulta, Pet } from "../servicos/petcareApi";

type Entidade = "clientes" | "pets" | "consultas";
type OperacaoPendente = {
  id: number;
  entidade: Entidade;
  dados: Record<string, unknown>;
};

let abertura: Promise<SQLite.SQLiteDatabase> | undefined;

async function db(): Promise<SQLite.SQLiteDatabase> {
  if (!abertura) {
    abertura = SQLite.openDatabaseAsync("petcare.db").then(async (banco) => {
      await banco.execAsync(`
        CREATE TABLE IF NOT EXISTS pc_cache (
          entidade TEXT NOT NULL,
          id INTEGER NOT NULL,
          dados TEXT NOT NULL,
          PRIMARY KEY (entidade, id)
        );
        CREATE TABLE IF NOT EXISTS pc_fila (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          entidade TEXT NOT NULL,
          dados TEXT NOT NULL,
          criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS pc_mapa_ids (
          temporario INTEGER PRIMARY KEY NOT NULL,
          remoto INTEGER NOT NULL
        );
      `);
      return banco;
    }).catch((erro) => {
      abertura = undefined;
      throw erro;
    });
  }
  return abertura;
}

export async function lerCache<T>(entidade: Entidade): Promise<T[]> {
  const banco = await db();
  const linhas = await banco.getAllAsync<{ dados: string }>(
    "SELECT dados FROM pc_cache WHERE entidade = ? ORDER BY id",
    [entidade],
  );
  return linhas.map((linha) => JSON.parse(linha.dados) as T);
}

export async function gravarCache<T extends { id: number }>(
  entidade: Entidade,
  registros: T[],
): Promise<void> {
  const banco = await db();
  await banco.withTransactionAsync(async () => {
    await banco.runAsync("DELETE FROM pc_cache WHERE entidade = ?", [entidade]);
    for (const registro of registros) {
      await banco.runAsync(
        "INSERT OR REPLACE INTO pc_cache (entidade, id, dados) VALUES (?, ?, ?)",
        [entidade, registro.id, JSON.stringify(registro)],
      );
    }
  });
}

export async function gravarUm<T extends { id: number }>(
  entidade: Entidade,
  registro: T,
): Promise<void> {
  const banco = await db();
  await banco.runAsync(
    "INSERT OR REPLACE INTO pc_cache (entidade, id, dados) VALUES (?, ?, ?)",
    [entidade, registro.id, JSON.stringify(registro)],
  );
}

export async function removerDoCache(entidade: Entidade, id: number): Promise<void> {
  const banco = await db();
  await banco.runAsync("DELETE FROM pc_cache WHERE entidade = ? AND id = ?", [entidade, id]);
}

async function proximoIdTemporario(): Promise<number> {
  const banco = await db();
  const linha = await banco.getFirstAsync<{ menor: number | null }>(
    "SELECT MIN(id) AS menor FROM pc_cache",
  );
  const menorFila = await banco.getFirstAsync<{ menor: number | null }>(
    "SELECT MIN(id) AS menor FROM pc_fila",
  );
  const menorMapeado = await banco.getFirstAsync<{ menor: number | null }>(
    "SELECT MIN(temporario) AS menor FROM pc_mapa_ids",
  );
  return Math.min(
    linha?.menor ?? 0,
    menorFila?.menor ?? 0,
    menorMapeado?.menor ?? 0,
    0,
  ) - 1;
}

export async function enfileirar(
  entidade: Entidade,
  dados: Record<string, unknown>,
): Promise<number> {
  const banco = await db();
  const idTemporario = await proximoIdTemporario();
  const payload = { ...dados, id: idTemporario };
  await banco.withTransactionAsync(async () => {
    await banco.runAsync(
      "INSERT INTO pc_fila (entidade, dados) VALUES (?, ?)",
      [entidade, JSON.stringify(payload)],
    );
    await banco.runAsync(
      "INSERT OR REPLACE INTO pc_cache (entidade, id, dados) VALUES (?, ?, ?)",
      [entidade, idTemporario, JSON.stringify(payload)],
    );
  });
  return idTemporario;
}

export async function listarFila(): Promise<OperacaoPendente[]> {
  const banco = await db();
  const linhas = await banco.getAllAsync<{ id: number; entidade: Entidade; dados: string }>(
    "SELECT id, entidade, dados FROM pc_fila ORDER BY id",
  );
  return linhas.map((linha) => ({
    id: linha.id,
    entidade: linha.entidade,
    dados: JSON.parse(linha.dados) as Record<string, unknown>,
  }));
}

export async function concluirPendente(idFila: number): Promise<void> {
  const banco = await db();
  await banco.runAsync("DELETE FROM pc_fila WHERE id = ?", [idFila]);
}

export async function salvarMapaId(temporario: number, remoto: number): Promise<void> {
  const banco = await db();
  await banco.runAsync(
    "INSERT OR REPLACE INTO pc_mapa_ids (temporario, remoto) VALUES (?, ?)",
    [temporario, remoto],
  );
}

export async function resolverId(id: number): Promise<number> {
  if (id >= 0) return id;
  const banco = await db();
  const linha = await banco.getFirstAsync<{ remoto: number }>(
    "SELECT remoto FROM pc_mapa_ids WHERE temporario = ?",
    [id],
  );
  return linha?.remoto ?? id;
}

export async function quantidadePendentes(): Promise<number> {
  const banco = await db();
  const linha = await banco.getFirstAsync<{ total: number }>(
    "SELECT COUNT(*) AS total FROM pc_fila",
  );
  return linha?.total ?? 0;
}

// Tipos usados para documentar o formato armazenado no SQLite.
export type DadosLocais = Cliente | Pet | Consulta;
