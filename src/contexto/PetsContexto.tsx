import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  carregarPets,
  descreverErro,
  incluirPet,
  type DadosNovoPet,
} from "../servicos/pets";
import type { Pet } from "../tipos/entidades";

export type EstadoPets =
  | { tipo: "carregando" }
  | { tipo: "erro"; mensagem: string }
  | { tipo: "pronto"; pets: Pet[] };

interface ValorDosPets {
  estado: EstadoPets;
  recarregar: () => void;
  incluir: (dados: DadosNovoPet) => Promise<Pet>;
  buscar: (id: number) => Pet | undefined;
}

const PetsContexto = createContext<ValorDosPets | undefined>(undefined);

export function PetsProvedor({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoPets>({ tipo: "carregando" });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setEstado({ tipo: "carregando" });
    carregarPets()
      .then((pets) => {
        if (!cancelado) {
          setEstado({ tipo: "pronto", pets });
        }
      })
      .catch((erro: unknown) => {
        if (!cancelado) {
          setEstado({ tipo: "erro", mensagem: descreverErro(erro) });
        }
      });
    return () => {
      cancelado = true;
    };
  }, [tentativa]);

  function recarregar() {
    setTentativa(tentativa + 1);
  }

  async function incluir(dados: DadosNovoPet): Promise<Pet> {
    const novo = await incluirPet(dados);
    setEstado((atual) =>
      atual.tipo === "pronto"
        ? { tipo: "pronto", pets: [novo, ...atual.pets] }
        : atual,
    );
    return novo;
  }

  function buscar(id: number): Pet | undefined {
    return estado.tipo === "pronto"
      ? estado.pets.find((pet) => pet.id === id)
      : undefined;
  }

  return (
    <PetsContexto.Provider value={{ estado, recarregar, incluir, buscar }}>
      {children}
    </PetsContexto.Provider>
  );
}

export function usePets(): ValorDosPets {
  const valor = useContext(PetsContexto);
  if (valor === undefined) {
    throw new Error("usePets só funciona dentro de PetsProvedor");
  }
  return valor;
}
