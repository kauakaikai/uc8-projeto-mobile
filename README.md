# uc8-projeto-mobile

Aplicativo mobile da UC8 "Desenvolver aplicações mobile" (SENAC RN Mossoró), em React Native com Expo e TypeScript.

## Sistema de origem

O tema é o PetCare, sistema de clínica veterinária desenvolvido na UC5 (desktop, com clientes, pets e consultas), reduzido para caber nas 140 horas da unidade.

## Recorte

**Entidade central: Pet.** O aplicativo trabalha ponta a ponta com ela: nuvem, aparelho e fila de envio.

| Entidade | Campos usados pelo aplicativo                                                                              |
| -------- | ---------------------------------------------------------------------------------------------------------- |
| **Pet**  | id, nome, espécie (`cachorro`, `gato`, `ave` ou `outro`), raça (opcional), clienteId (referência ao tutor) |

`Cliente` e `Consulta` continuam tipadas em `src/tipos/entidades.ts`, mas não têm tela neste recorte: o tutor aparece só como referência (`clienteId`) e a consulta ficou fora.

> Mudança de recorte: o recorte inicial (módulo 1) previa também a tela _nova consulta_. Ela saiu para que o Pet fosse entregue completo, com nuvem, cache e fila. O README e os tipos acompanham essa mudança.

**Telas:**

1. **Lista de pets** (aba Pets): mostra os pets em uma coluna no celular e em duas em janela larga, com os estados carregando, erro e pronto, e os botões _Recarregar_ e _Novo pet_.
2. **Detalhe do pet**: abre pelo toque em _Ver detalhes_, levando só o `id` como parâmetro tipado.
3. **Novo pet**: formulário com nome (obrigatório) e raça; mostra a recusa do servidor quando ela acontece.
4. **Sobre** (aba Sobre): dados da janela, densidade e escala da fonte, e quantos pets estão guardados no aparelho.

**O que fica de fora:** usuários e permissões, relatórios gerenciais, tela de consultas, gestão de clientes e edição ou exclusão de pets.

## Como funciona

- **Nuvem:** tabela `pets` no Supabase, lida e gravada por `fetch` na API de dados (HTTPS). O papel `anon` só lê e inclui (`supabase/esquema.sql`).
- **Aparelho:** `expo-sqlite` guarda uma cópia dos pets e a fila de cadastros pendentes (`src/banco/banco.ts`).
- **Sem rede:** a lista vem do aparelho, com o aviso do motivo. Um cadastro feito sem rede entra na fila (`A enviar (n)`) e é enviado na próxima abertura ou ao tocar em _Recarregar_.
- **Erros:** classificados em um só lugar (`src/erros/erros.ts`); a tela mostra a mensagem para quem usa e o console recebe o detalhe técnico.
- **Dados pessoais:** o aplicativo guarda só dados do pet. Nome, telefone e e-mail do tutor não entram no aparelho nem na nuvem.

## Configuração

O aplicativo lê a URL do projeto e a chave publicável do Supabase de um arquivo `.env.local`, que não vai para o repositório. Copie `.env.example` para `.env.local` e preencha:

```
EXPO_PUBLIC_SUPABASE_URL=https://xouxkupjvvklyzpyhyur.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=sb_publishable_COLE-A-SUA-CHAVE-PUBLICAVEL
```

Só a chave publicável vai no aplicativo. A chave secreta e a senha do banco ficam fora do código.

## Como rodar

```
npm install
cp .env.example .env.local
npx expo start
```

No celular, abra o Expo Go e leia o QR Code. No laboratório do SENAC, com o cabo USB:

```
adb reverse tcp:8081 tcp:8081
export REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1
npx expo start
```

## Testes e qualidade

- `npx tsc --noEmit` termina sem erro e o projeto não usa `any` (`git grep -nw any -- "*.ts" "*.tsx"` não encontra nada).
- O roteiro de teste, com o resultado de cada caso, está em `docs/roteiro_de_teste.md`.

## APK

O APK sai do EAS Build, com o perfil `preview` do `eas.json` e o pacote Android definido no `app.json`. As variáveis `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_KEY` ficam no painel do projeto na Expo, porque o `.env.local` não vai para o build:

```
npx eas-cli@latest build -p android --profile preview
```

## Estrutura

```
App.tsx                 provedor, abas e navegação
src/banco/              SQLite: cache dos pets e fila de pendentes
src/componentes/        Botao, Campo, CartaoPet, FormularioPet
src/contexto/           estado global dos pets (PetsProvedor, usePets)
src/erros/              classificação e registro de erros
src/navegacao/          pilha de telas e tipos das rotas
src/servicos/           acesso à API do Supabase
src/telas/              TelaPets, TelaDetalhePet, TelaNovoPet, TelaSobre
src/tema/               cores, espaços e medidas
src/tipos/              entidades tipadas
supabase/esquema.sql    tabela, segurança por linha e permissões
docs/                   roteiro de teste
```

## Stack

Expo SDK 57, React Native, TypeScript em modo estrito, React Navigation 7 (pilha e abas), Supabase (API de dados), expo-sqlite e EAS Build.
