[◄ Índice da base de conhecimento](../../../README.md)

---

# Módulo `company_manager` — frontend (empresas e acesso individual)

Backend e banco em
[`README_modulo_companies.md`](../../../../../../../app/markdown/geral/README_modulo_companies.md).
Aqui: o que existe no frontend e os dois **componentes globais** novos.

## Telas (todas admin — `RequireRole`)

| Rota | Página | Fonte dos dados |
| ---- | ------ | --------------- |
| `/v1/company-manager` | `pages/v1/company/company-manager/GetAllPage` | lista 42 (`list_manager`), busca, Editar/Excluir (DEFAULT sem Excluir) |
| `/v1/company-manager/create` | `…/CreatePage` | form 48 `criar-empresa` |
| `/v1/company-manager/update/:id` | `…/UpdatePage` | form 49 `editar-empresa` |
| `/v1/user-resource-access` | `pages/v1/user/user-resource-access/GetAllPage` | lista 43 |
| `/v1/user-resource-access/create` | `…/CreatePage` | schema inline: o **tipo** (formulário/listagem) troca o `src` do select de recurso; `?user_manager_id=` pré-seleciona o usuário |
| `/v1/user-resource-access/update/:id` | `…/UpdatePage` | só o campo Acesso muda |

Menu **"Empresa"** (offcanvas, pai sem rota) com os filhos Empresas, Membros (`/v1/company-members`, lista 44), Usuários por empresa (`/v1/company-users`, lista 45) e Acesso individual. Membros tem tela de seleção (abaixo); Usuários por empresa é só leitura. Na lista de usuários (`user-manager`) há duas ações novas:
**Empresas** (modal `ChangeCompaniesModal`, grava `company_ids` — select múltiplo de `companies`, nunca JSON digitado; vazio envia `null`)
e **Acesso individual** (link para o cadastro já com o usuário).

## Membros por empresa (seleção de empresa + marcação de usuários)

Espelho de `pages/v1/messages/message-group-members-manager/`, em `pages/v1/company/company-members/`:

- **`CompanyMembersEditor`** — dois cards: usuários (checklist com busca, `company-users-companies-view`, até 1000; acima disso a busca vai ao servidor)
  e empresa (select remoto com busca + membros ativos de `company-members-view`). Marcar um usuário o põe como "novo"; marcar um membro, como "remover";
  **Salvar** grava tudo numa chamada (`PUT company-members/sync/{id}`). Empresa não tem dono: só admin edita.
- **`UpdatePage`** (`/v1/company-members/update/:id`) — o `:id` é a empresa inicial; trocar no select atualiza a URL.
- **`CreateModal`** — botão **Novo** da lista 44, em 2 etapas: form `criar-empresa` e depois o editor com a empresa recém-criada.
- **`GetAllPage`** (`/v1/company-members`) — `ListBuild` com a ação **Membros** (link para a UpdatePage) e **Editar empresa**.
  `ListBuild` ganhou a prop `headerActions` (botões extras no cabeçalho).
- Services: `companyMembers.table.ts` (`syncCompanyMembers`), `companyMembers.view.ts`, `companyMemberships.view.ts`, `companyUsersCompanies.view.ts`.

## Componentes globais novos (`components/global/`)

- **`ListBuild`** — listagem dirigida por dados, por **props** (`slug`, `createPath`, `createLabel`, textos, `headerActions`). Extraído do `GetAllPage`
  de `message-groups-manager`; as `GetAllPage` novas são só wrappers. Antes de listar chama o `check` (acesso negado vira `EmptyState`).
- **`RecordFormBuild`** — cadastro **ou** edição por formulário do banco, por **props** (`slug`, `backPath`, `recordId`, `loadRecord`,
  `toValues`, `defaults`, `patches`). Substitui o par `CreatePage`/`UpdatePage` copiado por módulo. Também chama o `check`.

Regra: render dirigido por dados nunca fica preso a `useParams`; a página só repassa props.

## Verificação de acesso

`services/v1/resourceAccess.ts`: `checkResourceAccess(type, {id|slug})` e `isDenied(result)`. Só conta como **negação** `source`
`user` ou `role` — falha de rede (`error`) e recurso inexistente (`not_found`) deixam a tela seguir e mostrar o próprio erro.
Aplicado em `ListBuild`, `RecordFormBuild`, `FormBuild`, `FormRendererPage` e nas páginas antigas de lista/formulário (padrão: logo após achar o `list_manager`/antes de ler o `form_manager`, `isDenied(await checkResourceAccess(...))` → `EmptyState`) (esta só com sessão: serve também formulário público,
ex.: cadastro de usuário).

## Organograma

Esquema Empresa → Usuários → Listas e Forms e a consolidação com o sistema:
[`README_modulo_companies.md`](../../../../../../../app/markdown/geral/README_modulo_companies.md#organograma-de-acesso-sas) (backend).

## Pendências

- As listagens antigas (cópias de `GetAllPage`) não usam `ListBuild`, mas **todas** passaram a chamar o `check` (2026-10-11): 24 listas e 24 formulários Create/Update de messages, chat-rooms, timeline, upload, menu, nav, user etc. Ficam de fora, de propósito: `cadastro-usuario`/`dados-do-usuario` (cadastro público, sem sessão), `FormConstructorPage`/`ListConstructorPage` (ferramentas de admin) e a lista de calendários (só lê colunas/ações de lista).
- `user.companies` já vem no login/`auth/me`, mas o frontend não exibe nem filtra por empresa.
- Telas conferidas por `tsc` e `eslint`; **não foram abertas no navegador** nesta entrega.

---

[◄ Índice da base de conhecimento](../../../README.md)

---

[◄ Índice da base de conhecimento](../../../README.md)

---

### 📌 Metadados do Autor

| Campo               | Informação                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Nome**            | Gustavo Hammes                                                                                                               |
| **Local**           | Rio de Janeiro                                                                                                               |
| **LinkedIn**        | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes)                                                 |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
