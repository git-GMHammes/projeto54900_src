[◄ Índice da base de conhecimento](../../../README.md)

---

# Cadastro de Usuário — Etapa 2 (`dados-do-usuario`)

Mesmo modelo de [`form/modelo_ia/form.md`](../modelo_ia/form.md): árvore revisada
aqui antes do `INSERT` (não migration, não seed — ver aviso em
[`README_modulo_form.md`](../../README_modulo_form.md)).

**O que é:** segunda etapa do cadastro — dados pessoais
(`user_profiles`), ligados à etapa 1
([`create_user_manager.md`](create_user_manager.md), `user_manager`) pela
chave `user_manager_id`. Reconstrução fiel do dump
`doc/sql/dump/202609201602.sql` (ids antigos 68–74, 77–78, `form_manager`
id=4).

## A chave que liga as duas etapas

Campo `user_manager_id` (Grupo "Identificação", Linha 1) — `required=1` **e**
`read_only=1`: aparece na tela mas não é digitado pelo usuário. É preenchido
pelo front com o `id` que voltou do `POST` da Etapa 1
(`cadastro-usuario` → `/api/v1/user-manager/create`), antes de submeter este
formulário.

## Regra de campo — não repetir o erro do `calendario`

`field_name` precisa ser exatamente a coluna real (minúsculo, snake_case).
Achado ao revisar: o dump tinha `field_name = 'Whatsapp'` (maiúsculo) — a
coluna real em `user_profiles` é `whatsapp` (confirmado via `DESCRIBE`).
Corrigido abaixo.

## O registro `form_manager` (o formulário em si)

| Coluna            | Valor                                                                         |
| ----------------- | ----------------------------------------------------------------------------- |
| `slug`            | `dados-do-usuario`                                                            |
| `table_name`      | `user_profiles`                                                               |
| `title`           | Usuário (Dados)                                                               |
| `description`     | Cadastro da segunda etapa do Formulário _(dump tinha "Fomulário", corrigido)_ |
| `roles`           | `["guest","user","admin"]`                                                    |
| `react_route`     | `/v1/user-manager/create`                                                     |
| `submit_endpoint` | `/api/v1/user-profiles/create`                                                |
| `http_method`     | `POST`                                                                        |
| `status`          | `active`                                                                      |
| `version`         | `1`                                                                           |

## Árvore de dados — hierarquia completa, sem detalhe (detalhe vai na tabela)

```
dados-do-usuario
├─ Grupo 1: Identificação 🆔
│  ├─ Linha 1
│  │  ├─ Usuario (vínculo)
│  │  └─ UUID
│  └─ Linha 2
│     ├─ Nome
│     └─ CPF
├─ Grupo 2: Contato 📞
│  └─ Linha 1
│     ├─ whatsapp
│     ├─ Telefone
│     └─ E-mail
└─ Grupo 3: Endereço 🏠
   └─ Linha 1
      ├─ CEP
      └─ Endereço
```

## Grupo 1 — Identificação 🆔

_slug `grupo-1-identificacao` · icon `person-rolodex`_

| Linha | Rótulo            | `field_name`      | Tipo | col | Obrig. | Observação                                                  |
| ----- | ----------------- | ----------------- | ---- | --- | ------ | ----------------------------------------------------------- |
| 1     | Usuario (vínculo) | `user_manager_id` | text | 3   | sim    | `read_only=1`, `is_hidden=1` — valor vem de `?user_manager_id=`; ver "A chave que liga as duas etapas" acima |
| 1     | UUID              | `uuid`            | text | 9   | não    | `read_only=1`, `is_hidden=1` — UUID v4 gerado no frontend (`user-profiles/CreatePage.tsx`) |
| 2     | Nome              | `name`            | text | 9   | sim    | `min_length=3`                                              |
| 2     | CPF               | `cpf`             | cpf  | 3   | não    | `input_mode=numeric`                                        |

## Grupo 2 — Contato 📞

_slug `grupo-2-contato` · icon `telephone-fill`_

| Linha | Rótulo   | `field_name` | Tipo  | col | Obrig. | Observação                                                                              |
| ----- | -------- | ------------ | ----- | --- | ------ | --------------------------------------------------------------------------------------- |
| 1     | whatsapp | `whatsapp`   | phone | 3   | não    | dump tinha `field_name='Whatsapp'` (maiúsculo) — corrigido para bater com a coluna real |
| 1     | Telefone | `phone`      | phone | 3   | não    | `input_mode=numeric`                                                                    |
| 1     | E-mail   | `email`      | email | 6   | não    | —                                                                                       |

## Grupo 3 — Endereço 🏠

_slug `grupo-3-endereco` · icon `house-door-fill`_

| Linha | Rótulo   | `field_name` | Tipo | col | Obrig. | Observação           |
| ----- | -------- | ------------ | ---- | --- | ------ | -------------------- |
| 1     | CEP      | `cep`        | cep  | 3   | não    | `input_mode=numeric` |
| 1     | Endereço | `address`    | text | 9   | não    | `no_special_chars=1` |

## Próximo passo

Revisar (principalmente a correção `Whatsapp` → `whatsapp`) e então gerar o
`INSERT` a partir exatamente destas tabelas. Depende da Etapa 1
([`create_user_manager.md`](create_user_manager.md)) já ter sido inserida —
`user_manager_id` referencia aquela tabela.

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
