[◄ Índice da base de conhecimento](../../../README.md)

---

# Cadastro de Nav — `cadastro-nav`

Mesmo modelo de [`form/modelo_ia/form.md`](../modelo_ia/form.md): árvore revisada
aqui antes do `INSERT` (não migration, não seed — ver aviso em
[`README_modulo_form.md`](../../README_modulo_form.md)).

**O que é:** formulário de `nav_manager` — a "casca" do app (nome exibido na
navbar, imagem, ícone de mensagens, versão do sistema). **Não** guarda itens
de navegação — isso é `menu_manager`, FK para este registro (ver
[`README_menu.md`](../../../../../frontend/projeto54900/src/markdown/geral/README_menu.md)),
fora do escopo deste doc. Como o `form-constructor`/`list-constructor`, não é
reconstrução de dump — nunca existiu formulário genérico para `nav_manager`
(hoje é tela própria, `pages/v1/nav/{Create,Update}Page.tsx`); desenho novo,
direto do schema real (`DESCRIBE nav_manager`).

## O registro `form_manager` (o formulário em si)

| Coluna            | Valor                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| `slug`            | `cadastro-nav`                                                                                           |
| `table_name`      | `nav_manager`                                                                                            |
| `title`           | Nav (Casca do App)                                                                                       |
| `description`     | Cadastro da casca de navegação: nome, imagem, ícone de mensagens e versão do sistema exibidos na navbar. |
| `roles`           | `["admin"]`                                                                                              |
| `react_route`     | `/v1/nav-manager/create`                                                                                 |
| `submit_endpoint` | `/api/v1/nav-manager/create`                                                                             |
| `http_method`     | `POST`                                                                                                   |
| `status`          | `active`                                                                                                 |
| `version`         | `1`                                                                                                      |

## Árvore de dados — hierarquia completa, sem detalhe (detalhe vai na tabela)

```
cadastro-nav
└─ Nav (nav_manager)
   ├─ Linha 1
   │  ├─ Título
   │  └─ Versão do sistema
   ├─ Linha 2
   │  ├─ Imagem
   │  └─ Ícone de mensagens
   └─ Linha 3
      └─ Status
```

## Grupo 1 — Nav (`nav_manager`)

_slug `nav` · icon `window`_

| Linha | Rótulo             | `field_name`     | Tipo  | col | Obrig. | Observação                                                                     |
| ----- | ------------------ | ---------------- | ----- | --- | ------ | ------------------------------------------------------------------------------ |
| 1     | Título             | `title`          | text  | 8   | sim    | placeholder "Ex: Projeto 54900"                                                |
| 1     | Versão do sistema  | `system_version` | text  | 4   | não    | placeholder `1.0.0`                                                            |
| 2     | Imagem             | `image`          | text  | 6   | não    | placeholder `/assets/logo.png` — `max_length=500` (coluna real)                |
| 2     | Ícone de mensagens | `message_icon`   | text  | 6   | não    | placeholder `bi-chat-dots` — `max_length=64` (coluna real)                     |
| 3     | Status             | `status`         | radio | 12  | não    | `inline=1`; opções: Rascunho (`draft`), Ativo (`active`), Inativo (`inactive`) |

## Próximo passo

Revisar e então gerar o `INSERT` (`form_manager` → `form_groups` →
`form_rows` → `form_fields`) a partir exatamente desta tabela — mesmo fluxo
do `form-constructor`/`list-constructor`, aplicado a `nav_manager`.

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
