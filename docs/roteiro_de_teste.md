# Roteiro de testes — PetCare Mobile

Este roteiro registra os testes executados na versão mobile com API Express, PostgreSQL/Neon e persistência local SQLite. Os resultados marcados como **aprovado** correspondem aos testes confirmados durante a validação do aplicativo em 15/11/2026. Os demais permanecem como não executados; não devem ser tratados como aprovados sem uma nova execução.

## Legenda

- **Aprovado:** o resultado observado correspondeu ao esperado e foi confirmado durante a validação.
- **Não executado:** ainda não há confirmação de execução.
- **Limitação conhecida:** comportamento não oferecido pela versão atual, documentado para evitar que seja confundido com defeito inesperado.

## Casos de teste

| ID | Caso | Procedimento | Resultado esperado | Resultado observado |
| --- | --- | --- | --- | --- |
| T01 | Verificação de TypeScript | Na raiz do projeto, executar `npx tsc --noEmit`. | Comando termina sem erros de TypeScript. | **Aprovado** — compilação limpa confirmada em 15/11/2026. |
| T02 | Saúde da API | Abrir `/api/health` no navegador. | API responde com status `ok` e identificação `PetCare API`. | **Aprovado** — endpoint foi acessado e respondeu corretamente durante a configuração. |
| T03 | Cadastro offline de tutor | Carregar o aplicativo, desligar a conexão e cadastrar um tutor fictício. | Aplicativo aceita o cadastro e guarda a operação localmente na fila. | **Aprovado** — cadastro offline realizado com sucesso. |
| T04 | Cadastro offline de pet | Com um tutor previamente salvo no aparelho, desligar a conexão e cadastrar um pet fictício vinculado a esse tutor. | Pet é guardado localmente e entra na fila para sincronização. | **Aprovado** — cadastro offline realizado com sucesso. |
| T05 | Cadastro offline de consulta | Com um pet previamente salvo no aparelho, desligar a conexão e cadastrar uma consulta fictícia. | Consulta é guardada localmente e entra na fila para sincronização. | **Aprovado** — cadastro offline realizado com sucesso. |
| T06 | Sincronização após reconexão | Reconectar a internet e executar a atualização/sincronização do aplicativo. Conferir os registros no aplicativo e no servidor. | Itens pendentes são enviados à API e passam a ter IDs definitivos; fila é atualizada. | **Aprovado** — sincronização dos cadastros offline de tutor, pet e consulta confirmada. |
| T07 | Consulta dos dados sem conexão | Com dados previamente carregados, desligar a rede, fechar e abrir o aplicativo e consultar as listas. | Aplicativo apresenta os dados disponíveis no cache local, sem depender da API. | **Não executado** como caso isolado. |
| T08 | Edição com conexão | Com internet disponível, editar um tutor, um pet e uma consulta; conferir os dados após recarregar. | Alterações são enviadas à API e aparecem atualizadas no aplicativo. | **Não executado** como conjunto completo de CRUD nesta rodada. |
| T09 | Exclusão com conexão | Com internet disponível, excluir registros de teste sem vínculos que impeçam a operação. | API exclui os registros e o aplicativo atualiza as listas. | **Não executado** como caso isolado nesta rodada. |
| T10 | Edição sem conexão | Desligar a rede e tentar editar tutor, pet ou consulta. | A versão atual não oferece fila offline para edição; a operação depende de conexão. | **Limitação conhecida** — requer internet. |
| T11 | Exclusão sem conexão | Desligar a rede e tentar excluir tutor, pet ou consulta. | A versão atual não oferece fila offline para exclusão; a operação depende de conexão. | **Limitação conhecida** — requer internet. |
| T12 | Busca de pets | Pesquisar por nome do pet ou do tutor com e sem conexão. | Resultados correspondem ao termo informado, conforme os dados disponíveis no modo atual. | **Não executado** nesta rodada. |

## Observações da validação offline

- Os três tipos de criação foram testados separadamente: tutor, pet e consulta.
- Para criar um pet offline, o tutor relacionado precisa estar disponível no armazenamento local.
- Para criar uma consulta offline, o pet relacionado precisa estar disponível no armazenamento local.
- A sincronização é acionada pela rotina de atualização do aplicativo, que chama `sincronizarPendentes()`.
- Edição e exclusão não fazem parte da fila offline nesta versão.
- Os testes devem usar dados fictícios. A API não possui autenticação de usuários nesta versão.

## Resultado geral

**Aprovado:** compilação TypeScript e fluxo de criação offline/sincronização para tutores, pets e consultas, conforme validação realizada em 15/11/2026.

**Pendente:** execução isolada dos testes de consulta do cache após reinicialização, edição, exclusão e busca. Esses casos não devem ser apresentados como aprovados até serem testados.
