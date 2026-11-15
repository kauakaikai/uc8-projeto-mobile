# 🐾 PetCare Mobile — UC8

Aplicativo mobile da PetCare, refeito para acompanhar os módulos do projeto desktop da UC5. Desenvolvido com **React Native, Expo e TypeScript**. A interface mantém a identidade visual do desktop e se adapta a telas de celular; o aplicativo continua abrindo pelo **Expo Go**.

## Funcionalidades

- **Tutores:** cadastrar, listar, editar e excluir tutores (nome, telefone e e-mail).
- **Pets:** selecionar um tutor e cadastrar, listar, editar e excluir seus pets (nome, espécie e raça).
- **Consultas:** selecionar tutor e pet, registrar, listar, editar e excluir consultas (data, hora, sintomas/descrição e valor).
- **Buscar:** localizar pets pelo nome do pet ou do tutor e filtrar os resultados por espécie.
- Mensagens de validação e tratamento de erros nas operações.

O mobile utiliza os mesmos nomes de tabelas e os mesmos campos definidos no projeto desktop: `clientes`, `pets` e `consultas`.

## Arquitetura e segurança

O aplicativo Expo **não conecta diretamente ao PostgreSQL** e não contém a senha do banco. A comunicação passa por uma pequena API Node.js/Express (`api/`), que utiliza `pg` e a `DATABASE_URL` do Neon no servidor. As consultas SQL são parametrizadas.

```text
Expo Go (celular)
      │ HTTP pela rede local
      ▼
API Node.js / Express (api/)
      │ DATABASE_URL (somente no servidor)
      ▼
Neon PostgreSQL
```

A API foi preparada para desenvolvimento local e apresentação em rede local. Antes de publicar a API na internet, adicione autenticação e autorização por usuário; não exponha uma API de escrita aberta publicamente.

## 1. Preparar o banco Neon

Use o mesmo banco Neon já configurado no projeto desktop. No painel SQL do Neon, execute o conteúdo de `api/schema.sql` caso as tabelas `clientes`, `pets` e `consultas` ainda não existam. Se o schema do desktop já foi executado nesse banco, não precisa executar novamente.

## 2. Iniciar a API

Abra um terminal na pasta `api`:

```bash
cd api
npm install
```

Copie `api/.env.example` para `api/.env` e coloque a mesma string `DATABASE_URL` usada no desktop:

```env
DATABASE_URL=postgresql://usuario:senha@host/neondb?sslmode=require
PORT=3000
```

Inicie o servidor:

```bash
npm run dev
```

O terminal deve informar que a API está disponível na porta 3000. Teste no navegador do computador em `http://localhost:3000/api/health`; deve aparecer `{"status":"ok","servico":"PetCare API"}`.

## 3. Configurar o Expo Go

Em outro terminal, na raiz do projeto mobile:

```bash
npm install
```

Copie `.env.example` para `.env.local`. No valor de `EXPO_PUBLIC_API_URL`, troque `SEU_IP_LOCAL` pelo IPv4 do computador que está executando a API. No Windows, descubra-o com `ipconfig`:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.15:3000/api
```

Use o IP real do seu computador, não o exemplo acima. O celular e o computador precisam estar na mesma rede Wi-Fi. Permita o acesso do Node.js na rede privada do Windows, caso o Firewall pergunte.

Inicie o Expo:

```bash
npx expo start --lan
```

Abra o Expo Go no celular e leia o QR Code. Mantenha os dois terminais abertos durante o uso (API e Expo).

> Quando alterar `.env.local`, reinicie o Expo limpando o cache: `npx expo start --clear`.

## 4. Estrutura mantida

As pastas e os arquivos que já existiam no projeto mobile foram mantidos. A nova tela principal concentra a navegação e as operações equivalentes às quatro abas do desktop. As telas, componentes, navegação, cache SQLite, contexto e roteiro de testes anteriores continuam no repositório para consulta e reaproveitamento; nenhum deles precisa ser apagado.

```text
App.tsx
api/
  server.js       API Express conectada ao Neon
  schema.sql      schema compatível com o desktop
  .env.example    modelo das variáveis privadas do servidor
src/
  servicos/
    petcareApi.ts cliente HTTP usado pelas quatro abas
    pets.ts       adaptador mantido para o contexto legado
  componentes/
    Botao.tsx e Campo.tsx componentes reutilizados e alinhados ao desktop
  telas/
    TelaPetCare.tsx interface principal (Tutores, Pets, Consultas e Buscar)
  tema/tema.ts    cores alinhadas ao projeto desktop
```

`src/supabase/squema.sql` permanece no projeto como arquivo histórico da implementação anterior, mas não é utilizado pela nova aplicação. O aplicativo e a API passam a usar o Neon configurado no servidor.

## 5. Observações

- O banco precisa estar acessível pela internet (Neon), mas o telefone só precisa alcançar a API no computador pela rede Wi-Fi.
- A API valida os campos e impede excluir tutor com pets ou pet com consultas vinculadas, seguindo as regras do desktop.
- A exclusão de uma consulta é permitida, assim como no desktop.
- O arquivo `api/.env` e o `.env.local` da raiz não devem ser enviados ao GitHub. Nunca compartilhe a senha ou a URL completa com credenciais.
