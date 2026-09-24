[◄ Índice da base de conhecimento](../../../README.md)

---

# Cadastro de Item de Menu — `cadastro-menu`

Mesmo modelo de [`form/modelo_ia/form.md`](../modelo_ia/form.md): árvore revisada
aqui antes do `INSERT` (não migration, não seed — ver aviso em
[`README_modulo_form.md`](../../README_modulo_form.md)).

**O que é:** formulário de `menu_manager` — a árvore de itens de navegação.
Cada linha pertence a UM [`nav_manager`](../nav/nav_manager.md) (`nav_manager_id`)
e pode ter `parent_id` (auto-relacionamento, para submenu). Complementa
`nav_manager` — ver [`README_menu.md`](../../../../../frontend/projeto54900/src/markdown/geral/README_menu.md)
pra convenção de faixas de `sort_order` (`<100` navbar real, `>=1000`
catálogo extra, `>=2000` árvore administrativa) e pra limitação atual (item
com `parent_id` preenchido não aparece na navbar pública, só na tela de
gestão). Como `nav_manager.md`, não é reconstrução de dump — desenho novo,
direto do schema real (`DESCRIBE menu_manager`).

## O registro `form_manager` (o formulário em si)

| Coluna            | Valor                                                                               |
| ----------------- | ----------------------------------------------------------------------------------- |
| `slug`            | `cadastro-menu`                                                                     |
| `table_name`      | `menu_manager`                                                                      |
| `title`           | Item de Menu                                                                        |
| `description`     | Cadastro de item de navegação — pertence a um Nav e pode ter um item pai (submenu). |
| `roles`           | `["admin"]`                                                                         |
| `react_route`     | `/v1/menu-manager/create`                                                           |
| `submit_endpoint` | `/api/v1/menu-manager/create`                                                       |
| `http_method`     | `POST`                                                                              |
| `status`          | `active`                                                                            |
| `version`         | `1`                                                                                 |

## Árvore de dados — hierarquia completa, sem detalhe (detalhe vai na tabela)

```
cadastro-menu
└─ Item de Menu (menu_manager)
   ├─ Linha 1
   │  ├─ Nav
   │  └─ Item pai
   ├─ Linha 2
   │  └─ Título
   ├─ Linha 3
   │  ├─ Rota no React
   │  └─ Local
   ├─ Linha 4
   │  └─ Perfis
   └─ Linha 5
      ├─ Ordem
      └─ Status
```

## Grupo 1 — Item de Menu (`menu_manager`)

_slug `item` · icon `list-nested`_

| Linha | Rótulo        | `field_name`     | Tipo   | col | Obrig. | Observação                                                                                                                                                                                                                |
| ----- | ------------- | ---------------- | ------ | --- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Nav           | `nav_manager_id` | select | 6   | sim    | remoto: `GET /api/v1/nav-manager/get-no-pagination`, `valueKey=id`, `labelTemplate="{title} #{id}"`; help: "A qual Nav este item pertence."                                                                               |
| 1     | Item pai      | `parent_id`      | select | 6   | não    | remoto: `GET /api/v1/menu-manager/get-no-pagination`, `valueKey=id`, `labelTemplate="{title} #{id}"`; help: "Vazio = item de topo. Preenchido = vira submenu (hoje só aparece na tela de gestão, não na navbar pública)." |
| 2     | Título        | `title`          | text   | 12  | sim    | placeholder "Ex: Usuários"                                                                                                                                                                                                |
| 3     | Rota no React | `react_route`    | text   | 8   | não    | placeholder `/v1/user-manager`; help: "Vazio = item organizacional (só agrupa filhos), também some da navbar pública hoje."                                                                                               |
| 3     | Local         | `placement`      | radio  | 4   | não    | `inline=1`, padrão `navbar`; opções: Navbar (`navbar`), Offcanvas (`offcanvas`); help: "Item de topo: onde ele (e seus filhos) aparece. Filhos seguem o pai." — seed `202609241701_seed_table.sql` |
| 4     | Perfis        | `roles`          | text   | 12  | não    | `datalist_json`: `["admin","editor","viewer","rh","financeiro"]`; coluna real é `json`                                                                                                                                    |
| 5     | Ordem         | `sort_order`     | text   | 4   | não    | `input_mode=numeric`; help: "`<100` navbar real · `>=1000` catálogo extra · `>=2000` árvore admin."                                                                                                                       |
| 5     | Status        | `status`         | radio  | 8   | não    | `inline=1`; opções: Rascunho (`draft`), Ativo (`active`), Inativo (`inactive`)                                                                                                                                            |

## Próximo passo

Revisar e então gerar o `INSERT` (`form_manager` → `form_groups` →
`form_rows` → `form_fields`) a partir exatamente desta tabela — mesmo fluxo
do `form-constructor`/`list-constructor`/`nav_manager.md`, aplicado a
`menu_manager`.

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
