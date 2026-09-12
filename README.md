# uc8-projeto-mobile

Projeto individual da UC8 "Desenvolver aplicações mobile" (SENAC RN Mossoró),
em React Native + Expo + TypeScript.

## Sistema de origem

O tema é o mesmo sistema da UC5 (PetCare - gestão de clínica veterinária),
com o escopo reduzido para caber nas 140h da unidade.

## Recorte

**Entidades e campos:**

| Entidade | Campos |
|---|---|
| **Pet** (central) | id, nome, espécie, raça/detalhe (opcional), clienteId (tutor, por identificador) |
| **Cliente** (tutor, sem tela própria) | id, nome, telefone, email (opcional) |
| **Consulta** | id, petId (por identificador), data, motivo, status |

**5 telas:**

1. **Lista de pets** - mostra todos os pets cadastrados, com busca por nome.
2. **Detalhe do pet** - exibe os dados do pet e o histórico de consultas vinculadas a ele.
3. **Novo pet** - formulário para cadastrar um pet e o cliente (tutor) responsável.
4. **Nova consulta** - formulário para registrar uma consulta vinculada a um pet já cadastrado.
5. **Sobre o app** - tela informativa sobre o aplicativo e a unidade curricular.

**O que fica de fora:** a gestão de usuários e permissões, os relatórios gerenciais e a administração completa de clientes (edição e exclusão) do sistema original não entram neste aplicativo - o cliente é criado apenas junto do pet, sem tela própria.

## Stack

- Expo (React Native + TypeScript, `strict: true`, sem `any`)
- Criado com `npx create-expo-app@latest uc8-projeto-mobile --template blank-typescript`