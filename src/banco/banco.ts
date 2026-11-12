import * as SQLite from "expo-sqlite";
import { ErroDoBanco } from "../erros/erros";
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

async function noBanco<T>(
  operacao: (db: SQLite.SQLiteDatabase) => Promise<T>,
): Promise<T> {
  try {
    const db = await banco();
    return await operacao(db);
  } catch (erro: unknown) {
    throw new ErroDoBanco(erro instanceof Error ? erro.message : String(erro));
  }
}

export function listarLocal(): Promise<Pet[]> {
  return noBanco(async (db) => {
    const linhas = await db.getAllAsync<LinhaPet>(
      "SELECT id, nome, especie, raca, cliente_id FROM pets ORDER BY id DESC",
    );
    return linhas.map(paraPet);
  });
}

export function guardarLocal(pets: Pet[]): Promise<void> {
  return noBanco((db) =>
    db.withTransactionAsync(async () => {
      await db.runAsync("DELETE FROM pets");
      for (const pet of pets) {
        await db.runAsync(
          "INSERT INTO pets (id, nome, especie, raca, cliente_id) VALUES (?, ?, ?, ?, ?)",
          [pet.id, pet.nome, pet.especie, pet.raca ?? null, pet.clienteId],
        );
      }
    }),
  );
}

export function contarLocal(): Promise<number> {
  return noBanco(async (db) => {
    const linha = await db.getFirstAsync<{ total: number }>(
      "SELECT COUNT(*) AS total FROM pets",
    );
    return linha?.total ?? 0;
  });
}

export function listarPendentes(): Promise<Pendente[]> {
  return noBanco((db) =>
    db.getAllAsync<Pendente>(
      "SELECT id, nome, raca FROM pendentes ORDER BY id",
    ),
  );
}

export function guardarPendente(dados: DadosNovoPet): Promise<Pendente> {
  return noBanco(async (db) => {
    const resultado = await db.runAsync(
      "INSERT INTO pendentes (nome, raca) VALUES (?, ?)",
      [dados.nome, dados.raca],
    );
    return {
      id: resultado.lastInsertRowId,
      nome: dados.nome,
      raca: dados.raca,
    };
  });
}

export function removerPendente(id: number): Promise<void> {
  return noBanco(async (db) => {
    await db.runAsync("DELETE FROM pendentes WHERE id = ?", [id]);
  });
}
