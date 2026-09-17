[◄ Índice da base de conhecimento](../README.md)

---

# Listagem passa pelo motor `list_manager`/`list_columns`/`list_actions` — não tabela à mão

Regra do frontend, espelhando [`README_render_via_formgrid.md`](README_render_via_formgrid.md)
mas para **listagens/grids** em vez de formulários: para renderizar uma
tabela que lê dados de uma API (colunas, ordenação, ações por linha,
paginação), descreve-se a listagem no banco (`list_manager` +
`list_columns` + `list_actions` — ver [`README_list_constructor.md`](README_list_constructor.md)
pro modelo de dados completo) e consome-se com as funções puras de
`src/utils/listConstructor.tsx`. Não se escreve `<thead>`/`<tbody>` +
`STATUS_CLASS` + `<Link>` de ação campo a campo, tabela por tabela — isso é
exatamente o que gerou o débito que o construtor de listas veio resolver
(cada listagem nova era um arquivo `.tsx` novo com colunas fixas no código).

## Onde está

- Motor: `src/utils/listConstructor.tsx` — tipos + funções puras, **sem
  estado React**. Import único:
  ```ts
  import {
    str, toManager, toColumn, toAction,
    cellValue, renderCell, evalBusinessRule, resolveHrefTemplate,
  } from '@/utils/listConstructor';
  import type { ListManagerRow, ListColumnRow, ListActionRow } from '@/utils/listConstructor';
  ```
- Services (endpoint-set padrão, `createResource` — ver `README_node_comandos_modulos.md`):
  `listManagerTable`, `listColumnsTable`, `listActionsTable` de `@/services/v1`.
- Paginação/ordenação sincronizada na URL: `usePagination()` (já existe,
  não é específico do construtor de listas).
- Referências que já consomem o motor:
  [`ListConstructorPage.tsx`](../../pages/v1/list/ListConstructorPage.tsx) (preview) e
  [`FormConstructorListPage.tsx`](../../pages/v1/form/FormConstructorListPage.tsx) (produção).

## Receita — os 4 passos de toda página que consome o motor

### 1. Carregar a definição (`list_manager` + `list_columns` + `list_actions`)

```ts
const raw = await listManagerTable.getNoPagination({ sort: 'id', order: 'ASC' });
const manager = normalizeList<Record<string, unknown>>(raw).rows
  .map(toManager)
  .find((m) => m.slug === 'meu-slug'); // ou deixar o usuário escolher (ver ListConstructorPage)

const [colsRaw, actsRaw] = await Promise.all([
  listColumnsTable.find({ list_manager_id: manager.id }, { sort: 'sort_order', order: 'ASC', limit: 100 }),
  listActionsTable.find({ list_manager_id: manager.id }, { sort: 'sort_order', order: 'ASC', limit: 100 }),
]);
const columns = normalizeList<Record<string, unknown>>(colsRaw).rows.map(toColumn);
const actions = normalizeList<Record<string, unknown>>(actsRaw).rows.map(toAction);
```

Página fixa numa listagem (como `FormConstructorListPage.tsx`, sempre
`form-manager`) filtra pelo `slug` certo; página seletora (como
`ListConstructorPage.tsx`) deixa o usuário escolher entre `getNoPagination()`
inteiro, via `<select>`.

### 2. Buscar os dados reais no `api_get_endpoint` do manager

```ts
const { params, setPage, setLimit, toggleSort } = usePagination();
const path = resolveEndpoint(manager.apiGetEndpoint); // tira o prefixo /api (utils/formSubmit.ts)
const raw = await http.get(path, { params: params as unknown as QueryParams });
const { rows, total } = normalizeList<Record<string, unknown>>(raw);
```

`api_get_endpoint` é gravado como `/api/v1/...` (igual `submit_endpoint` do
módulo Form) — por isso passa por `resolveEndpoint()` antes do `http.get`.

### 3. Renderizar `<thead>`/`<tbody>` a partir de `columns`

```tsx
<thead>
  <tr>
    {columns.map((c) => (
      <th key={c.id} onClick={c.sortable ? () => toggleSort(c.sortKey) : undefined}>
        {c.label}
        {c.sortable && params.sort === c.sortKey && (params.order === 'ASC' ? ' ▲' : ' ▼')}
      </th>
    ))}
  </tr>
</thead>
<tbody>
  {rows.map((row) => (
    <tr key={str(row.id)}>
      {columns.map((c) => <td key={c.id}>{renderCell(c, row)}</td>)}
    </tr>
  ))}
</tbody>
```

`renderCell(column, row)` já resolve **tudo** sozinho: `concat_json`
(célula composta), `fallback` (vazio/nulo) e o tratamento especial por
`format` (`code`, `status-badge`, … — ver "Tratamento especial por coluna"
em `README_list_constructor.md`). Nunca leia `row[campo]` na mão dentro da
página — sempre via `renderCell`/`cellValue`.

### 4. Renderizar `list_actions` — decidir *preview* ou *produção*

Aqui o motor **não decide por você** — é a única parte que cada página
implementa diferente, de propósito:

|                           | Preview (`ListConstructorPage.tsx`)                               | Produção (`FormConstructorListPage.tsx`)                               |
| ------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `action_type: 'link'`     | toast com o `href` que seria aberto                               | `<Link to={resolveHrefTemplate(a.hrefTemplate, row)}>` real            |
| `action_type: 'api_call'` | toast com `METHOD endpoint` que seria chamado                     | `http.{method}(...)` de verdade, com `window.confirm()` se `a.confirm` |
| `business_rule_json`      | `evalBusinessRule(a.businessRule, row)` desabilita o botão (mock) | `evalBusinessRule(...)` desabilita o botão (bloqueia de verdade)       |

Regra prática: **página de demonstração/preview de uma listagem que ainda
não tem tela própria → toast.** Página real que já existia com ações de
verdade (ou nova tela assumida como definitiva) → `resolveHrefTemplate` +
`<Link>`/`http.*`, copiando o padrão de `ActionButton` em
`FormConstructorListPage.tsx`.

## API do motor (`src/utils/listConstructor.tsx`)

| Função/tipo                            | Faz                                                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `toManager`/`toColumn`/`toAction(raw)` | linha crua da API → tipo tipado (`ListManagerRow`/`ListColumnRow`/`ListActionRow`), decodifica `*_json`       |
| `cellValue(column, row)`               | resolve `concat_json` ou `field_key`, aplica `fallback` — sempre `string`                                     |
| `renderCell(column, row)`              | `cellValue` + tratamento especial por `format` (`CUSTOM_CELL_RENDERERS`) — sempre `ReactNode`                 |
| `resolveHrefTemplate(template, row)`   | troca **qualquer** `{campo}` no `href_template`/`api_endpoint` pelo valor real da linha (`{id}`, `{slug}`, …) |
| `evalBusinessRule(rule, row)`          | avalia `business_rule_json` (`eq`/`ne`/`lt`/`lte`/`gt`/`gte`) → `boolean`                                     |
| `str`/`num`/`parseJson`                | helpers de normalização usados pelos `toXxx` acima                                                            |

## Quando aplicar

- **Listagem nova que lê de uma API (própria ou de outro módulo):** sempre
  cadastrar `list_manager`/`list_columns`/`list_actions` (via seed ou, no
  futuro, via UI própria — ainda não existe) e consumir pelo motor. Nunca
  criar `<table>` com colunas fixas escritas à mão pra uma listagem nova.
- **Migrando uma listagem existente:** cadastrar a definição equivalente e
  trocar a página pra consumir o motor — foi o que aconteceu com
  `FormConstructorListPage.tsx` (tinha `STATUS_CLASS` e `<code>{r.slug}</code>`
  hardcoded; virou `format: 'status-badge'`/`format: 'code'` em
  `list_columns`, mesmo resultado visual, motor compartilhado).
- **Exceção:** chrome que não é linha/coluna de dado — `PageHeader`, botão
  "Novo registro", paginação — continuam de responsabilidade da própria
  página, não do motor (`usePagination` cuida do estado/URL; o JSX do footer
  é duplicado em cada página, ver "Paginação — padrão do footer" abaixo).

## Paginação — padrão do footer (todas as listagens)

Footer padrão do Bootstrap (`<nav><ul class="pagination">`, página atual
destacada com `.active`/`aria-current="page"`) — substitui o antigo
"Anterior / página X / Próxima" em `btn-group`. `usePagination()` já dá
`params`/`setPage`; só falta calcular `totalPages` a partir do `total` real
que a API devolve (`normalizeList` já expõe) e passar pra
`paginationWindow()` (`src/utils/pagination.ts`, função pura — sem estado
React), que devolve a janela de números a mostrar (primeira, última, ±2 em
torno da atual, buracos viram um único `'...'`):

```tsx
import { paginationWindow } from '@/utils/pagination';

const totalPages = useMemo(() => Math.max(1, Math.ceil(total / params.limit)), [total, params.limit]);

<nav aria-label="Paginação">
  <ul className="pagination pagination-sm mb-0">
    <li className={`page-item${params.page <= 1 ? ' disabled' : ''}`}>
      <button type="button" className="page-link" disabled={params.page <= 1} onClick={() => setPage(params.page - 1)}>
        Anterior
      </button>
    </li>
    {paginationWindow(params.page, totalPages).map((tok, i) =>
      tok === '...' ? (
        <li key={`ellipsis-${i}`} className="page-item disabled"><span className="page-link">…</span></li>
      ) : (
        <li key={tok} className={`page-item${tok === params.page ? ' active' : ''}`}>
          <button type="button" className="page-link" aria-current={tok === params.page ? 'page' : undefined} onClick={() => setPage(tok)}>
            {tok}
          </button>
        </li>
      ),
    )}
    <li className={`page-item${params.page >= totalPages ? ' disabled' : ''}`}>
      <button type="button" className="page-link" disabled={params.page >= totalPages} onClick={() => setPage(params.page + 1)}>
        Próxima
      </button>
    </li>
  </ul>
</nav>
```

`paginationWindow()` fica em `src/utils/` (não em `listConstructor.tsx`) de
propósito — é matemática de paginação genérica, não específica do motor
list_manager; qualquer página com uma lista paginada (mesmo fora do
construtor de listas) pode reaproveitar. O JSX em si continua duplicado
entre `ListConstructorPage.tsx` e `FormConstructorListPage.tsx` (só o
cálculo da janela é compartilhado) — mesma decisão de não tocar no stub
`DataTable.tsx`/`Pagination.tsx` (ver "Decisão" em `README_list_constructor.md`).
Toda listagem nova que consome o motor deve copiar este footer, não o
padrão antigo `Anterior`/`pagina X`/`Proxima`.

## Estado atual — quem já consome

| Página                        | Rota                   | Modo                                                    |
| ----------------------------- | ---------------------- | ------------------------------------------------------- |
| `ListConstructorPage.tsx`     | `/v1/list-constructor` | preview — 9 listagens semeadas, `<select>` escolhe qual |
| `FormConstructorListPage.tsx` | `/v1/form-constructor` | produção — fixa no slug `form-manager`, ações reais     |

Sem UI própria ainda pra cadastrar `list_manager`/`list_columns`/
`list_actions` (hoje é só seed/API direta) — ver "Próximos passos" em
[`README_list_constructor.md`](README_list_constructor.md).

---

[◄ Índice da base de conhecimento](../README.md)

---

### 📌 Metadados do Autor

| Campo | Informação |
| --- | --- |
| **Nome** | Gustavo Hammes |
| **Local** | Rio de Janeiro |
| **LinkedIn** | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes) |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
