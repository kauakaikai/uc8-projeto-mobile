import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Botao as BotaoBase } from "../componentes/Botao";
import { Campo as CampoBase } from "../componentes/Campo";
import {
  petCareApi,
  type Cliente,
  type Consulta,
  type NovaConsulta,
  type NovoCliente,
  type NovoPet,
  type Pet,
  type PetComTutor,
} from "../servicos/petcareApi";
import { cores, espacos } from "../tema/tema";
import {
  sincronizarPendentes,
  obterPendenciasPetCare,
} from "../servicos/petcareApi";

type Aba = "clientes" | "pets" | "consultas" | "busca";
type CampoProps = {
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  placeholder?: string;
  teclado?: "default" | "email-address" | "phone-pad" | "numeric";
  multiline?: boolean;
};

function Campo({
  rotulo,
  valor,
  aoMudar,
  placeholder,
  teclado = "default",
  multiline = false,
}: CampoProps) {
  return (
    <CampoBase
      rotulo={rotulo}
      valor={valor}
      aoMudar={aoMudar}
      placeholder={placeholder}
      teclado={teclado}
      multiline={multiline}
    />
  );
}

function Botao({
  titulo,
  aoPressionar,
  variante = "primario",
  desabilitado = false,
}: {
  titulo: string;
  aoPressionar: () => void;
  variante?: "primario" | "secundario" | "perigo";
  desabilitado?: boolean;
}) {
  return (
    <BotaoBase
      titulo={titulo}
      onPress={aoPressionar}
      variante={variante}
      desabilitado={desabilitado}
    />
  );
}

function Painel({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={estilos.painel}>
      <Text style={estilos.tituloPainel}>{titulo}</Text>
      {children}
    </View>
  );
}

function Opcao({
  titulo,
  selecionada,
  aoPressionar,
}: {
  titulo: string;
  selecionada: boolean;
  aoPressionar: () => void;
}) {
  return (
    <Pressable
      onPress={aoPressionar}
      style={[estilos.opcao, selecionada && estilos.opcaoSelecionada]}
    >
      <Text
        style={[
          estilos.textoOpcao,
          selecionada && estilos.textoOpcaoSelecionada,
        ]}
      >
        {titulo}
      </Text>
    </Pressable>
  );
}

function formatarMoeda(valor: number) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function confirmarExclusao(
  titulo: string,
  mensagem: string,
  acao: () => Promise<void>,
) {
  Alert.alert(titulo, mensagem, [
    { text: "Cancelar", style: "cancel" },
    {
      text: "Excluir",
      style: "destructive",
      onPress: () => {
        void acao();
      },
    },
  ]);
}

export function TelaPetCare() {
  const [aba, setAba] = useState<Aba>("clientes");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [status, setStatus] = useState("");
  const [erroStatus, setErroStatus] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Formulário de tutores
  const [clienteEmEdicao, setClienteEmEdicao] = useState<Cliente | null>(null);
  const [clienteNome, setClienteNome] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");

  // Formulário de pets
  const [clientePetsId, setClientePetsId] = useState<number | null>(null);
  const [petEmEdicao, setPetEmEdicao] = useState<Pet | null>(null);
  const [petNome, setPetNome] = useState("");
  const [petEspecie, setPetEspecie] = useState("");
  const [petRaca, setPetRaca] = useState("");

  // Formulário de consultas
  const [clienteConsultasId, setClienteConsultasId] = useState<number | null>(
    null,
  );
  const [petConsultasId, setPetConsultasId] = useState<number | null>(null);
  const [consultaEmEdicao, setConsultaEmEdicao] = useState<Consulta | null>(
    null,
  );
  const [consultaData, setConsultaData] = useState("");
  const [consultaHora, setConsultaHora] = useState("");
  const [consultaSintomas, setConsultaSintomas] = useState("");
  const [consultaValor, setConsultaValor] = useState("");

  // Busca
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroEspecie, setFiltroEspecie] = useState("");
  const [resultadosBusca, setResultadosBusca] = useState<PetComTutor[]>([]);
  const [buscou, setBuscou] = useState(false);

  const petsDoTutor = useMemo(
    () => pets.filter((pet) => pet.id_cliente === clientePetsId),
    [pets, clientePetsId],
  );
  const petsDoTutorConsulta = useMemo(
    () => pets.filter((pet) => pet.id_cliente === clienteConsultasId),
    [pets, clienteConsultasId],
  );
  const resultadosFiltrados = useMemo(() => {
    const filtro = filtroEspecie.trim().toLocaleLowerCase("pt-BR");
    return resultadosBusca.filter((pet) =>
      pet.especie.toLocaleLowerCase("pt-BR").includes(filtro),
    );
  }, [resultadosBusca, filtroEspecie]);

  async function recarregarDados(mostrarStatus = false) {
    setCarregando(true);
    try {
      try {
        await sincronizarPendentes();
      } catch {
        // Sem internet: continua usando os dados locais.
      }
      const listaClientes = await petCareApi.listarClientes();
      const listaPets = await petCareApi.listarPets();
      setClientes(listaClientes);
      setPets(listaPets);
      if (
        clientePetsId !== null &&
        !listaClientes.some((cliente) => cliente.id === clientePetsId)
      )
        setClientePetsId(null);
      if (
        clienteConsultasId !== null &&
        !listaClientes.some((cliente) => cliente.id === clienteConsultasId)
      ) {
        setClienteConsultasId(null);
        setPetConsultasId(null);
      }
      const pendentes = await obterPendenciasPetCare();
      if (mostrarStatus)
        definirStatus(
          pendentes > 0
            ? `Dados atualizados. ${pendentes} cadastro(s) aguardando sincronização.`
            : "Dados atualizados com sucesso.",
        );
    } catch (erro) {
      definirStatus(
        erro instanceof Error
          ? erro.message
          : "Não foi possível carregar os dados.",
        true,
      );
    } finally {
      setCarregando(false);
    }
  }

  function definirStatus(mensagem: string, erro = false) {
    setStatus(mensagem);
    setErroStatus(erro);
  }

  useEffect(() => {
    void recarregarDados();
    // A carga inicial deve ocorrer apenas uma vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelado = false;
    if (aba === "consultas" && petConsultasId !== null) {
      petCareApi
        .listarConsultas(petConsultasId)
        .then((lista) => {
          if (!cancelado) setConsultas(lista);
        })
        .catch((erro: unknown) => {
          if (!cancelado)
            definirStatus(
              erro instanceof Error
                ? erro.message
                : "Erro ao carregar consultas.",
              true,
            );
        });
    } else if (aba === "consultas") {
      setConsultas([]);
    }
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aba, petConsultasId]);

  function limparFormularioCliente() {
    setClienteEmEdicao(null);
    setClienteNome("");
    setClienteTelefone("");
    setClienteEmail("");
  }

  function editarCliente(cliente: Cliente) {
    setClienteEmEdicao(cliente);
    setClienteNome(cliente.nome);
    setClienteTelefone(cliente.telefone ?? "");
    setClienteEmail(cliente.email ?? "");
    setStatus("");
  }

  async function salvarCliente() {
    const dados: NovoCliente = {
      nome: clienteNome.trim(),
      telefone: clienteTelefone.trim(),
      email: clienteEmail.trim(),
    };
    if (!dados.nome || !dados.telefone || !dados.email)
      return definirStatus("Preencha nome, telefone e e-mail do tutor.", true);
    setSalvando(true);
    try {
      if (clienteEmEdicao) {
        await petCareApi.atualizarCliente(clienteEmEdicao.id, dados);
        definirStatus("Tutor atualizado com sucesso.");
      } else {
        await petCareApi.criarCliente(dados);
        definirStatus("Tutor cadastrado com sucesso.");
      }
      limparFormularioCliente();
      await recarregarDados();
    } catch (erro) {
      definirStatus(
        erro instanceof Error ? erro.message : "Erro ao salvar tutor.",
        true,
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirCliente(cliente: Cliente) {
    try {
      await petCareApi.excluirCliente(cliente.id);
      if (clientePetsId === cliente.id) setClientePetsId(null);
      if (clienteConsultasId === cliente.id) {
        setClienteConsultasId(null);
        setPetConsultasId(null);
      }
      definirStatus("Tutor excluído.");
      await recarregarDados();
    } catch (erro) {
      definirStatus(
        erro instanceof Error ? erro.message : "Erro ao excluir tutor.",
        true,
      );
    }
  }

  function limparFormularioPet() {
    setPetEmEdicao(null);
    setPetNome("");
    setPetEspecie("");
    setPetRaca("");
  }

  function editarPet(pet: Pet) {
    setClientePetsId(pet.id_cliente);
    setPetEmEdicao(pet);
    setPetNome(pet.nome);
    setPetEspecie(pet.especie);
    setPetRaca(pet.raca ?? "");
    setStatus("");
  }

  async function salvarPet() {
    if (clientePetsId === null)
      return definirStatus("Selecione o tutor do pet.", true);
    const dados: NovoPet = {
      nome: petNome.trim(),
      especie: petEspecie.trim(),
      raca: petRaca.trim(),
      id_cliente: clientePetsId,
    };
    if (!dados.nome || !dados.especie || !dados.raca)
      return definirStatus("Preencha nome, espécie e raça do pet.", true);
    setSalvando(true);
    try {
      if (petEmEdicao) {
        await petCareApi.atualizarPet(petEmEdicao.id, dados);
        definirStatus("Pet atualizado com sucesso.");
      } else {
        await petCareApi.criarPet(dados);
        definirStatus("Pet cadastrado com sucesso.");
      }
      limparFormularioPet();
      await recarregarDados();
    } catch (erro) {
      definirStatus(
        erro instanceof Error ? erro.message : "Erro ao salvar pet.",
        true,
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirPet(pet: Pet) {
    try {
      await petCareApi.excluirPet(pet.id);
      if (petConsultasId === pet.id) setPetConsultasId(null);
      definirStatus("Pet excluído.");
      await recarregarDados();
    } catch (erro) {
      definirStatus(
        erro instanceof Error ? erro.message : "Erro ao excluir pet.",
        true,
      );
    }
  }

  function selecionarTutorConsultas(id: number) {
    setClienteConsultasId(id);
    setPetConsultasId(null);
    setConsultaEmEdicao(null);
    limparFormularioConsulta();
  }

  function limparFormularioConsulta() {
    setConsultaEmEdicao(null);
    setConsultaData("");
    setConsultaHora("");
    setConsultaSintomas("");
    setConsultaValor("");
  }

  function editarConsulta(consulta: Consulta) {
    const pet = pets.find((item) => item.id === consulta.id_pet);
    if (pet) setClienteConsultasId(pet.id_cliente);
    setPetConsultasId(consulta.id_pet);
    setConsultaEmEdicao(consulta);
    setConsultaData(consulta.data.slice(0, 10));
    setConsultaHora(consulta.hora.slice(0, 5));
    setConsultaSintomas(consulta.descricao_sintomas ?? "");
    setConsultaValor(String(consulta.valor));
    setStatus("");
  }

  async function salvarConsulta() {
    if (petConsultasId === null)
      return definirStatus("Selecione o pet da consulta.", true);
    const dados: NovaConsulta = {
      id_pet: petConsultasId,
      data: consultaData.trim(),
      hora: consultaHora.trim(),
      descricao_sintomas: consultaSintomas.trim(),
      valor: Number(consultaValor.replace(",", ".")),
    };
    if (
      !dados.data ||
      !dados.hora ||
      !dados.descricao_sintomas ||
      !consultaValor.trim() ||
      !Number.isFinite(dados.valor) ||
      dados.valor < 0
    ) {
      return definirStatus(
        "Preencha data, hora, descrição e um valor válido para a consulta.",
        true,
      );
    }
    setSalvando(true);
    try {
      if (consultaEmEdicao) {
        await petCareApi.atualizarConsulta(consultaEmEdicao.id, dados);
        definirStatus("Consulta atualizada com sucesso.");
      } else {
        await petCareApi.criarConsulta(dados);
        definirStatus("Consulta registrada com sucesso.");
      }
      limparFormularioConsulta();
      const lista = await petCareApi.listarConsultas(petConsultasId);
      setConsultas(lista);
    } catch (erro) {
      definirStatus(
        erro instanceof Error ? erro.message : "Erro ao salvar consulta.",
        true,
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirConsulta(consulta: Consulta) {
    try {
      await petCareApi.excluirConsulta(consulta.id);
      definirStatus("Consulta excluída.");
      if (petConsultasId !== null)
        setConsultas(await petCareApi.listarConsultas(petConsultasId));
    } catch (erro) {
      definirStatus(
        erro instanceof Error ? erro.message : "Erro ao excluir consulta.",
        true,
      );
    }
  }

  async function buscarPets() {
    if (termoBusca.trim().length < 2)
      return definirStatus("Digite pelo menos 2 caracteres para buscar.", true);
    setSalvando(true);
    setBuscou(true);
    setFiltroEspecie("");
    try {
      const resultado = await petCareApi.buscarPets(termoBusca.trim());
      setResultadosBusca(resultado);
      definirStatus(`${resultado.length} resultado(s) encontrado(s).`);
    } catch (erro) {
      setResultadosBusca([]);
      definirStatus(
        erro instanceof Error
          ? erro.message
          : "Não foi possível realizar a busca.",
        true,
      );
    } finally {
      setSalvando(false);
    }
  }

  function renderTutores() {
    return (
      <>
        <Painel titulo={clienteEmEdicao ? "Editar tutor" : "Novo tutor"}>
          <Campo
            rotulo="Nome"
            valor={clienteNome}
            aoMudar={setClienteNome}
            placeholder="Nome completo"
          />
          <Campo
            rotulo="Telefone"
            valor={clienteTelefone}
            aoMudar={setClienteTelefone}
            placeholder="(00) 00000-0000"
            teclado="phone-pad"
          />
          <Campo
            rotulo="E-mail"
            valor={clienteEmail}
            aoMudar={setClienteEmail}
            placeholder="email@exemplo.com"
            teclado="email-address"
          />
          <View style={estilos.linhaBotoes}>
            <Botao
              titulo={
                salvando
                  ? "Salvando..."
                  : clienteEmEdicao
                    ? "Salvar alterações"
                    : "Cadastrar"
              }
              aoPressionar={() => {
                void salvarCliente();
              }}
              desabilitado={salvando}
            />
            {clienteEmEdicao && (
              <Botao
                titulo="Cancelar"
                variante="secundario"
                aoPressionar={limparFormularioCliente}
              />
            )}
          </View>
        </Painel>
        <Painel titulo={`Tutores cadastrados (${clientes.length})`}>
          {clientes.length === 0 ? (
            <Text style={estilos.textoVazio}>
              Nenhum tutor cadastrado ainda.
            </Text>
          ) : (
            clientes.map((cliente) => (
              <View key={cliente.id} style={estilos.itemLista}>
                <View style={estilos.itemConteudo}>
                  <Text style={estilos.itemTitulo}>{cliente.nome}</Text>
                  <Text style={estilos.itemDescricao}>{cliente.telefone}</Text>
                  <Text style={estilos.itemDescricao}>{cliente.email}</Text>
                </View>
                <View style={estilos.acoesItem}>
                  <Botao
                    titulo="Editar"
                    variante="secundario"
                    aoPressionar={() => editarCliente(cliente)}
                  />
                  <Botao
                    titulo="Excluir"
                    variante="perigo"
                    aoPressionar={() =>
                      confirmarExclusao(
                        "Excluir tutor?",
                        `Deseja excluir ${cliente.nome}? Tutores com pets cadastrados não podem ser removidos.`,
                        () => excluirCliente(cliente),
                      )
                    }
                  />
                </View>
              </View>
            ))
          )}
        </Painel>
      </>
    );
  }

  function renderPets() {
    return (
      <>
        <Painel titulo="Selecione o tutor">
          {clientes.length === 0 ? (
            <Text style={estilos.textoVazio}>
              Cadastre um tutor primeiro na aba Tutores.
            </Text>
          ) : (
            <View style={estilos.opcoesLista}>
              {clientes.map((cliente) => (
                <Opcao
                  key={cliente.id}
                  titulo={cliente.nome}
                  selecionada={clientePetsId === cliente.id}
                  aoPressionar={() => {
                    setClientePetsId(cliente.id);
                    if (petEmEdicao && petEmEdicao.id_cliente !== cliente.id)
                      limparFormularioPet();
                  }}
                />
              ))}
            </View>
          )}
        </Painel>
        {clientePetsId !== null && (
          <>
            <Painel titulo={petEmEdicao ? "Editar pet" : "Novo pet"}>
              <Campo
                rotulo="Nome do pet"
                valor={petNome}
                aoMudar={setPetNome}
                placeholder="Ex.: Rex"
              />
              <Campo
                rotulo="Espécie"
                valor={petEspecie}
                aoMudar={setPetEspecie}
                placeholder="Cachorro, gato, ave..."
              />
              <Campo
                rotulo="Raça"
                valor={petRaca}
                aoMudar={setPetRaca}
                placeholder="Raça do pet"
              />
              <View style={estilos.linhaBotoes}>
                <Botao
                  titulo={
                    salvando
                      ? "Salvando..."
                      : petEmEdicao
                        ? "Salvar alterações"
                        : "Cadastrar pet"
                  }
                  aoPressionar={() => {
                    void salvarPet();
                  }}
                  desabilitado={salvando}
                />
                {petEmEdicao && (
                  <Botao
                    titulo="Cancelar"
                    variante="secundario"
                    aoPressionar={limparFormularioPet}
                  />
                )}
              </View>
            </Painel>
            <Painel
              titulo={`Pets de ${clientes.find((c) => c.id === clientePetsId)?.nome ?? "tutor"} (${petsDoTutor.length})`}
            >
              {petsDoTutor.length === 0 ? (
                <Text style={estilos.textoVazio}>
                  Este tutor ainda não possui pets cadastrados.
                </Text>
              ) : (
                petsDoTutor.map((pet) => (
                  <View key={pet.id} style={estilos.itemLista}>
                    <View style={estilos.itemConteudo}>
                      <Text style={estilos.itemTitulo}>🐾 {pet.nome}</Text>
                      <Text style={estilos.itemDescricao}>
                        {pet.especie} · {pet.raca}
                      </Text>
                    </View>
                    <View style={estilos.acoesItem}>
                      <Botao
                        titulo="Editar"
                        variante="secundario"
                        aoPressionar={() => editarPet(pet)}
                      />
                      <Botao
                        titulo="Excluir"
                        variante="perigo"
                        aoPressionar={() =>
                          confirmarExclusao(
                            "Excluir pet?",
                            `Deseja excluir ${pet.nome}? Pets com consultas registradas não podem ser removidos.`,
                            () => excluirPet(pet),
                          )
                        }
                      />
                    </View>
                  </View>
                ))
              )}
            </Painel>
          </>
        )}
      </>
    );
  }

  function renderConsultas() {
    return (
      <>
        <Painel titulo="Selecione o tutor e o pet">
          <Text style={estilos.rotulo}>Tutor</Text>
          {clientes.length === 0 ? (
            <Text style={estilos.textoVazio}>Cadastre um tutor primeiro.</Text>
          ) : (
            <View style={estilos.opcoesLista}>
              {clientes.map((cliente) => (
                <Opcao
                  key={cliente.id}
                  titulo={cliente.nome}
                  selecionada={clienteConsultasId === cliente.id}
                  aoPressionar={() => selecionarTutorConsultas(cliente.id)}
                />
              ))}
            </View>
          )}
          {clienteConsultasId !== null && (
            <>
              <Text style={[estilos.rotulo, estilos.rotuloComEspaco]}>Pet</Text>
              {petsDoTutorConsulta.length === 0 ? (
                <Text style={estilos.textoVazio}>
                  Este tutor ainda não possui pets.
                </Text>
              ) : (
                <View style={estilos.opcoesLista}>
                  {petsDoTutorConsulta.map((pet) => (
                    <Opcao
                      key={pet.id}
                      titulo={`${pet.nome} · ${pet.especie}`}
                      selecionada={petConsultasId === pet.id}
                      aoPressionar={() => {
                        setPetConsultasId(pet.id);
                        setConsultaEmEdicao(null);
                        limparFormularioConsulta();
                      }}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </Painel>
        {petConsultasId !== null && (
          <>
            <Painel
              titulo={consultaEmEdicao ? "Editar consulta" : "Nova consulta"}
            >
              <Campo
                rotulo="Data (AAAA-MM-DD)"
                valor={consultaData}
                aoMudar={setConsultaData}
                placeholder="2026-11-16"
              />
              <Campo
                rotulo="Hora (HH:MM)"
                valor={consultaHora}
                aoMudar={setConsultaHora}
                placeholder="14:30"
              />
              <Campo
                rotulo="Sintomas / descrição"
                valor={consultaSintomas}
                aoMudar={setConsultaSintomas}
                placeholder="Descreva o motivo da consulta"
                multiline
              />
              <Campo
                rotulo="Valor (R$)"
                valor={consultaValor}
                aoMudar={setConsultaValor}
                placeholder="0,00"
                teclado="numeric"
              />
              <View style={estilos.linhaBotoes}>
                <Botao
                  titulo={
                    salvando
                      ? "Salvando..."
                      : consultaEmEdicao
                        ? "Salvar alterações"
                        : "Registrar consulta"
                  }
                  aoPressionar={() => {
                    void salvarConsulta();
                  }}
                  desabilitado={salvando}
                />
                {consultaEmEdicao && (
                  <Botao
                    titulo="Cancelar"
                    variante="secundario"
                    aoPressionar={limparFormularioConsulta}
                  />
                )}
              </View>
            </Painel>
            <Painel titulo={`Histórico de consultas (${consultas.length})`}>
              {consultas.length === 0 ? (
                <Text style={estilos.textoVazio}>
                  Nenhuma consulta registrada para este pet.
                </Text>
              ) : (
                consultas.map((consulta) => (
                  <View key={consulta.id} style={estilos.itemLista}>
                    <View style={estilos.itemConteudo}>
                      <Text style={estilos.itemTitulo}>
                        {consulta.data} · {consulta.hora}
                      </Text>
                      <Text style={estilos.itemDescricao}>
                        {consulta.descricao_sintomas}
                      </Text>
                      <Text style={estilos.itemPreco}>
                        {formatarMoeda(consulta.valor)}
                      </Text>
                    </View>
                    <View style={estilos.acoesItem}>
                      <Botao
                        titulo="Editar"
                        variante="secundario"
                        aoPressionar={() => editarConsulta(consulta)}
                      />
                      <Botao
                        titulo="Excluir"
                        variante="perigo"
                        aoPressionar={() =>
                          confirmarExclusao(
                            "Excluir consulta?",
                            "Deseja remover este registro do histórico?",
                            () => excluirConsulta(consulta),
                          )
                        }
                      />
                    </View>
                  </View>
                ))
              )}
            </Painel>
          </>
        )}
      </>
    );
  }

  function renderBusca() {
    return (
      <>
        <Painel titulo="Buscar pet por nome do pet ou do tutor">
          <Campo
            rotulo="Termo de busca"
            valor={termoBusca}
            aoMudar={setTermoBusca}
            placeholder="Ex.: Rex"
          />
          <Botao
            titulo={salvando ? "Buscando..." : "Buscar"}
            aoPressionar={() => {
              void buscarPets();
            }}
            desabilitado={salvando}
          />
          <View style={estilos.filtroBusca}>
            <Campo
              rotulo="Filtrar resultados por espécie"
              valor={filtroEspecie}
              aoMudar={setFiltroEspecie}
              placeholder="Cachorro, gato..."
            />
          </View>
          {buscou && resultadosBusca.length === 0 && (
            <Text style={estilos.textoVazio}>
              Nenhum resultado encontrado para “{termoBusca}”.
            </Text>
          )}
          {resultadosBusca.length > 0 && (
            <>
              <Text style={estilos.contagemBusca}>
                {resultadosFiltrados.length} resultado(s) exibido(s).
              </Text>
              {resultadosFiltrados.map((pet) => (
                <View key={pet.id} style={estilos.resultadoBusca}>
                  <Text style={estilos.itemTitulo}>🐾 {pet.nome}</Text>
                  <Text style={estilos.itemDescricao}>
                    {pet.especie} · {pet.raca} — tutor: {pet.nome_cliente}
                  </Text>
                </View>
              ))}
            </>
          )}
        </Painel>
      </>
    );
  }

  const abas: { id: Aba; titulo: string }[] = [
    { id: "clientes", titulo: "🧑‍🤝‍🧑 Tutores" },
    { id: "pets", titulo: "🐶 Pets" },
    { id: "consultas", titulo: "📋 Consultas" },
    { id: "busca", titulo: "🔍 Buscar" },
  ];

  return (
    <KeyboardAvoidingView
      style={estilos.tela}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <View style={estilos.cabecalho}>
          <Text style={estilos.logo}>🐾 PetCare</Text>
          <Text style={estilos.subtitulo}>
            Sua clínica com carinho de verdade
          </Text>
          <View style={estilos.sublinhado} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={estilos.navegacao}
        >
          {abas.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => {
                setAba(item.id);
                setStatus("");
              }}
              style={[estilos.aba, aba === item.id && estilos.abaAtiva]}
            >
              <Text
                style={[
                  estilos.textoAba,
                  aba === item.id && estilos.textoAbaAtiva,
                ]}
              >
                {item.titulo}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={estilos.linhaAtualizar}>
          <Text style={estilos.tituloSecao}>
            {abas.find((item) => item.id === aba)?.titulo.replace(/^\S+\s/, "")}
          </Text>
          <Pressable
            onPress={() => {
              void recarregarDados(true);
            }}
            style={estilos.linkAtualizar}
          >
            <Text style={estilos.textoLink}>↻ Atualizar</Text>
          </Pressable>
        </View>

        {status !== "" && (
          <View style={[estilos.status, erroStatus && estilos.statusErro]}>
            <Text
              style={[
                estilos.textoStatus,
                erroStatus && estilos.textoStatusErro,
              ]}
            >
              {status}
            </Text>
          </View>
        )}
        {carregando ? (
          <View style={estilos.carregando}>
            <ActivityIndicator size="large" color={cores.primaria} />
            <Text style={estilos.textoVazio}>Carregando dados...</Text>
          </View>
        ) : (
          <>
            {aba === "clientes" && renderTutores()}
            {aba === "pets" && renderPets()}
            {aba === "consultas" && renderConsultas()}
            {aba === "busca" && renderBusca()}
          </>
        )}
        <Text style={estilos.rodape}>PetCare · Gestão veterinária</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: {
    paddingHorizontal: espacos.md,
    paddingTop: espacos.md,
    paddingBottom: 40,
  },
  cabecalho: { alignItems: "center", marginBottom: espacos.md },
  logo: {
    color: cores.primariaEscura,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  subtitulo: { color: cores.textoSecundario, fontWeight: "600", marginTop: 2 },
  sublinhado: {
    width: 56,
    height: 4,
    borderRadius: 99,
    backgroundColor: cores.vinho,
    marginTop: 8,
  },
  navegacao: {
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 1,
    marginBottom: espacos.md,
  },
  aba: {
    backgroundColor: cores.superficie,
    borderColor: cores.borda,
    borderWidth: 2,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  abaAtiva: {
    backgroundColor: cores.primaria,
    borderColor: cores.primariaEscura,
  },
  textoAba: { color: cores.texto, fontWeight: "700", fontSize: 13 },
  textoAbaAtiva: { color: "#FFFFFF" },
  linhaAtualizar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  tituloSecao: { color: cores.primariaEscura, fontWeight: "800", fontSize: 18 },
  linkAtualizar: { paddingVertical: 6, paddingHorizontal: 10 },
  textoLink: { color: cores.vinho, fontWeight: "800" },
  painel: {
    backgroundColor: cores.superficie,
    borderRadius: 20,
    padding: 18,
    marginBottom: espacos.md,
    borderWidth: 1,
    borderColor: cores.borda,
    borderTopWidth: 4,
    borderTopColor: cores.vinho,
    shadowColor: "#2B1B12",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  tituloPainel: {
    marginBottom: 14,
    fontSize: 18,
    fontWeight: "800",
    color: cores.primariaEscura,
  },
  grupoCampo: { marginBottom: 12 },
  rotulo: {
    color: cores.textoSecundario,
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 5,
  },
  entrada: {
    minHeight: 46,
    backgroundColor: cores.fundo,
    color: cores.texto,
    borderWidth: 2,
    borderColor: cores.borda,
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 10,
    fontSize: 15,
  },
  entradaMultilinha: { minHeight: 86 },
  linhaBotoes: { flexDirection: "row", gap: 9, marginTop: 3 },
  botao: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cores.primaria,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  botaoSecundario: {
    backgroundColor: cores.superficie,
    borderWidth: 1.5,
    borderColor: cores.borda,
  },
  botaoPerigo: { backgroundColor: cores.vinho },
  botaoPressionado: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  botaoDesabilitado: { opacity: 0.5 },
  textoBotao: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
  textoBotaoSecundario: { color: cores.primariaEscura },
  itemLista: {
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    paddingVertical: 13,
    gap: 10,
  },
  itemConteudo: { flex: 1 },
  itemTitulo: {
    color: cores.texto,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  itemDescricao: { color: cores.textoSecundario, fontSize: 13, lineHeight: 19 },
  itemPreco: { color: cores.primariaEscura, fontWeight: "800", marginTop: 5 },
  acoesItem: { flexDirection: "row", gap: 8 },
  textoVazio: { color: cores.textoSecundario, lineHeight: 20 },
  opcoesLista: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  opcao: {
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 9,
    backgroundColor: cores.fundo,
  },
  opcaoSelecionada: {
    backgroundColor: cores.fundoVerde,
    borderColor: cores.primaria,
  },
  textoOpcao: { color: cores.textoSecundario, fontWeight: "700", fontSize: 13 },
  textoOpcaoSelecionada: { color: cores.primariaEscura },
  rotuloComEspaco: { marginTop: 16 },
  filtroBusca: { marginTop: 16 },
  contagemBusca: {
    color: cores.textoSecundario,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 5,
  },
  resultadoBusca: {
    backgroundColor: cores.fundo,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: cores.borda,
    padding: 12,
    marginTop: 8,
  },
  status: {
    backgroundColor: cores.superficie,
    borderColor: cores.vinho,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  statusErro: { backgroundColor: cores.fundoRosado },
  textoStatus: {
    color: cores.texto,
    fontWeight: "700",
    textAlign: "center",
    fontSize: 13,
  },
  textoStatusErro: { color: cores.vinhoEscuro },
  carregando: {
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    gap: 10,
  },
  rodape: {
    textAlign: "center",
    color: cores.textoClaroSecundario,
    fontSize: 12,
    marginTop: 3,
  },
});
