import * as SQLite from "expo-sqlite";
import type { DadosNovoPet } from "../servicos/pets";
import type { Especie, Pet } from "../tipos/entidades";

export interface Pendente extends DadosNovoPet {
  id: number;
}

interface LinhaPet {
  id: number;
  nome: string;
  especie: string;
  raca: string | null;
  cliente_id: number;
}

let bancoAberto: Promise<SQLite.SQLiteDatabase> | undefined;

function banco(): Promise<SQLite.SQLiteDatabase> {
  if (bancoAberto === undefined) {
    bancoAberto = SQLite.openDatabaseAsync("petcare.db").then(async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS pets (
          id INTEGER PRIMARY KEY NOT NULL,
          nome TEXT NOT NULL,
          especie TEXT NOT NULL,
          raca TEXT,
          cliente_id INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS pendentes (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          nome TEXT NOT NULL,
          raca TEXT NOT NULL
        );
      `);
      return db;
    });
  }
  return bancoAberto;
}

function comoEspecie(texto: string): Especie {
  return texto === "cachorro" || texto === "gato" || texto === "ave"
    ? texto
    : "outro";
}

function paraPet(linha: LinhaPet): Pet {
  return {
    id: linha.id,
    nome: linha.nome,
    especie: comoEspecie(linha.especie),
    raca: linha.raca ?? undefined,
    clienteId: linha.cliente_id,
  };
}

export async function listarLocal(): Promise<Pet[]> {
  const db = await banco();
  const linhas = await db.getAllAsync<LinhaPet>(
    "SELECT id, nome, especie, raca, cliente_id FROM pets ORDER BY id DESC",
  );
  return linhas.map(paraPet);
}

export async function guardarLocal(pets: Pet[]): Promise<void> {
  const db = await banco();
  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM pets");
    for (const pet of pets) {
      await db.runAsync(
        "INSERT INTO pets (id, nome, especie, raca, cliente_id) VALUES (?, ?, ?, ?, ?)",
        [pet.id, pet.nome, pet.especie, pet.raca ?? null, pet.clienteId],
      );
    }
  });
}

export async function contarLocal(): Promise<number> {
  const db = await banco();
  const linha = await db.getFirstAsync<{ total: number }>(
    "SELECT COUNT(*) AS total FROM pets",
  );
  return linha?.total ?? 0;
}

export async function listarPendentes(): Promise<Pendente[]> {
  const db = await banco();
  return db.getAllAsync<Pendente>(
    "SELECT id, nome, raca FROM pendentes ORDER BY id",
  );
}

export async function guardarPendente(dados: DadosNovoPet): Promise<Pendente> {
  const db = await banco();
  const resultado = await db.runAsync(
    "INSERT INTO pendentes (nome, raca) VALUES (?, ?)",
    [dados.nome, dados.raca],
  );
  return { id: resultado.lastInsertRowId, nome: dados.nome, raca: dados.raca };
}

export async function removerPendente(id: number): Promise<void> {
  const db = await banco();
  await db.runAsync("DELETE FROM pendentes WHERE id = ?", [id]);
}
