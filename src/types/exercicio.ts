export type Especie = 'cachorro' | 'gato' | 'ave' | 'outro';
export type StatusConsulta = 'agendada' | 'realizada' | 'cancelada';

export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  email?: string;
}

export interface Pet {
  id: number;
  nome: string;
  especie: Especie;
  raca?: string;
  clienteId: number;
}

export interface Consulta {
  id: number;
  petId: number; 
  data: string; 
  motivo: string;
  status: StatusConsulta;
}