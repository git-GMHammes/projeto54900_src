[◄ Índice da base de conhecimento](../../../README.md)

---

# Cadastro de Rota — `cadastro-route`

Mesmo modelo de [`form/modelo_ia/form.md`](../modelo_ia/form.md): árvore revisada
aqui antes do `INSERT` (não migration, não seed — ver aviso em
[`README_modulo_form.md`](../../README_modulo_form.md)).

**O que é:** formulário de `route_manager` — catálogo de rotas (backend e
frontend) do sistema. Hoje as **355 linhas existentes** vieram em bloco do
dump/seeder (`RouteManagerSeeder`, já descontinuado — ver
`README_seed.md`), refletindo `Config/Routes.php` por introspecção
automática. **Este formulário não substitui isso** — serve só pro caso
manual: cadastrar uma rota que a introspecção automática não capta (ex.:
rota externa, de outro serviço). Desenho novo, direto do schema real
(`DESCRIBE route_manager`).

## Nota sobre `controller_method` — coluna reaproveitada pelas duas camadas

Confirmado nos dados existentes: em linhas `layer=backend`, guarda o método
PHP (`Api\V1\Nav\NavManager\ResourceTableController::find`); em linhas
`layer=frontend`, guarda o caminho da página React
(`pages/v1/nav/GetAllPage`). Mesmo campo, uso diferente por camada — o
`help_text` abaixo avisa isso.

## O registro `form_manager` (o formulário em si)

| Coluna            | Valor                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `slug`            | `cadastro-route`                                                                                                          |
| `table_name`      | `route_manager`                                                                                                           |
| `title`           | Rota                                                                                                                      |
| `description`     | Cadastro manual de uma rota — uso: registrar rota externa que a introspecção automática de Config/Routes.php não captura. |
| `roles`           | `["admin"]`                                                                                                               |
| `react_route`     | `/v1/route-manager/create`                                                                                                |
| `submit_endpoint` | `/api/v1/route-manager/create`                                                                                            |
| `http_method`     | `POST`                                                                                                                    |
| `status`          | `active`                                                                                                                  |
| `version`         | `1`                                                                                                                       |

## Árvore de dados — hierarquia completa, sem detalhe (detalhe vai na tabela)

```
cadastro-route
└─ Rota (route_manager)
   ├─ Linha 1
   │  ├─ Camada
   │  ├─ Objeto
   │  └─ Ação
   ├─ Linha 2
   │  ├─ Método
   │  └─ Endpoint
   └─ Linha 3
      └─ Controller / Página
```

## Grupo 1 — Rota (`route_manager`)

_slug `rota` · icon `signpost-split`_

| Linha | Rótulo              | `field_name`        | Tipo   | col | Obrig. | Observação                                                                                                                                                            |
| ----- | ------------------- | ------------------- | ------ | --- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Camada              | `layer`             | select | 4   | sim    | opções (coluna `enum`): Backend (`backend`), Frontend (`frontend`)                                                                                                    |
| 1     | Objeto              | `object`            | text   | 4   | sim    | placeholder "Ex: nav-manager"; help: "Nome do recurso/grupo de rota."                                                                                                 |
| 1     | Ação                | `action`            | text   | 4   | sim    | placeholder "Ex: get-all, create, list"                                                                                                                               |
| 2     | Método              | `method`            | select | 4   | sim    | opções (coluna `enum`): GET, POST, PUT, PATCH, DELETE                                                                                                                 |
| 2     | Endpoint            | `endpoint`          | text   | 8   | sim    | placeholder `/api/v1/.../get-all` (backend) ou `/v1/.../` (frontend)                                                                                                  |
| 3     | Controller / Página | `controller_method` | text   | 12  | não    | help: "Backend: classe::método PHP (ex.: Api\\V1\\Nav\\NavManager\\ResourceTableController::find). Frontend: caminho da página React (ex.: pages/v1/nav/GetAllPage)." |

## Próximo passo

Revisar e então gerar o `INSERT` a partir exatamente desta tabela — mesmo
fluxo dos anteriores, aplicado a `route_manager`.

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
