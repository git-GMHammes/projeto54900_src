[`README.md`](../README.md)

# Campo de rota = sempre um select (`route_manager`)

> Regra geral, válida para qualquer construtor (`FormBuilderPage`,
> `ListBuilderPage`, e qualquer tela nova que grave uma rota como valor):
> **nenhum campo que armazena uma rota é `<input type="text">`. É sempre um
> `<select>` carregado da tabela `route_manager`.**
>
> Já aplicado em [`ListBuilderPage.tsx`](../../pages/v1/list/ListBuilderPage.tsx):
> `href_template` (list_actions, `action_type=link`) e `api_endpoint`
> (list_actions, `action_type=api_call`). Também já usado em
> `api_get_endpoint`/`api_search_endpoint` (list_manager). Este documento
> generaliza o padrão para qualquer campo semelhante, presente ou futuro.

---

## O que conta como "campo de rota"

Qualquer campo cujo valor é um path/endpoint que o sistema depois usa para
navegar ou chamar uma API — exemplos já existentes ou prováveis:

- `href_template` (`list_actions` — link)
- `api_endpoint` (`list_actions` — chamada direta)
- `api_get_endpoint`, `api_search_endpoint` (`list_manager`)
- `submit_endpoint` (`form_manager`)
- qualquer campo novo com sufixo `_endpoint`, `_route`, `_url_template` ou
  equivalente

Se o campo guarda uma URL/rota do próprio sistema (não uma URL externa
arbitrária), esta regra se aplica.

---

## Padrão técnico

Componente: `SelectField` (`components/ui/FormGrid/select/index.tsx`),
consumido via `FormGridSchema` (`components/ui/FormGrid/Input`). Fonte:
`GET {apiBaseUrl}/v1/route-manager/get-no-pagination`.

```ts
const ROUTE_MANAGER_SRC = `${env.apiBaseUrl}/v1/route-manager/get-no-pagination`;

{
  type: 'select',
  col: 12, // ajustar ao layout do card
  label: '<nome_do_campo> — <descrição curta>',
  src: ROUTE_MANAGER_SRC,
  labelTemplate: '{method} - {object} - {action}',
  valueKey: 'endpoint',
  value: <valorAtualDoCampo>,
  onChange: (value) => patch(tabela, id, { <campo>: value }),
},
```

- **Visualização** (o que aparece na lista/busca do select): `method - object
  - action`, via `labelTemplate`.
- **Value gravado**: sempre a coluna `endpoint` da linha escolhida, via
  `valueKey: 'endpoint'`.
- `onChange` do `SelectField` entrega `(value, item)` — o `item` é a linha
  inteira de `route_manager`, disponível caso um campo futuro precise
  aproveitar outra coluna dele (ex.: auto-preencher `http_method` a partir de
  `item.method` — ver nota em "Extensões possíveis" no fim).

---

## Passo a passo para aplicar num campo (novo ou existente)

1. Localizar o campo no `FormGridSchema` da tela (`fields: [...]`).
2. Se for `<input>` texto (`name`, `maxLength`, `placeholder`,
   `onChange: (e) => ...e.target.value`), substituir pelo schema select do
   bloco acima, mantendo `label`, `col` e o `patch(...)` de destino.
3. Rodar `npx tsc --noEmit -p tsconfig.app.json` na pasta do frontend para
   confirmar que o schema bate com `SelectFieldSchema`.
4. Testar no navegador: abrir o modal, digitar no campo (busca local +
   filtro), confirmar que a opção mostra `method - object - action` e que
   salvar grava o `endpoint` correto na tabela do módulo (`list_actions`,
   `list_manager`, `form_manager`, etc.).

---

## Checklist obrigatório antes de alterar um campo de rota

Nunca faça só a troca do `<input>` pelo `<select>` sem passar por este
checklist — o select depende inteiramente de `route_manager` estar completa
e correta; se a tabela estiver desatualizada, o campo fica com opções
faltando ou apontando para rotas que não existem mais.

### 1. O `object` existe em `route_manager`?

```sql
SELECT DISTINCT object FROM route_manager WHERE layer = 'backend'; -- ou 'frontend'
```

- Se o `object` esperado (ex.: `list-manager`, `form-manager`,
  `menu-manager`) **não aparecer**, a tabela está incompleta para aquele
  módulo — ver seção 3 antes de prosseguir.
- **Em dúvida sobre qual `object`/`method`/módulo o campo deveria usar**
  (o nome do recurso não é óbvio pelo contexto da tela), **perguntar ao
  usuário** qual é o objeto/método/módulo correto, em vez de adivinhar ou
  inserir um valor genérico. Isso evita poluir `route_manager` com objects
  errados que depois aparecem como opção inválida em outros selects.

### 2. A tabela bate com o código-fonte real?

`route_manager` é uma cópia — a fonte de verdade é sempre o código. Antes de
confiar nas linhas existentes (ou de inserir novas), conferir contra a
origem certa **de acordo com o `layer` do `object` em questão**:

| `layer`    | Fonte de verdade no código                                      | Espelho em markdown                                                                    | Formato do `endpoint`                            |
| ---------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `backend`  | `app/Config/Routes/Api/v1/**/*.php` (+ `app/Config/Routes.php`) | [`README_rotas_swagger.md`](../../../../../app/markdown/geral/README_rotas_swagger.md) | `/api/v1/<object>/<action>` (com prefixo `/api`) |
| `frontend` | `src/routes/v1/*.routes.tsx`, `src/routes/paths.ts`             | [`README_rotas_frontend.md`](README_rotas_frontend.md)                                 | `/v1/<path>` (sem prefixo `/api`)                |

Passos:

1. Identificar se o campo em questão consome rota de **backend** (chama uma
   API — `api_endpoint`, `api_get_endpoint`, `submit_endpoint`, ...) ou de
   **frontend** (navega para uma página React — `href_template`, links de
   menu, ...).
2. Ler a fonte de verdade correspondente (arquivo de rotas do CI4 ou
   `routes/v1/*.routes.tsx`/`paths.ts`).
3. Comparar linha a linha com o que está em `route_manager` para aquele
   `object` (mesmo `method`+`endpoint`, mesmo `action`).
4. Note o prefixo `/api` diferente entre camadas (tabela acima) — não é erro,
   é a convenção de cada layer; não "corrigir" um pelo outro.

### 3. Corrigir divergências — na tabela **e** nos dois READMEs

Se o passo 2 encontrar rota faltando, sobrando ou desatualizada em
`route_manager`:

1. Corrigir a tabela `route_manager` (INSERT/UPDATE — banco dev local,
   seguir a regra de credenciais e escopo do `CLAUDE.md` do desktop).
2. Corrigir também o(s) README(s) afetado(s) —
   [`README_rotas_frontend.md`](README_rotas_frontend.md) e/ou
   [`README_rotas_swagger.md`](../../../../../app/markdown/geral/README_rotas_swagger.md)
   — para que voltem a espelhar o código-fonte 1:1.

Os três (tabela + os dois READMEs) têm que ficar consistentes entre si e com
o código-fonte ao final da alteração — são a base que sustenta a garantia de
que o select de rota sempre lista opções válidas e atuais. Deixar só um
deles atualizado é o mesmo que não ter corrigido nada: o próximo select de
rota vai continuar oferecendo (ou faltando) a opção errada.

---

## Extensões possíveis (não fazer sem confirmar com o usuário)

- **Auto-preencher `http_method`** a partir do `item.method` retornado pelo
  `onChange` do select de `api_endpoint`, eliminando a escolha manual
  redundante do campo `http_method` ao lado. Levantado em 2026-09-16 durante
  a conversão de `api_endpoint`, não implementado — aguardando decisão do
  usuário se/quando o padrão for revisitado.

[`README.md`](../README.md)
