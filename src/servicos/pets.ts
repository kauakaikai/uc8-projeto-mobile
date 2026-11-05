import type { Pet } from '../tipos/entidades';

let pets: Pet[] = [
  { id: 1, nome: 'Rex', especie: 'cachorro', raca: 'Vira-lata', clienteId: 1 },
  { id: 2, nome: 'Mimi', especie: 'gato', clienteId: 2 },
  { id: 3, nome: 'Piu', especie: 'ave', raca: 'Calopsita', clienteId: 1 },
];

export function carregarPets(): Promise<Pet[]> {
  return new Promise((resolver) => {
    setTimeout(() => resolver(pets), 800);
  });
}

export function incluirPet(dados: { nome: string; raca: string }): Pet {
  const proximoId = pets.reduce((maior, atual) => Math.max(maior, atual.id), 0) + 1;
  const novo: Pet = {
    id: proximoId,
    nome: dados.nome,
    especie: 'outro',
    raca: dados.raca || undefined,
    clienteId: 1,
  };
  pets = [novo, ...pets];
  return novo;
}

export function buscarPet(id: number): Promise<Pet | undefined> {
  return new Promise((resolver) => {
    setTimeout(() => resolver(pets.find((pet) => pet.id === id)), 400);
  });
}