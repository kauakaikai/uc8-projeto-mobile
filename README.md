# PetCare Mobile — UC8

Aplicativo mobile de gerenciamento de tutores, pets e consultas veterinárias. Desenvolvido com **React Native, Expo e TypeScript**, com persistência local em **SQLite** e uma API **Node.js/Express** conectada ao **PostgreSQL do Neon**.

## Funcionalidades

- **Tutores:** cadastrar, consultar, editar e excluir tutores.
- **Pets:** cadastrar, consultar, editar e excluir pets vinculados a um tutor.
- **Consultas:** registrar, consultar, editar e excluir consultas vinculadas a um pet.
- **Buscar:** localizar pets pelos dados disponíveis na busca.
- **Sobre:** apresentar informações do aplicativo.
- **Uso offline para novos cadastros:** quando não há conexão, novos tutores, pets e consultas podem ser guardados no SQLite e colocados em uma fila para sincronização posterior.

## Tecnologias

- React Native, Expo e TypeScript.
- Expo SQLite para cache e fila local de operações pendentes.
- Node.js e Express para a API HTTP.
- PostgreSQL hospedado no Neon.
- Render para hospedagem da API.
- EAS Build para gerar o APK Android.

## Arquitetura

O aplicativo não acessa o PostgreSQL diretamente. A comunicação com o banco passa pela API; o SQLite mantém dados locais e operações pendentes no aparelho.

```text
Aplicativo PetCare (Expo / React Native)
       │
       ├── petcareApi.ts ── HTTP ──> API Node.js / Express (Render)
       │                                  │
       │                                  └── PostgreSQL (Neon)
       │
       └── persistenciaPetCare.ts ──> SQLite local
                                      ├── cache de dados
                                      └── fila de cadastros pendentes
```

### Como funciona o modo offline

1. O aplicativo mantém dados locais no SQLite para permitir a consulta dos dados já armazenados no aparelho.
2. Se um novo tutor, pet ou consulta for cadastrado sem conexão, a operação é guardada na fila local.
3. O aplicativo usa identificadores temporários para relacionar cadastros que ainda não receberam um ID do servidor.
4. Quando a conexão volta e a rotina de atualização é executada, `sincronizarPendentes()` tenta enviar os itens da fila à API e relacionar os IDs temporários aos IDs definitivos.

**Limitação conhecida:** nesta versão, a fila offline atende à criação de tutores, pets e consultas. Edição e exclusão ainda dependem de conexão com a API. A fila e o cache são locais ao aparelho; não substituem o banco central.

## Configuração do banco de dados

O banco PostgreSQL utilizado pela API é hospedado no Neon. Caso as tabelas ainda não existam, execute o script `api/schema.sql` no banco. As entidades principais são `clientes` (tutores), `pets` e `consultas`.

A variável `DATABASE_URL` contém a string de conexão do banco e deve existir **somente no ambiente da API**, nunca no aplicativo mobile.

## Configurar e executar a API localmente

Na raiz do projeto, abra um terminal:

```bash
cd api
npm install
```

Crie `api/.env` a partir de `api/.env.example` e configure a conexão do Neon:

```env
DATABASE_URL=postgresql://usuario:senha@host/neondb?sslmode=require
PORT=3000
```

Inicie a API em modo de desenvolvimento:

```bash
npm run dev
```

Verifique a saúde da API no navegador:

```text
http://localhost:3000/api/health
```

A resposta esperada é um JSON indicando `status: ok` e `servico: PetCare API`.

## Configurar o aplicativo mobile

Na raiz do projeto mobile, instale as dependências:

```bash
npm install
```

Crie `.env.local` a partir de `.env.example` e informe a URL base da API, terminando em `/api`.

Para usar a API hospedada no Render:

```env
EXPO_PUBLIC_API_URL=https://SEU-SERVICO.onrender.com/api
```

Substitua o exemplo pelo endereço real do serviço Render. Para usar uma API executada no computador, use o IPv4 do computador na rede local, por exemplo:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.15:3000/api
```

O endereço acima é apenas um exemplo. Em um teste pela rede local, o celular e o computador precisam estar na mesma rede e o firewall deve permitir a conexão com a API.

Depois de alterar `.env.local`, reinicie o Expo limpando o cache:

```bash
npx expo start -c
```

Leia o QR Code com o Expo Go. Para o aplicativo funcionar com a API hospedada, o celular precisa ter acesso à internet. Para o teste com API local, precisa alcançar o computador pela rede local.

## Implantação da API no Render

A API pode ser implantada a partir da pasta `api/` do repositório. Na configuração do serviço, utilize:

- **Root Directory:** `api`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment Variable:** `DATABASE_URL`, com a string de conexão do Neon.

O Render fornece a variável `PORT` para o serviço web. Após a implantação, teste `https://SEU-SERVICO.onrender.com/api/health` e configure essa URL em `EXPO_PUBLIC_API_URL` no ambiente do aplicativo.

## Verificação de TypeScript

Para verificar os tipos antes de executar ou entregar o projeto:

```bash
npx tsc --noEmit
```

O comando deve terminar sem apresentar erros.

## APK Android — versão para entrega

Aplicativo compilado com sucesso pelo EAS Build em 15/11/2026.

- **Perfil:** preview
- **Plataforma:** Android
- **Version code:** 3

**Links para download e consulta:**

- [Acessar página do build no EAS](https://expo.dev/accounts/kauakaikai/projects/uc8-projeto-mobile/builds/4fe253f2-4f7a-4425-b8eb-262f700f172f)
- [Baixar APK PetCare](https://expo.dev/artifacts/eas/UVrPcFkKn3UqieHZ9-F1056rDklV87kIXpI9carkw-M.apk)

## Estrutura principal

```text
App.tsx
api/
  server.js
  schema.sql
  .env.example
src/
  banco/
    persistenciaPetCare.ts
  servicos/
    petcareApi.ts
  telas/
    TelaPetCare.tsx
    TelaSobre.tsx
  tema/
    tema.ts
docs/
  roteiro_de_teste.md
```

Os nomes de arquivos podem incluir outros componentes e módulos auxiliares além dos itens principais mostrados acima.

## Segurança e observações

- Não coloque `DATABASE_URL` no aplicativo nem em variáveis `EXPO_PUBLIC_*`.
- Não envie `api/.env` ou `.env.local` ao GitHub. Esses arquivos devem permanecer ignorados pelo Git.
- A API atual não implementa autenticação de usuários. Portanto, use apenas dados fictícios em demonstrações públicas e não cadastre informações pessoais reais até que autenticação e autorização sejam implementadas.
- A API precisa estar acessível para realizar operações remotas e sincronizar a fila local.
- O SQLite é uma persistência por dispositivo; limpar os dados do aplicativo pode remover cache e cadastros ainda não sincronizados.

## Roteiro de testes

Os resultados conhecidos e as limitações verificadas estão registrados em [`docs/roteiro_de_teste.md`](docs/roteiro_de_teste.md).
