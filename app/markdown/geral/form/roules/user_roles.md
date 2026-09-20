[◄ Índice da base de conhecimento](../../../README.md)

---

# Cadastro de Perfil de Acesso — `cadastro-role`

Mesmo modelo de [`form/modelo_ia/form.md`](../modelo_ia/form.md): árvore revisada
aqui antes do `INSERT` (não migration, não seed — ver aviso em
[`README_modulo_form.md`](../../README_modulo_form.md)).

## ⚠️ Contexto — `user_roles` era read-only, agora não é mais

Até 2026-09-20, `user_roles` só tinha rotas de leitura — `create`/`update`/
`delete` eram bloqueados de propósito no backend (comentário no próprio
`EndpointTable.php`: _"Módulo read-only: sem create/update/delete"_). A
pedido explícito do usuário, o módulo foi completado ao padrão canônico do
projeto (18 rotas), espelhando exatamente `NavManager` (estrutura) e
`MenuManager` (coluna `permissions`, JSON de verdade — mesmo tratamento de
`MenuManager.roles`). Testado ponta a ponta antes deste doc: `create` (201),
unicidade de `slug` (409 em duplicata), `update` (200), `delete-soft` (200).

## O registro `form_manager` (o formulário em si)

| Coluna            | Valor                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| `slug`            | `cadastro-role`                                                           |
| `table_name`      | `user_roles`                                                              |
| `title`           | Perfil de Acesso                                                          |
| `description`     | Cadastro de perfil de acesso (role) — nome, slug, descrição e permissões. |
| `roles`           | `["admin"]`                                                               |
| `react_route`     | `/v1/user-roles/create`                                                   |
| `submit_endpoint` | `/api/v1/user-roles/create`                                               |
| `http_method`     | `POST`                                                                    |
| `status`          | `active`                                                                  |
| `version`         | `1`                                                                       |

## Árvore de dados — hierarquia completa, sem detalhe (detalhe vai na tabela)

```
cadastro-role
└─ Perfil (user_roles)
   ├─ Linha 1
   │  ├─ Nome
   │  └─ Slug
   ├─ Linha 2
   │  └─ Descrição
   ├─ Linha 3
   │  └─ Permissões
   └─ Linha 4
      └─ Ativo
```

## Grupo 1 — Perfil (`user_roles`)

_slug `perfil` · icon `shield-lock`_

| Linha | Rótulo     | `field_name`  | Tipo     | col | Obrig. | Observação                                                                                                                                                                                                 |
| ----- | ---------- | ------------- | -------- | --- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Nome       | `name`        | text     | 6   | sim    | placeholder "Ex: Financeiro"                                                                                                                                                                               |
| 1     | Slug       | `slug`        | text     | 6   | sim    | pattern `^[a-z0-9]+(?:-[a-z0-9]+)*$`; help: "Identificador único — usado nos `roles` de outros formulários (ex.: `financeiro`)."                                                                           |
| 2     | Descrição  | `description` | textarea | 12  | não    | `rows_qty=2`                                                                                                                                                                                               |
| 3     | Permissões | `permissions` | textarea | 12  | não    | `rows_qty=3`; coluna real é `json`; help: "Lista livre (ex.: slugs de rota/recurso liberados). Sem UI dedicada ainda — mesmo padrão textarea usado em `options_json`/`concat_json` de outros formulários." |
| 4     | Ativo      | `status`      | checkbox | 12  | não    | opção única "Sim" (coluna real é `tinyint(1)`, default `1`)                                                                                                                                                |

## Próximo passo

Revisar e então gerar o `INSERT` a partir exatamente desta tabela — mesmo
fluxo dos anteriores, aplicado a `user_roles`.

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
