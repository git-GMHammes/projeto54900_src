[◄ Índice da base de conhecimento](../../../README.md)

---

# Edição de Calendário — `editar-calendario`

Mesmo modelo de [`form/modelo_ia/form.md`](../modelo_ia/form.md): árvore revisada
aqui antes do `INSERT` (não migration, não seed — ver aviso em
[`README_modulo_form.md`](../../README_modulo_form.md)).

**O que é:** formulário de EDIÇÃO de `calendar_manager` — mesma árvore de
campos de [`calendar_manager.md`](calendar_manager.md) (slug `calendario`),
mas com destino de gravação diferente: `PUT` em vez de `POST`, direto no
registro clicado. É o padrão "uma submissão = um `form_manager` próprio" já
usado no projeto para o wizard de cadastro (`cadastro-usuario` e
`dados-do-usuario` são 2 `form_manager` separados para 2 submissões
diferentes — ver `README_paginas_modulo.md`).

**Por que um `form_manager` novo, e não reescrever `calendario`:** o registro
`calendario` já é usado (produção) para CRIAR (`POST .../create`, botão "Novo
Calendário" em `/v1/calendar-manager`). Trocar seu `submit_endpoint`/
`http_method` quebraria a criação. `editar-calendario` é a mesma árvore de
campos, só com meta de UPDATE — consumido pelo botão "Editar" (ação
`list_actions` tipo `modal`) da mesma tela.

**Pré-preenchimento:** este `form_manager` não pré-preenche sozinho — quem
abre o modal (`CalendarManagerGetAllPage.tsx`) injeta `defaultValue` em cada
campo a partir do calendário já carregado em tela (sem nova chamada de API).
`table_name`/campos idênticos a `calendario` garantem que os nomes batem
1:1 com o objeto já em memória (`CalendarManagerRow`, `services/calendarSchema.ts`).

## O registro `form_manager` (o formulário em si)

| Coluna | Valor |
| --- | --- |
| `slug` | `editar-calendario` |
| `table_name` | `calendar_manager` |
| `title` | Editar Calendário |
| `description` | Edição de Calendário |
| `roles` | `["guest","user","admin"]` |
| `react_route` | `/v1/calendar-manager/:id/update` |
| `submit_endpoint` | `/api/v1/calendar-manager/update/{id}` |
| `http_method` | `PUT` |
| `status` | `active` |
| `version` | `1` |

`react_route` é só metadado/documentação — igual ao já aceito em `calendario`
(`react_route = /v1/calendar-manager/create`, que também não tem rota React
registrada): este formulário é aberto em modal, não por navegação.

## Árvore de dados — IDÊNTICA à de `calendario` (mesmos 5 grupos/campos)

Ver [`calendar_manager.md`](calendar_manager.md), seções "Grupo 1" a "Grupo 5"
— não repetida aqui para não divergir por cópia. Nenhum campo, `col`,
obrigatoriedade ou observação muda entre os dois formulários; só a meta do
`form_manager` (tabela acima) é diferente.

## Próximo passo

Revisar e então gerar o `INSERT` (via API/Processor, não SQL cru) — mesma
árvore de `calendario`, meta desta página.

---

[◄ Índice da base de conhecimento](../../../README.md)

---

### 📌 Metadados do Autor

| Campo | Informação |
| --- | --- |
| **Nome** | Gustavo Hammes |
| **Local** | Rio de Janeiro |
| **LinkedIn** | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes) |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
