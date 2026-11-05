import type { NavigatorScreenParams } from '@react-navigation/native';

export type RotasDaPilha = {
  Pets: undefined;
  DetalhePet: { id: number };
  NovoPet: undefined;
};

export type RotasDasAbas = {
  AbaPets: NavigatorScreenParams<RotasDaPilha>;
  AbaSobre: undefined;
};