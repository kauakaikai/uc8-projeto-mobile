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

export function guardarPet(pet: Pet): void {
  pets = [pet, ...pets];
}

export function buscarPet(id: number): Promise<Pet | undefined> {
  return new Promise((resolver) => {
    setTimeout(() => resolver(pets.find((pet) => pet.id === id)), 400);
  });
}