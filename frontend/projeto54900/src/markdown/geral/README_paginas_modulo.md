[`README.md`](../README.md)

# Páginas por módulo (`pages/v1/<modulo>/...`)

> Convenção de organização de `pages/` — como o frontend espelha o agrupamento
> de módulos da API (`README_rotas_swagger.md` do backend, `src/app/markdown/`).

## Ideia central

O backend agrupa rotas em **módulos**, e cada módulo administra **uma ou mais
tabelas** (recursos), sob uma **versão** (`v1`, `v1a`, ...). Ex.: o módulo
`User` (ver `README_rotas_swagger.md`) administra `user-manager`,
`user-manager-view`, `user-roles` e `user-profiles` — 4 recursos, 1 módulo.

No frontend, `pages/v1/<modulo>/` espelha isso:

```
pages/v1/<modulo>/
  <recurso>/
    CreatePage.tsx     — formulario de criacao (POST .../create)
    UpdatePage.tsx     — formulario de edicao   (PUT  .../update/{id})
    GetAllPage.tsx     — listagem               (GET  .../get-all)
    GetPage.tsx        — detalhe de 1 registro  (GET  .../get/{id})
```

- **1 arquivo por ação**, nomeado com o **mesmo verbo do endpoint** que ele
  chama (`create` → `CreatePage`, `update` → `UpdatePage`, `get-all` →
  `GetAllPage`, `get` → `GetPage`). Sem `mode="create"|"edit"` num arquivo só —
  cada ação é um componente próprio.
- Ações que não abrem uma tela cheia (`delete-soft`, `delete-restore`,
  `clear-deleted`, ...) **não** viram arquivo de página — são botão + modal de
  confirmação dentro de `GetAllPage`/`GetPage`, chamando o service direto.
- Quando o módulo tem **1 recurso só** (não precisa de subpasta por tabela), as
  páginas ficam direto em `pages/v1/<modulo>/`. Ex. hipotético — módulo `plane`
  (1 tabela, `planes`): `pages/v1/plane/CreatePage.tsx`,
  `pages/v1/plane/GetAllPage.tsx`, etc. — sem subpasta `planes/` no meio.
- Quando o módulo tem **várias tabelas** (como `user`), cada uma ganha sua
  subpasta com o **slug do recurso na API** (`user-manager/`, não `manager/`) —
  ver a árvore acima.

## Fluxo composto (mexe em mais de 1 tabela)

Um cadastro que grava em **duas tabelas do mesmo módulo**, ligadas por chave
estrangeira (ex.: criar o login em `user-manager` e depois o perfil em
`user-profiles`, passando o `id` do primeiro pro segundo) **não é a ação de
uma tabela só** — não vira `CreatePage.tsx` de nenhum dos dois recursos.

Ganha **pasta própria na raiz do módulo**, nomeada pelo que o fluxo faz (não
pelo recurso):

```
pages/v1/user/
  user-manager/    (CRUD de 1 tabela)
  user-profiles/   (CRUD de 1 tabela, quando existir)
  register/        <- fluxo composto: RegisterPage.tsx
```

Caso de referência: `pages/v1/user/register/RegisterPage.tsx` — 2 cards
sequenciais (não abas), um por tabela; o segundo card recebe a chave
estrangeira pré-preenchida com o `id` criado pelo primeiro. Rota: `/v1/register`.

## Rotas e nomes — sempre em inglês

Segmento de rota, nome de arquivo, nome de pasta, nome de variável/função:
**sempre em inglês**, espelhando o verbo/nome do endpoint da API
(`/v1/user-manager/create`, não `/v1/user-manager/novo`).

**Exceção — o que continua em português:**
- **Comentários no código** (`// ...`) — é como a base inteira já documenta
  suas decisões, mantém o padrão.
- **Texto visível ao usuário final** — título de página, label de campo,
  mensagem de toast, texto de botão. O público da aplicação é brasileiro; só
  o *código* (o que outro dev lê) precisa ser em inglês.

Ex.: `export default function RegisterPage()` (inglês) pode ter
`<PageHeader title="Novo Cadastro" />` (português) dentro — os dois estão
certos, cada um na sua camada.

## Registrando a rota

Cada módulo tem seu `routes/v1/<modulo>.routes.tsx` (ver
`README_node_comandos_modulos.md`), que importa as páginas com `lazy()` e
registra os `path` — sempre via `paths.ts`, nunca string solta nas páginas que
navegam (`Link to={paths.v1.user.create}`, não `Link to="/v1/user-manager/create"`).

[`README.md`](../README.md)

---

### 📌 Metadados do Autor

| Campo | Informação |
| --- | --- |
| **Nome** | Gustavo Hammes |
| **Local** | Rio de Janeiro |
| **LinkedIn** | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes) |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
