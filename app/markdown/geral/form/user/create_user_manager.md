[◄ Índice da base de conhecimento](../../../README.md)

---

# Cadastro de Usuário — Etapa 1 (`cadastro-usuario`)

> NÃO EXISTE ALTERAÇÃO de MIGRATE: apenas no fim de cada ciclo um novo, para a renovação de todo o sistema.

Mesmo modelo de [`form/modelo_ia/form.md`](../modelo_ia/form.md): árvore revisada
aqui antes do `INSERT` (não migration, não seed — ver aviso em
[`README_modulo_form.md`](../../README_modulo_form.md)).

**O que é:** primeira etapa do cadastro de usuário — cria a linha de
**segurança** (`user_manager`: usuário + senha). O `id` gerado aqui é a chave
que a etapa 2 ([`create_user_profiles.md`](create_user_profiles.md),
`user_profiles.user_manager_id`) usa pra ligar os dados pessoais a este
login. Reconstrução fiel do que existia no banco (ids antigos
75–76, `form_manager` id=3).

## O registro `form_manager` (o formulário em si)

| Coluna            | Valor                                   |
| ----------------- | --------------------------------------- |
| `slug`            | `cadastro-usuario`                      |
| `table_name`      | `user_manager`                          |
| `title`           | Usuário (Segurança)                     |
| `description`     | Primeira etapa de cadastro de usuários. |
| `roles`           | `["guest","user","admin"]`              |
| `react_route`     | `/v1/user-manager/create`               |
| `submit_endpoint` | `/api/v1/user-manager/create`           |
| `http_method`     | `POST`                                  |
| `status`          | `active`                                |
| `version`         | `1`                                     |

## Árvore de dados — hierarquia completa, sem detalhe (detalhe vai na tabela)

```
cadastro-usuario
└─ Criação de Segurança
   ├─ Linha 1
   │  └─ Usuário
   └─ Linha 2
      └─ Senha
```

## Grupo 1 — Criação de Segurança

_slug `criacao-de-seguranca` · icon `lock-fill`_

| Linha | Rótulo  | `field_name`    | Tipo  | col | Obrig. | Observação                                                                                                                                                           |
| ----- | ------- | --------------- | ----- | --- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Usuário | `username`      | text  | 4   | sim    | —                                                                                                                                                                    |
| 2     | Senha   | `password_hash` | senha | 4   | sim    | `min_length=8`, `max_length=72` (limite do bcrypt), `strong_password=1`, `double_field=1` — o 2º campo sai como `password_hash_confirm` e é validado também no backend (`CreateRequest`: `required\|matches[password_hash]`) |

## Campo Empresa e termo de uso (tela `/v1/user-manager/create`)

- **Empresa** (`company_ids`, `form_fields` id 505): `select` de escolha única, opções de
  `/api/v1/company-manager-public/get-no-pagination` (`id`, `name`, `slug`). Com slug na URL
  (`/tryikads/v1/user-manager/create`) abre pré-selecionado; sem slug, vazio. A página envia
  `company_ids` como lista de um item (a API descarta valor escalar).
- **Termo de uso**: `TermsModal.tsx` abre ao carregar a tela; o botão Criar nasce desabilitado e só
  habilita com o aceite. Fechado sem aceite, o link "Ler e aceitar os termos de uso" reabre o modal.
  O texto é provisório (constantes no topo do `TermsModal.tsx`). O aceite vale só no navegador.

## Próximo passo

Revisar e então gerar o `INSERT` (`form_manager` → `form_groups` →
`form_rows` → `form_fields`) a partir exatamente desta tabela. Depois seguir
para [`create_user_profiles.md`](create_user_profiles.md) (etapa 2), que
depende do `id` gerado aqui.

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
