[◄ Índice da base de conhecimento](../../../README.md)

---

# Login — `usuario-autenticacao`

Mesmo modelo de [`form/modelo_ia/form.md`](../modelo_ia/form.md): árvore revisada
aqui antes do `INSERT` (não migration, não seed — ver aviso em
[`README_modulo_form.md`](../../README_modulo_form.md)).

**O que é:** tela de login (`/v1/user-auth`, `POST /api/v1/auth`) — 1 único
grupo, 2 campos (`username`, `password_hash`), ambos coluna real de
`user_manager`. Reconstrução fiel do que existia no dump
`doc/sql/dump/202609201602.sql` (ids antigos 79–80, `form_manager` id=5),
revisado.

## Regra de campo — mesma do `form-constructor`

`field_name` é a coluna real da tabela (`username`, `password_hash` —
confirmado em `user_manager`). `field_key` é só o `id` do HTML, namespaced
por grupo.

## ⚠️ Achado ao revisar: campo de senha sem máscara

No dump, `password_hash` usava `field_type = 'text'` — senha em texto visível
na tela. O form **ativo** `cadastro-usuario` (mesma coluna `password_hash`,
`form_fields` id=76) usa `field_type = 'senha'` — esse é o padrão correto do
projeto para campo de senha. Proponho corrigir para `senha` aqui também (não
copiar o erro do dump). Revisar antes do `INSERT`.

## O registro `form_manager` (o formulário em si)

| Coluna            | Valor                                        |
| ----------------- | -------------------------------------------- |
| `slug`            | `usuario-autenticacao`                       |
| `table_name`      | `user_manager`                               |
| `title`           | Usuário (Autenticação)                       |
| `description`     | Tela de Login do Usuário                     |
| `roles`           | _(vazio — login é público, sem perfil dono)_ |
| `react_route`     | `/v1/user-auth`                              |
| `submit_endpoint` | `/api/v1/auth`                               |
| `http_method`     | `POST`                                       |
| `status`          | `draft` — nunca foi publicado                |
| `version`         | `1`                                          |

## Árvore de dados — hierarquia completa, sem detalhe (detalhe vai na tabela)

```
usuario-autenticacao
└─ Autenticação (form_manager_id -> este registro)
   ├─ Linha 1
   │  └─ Usuário
   └─ Linha 2
      └─ Senha
```

## Grupo 1 — Autenticação

_slug `autenticacao` · icon `person-fill`_

| Linha | Rótulo  | `field_name`    | Tipo                                                        | col | Obrig. | Observação |
| ----- | ------- | --------------- | ----------------------------------------------------------- | --- | ------ | ---------- |
| 1     | Usuário | `username`      | text                                                        | 12  | sim    | —          |
| 2     | Senha   | `password_hash` | **senha** (dump tinha `text` — corrigido, ver achado acima) | 12  | sim    | —          |

## Próximo passo

Revisar (principalmente a correção do tipo `senha`) e então gerar o `INSERT`
(`form_manager` → `form_groups` → `form_rows` → `form_fields`) a partir
exatamente desta tabela.

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
