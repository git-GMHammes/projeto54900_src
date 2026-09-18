/**
 * =============================================================================
 * FILE HEADER — formBuilder.model (modelo do construtor de formulários)
 * =============================================================================
 *
 * O QUE FAZ:
 *   Concentra TUDO o que descreve a FORMA dos dados do construtor de
 *   formulários (`/v1/form-constructor`): os tipos de estado de UI (`*Local`),
 *   os construtores `*Inicial()`, os tradutores estado -> corpo da API
 *   (`*Payload()`) e o tradutor REVERSO que reconstrói o estado a partir da
 *   view de leitura (`viewRowsToBuilderState`). A página
 *   (`FormBuilderPage.tsx`) fica só com estado React, hooks, schema de tela e
 *   modais — nenhuma regra de "como o dado é montado/enviado/lido" mora lá.
 *
 *   ÁRVORE DE TABELAS espelhada aqui (4 níveis, cada um = 1 bloco):
 *     form_manager (1, 1:1 com a tabela real do banco escolhida pelo usuário)
 *       └─ form_groups  (N; agrupamento visual, com ícone e colapso)
 *            └─ form_rows  (N por grupo; 1 linha do grid Bootstrap)
 *                 └─ form_fields (1 por coluna da tabela escolhida na linha)
 *
 * ATENÇÃO — este arquivo é a FRONTEIRA DO BANCO do módulo Form. Ao criar,
 * renomear ou tirar uma coluna de qualquer uma dessas 4 tabelas, o ajuste
 * começa AQUI na ordem: tipo `*Local` -> `*Inicial()` -> `*Payload()` ->
 * hidratação; só depois a página e os componentes de campo.
 *
 * DEPENDÊNCIAS (o que este arquivo consome):
 *   - `@/utils/jsonList` (`toStringList`) — campos cujo valor PERSISTIDO é uma
 *     lista JSON de strings (ex.: `form_manager.roles = ["admin","user"]`) mas
 *     cuja edição na tela é um controle comum (select múltiplo). Ver
 *     `src/markdown/geral/README_campo_json_montado.md`.
 *   - `crypto.randomUUID()` — nativo do browser (Web Crypto), sem import; gera
 *     as chaves de UI (`id`) de grupo e linha.
 *   - Nenhum React, nenhum JSX, nenhum hook: é TypeScript puro, exatamente
 *     para poder ser importado/testado fora do componente.
 *
 * CONSUMIDORES (quem importa daqui):
 *   - `src/pages/v1/form/FormBuilderPage.tsx` — consumidor principal: tipos
 *     `*Local`, `*Inicial()`, `*Payload()`, `MAX_COLUNAS_POR_LINHA`,
 *     `adicionarColunas`/`removerColuna`, `campoInicial`, `toTabela`/`toColuna`
 *     e `viewRowsToBuilderState`.
 *   - `src/pages/v1/list/listBuilder.model.ts` — reaproveita a parte GENÉRICA
 *     em vez de duplicar: `TabelaInfo`, `ColunaInfo`, `ColunasState`,
 *     `toTabela`, `toColuna`, `tabelaDoEndpoint`, `stripVazios`, `bit` e
 *     `Payload`. Ao renomear/remover um desses símbolos, ajustar o import de lá.
 *   - `asString`, `inferirFieldType`, `camposParaPayload`, `intOuUndef` e
 *     `BuilderState` são de uso interno/indireto (via `campoInicial`,
 *     `campoPayload` e `viewRowsToBuilderState`).
 *
 * MAPA DOS BLOCOS (ordem do arquivo, de cima para baixo):
 *   Bloco 1 — Introspecção do banco (API `db-schema`): tabelas e colunas
 *   Bloco 2 — `form_manager` (1 registro por tabela escolhida; 1:1)
 *   Bloco 3 — `form_groups` (N por manager)
 *   Bloco 4 — `form_rows` (N por grupo)
 *   Bloco 5 — Distribuição das colunas da tabela entre as linhas (só UI)
 *   Bloco 6 — `form_fields` / `CampoLocal` (1 por coluna escolhida na linha)
 *   Bloco 7 — Mappers estado -> payload (ESCRITA: create/update)
 *   Bloco 8 — Hidratação `view_form_manager` -> estado (LEITURA: modo edição)
 *
 * FLUXO DE DADOS (as portas de entrada/saída deste arquivo):
 *
 *   A) CRIAÇÃO (registro novo):
 *      db-schema/tables|columns ──toTabela/toColuna──▶ TabelaInfo/ColunaInfo
 *        └─ `*Inicial()` cria o estado de UI (sempre com `dbId: null`)
 *             └─ `*Payload()` monta o corpo de `form-<recurso>/create` (um
 *                recurso por nível: `form-manager`, `form-groups`,
 *                `form-rows`, `form-campos`)
 *                  └─ a API devolve o `id` → vira `dbId` no estado, e SÓ
 *                     então o nó filho pode ser criado (FK explícita)
 *
 *   B) EDIÇÃO (registro existente):
 *      form-manager-view (1 linha por campo, prefixos fm_/fg_/fr_/fc_)
 *        └─ `viewRowsToBuilderState()` reconstrói estado + `tabela`
 *             └─ cada `*Payload()` já recebe `dbId` preenchido → UPDATE
 *
 *   C) USO (formulário gerado): outro módulo lê as mesmas tabelas; aqui só a
 *      FORMA é definida, nada é renderizado.
 *
 * REGRAS DE MANUTENÇÃO (evitar quebra em evolução/correção):
 *   1. `*Local` é ESTADO DE UI, não a tabela. Campo sem coluna no banco
 *      (`RowLocal.columns`, `slugAuto`, `*_json` editado cru) precisa estar
 *      marcado como "só UI" — e NUNCA entra no `*Payload()`.
 *   2. Todo campo de `*Local` aparece em 3 lugares, na mesma ordem:
 *      tipo -> `*Inicial()` -> `*Payload()`. Esquecer um dos três é a causa
 *      mais comum de "campo que existe no banco mas não salva / não carrega".
 *   3. `dbId` = PK no banco (`null` = ainda não persistido); `id` = uuid de UI,
 *      chave do React e dos `Record` de `linhas`/`campos`. NUNCA usar `dbId`
 *      como chave de estado (o pai pode não estar salvo).
 *   4. `''` é o "não definido" de todos os campos de texto, INCLUSIVE os que
 *      são INT no banco (`max_length`, `rows_qty`, `sel_rows`). Quem converte é
 *      `intOuUndef()` / `viewIntStr()`.
 *   5. `stripVazios` roda em todos os payloads: string vazia é OMITIDA do corpo
 *      (a API é `permit_empty`, então omitir = manter o default do banco).
 *      Booleano NUNCA vai cru — passa por `bit()` (0/1).
 *   6. `id`, timestamps e auditoria não são enviados: são do backend.
 *
 * COMO CRIAR UM MODEL SIMILAR (outro construtor pai → filho):
 *   1. Se os filhos forem IRMÃOS (sem aninhamento), use como espelho
 *      `src/pages/v1/list/listBuilder.model.ts`. Se houver 3+ níveis
 *      aninhados, use ESTE arquivo.
 *   2. Reaproveite os genéricos daqui em vez de copiar: `asString`,
 *      `toTabela`/`toColuna` (introspecção) e `Payload`,
 *      `stripVazios`/`bit`/`intOuUndef` (payload).
 *   3. Para CADA nível da árvore crie o trio, sempre nesta ordem:
 *      `interface <Nivel>Local` -> `<nivel>Inicial()` ->
 *      `<nivel>Payload(nivel, fkDoPai)`.
 *   4. `dbId: number | null` como primeiro campo é o que permite o MESMO par
 *      `Inicial()`/`Payload()` servir para criar (POST) e atualizar (UPDATE).
 *   5. Havendo view achatada de leitura, escreva o inverso
 *      `viewRowsTo<X>State()` usando os coercedores `viewNum`/`viewStr`/
 *      `viewBit`/`viewIntStr`/`viewJsonStr` — a API devolve `unknown`, nunca
 *      confie no tipo do JSON.
 *   6. Numere os BLOCOS deste arquivo também no comentário da página
 *      consumidora (ver `FormBuilderPage.tsx`), para o dev achar o par
 *      model ↔ tela.
 * =============================================================================
 */

import { toStringList } from '@/utils/jsonList';

/**
 * =============================================================================
 * BLOCO 1 — INTROSPECÇÃO DO BANCO (API `db-schema`, somente leitura)
 * =============================================================================
 *
 * O QUE FAZ:
 *   Descreve as respostas de `GET db-schema/tables` e
 *   `GET db-schema/columns/{table}` (ver `services/v1/dbSchema.ts`) e converte
 *   cada linha crua (`Record<string, unknown>` — JSON sem tipo garantido) nos
 *   tipos que a tela usa.
 *
 * POR QUE É IMPORTANTE:
 *   É o que faz o construtor aceitar QUALQUER tabela do banco SEM lista fixa no
 *   código. Se a API mudar o nome de uma chave (`name`, `data_type`,
 *   `nullable`, ...), o ajuste é só aqui — a página continua igual.
 *
 * CONEXÃO:
 *   `FormBuilderPage.tsx` → `dbSchema.tables()` → `toTabela()` (cards de tabela
 *   disponível) e `dbSchema.columns(tabela)` → `toColuna()` (opções do select
 *   "Colunas" de cada linha + seed do `CampoLocal` no Bloco 6).
 *
 * COMO REAPROVEITAR EM OUTRO MÓDULO:
 *   É genérico (vale para qualquer tabela). `listBuilder.model.ts` já reexporta
 *   daqui — importe destes arquivos em vez de copiar.
 * -------------------------------------------------------------------------
 */

/**
 * Uma TABELA do banco oferecida no card seletor (`db-schema/tables`).
 * `name` é o nome REAL da tabela: é ele que vai para
 * `db-schema/columns/{name}` e é gravado em `form_manager.table_name`.
 */
export interface TabelaInfo {
  name: string;
  type: string;
}

/**
 * Uma COLUNA de uma tabela (`db-schema/columns/{table}`) — a metadata que
 * semeia o campo do formulário (`campoInicial`) e limita o `field_type`.
 *   name        → nome da coluna; vira `field_name`/`field_key` do campo
 *   data_type   → tipo lógico do MySQL (`varchar`, `int`, `enum`, `text`...);
 *                 é a entrada de `inferirFieldType()`
 *   column_type → tipo completo (`varchar(255)`, `enum('a','b')`); serve para
 *                 o dev ver tamanho e opções reais da coluna
 *   nullable    → aceita NULL; em `campoInicial()` vira `required: !nullable`
 *   key         → `PRI`/`UNI`/`MUL` ou `null` (`''` é normalizado para `null`)
 * ATENÇÃO ao `nullable`: é avaliado como `=== true` (boolean estrito); valor
 *   numérico/string (`1`, `'1'`) NÃO é considerado verdadeiro.
 */
export interface ColunaInfo {
  name: string;
  data_type: string;
  column_type: string;
  nullable: boolean;
  key: string | null;
}

/**
 * Estado de CARGA das colunas de UMA tabela, guardado por tabela escolhida:
 *   loading → `true` enquanto `db-schema/columns/{table}` não responde (o
 *             select de colunas fica desabilitado)
 *   error   → mensagem da falha (o select não abre); `null` = sem erro
 *   items   → lista já convertida por `toColuna()`; `[]` é estado válido
 *             (tabela sem colunas visíveis/permissão)
 */
export interface ColunasState {
  loading: boolean;
  error: string | null;
  items: ColunaInfo[];
}

/**
 * Coerção defensiva de um valor arbitrário vindo da API para string.
 * A introspecção devolve `unknown` (o driver pode mandar número onde a tela
 * espera texto); aqui number → string e TODO o resto → `''`, para nenhum
 * `undefined`/`null` vazar para dentro do estado de UI.
 * @param v valor cru da linha da API
 * @returns string segura (nunca `null`/`undefined`)
 */
export function asString(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return '';
}

/**
 * Linha crua de `db-schema/tables` → `TabelaInfo`.
 * `type` cai em `'table'` quando a API não manda o campo (view ou tabela sem
 * tipo explícito), para o card nunca aparecer sem rótulo.
 * @param row linha crua da API (uma tabela)
 * @returns tabela tipada consumida pelo card seletor
 */
export function toTabela(row: Record<string, unknown>): TabelaInfo {
  return { name: asString(row.name), type: asString(row.type) || 'table' };
}

/**
 * Linha crua de `db-schema/columns/{table}` → `ColunaInfo`.
 * É a porta de entrada da metadata: o resultado alimenta tanto o select de
 * colunas da linha quanto `campoInicial()` (que semeia o campo novo).
 * @param row linha crua da API (uma coluna)
 * @returns coluna tipada; `key` vazio vira `null` e `nullable` só aceita `true`
 */
export function toColuna(row: Record<string, unknown>): ColunaInfo {
  return {
    name: asString(row.name),
    data_type: asString(row.data_type),
    column_type: asString(row.column_type),
    nullable: row.nullable === true,
    key: typeof row.key === 'string' && row.key !== '' ? row.key : null,
  };
}

/**
 * =============================================================================
 * BLOCO 2 — form_manager (1 registro por tabela escolhida; 1:1)
 * =============================================================================
 *
 * O QUE FAZ:
 *   `ManagerLocal` é o estado de UI do nó RAIZ da árvore: os metadados do
 *   formulário (slug, título, rota React, endpoint de submit) ligados a UMA
 *   tabela real do banco. `managerInicial()` cria esse estado vazio.
 *
 * POR QUE É IMPORTANTE:
 *   É o PAI de toda a árvore: só depois que este registro tem `dbId` (Salvar do
 *   card) é que `form_groups` pode ser criado apontando para ele. `tableName` é
 *   gravado UMA vez, na criação, e é a fonte da verdade para reabrir o
 *   formulário em edição — nunca é deduzido de `submit_endpoint`.
 *
 * MAPA — `ManagerLocal` → coluna de `form_manager`:
 *   dbId            → `id` (PK; `null` = não salvo, logo o payload vira INSERT)
 *   slug            → `slug` (identificador de URL; gerado do título enquanto
 *                     `slugAuto` for `true` — ver `@/utils/slug`)
 *   tableName       → `table_name` (nome da tabela real escolhida no card)
 *   title           → `title`
 *   description     → `description`
 *   roles           → `roles` (lista JSON de slugs de `user_roles`)
 *   react_route     → `react_route` (rota React do formulário gerado)
 *   submit_endpoint → `submit_endpoint` (endpoint que recebe o submit)
 *   http_method     → `http_method` (default `POST` em `managerInicial`)
 *   status          → `status` (enum `ManagerStatus`)
 *   version         → `version` (começa em 1; a cada Salvar a página envia o
 *                     valor atual — o bump é do backend)
 *   slugAuto        → SÓ UI — NÃO existe no banco. Enquanto `true`, o slug
 *                     acompanha o título na digitação e para de acompanhar
 *                     assim que o usuário edita o slug à mão.
 *
 * CONSUMIDORES:
 *   `FormBuilderPage.tsx` (`managerSchema` monta o formulário do card;
 *   `managerPayload()` envia) e `viewRowsToBuilderState()` (Bloco 8), que
 *   reconstrói este mesmo estado no modo edição.
 *
 * COMO REAPROVEITAR:
 *   Mesmo trio para qualquer nó raiz 1:1: `interface XLocal` (`dbId` primeiro)
 *   → `xInicial()` (vazio, `dbId: null`, defaults do banco) → `xPayload()`
 *   (Bloco 7). Marque com "só UI" tudo o que não tem coluna no banco.
 * -------------------------------------------------------------------------
 */

/**
 * Status do formulário, espelhando o enum `status` da tabela `form_manager`.
 *   draft    → em montagem (o renderer não publica)
 *   active   → em uso
 *   inactive → fora do ar sem apagar o registro
 * A hidratação (Bloco 8) cai em `draft` quando a API devolve algo fora desta
 * união — por isso o tipo é fechado aqui.
 */
export type ManagerStatus = 'draft' | 'active' | 'inactive';

/**
 * Estado de UI do nó raiz (1:1 com a tabela real escolhida).
 * `dbId: number | null` primeiro é o que deixa o MESMO `managerPayload()`
 * servir para criar e para atualizar; os campos marcados "só UI" ficam fora do
 * payload. Mapa completo campo → coluna no cabeçalho do BLOCO 2 acima.
 */
export interface ManagerLocal {
  /** PK de `form_manager` depois do primeiro Salvar. `null` = ainda não persistido. */
  dbId: number | null;
  slug: string;
  /**
   * Nome real da tabela do banco escolhida no card seletor — fonte da verdade
   * para reabrir o formulário em edição. Gravado 1x na criação (`handleTabelas`),
   * nunca adivinhado a partir de `submit_endpoint`.
   */
  tableName: string;
  title: string;
  description: string;
  /** Lista JSON de slugs de user_roles — ver utils/jsonList. */
  roles: string;
  react_route: string;
  submit_endpoint: string;
  http_method: string;
  status: ManagerStatus;
  version: number;
  /** Só UI: enquanto true, o slug acompanha o título. */
  slugAuto: boolean;
}

/**
 * Estado inicial do nó raiz: nenhum campo preenchido e `dbId: null`.
 * @param tableName nome real da tabela do banco escolhida no card seletor —
 *                  entra já no estado para o construtor saber de onde puxar as
 *                  colunas (não é deduzido depois)
 * @returns `ManagerLocal` com os defaults do banco aplicados:
 *          `http_method: 'POST'`, `status: 'draft'`, `version: 1`,
 *          `slugAuto: true` (slug acompanha o título), `roles: ''`
 * POR QUE: como `dbId` nasce `null`, o mesmo `managerPayload()` decide entre
 *   POST (criar) e UPDATE (atualizar) apenas olhando o estado — a página não
 *   precisa de dois caminhos.
 */
export function managerInicial(tableName = ''): ManagerLocal {
  return {
    dbId: null,
    slug: '',
    tableName,
    title: '',
    description: '',
    roles: '',
    react_route: '',
    submit_endpoint: '',
    http_method: 'POST',
    status: 'draft',
    version: 1,
    slugAuto: true,
  };
}

/**
 * =============================================================================
 * BLOCO 3 — form_groups (N por manager)
 * =============================================================================
 *
 * O QUE FAZ:
 *   `GrupoLocal` é o 2º nível da árvore: o agrupamento VISUAL dos campos
 *   (um "caderno" com ícone, ordem e colapso). `grupoInicial()` cria o grupo
 *   vazio e `grupoPayload()` (Bloco 7) o envia com a FK `form_manager_id`.
 *
 * POR QUE É IMPORTANTE — a chave dupla `id` (uuid, UI) x `dbId` (PK, banco):
 *   `id` é a chave dos `Record` de estado (`linhas[grupo.id]`), gerada por
 *   `crypto.randomUUID()` e ESTÁVEL enquanto o grupo existir na tela — por
 *   isso funciona como chave mesmo antes de o grupo ser salvo. `dbId` só
 *   existe depois do Salvar e é o que liga `form_rows` ao grupo.
 *
 * MAPA — `GrupoLocal` → coluna de `form_groups`:
 *   id          → SÓ UI (uuid; chave do React e de `linhas`)
 *   dbId        → `id` (PK)
 *   title       → `title`
 *   slug        → `slug`
 *   description → `description`
 *   icon        → `icon` (nome de ícone Bootstrap, escolhido no `<IconSelect>`)
 *   sort_order  → `sort_order` (ordenação dentro do manager; a hidratação
 *                 reordena a lista por ele no Bloco 8)
 *   collapsed   → `collapsed` (0/1 no banco via `bit()`; é estado VISUAL do
 *                 usuário e persiste junto — a árvore reabre como ele deixou)
 *   slugAuto    → SÓ UI (enquanto `true`, o slug acompanha o `title`)
 *
 * CONSUMIDORES:
 *   `FormBuilderPage.tsx` (`grupoSchema`, `salvarGrupo`, card de grupos) e
 *   `viewRowsToBuilderState()` (Bloco 8).
 *
 * COMO REAPROVEITAR:
 *   Copie o trio `GrupoLocal`/`grupoInicial`/`grupoPayload` para qualquer
 *   "filho ordenável e colapsável de um pai" — a única diferença entre os
 *   níveis é o nome da FK.
 * -------------------------------------------------------------------------
 */

/**
 * Estado de UI de um GRUPO de campos (2º nível da árvore).
 * `id` é a chave de UI (uuid) usada em `linhas[grupo.id]`; `dbId` é a PK em
 * `form_groups`, `null` enquanto o grupo não foi salvo.
 */
export interface GrupoLocal {
  /** Chave estável de UI (uuid) — key do React e chave de `linhas`. */
  id: string;
  /** PK de `form_groups` depois do Salvar. `null` = ainda não persistido. */
  dbId: number | null;
  /** Título visível do grupo na árvore e no formulário gerado. */
  title: string;
  /** Identificador de URL; acompanha o `title` enquanto `slugAuto` for `true`. */
  slug: string;
  /** Texto de apoio do grupo (exibido no formulário gerado). */
  description: string;
  /** Nome do ícone Bootstrap (`bi-*`) escolhido no `<IconSelect>`. */
  icon: string;
  /** Ordem do grupo dentro do manager (a lista é reordenada por ele ao salvar/hidratar). */
  sort_order: number;
  /** Grupos começam abertos ou fechados na árvore; persiste como 0/1. */
  collapsed: boolean;
  /** Só UI: enquanto true, o slug acompanha o title. */
  slugAuto: boolean;
}

/**
 * Estado inicial de um grupo novo (título/slug vazios, `sort_order: 0`,
 * aberto, `dbId: null`).
 * @returns `GrupoLocal` vazio com `id` uuid NOVO a cada chamada — por isso a
 *          função é chamada dentro do handler, nunca em render.
 */
export function grupoInicial(): GrupoLocal {
  return {
    id: crypto.randomUUID(),
    dbId: null,
    title: '',
    slug: '',
    description: '',
    icon: '',
    sort_order: 0,
    collapsed: false,
    slugAuto: true,
  };
}

/**
 * =============================================================================
 * BLOCO 4 — form_rows (N por grupo)
 * =============================================================================
 *
 * O QUE FAZ:
 *   `RowLocal` é o 3º nível: UMA linha do grid Bootstrap dentro do grupo (o
 *   "L" da estrutura visual do formulário). `rowInicial()` cria a linha vazia e
 *   `rowPayload()` (Bloco 7) a envia com a FK `form_group_id`.
 *
 * POR QUE É IMPORTANTE — a linha é o NÓ DE LIGAÇÃO:
 *   É nela que o usuário escolhe QUAIS colunas da tabela real entram no
 *   formulário (`columns`, ver Bloco 5); cada coluna escolhida gera um
 *   `CampoLocal` (Bloco 6). Ou seja: a linha não "contém" os campos no banco
 *   (quem guarda a FK é o campo, via `form_row_id`), mas é ela que dispara a
 *   criação deles.
 *
 * MAPA — `RowLocal` → coluna de `form_rows`:
 *   id         → SÓ UI (uuid; chave do React e de `campos`)
 *   dbId       → `id` (PK)
 *   sort_order → `sort_order` (ordem da linha dentro do grupo)
 *   gutter     → `gutter` (classe de espaçamento do Bootstrap na `row`,
 *                `g-0` … `g-5`; default `g-3`)
 *   note       → `note` (observação da linha no formulário gerado)
 *   columns    → SÓ UI — `form_rows` NÃO tem coluna correspondente. É a lista
 *                dos nomes de coluna (`ColunaInfo.name`) escolhidos nesta
 *                linha; serve de controle de UI e é reconstruída na hidratação
 *                a partir dos campos que voltam da view.
 *
 * CONSUMIDORES:
 *   `FormBuilderPage.tsx` (`rowSchema`, `salvarRow`, handlers de colunas) e
 *   `viewRowsToBuilderState()` (Bloco 8).
 *
 * COMO REAPROVEITAR:
 *   Mesmo padrão dos Blocos 2/3; o que muda é a FK (`form_group_id`) e o fato
 *   de a linha carregar uma lista SÓ DE UI (`columns`) que precisa ser
 *   sincronizada com o nível de baixo.
 * -------------------------------------------------------------------------
 */

/**
 * Estado de UI de uma LINHA do grid (3º nível da árvore).
 * `id` é a chave de UI (uuid) usada em `campos[linha.id]`; `dbId` é a PK em
 * `form_rows`, `null` enquanto a linha não foi salva. `columns` é a única
 * lista aqui que não existe no banco.
 */
export interface RowLocal {
  /** Chave estável de UI (uuid) — key do React e chave de `campos`. */
  id: string;
  /** PK de `form_rows` depois do Salvar. `null` = ainda não persistido. */
  dbId: number | null;
  sort_order: number;
  /** Classe de gap do Bootstrap na `row` (g-0 … g-5). */
  gutter: string;
  note: string;
  /**
   * Colunas da tabela dona escolhidas nesta linha. Estado só de UI — `form_rows`
   * não tem coluna correspondente no banco; alimenta a montagem futura dos
   * `form_fields`. Nomes de coluna (`ColunaInfo.name`).
   */
  columns: string[];
}

/**
 * Estado inicial de uma linha nova: sem colunas escolhidas, `gutter: 'g-3'`
 * (espaçamento padrão do grid), `sort_order: 0`, `dbId: null`.
 * @returns `RowLocal` vazio com `id` uuid NOVO a cada chamada — por isso só
 *          deve ser chamada dentro de um handler, nunca em render.
 */
export function rowInicial(): RowLocal {
  return {
    id: crypto.randomUUID(),
    dbId: null,
    sort_order: 0,
    gutter: 'g-3',
    note: '',
    columns: [],
  };
}

/**
 * =============================================================================
 * BLOCO 5 — DISTRIBUIÇÃO DAS COLUNAS DA TABELA ENTRE AS LINHAS (SÓ UI)
 * =============================================================================
 *
 * O QUE FAZ:
 *   Regras puras de "quais colunas da tabela real já foram usadas em qual
 *   linha". A informação vive só em `RowLocal.columns` (Bloco 4) e NÃO existe
 *   no banco: `form_rows` não tem coluna correspondente.
 *
 * REGRA DO PRODUTO:
 *   Cada coluna da tabela vai para NO MÁXIMO uma linha do formulário. Por
 *   isso o select "Colunas (x/12)" de cada linha mostra a lista COMPLETA de
 *   colunas e as já usadas por QUALQUER linha entram como `<option disabled>`
 *   (prop `disabledValues` do `<FormGrid>` select). Estas funções garantem o
 *   mesmo invariante por código — a UI não é a única defesa.
 *
 * CONSUMIDORES:
 *   `FormBuilderPage.tsx` (`adicionarColunasLinha` / `removerColuna`), que a
 *   cada acréscimo cria também o `CampoLocal` correspondente (Bloco 6) e a
 *   cada remoção apaga o campo. Ou seja: `RowLocal.columns` e o `Record` de
 *   campos andam SEMPRE juntos — mexer em um sem o outro deixa coluna órfã
 *   (aparece como "em uso" e não pode ser reescolhida) ou campo órfão
 *   (persistido sem linha).
 *
 * COMO REAPROVEITAR:
 *   São funções PURAS (entrada → saída, sem estado e sem mutar o array
 *   recebido): reaproveite direto em qualquer tela que precise de seleção sem
 *   repetição e com teto. O `max` é parametrizável justamente para isso.
 * -------------------------------------------------------------------------
 */

/**
 * Teto de colunas por linha: 12 = largura total do grid Bootstrap, então cada
 * coluna fica com `col-md-1` no mínimo. É o `max` default de
 * `adicionarColunas` e é o número mostrado no rótulo do select da página.
 */
export const MAX_COLUNAS_POR_LINHA = 12;

/**
 * Acrescenta `escolhidas` a `atuais` sem duplicar e respeitando o teto.
 * A ordem de `atuais` é preservada e o excedente é DESCARTADO em silêncio (a
 * UI já limita a seleção antes de chamar).
 * @param atuais     colunas já escolhidas na linha (`RowLocal.columns`)
 * @param escolhidas colunas selecionadas neste submit do select
 * @param max        teto de colunas por linha (default `MAX_COLUNAS_POR_LINHA`)
 * @returns NOVA lista (não muta `atuais` — seguro para `setState`)
 */
export function adicionarColunas(
  atuais: string[],
  escolhidas: string[],
  max = MAX_COLUNAS_POR_LINHA,
): string[] {
  const out = [...atuais];
  for (const nome of escolhidas) {
    if (out.length >= max) break;
    if (!out.includes(nome)) out.push(nome);
  }
  return out;
}

/**
 * Remove `nome` de `atuais`.
 * A coluna volta ao pool e reaparece HABILITADA nos selects das outras linhas
 * no próximo render. Não valida o teto nem a existência de `nome` (filtrar o
 * que não existe é no-op).
 * @param atuais colunas escolhidas na linha
 * @param nome   nome da coluna a tirar (`ColunaInfo.name`)
 * @returns NOVA lista sem `nome` (não muta `atuais`)
 */
export function removerColuna(atuais: string[], nome: string): string[] {
  return atuais.filter((c) => c !== nome);
}

/**
 * =============================================================================
 * BLOCO 6 — form_fields / `CampoLocal` (1 campo por coluna escolhida na linha)
 * =============================================================================
 *
 * O QUE FAZ:
 *   `CampoLocal` é o estado de UI de UM campo do formulário, ou seja, uma linha
 *   de `form_fields` (4º e último nível da árvore). Ele NASCE quando o usuário
 *   escolhe uma coluna no listbox da linha (`campoInicial()`, já pré-preenchido
 *   pela metadata da coluna) e é editado no modal de campo (`campoSchema` na
 *   página), que é montado pelo `<FormGrid>` a partir dos `FieldSchema` de
 *   `src/components/ui/FormGrid`.
 *
 * POR QUE É IMPORTANTE:
 *   É o nível mais próximo do banco: quase todo campo de `CampoLocal` vira 1:1
 *   uma coluna de `form_fields`. Portanto, acrescentar suporte a um novo tipo
 *   de campo ou a uma nova configuração começa SEMPRE por aqui, no trio:
 *   tipo/interface → `campoInicial()` (default) → `campoPayload()` (envio).
 *
 * MAPA — `CampoLocal` → coluna de `form_fields`:
 *   É 1:1 com o nome do campo, com SÓ 3 exceções:
 *     dbId         → coluna `id` (PK; `null` = ainda não salvo)
 *     sel_*        → NÃO são colunas: viram o JSON `select_config_json`
 *                    (montado por `camposParaPayload()`, no fim deste bloco)
 *     (nenhum campo é "só UI") — todos os demais vão ao banco; a FK
 *                    `form_row_id` chega por PARÂMETRO de `campoPayload()`,
 *                    não faz parte do estado.
 *
 * O QUE NÃO ESTÁ AQUI (decisões já tomadas — leia antes de "completar"):
 *   - Só entra na UI o que alguém precisa PREENCHER ao criar o campo: as colunas
 *     de conteúdo/validação + o que cada `<Tipo>FieldSchema` de
 *     `src/components/ui/FormGrid/<tipo>` declara como config de PRODUTO.
 *     Quem decide qual opção aparece para cada `field_type` é o mapa
 *     `CAMPOS_POR_TIPO` em `FormBuilderPage.tsx` — ao criar uma flag nova,
 *     cadastre-a LÁ também, senão ela existe no estado, é enviada, e ninguém
 *     consegue editá-la na tela.
 *   - Atributos DOM soltos (`title`, `className`, `tabIndex`, `size`, `cols`,
 *     `dir`, `lang`, `spellCheck`, `autoFocus`, `list`) e `style_json` ficam
 *     SEM UI: o renderer/submit define default ou `null`.
 *   - `options_json` / `datalist_json` / `allowed_domains_json` são editados
 *     como TEXTAREA CRUA (string JSON). Editor estruturado é etapa à parte —
 *     por isso são `string` no estado, e não array/objeto tipado.
 *   - A configuração do `select` fica achatada no estado (`sel_*`) e só é
 *     SERIALIZADA na hora de enviar. Nunca monte esse JSON na página.
 *
 * CONSUMIDORES:
 *   `FormBuilderPage.tsx` (`campoSchema` edita, `campoPayload` envia,
 *   `campoInicial` semeia, `MAX_COLUNAS_POR_LINHA` vem do Bloco 5) e
 *   `viewRowToCampo()` (Bloco 8), que reconstrói este estado a partir da view.
 *
 * COMO ESTENDER (fluxo completo de uma opção nova):
 *   1. Declare o campo aqui, com o comentário do que ele faz e em que tipo vale.
 *   2. Dê o default dele em `campoInicial()` (sempre `''`/`false`).
 *   3. Envie em `campoPayload()` (booleano via `bit()`, INT via `intOuUndef()`).
 *   4. Leia de volta em `viewRowToCampo()` se ele precisar reaparecer no modo
 *      edição — esquecer este passo é o bug clássico de "salva mas não volta".
 *   5. Exponha na tela em `CAMPOS_POR_TIPO` (`FormBuilderPage.tsx`).
 *   6. Novo TIPO de campo (e não opção): acrescente o chute em
 *      `inferirFieldType()` e garanta o componente em `FormGrid/<tipo>`.
 * -------------------------------------------------------------------------
 */

/**
 * Estado de UI de UM CAMPO do formulário (4º nível da árvore).
 * Os nomes dos campos repetem os nomes das colunas de `form_fields` (ver mapa
 * no cabeçalho do BLOCO 6); `dbId` é a PK (`null` = não salvo) e os `sel_*` são
 * a configuração do select antes de virar JSON.
 */
export interface CampoLocal {
  /** PK de `form_fields` depois do Salvar. `null` = ainda não persistido. */
  dbId: number | null;

  // -- Estrutura (identificação e posicionamento do campo) ----------------
  /**
   * Enum `field_type` do banco (default `text`). É o DISCRIMINADOR: decide
   * qual componente de campo renderiza (`src/components/ui/FormGrid/<tipo>`) e
   * quais opções aparecem (`CAMPOS_POR_TIPO`). Chute inicial em
   * `inferirFieldType()`; o valor final é escolhido no modal de campo.
   */
  field_type: string;
  /** 1..12 — largura Bootstrap (`col`). 12 = linha inteira (default ao criar). */
  col: number;
  /** Ordem do campo dentro da LINHA (não do grupo). */
  sort_order: number;
  /** Rótulo visível do campo (nasce com o nome da coluna). */
  label: string;
  /** Vira o atributo `name` do campo renderizado (`field_name`). */
  field_name: string;
  /** Vira o atributo `id` do campo renderizado (`field_key`). */
  field_key: string;
  /** Texto de exemplo exibido dentro do campo vazio. */
  placeholder: string;
  /** Valor inicial do campo no formulário gerado. */
  default_value: string;
  /** Texto de ajuda exibido abaixo do campo. */
  help_text: string;

  // -- Estado / validação (TINYINT 0/1 no banco, via `bit()`) --------------
  /** Campo obrigatório (nasce `true` quando a coluna NÃO é nullable). */
  required: boolean;
  /** Renderiza desabilitado (não editável e não enviado pelo browser). */
  disabled: boolean;
  /** Somente leitura (permite selecionar/copiar, mas não editar). */
  read_only: boolean;
  /** Não aparece na tela, mas continua indo no submit (campo oculto). */
  is_hidden: boolean;
  /** INT no banco; `''` = não definido. */
  max_length: string;
  /** INT no banco; `''` = não definido. */
  min_length: string;
  /** Regex HTML (`pattern`) validada pelo browser antes do submit. */
  pattern: string;
  /** Teclado sugerido no mobile (`inputmode`: numeric, email, tel...). */
  input_mode: string;
  /** Dica de autocompletar do browser (`autocomplete`). */
  autocomplete: string;

  // -- Flags por tipo (só têm efeito nos tipos que as declaram; o tipo que
  //    habilita cada uma está em `CAMPOS_POR_TIPO`, em `FormBuilderPage.tsx`) --
  /** Bloqueia dígitos na digitação (`text`/`textarea`/`senha`). */
  no_numbers: boolean;
  /** Bloqueia letras na digitação (`text`/`textarea`/`senha`). */
  no_letters: boolean;
  /** Bloqueia caracteres especiais na digitação (`text`/`textarea`/`senha`). */
  no_special_chars: boolean;
  /** Exige senha forte (composição mínima) no campo de senha. */
  strong_password: boolean;
  /** Sozinho já exige igualdade entre os 2 campos (ver SenhaField). */
  double_field: boolean;
  /** Inclui segundos no campo de hora. */
  with_seconds: boolean;
  /** Exibe contador de caracteres abaixo do campo (`textarea`). */
  show_counter: boolean;
  /** Renderiza os itens na mesma linha (`radio`/`checkbox`). */
  inline: boolean;
  /** INT no banco; `''` = não definido. Altura em linhas (`textarea`). */
  rows_qty: string;
  /** ISO `YYYY-MM-DD`; `''` = não definido. Data mínima aceita (`data`). */
  min_date: string;
  /** ISO `YYYY-MM-DD`; `''` = não definido. Data máxima aceita (`data`). */
  max_date: string;

  // -- Arrays (JSON cru — editor estruturado é etapa à parte) --------
  // São strings JSON digitadas como textarea: NÃO são validadas nem
  // convertidas aqui — quem interpreta é o renderer do formulário gerado.
  /** Opções do grupo local (`radio`/`checkbox`, select com opções inline). */
  options_json: string;
  /** Sugestões de preenchimento local (`<datalist>`). */
  datalist_json: string;
  /** Domínios de e-mail aceitos (`email`). */
  allowed_domains_json: string;

  // -- Config do `select` (→ serializada em `select_config_json`) ----
  // Preenchidas só quando `field_type: 'select'`. NÃO são colunas do banco:
  // viram JSON em `camposParaPayload()` e voltam em `selConfigToCampo()`
  // (Bloco 8). O sufixo corresponde à chave camelCase do JSON: `sel_src` →
  // `src`, `sel_value_key` → `valueKey`, e assim por diante.
  /** Permite mais de uma opção selecionada. */
  sel_multiple: boolean;
  /** URL remota que alimenta as opções (prop `src` do SelectField). */
  sel_src: string;
  /** Chave do registro usada como VALOR da opção (ex.: `id`). */
  sel_value_key: string;
  /** Chave usada como RÓTULO (o Bloco 8 também aceita array, unido por vírgula). */
  sel_label_key: string;
  /** Template do rótulo montado a partir do registro (ver SelectField). */
  sel_label_template: string;
  /** INT; `''` = não definido — enviado como `maxVisible`. */
  sel_max_visible: string;
  /** INT; `''` = não definido — enviado como `rows`. */
  sel_rows: string;
  /** Token enviado na requisição de `sel_src` (enviado como `authToken`). */
  sel_auth_token: string;
  /** URL da busca remota por texto (enviada como `findSrc`). */
  sel_find_src: string;
  /** Coluna usada pela busca remota de `sel_find_src` (enviada como `findColumn`). */
  sel_find_column: string;
  /** URL que recupera registros já escolhidos (enviada como `getSrc`). */
  sel_get_src: string;
}

/**
 * Chuta o `field_type` a partir do `data_type` da coluna.
 * É só o valor INICIAL do campo (o usuário troca no modal de campo depois).
 * @param dataType valor cru de `ColunaInfo.data_type` (comparado em minúsculas)
 * @returns um `field_type` válido para `CampoLocal.field_type`
 * Mapa atual: `text*` (text/tinytext/mediumtext/longtext) → `textarea`;
 *   `date` → `data`; `time` → `hora`; `datetime`/`timestamp` → `data`;
 *   `enum`/`set` → `select`; QUALQUER outro (`varchar`, `int`, `decimal`,
 *   `json`, `blob`...) cai no default `text`.
 * ATENÇÃO: se um tipo novo passar a existir em `FormGrid/<tipo>`, cadastre o
 * chute aqui e confirme que a coluna aparece com a opção certa no select.
 */
export function inferirFieldType(dataType: string): string {
  const t = dataType.toLowerCase();
  if (t.includes('text')) return 'textarea';
  if (t === 'date') return 'data';
  if (t === 'time') return 'hora';
  if (t === 'datetime' || t === 'timestamp') return 'data';
  if (t === 'enum' || t === 'set') return 'select';
  return 'text';
}

/**
 * Cria o estado de UI de um campo NOVO a partir da coluna escolhida na linha.
 * É chamado pelo handler `adicionarColunasLinha` da página (Bloco 5), uma vez
 * por coluna marcada no listbox.
 * @param coluna    metadata vinda de `db-schema/columns` (`ColunaInfo`)
 * @param sortOrder posição do campo dentro da linha (índice da coluna)
 * @returns `CampoLocal` com `dbId: null` (ainda não salvo), `field_type`
 *          chutado por `inferirFieldType()`, `col: 12` (linha inteira — o
 *          usuário reduz depois), `label`/`field_name`/`field_key` herdando o
 *          nome da coluna e `required` = coluna NÃO nullable. Todo o resto sai
 *          no default do banco (`''` para texto, `false` para flag).
 * POR QUE: evita digitação repetida e garante que o campo nasce "batendo" com a
 *   coluna real; é também o único lugar que lê a metadata para semear defaults.
 */
export function campoInicial(coluna: ColunaInfo, sortOrder: number): CampoLocal {
  return {
    dbId: null,
    field_type: inferirFieldType(coluna.data_type),
    col: 12,
    sort_order: sortOrder,
    label: coluna.name,
    field_name: coluna.name,
    field_key: coluna.name,
    placeholder: '',
    default_value: '',
    help_text: '',
    required: !coluna.nullable,
    disabled: false,
    read_only: false,
    is_hidden: false,
    max_length: '',
    min_length: '',
    pattern: '',
    input_mode: '',
    autocomplete: '',
    no_numbers: false,
    no_letters: false,
    no_special_chars: false,
    strong_password: false,
    double_field: false,
    with_seconds: false,
    show_counter: false,
    inline: false,
    rows_qty: '',
    min_date: '',
    max_date: '',
    options_json: '',
    datalist_json: '',
    allowed_domains_json: '',
    sel_multiple: false,
    sel_src: '',
    sel_value_key: '',
    sel_label_key: '',
    sel_label_template: '',
    sel_max_visible: '',
    sel_rows: '',
    sel_auth_token: '',
    sel_find_src: '',
    sel_find_column: '',
    sel_get_src: '',
  };
}

/**
 * Serializa SÓ a configuração do `select` (os `sel_*`) na coluna
 * `select_config_json`, com as chaves em camelCase que o SelectField espera
 * (`sel_value_key` → `valueKey`, etc.).
 * Chaves vazias/`false` são omitidas e um objeto vazio vira `''` (aí o
 * `stripVazios` do `campoPayload` corta a coluna do corpo).
 * @param c campo em edição no modal
 * @returns `{ select_config_json }`, já pronto para o spread dentro de
 *          `campoPayload` — o resto de `CampoLocal` mapeia 1:1 nas colunas
 * O INVERSO é `selConfigToCampo()` (Bloco 8). Ao criar/renomear uma opção do
 * select, ajuste OS DOIS lados — este é o único ponto de tradução entre o
 * estado achatado (`sel_*`) e o JSON do banco.
 */
export function camposParaPayload(c: CampoLocal): { select_config_json: string } {
  const sel: Record<string, string | number | boolean> = {};
  if (c.sel_multiple) sel.multiple = true;
  if (c.sel_src) sel.src = c.sel_src;
  if (c.sel_value_key) sel.valueKey = c.sel_value_key;
  if (c.sel_label_key) sel.labelKey = c.sel_label_key;
  if (c.sel_label_template) sel.labelTemplate = c.sel_label_template;
  if (c.sel_max_visible) sel.maxVisible = Number.parseInt(c.sel_max_visible, 10);
  if (c.sel_rows) sel.rows = Number.parseInt(c.sel_rows, 10);
  if (c.sel_auth_token) sel.authToken = c.sel_auth_token;
  if (c.sel_find_src) sel.findSrc = c.sel_find_src;
  if (c.sel_find_column) sel.findColumn = c.sel_find_column;
  if (c.sel_get_src) sel.getSrc = c.sel_get_src;

  return {
    select_config_json: Object.keys(sel).length > 0 ? JSON.stringify(sel) : '',
  };
}

/**
 * =============================================================================
 * BLOCO 7 — MAPPERS ESTADO → PAYLOAD (ESCRITA: create / update)
 * =============================================================================
 *
 * O QUE FAZ:
 *   Converte cada `*Local` (estado de UI dos Blocos 2, 3, 4 e 6) no corpo JSON
 *   que a API espera em `form-manager` | `form-groups` | `form-rows` |
 *   `form-campos` `/create|update`.
 *
 * REGRAS DO CONTRATO (valem para os QUATRO payloads):
 *   - Só vai o que está PREENCHIDO: `stripVazios` descarta `''`/`null`/
 *     `undefined`. A API é `permit_empty`, então omitir a chave é o jeito
 *     correto de dizer "não mexe" (em UPDATE, evita sobrescrever com vazio).
 *   - Booleano NUNCA vai cru: sempre `bit()` → 0/1 (TINYINT no banco).
 *     `stripVazios` também não repassa booleano nenhum (nem `true`), então
 *     esquecer o `bit()` faz a chave DESAPARECER do corpo, sem erro.
 *   - Texto que representa INT no banco (`max_length`, `rows_qty`, `sel_rows`)
 *     vira número por `intOuUndef()`, e volta a ser omitido quando inválido.
 *   - A FK do pai entra SEMPRE explícita, como segundo argumento da função
 *     (`form_manager_id`, `form_group_id`, `form_row_id`) — é o que garante a
 *     árvore montada nó a nó, um nível por vez.
 *   - `id`, timestamps e auditoria ficam por conta do BACKEND.
 *
 * CONSUMIDORES:
 *   `FormBuilderPage.tsx`, nas funções `salvarManager`/`salvarGrupo`/
 *   `salvarRow`/`salvarCampo` (cada modal tem o seu Salvar independente).
 *
 * COMO REAPROVEITAR:
 *   `Payload`, `stripVazios`, `bit` e `intOuUndef` são GENÉRICOS e foram feitos
 *   para reuso — `listBuilder.model.ts` já importa todos. Um payload novo é
 *   sempre `stripVazios({ <fk do pai>, <campos do estado> })`.
 *
 * ARMADILHAS (causas comuns de bug em manutenção):
 *   - Criar o campo no `*Local` e esquecer de listá-lo no `*Payload()`: o valor
 *     aparece na tela, o usuário salva e nada é enviado.
 *   - Passar número/string para `bit()` (ele tipa booleano): o valor sai errado.
 *   - Assumir que `stripVazios` mantém `0`: mantém sim (é number), mas `false`
 *     cru NÃO — daí a regra acima.
 * -------------------------------------------------------------------------
 */

/**
 * Corpo de requisição aceito pela API: chave → string ou número.
 * Arrays/objetos não são representáveis aqui de propósito — o que é lista vai
 * como string JSON (`roles`, `*_json`).
 */
export type Payload = Record<string, string | number>;

/**
 * Descarta chaves `''` / `null` / `undefined`.
 * Mantém `0` e os demais números (importante: `sort_order: 0` é valor válido) e
 * também NÃO repassa booleanos — `true`/`false` crus são descartados, por isso
 * todo booleano precisa passar por `bit()` antes.
 * @param obj objeto cru montado pelo `*Payload()`
 * @returns novo objeto só com string/número preenchidos
 * Exportado: reaproveitado por outros construtores (ver `listBuilder.model.ts`).
 */
export function stripVazios(obj: Record<string, unknown>): Payload {
  const out: Payload = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === '' || v === null || v === undefined) continue;
    if (typeof v === 'number' || typeof v === 'string') out[k] = v;
  }
  return out;
}

/**
 * Booleano → 0/1 (TINYINT do banco), lido de volta por `viewBit()` no Bloco 8.
 * Use SEMPRE antes de mandar flag no payload (ver armadilha do `stripVazios`
 * acima). Reaproveitado por `listBuilder.model.ts`.
 */
export const bit = (b: boolean): number => (b ? 1 : 0);

/**
 * Texto de campo INT do banco → número do payload.
 * `'12'` → `12`; `''`, `'abc'` ou qualquer inválido → `undefined`, que o
 * `stripVazios` então corta do corpo ("não definido" continua ausente).
 * @param s valor do estado (sempre string; `''` = não definido)
 * @returns número válido ou `undefined`
 */
export function intOuUndef(s: string): number | undefined {
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * `ManagerLocal` → corpo de `form-manager/create|update`.
 * @param m estado do nó raiz (Bloco 2)
 * @returns corpo sem as chaves vazias; `tableName` → `table_name` e `slugAuto`
 *          (só UI) NÃO é enviado. `version` cai para 1 se vier inválido.
 * POR QUE: é o payload que grava a tabela real do banco no registro — sem ele
 *   o modo edição não teria como recarregar as colunas.
 */
export function managerPayload(m: ManagerLocal): Payload {
  return stripVazios({
    slug: m.slug,
    table_name: m.tableName,
    title: m.title,
    description: m.description,
    roles: m.roles,
    react_route: m.react_route,
    submit_endpoint: m.submit_endpoint,
    http_method: m.http_method,
    status: m.status,
    version: Number.isFinite(m.version) ? m.version : 1,
  });
}

/**
 * `GrupoLocal` → corpo de `form-groups/create|update`.
 * @param g estado do grupo (Bloco 3)
 * @param formManagerId `dbId` do manager dono — a FK que liga o grupo à árvore
 * @returns corpo com a FK explícita e `collapsed` convertido por `bit()`
 * ATENÇÃO: a página só pode chamar isto DEPOIS que o manager tem `dbId` (é a
 *   FK que a API exige); o `id` uuid de UI fica no estado e não vai no corpo.
 */
export function grupoPayload(g: GrupoLocal, formManagerId: number): Payload {
  return stripVazios({
    form_manager_id: formManagerId,
    title: g.title,
    slug: g.slug,
    description: g.description,
    icon: g.icon,
    sort_order: g.sort_order,
    collapsed: bit(g.collapsed),
  });
}

/**
 * `RowLocal` → corpo de `form-rows/create|update`.
 * @param r estado da linha (Bloco 4)
 * @param formGroupId `dbId` do grupo dono
 * @returns corpo com a FK e o `gutter`; `columns` (só UI) NÃO é enviado — quem
 *          persiste a coluna escolhida é o campo criado a partir dela
 *          (`campoPayload`, com a coluna `field_name`).
 */
export function rowPayload(r: RowLocal, formGroupId: number): Payload {
  return stripVazios({
    form_group_id: formGroupId,
    sort_order: r.sort_order,
    gutter: r.gutter,
    note: r.note,
  });
}

/**
 * `CampoLocal` → corpo de `form-campos/create|update`.
 * É o payload mais completo do módulo: quase todos os campos do estado viram
 * coluna 1:1 e os que representam INT passam por `intOuUndef()`.
 * @param c estado do campo (Bloco 6)
 * @param formRowId `dbId` da linha dona — a FK que amarra o campo ao grid
 * @returns corpo pronto, já com `select_config_json` no fim (spread de
 *          `camposParaPayload(c)`, que serializa os `sel_*`)
 * AO ACRESCENTAR UMA OPÇÃO NOVA em `CampoLocal`: espelhar aqui (booleano via
 *   `bit()`, INT via `intOuUndef()`, texto cru) E no `viewRowToCampo()` do
 *   Bloco 8, senão o valor salva mas não volta ao reabrir o registro.
 */
export function campoPayload(c: CampoLocal, formRowId: number): Payload {
  return stripVazios({
    form_row_id: formRowId,
    sort_order: c.sort_order,
    field_type: c.field_type,
    col: c.col,
    label: c.label,
    field_name: c.field_name,
    field_key: c.field_key,
    placeholder: c.placeholder,
    default_value: c.default_value,
    help_text: c.help_text,
    required: bit(c.required),
    disabled: bit(c.disabled),
    read_only: bit(c.read_only),
    is_hidden: bit(c.is_hidden),
    min_length: intOuUndef(c.min_length),
    max_length: intOuUndef(c.max_length),
    pattern: c.pattern,
    input_mode: c.input_mode,
    autocomplete: c.autocomplete,
    no_numbers: bit(c.no_numbers),
    no_letters: bit(c.no_letters),
    no_special_chars: bit(c.no_special_chars),
    strong_password: bit(c.strong_password),
    double_field: bit(c.double_field),
    with_seconds: bit(c.with_seconds),
    show_counter: bit(c.show_counter),
    inline: bit(c.inline),
    rows_qty: intOuUndef(c.rows_qty),
    min_date: c.min_date,
    max_date: c.max_date,
    options_json: c.options_json,
    datalist_json: c.datalist_json,
    allowed_domains_json: c.allowed_domains_json,
    ...camposParaPayload(c),
  });
}

/**
 * =============================================================================
 * BLOCO 8 — HIDRATAÇÃO: `view_form_manager` → estado do builder (LEITURA)
 * =============================================================================
 *
 * O QUE FAZ:
 *   Inverso EXATO dos `*Payload()` do Bloco 7. A view `view_form_manager`
 *   (`services/v1/formManager.view.ts`) devolve tudo ACHATADO — 1 linha por
 *   campo, com prefixos por nível:
 *     `fm_*` = form_manager   `fg_*` = form_groups
 *     `fr_*` = form_rows      `fc_*` = form_fields
 *   `viewRowsToBuilderState()` varre essas linhas, remonta a árvore
 *   (`manager` + `grupos` + `linhas` + `campos`) e devolve o MESMO formato de
 *   estado que o fluxo de criação produz.
 *
 * POR QUE É IMPORTANTE:
 *   É o que faz a rota `/v1/form-constructor/update/:id` abrir o formulário
 *   completo. Se uma coluna enviada pelo `*Payload()` não for lida aqui, o
 *   valor "some" ao reabrir o registro (foi salvo, mas a tela não mostra) —
 *   por isso os Blocos 7 e 8 são mantidos SEMPRE em pares.
 *
 * REGRAS DA REMONTAGEM:
 *   - Linhas sem campo (`fc_id` nulo: grupo/linha ainda vazios) entram assim
 *     mesmo, sem campo — a árvore precisa mostrar o nó vazio.
 *   - O `dbId` de cada nível vem da view; as chaves de UI (`id` uuid) são
 *     geradas AQUI, porque a view não as tem. É isso que permite editar um nó
 *     ainda não salvo sem esperar o banco.
 *   - O agrupamento é pela FK do pai: `fg_id` agrupa em `linhas[grupo.id]` e
 *     `fr_id` em `campos[linha.id]`; a chave de `campos` é o `field_name`.
 *   - `RowLocal.columns` é RECONSTRUÍDO aqui a partir dos campos que voltam
 *     (não existe no banco) — se o dedupe por `field_name` pular um campo
 *     repetido, a coluna também não é duplicada na linha.
 *   - `tabela` (para recarregar as colunas) usa `fm_table_name` e SÓ cai no
 *     heurístico `tabelaDoEndpoint()` em registros legados sem esse valor.
 *
 * IMPORTANTE — tudo chega como `unknown`:
 *   A view pode mandar número, string numérica, `1`/`'1'` como bit ou JSON já
 *   desserializado (objeto) conforme o driver. Os coercedores
 *   `viewNum`/`viewStr`/`viewBit`/`viewIntStr`/`viewJsonStr` são a ÚNICA porta
 *   de entrada — nunca compare nem converta o valor cru inline.
 *
 * CONSUMIDORES:
 *   `FormBuilderPage.tsx` (useEffect do `:id`), que chama
 *   `viewRowsToBuilderState(rows)` e distribui o resultado nos `useState`.
 *
 * COMO REAPROVEITAR:
 *   Precisa de uma view que devolva o nível-pai REPETIDO em cada linha (senão
 *   não há como saber a qual pai o filho pertence). Copie o par
 *   "coercedores + `viewRowsTo<X>State()`" e mantenha a ordem de construção
 *   pai → filho (o grupo cria a chave de `linhas`; a linha, a de `campos`).
 * -------------------------------------------------------------------------
 */

/**
 * Estado COMPLETO do builder — o formato que a página consome, tanto no fluxo
 * de criação quanto no modo edição.
 * `tabela`  → nome da tabela real dona (usado para buscar as colunas)
 * `manager` → nó raiz (1)
 * `grupos`  → 2º nível, já ordenado por `sort_order`
 * `linhas`  → chave = `GrupoLocal.id` (uuid de UI, NUNCA o `dbId`)
 * `campos`  → chave = `RowLocal.id` → chave = `field_name`
 * O encadeamento por UUID (e não por PK) é o que permite mexer em um nó novo,
 * ainda sem `dbId`, sem esperar resposta do banco.
 */
export interface BuilderState {
  /** Nome da tabela dona (para carregar colunas). */
  tabela: string;
  manager: ManagerLocal;
  grupos: GrupoLocal[];
  /** chave = grupo.id (uuid). */
  linhas: Record<string, RowLocal[]>;
  /** chave = linha.id (uuid) -> field_name. */
  campos: Record<string, Record<string, CampoLocal>>;
}

/**
 * FAMÍLIA DE COERCEDORES DA VIEW (Bloco 8) — a única porta de entrada dos
 * valores que vêm do banco, todos tipados como `unknown`. Convertem o valor
 * cru para o tipo do estado, SEM lançar exceção:
 *   `viewNum`    → número válido ou `null` (aceita `'12'`, rejeita `''`/lixo)
 *   `viewStr`    → string (number vira string; resto vira `''`)
 *   `viewBit`    → booleano (aceita `1`, `'1'` e `true`)
 *   `viewIntStr` → string de INT para o estado (`''` quando não definido)
 *   `viewJsonStr`→ string JSON crua (objeto do driver é re-serializado)
 * Ao acrescentar um campo na hidratação, escolha o coercedor pelo tipo da
 * COLUNA do banco, nunca pela aparência do JSON recebido.
 */

/**
 * Valor cru → número, ou `null` quando não é numérico (`''`, texto, objeto).
 * `null` é o sinal de "não veio" usado nos testes de `continue` da hidratação
 * (`fg_id`, `fr_id`, `fc_id`) e nos `?? 0` de ordenação.
 */
function viewNum(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/**
 * Valor cru → string do estado. Número vira string (o banco manda INT onde o
 * estado usa texto, ex.: `fc_col`); `null`/`undefined`/objeto viram `''`.
 */
function viewStr(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return '';
}

/**
 * Valor cru → booleano de flag (TINYINT). Aceita `1`, `'1'` e `true`; QUALQUER
 * outro valor (inclusive `'true'` e `0`) é `false`.
 * É o inverso de `bit()` (Bloco 7) e mais tolerante que o `nullable` de
 * `toColuna()` (Bloco 1), que só aceita `true` booleano.
 */
function viewBit(v: unknown): boolean {
  return v === 1 || v === '1' || v === true;
}

/**
 * Valor cru de campo INT opcional → STRING para o estado (`''` = não definido),
 * porque as flags de tamanho/quantidade de `CampoLocal` são `string` (ver
 * regra 4 do cabeçalho). O caminho de volta é `intOuUndef()` (Bloco 7).
 */
function viewIntStr(v: unknown): string {
  const n = viewNum(v);
  return n === null ? '' : String(n);
}

/**
 * Coluna `*_json` → string crua para o estado.
 * Se o driver já entregou string, devolve como veio (preserva formatação do
 * que foi salvo); se veio objeto/array desserializado, re-serializa. `''`,
 * `null` e JSON que não serializa viram `''` — nunca lança.
 */
function viewJsonStr(v: unknown): string {
  if (v === null || v === undefined || v === '') return '';
  if (typeof v === 'string') return v;
  try {
    return JSON.stringify(v);
  } catch {
    return '';
  }
}

/**
 * Deduz o nome da TABELA do banco a partir do endpoint de submit.
 * `/api/v1/calendar-manager/create` → `calendar_manager`.
 * Rotas da API são kebab-case (`API_GROUPS`), mas as tabelas reais são
 * snake_case (ex.: `user-manager` → `user_manager`) — converte antes de
 * devolver, senão a introspecção do schema falha para qualquer tabela cujo
 * nome tenha underscore.
 * @param submitEndpoint `submit_endpoint` do manager (ex.: `/api/v1/x-manager/create`)
 * @param slug `slug` do manager — fallback quando o endpoint não casa com o regex
 * @returns nome da tabela com `_` no lugar de `-`
 * Uso: é FALLBACK da hidratação (registros legados sem `fm_table_name`); em
 *   registro novo, `tabela` vem de `ManagerLocal.tableName`.
 */
export function tabelaDoEndpoint(submitEndpoint: string, slug: string): string {
  const m = /\/v1a?\/([^/?#]+)/.exec(submitEndpoint);
  return (m?.[1] ?? slug).replace(/-/g, '_');
}

/**
 * `fm_roles` → string de lista JSON (o formato que `parseStringList`/
 * `toStringList` de `@/utils/jsonList` entendem).
 * Aceita as DUAS formas que a coluna pode ter: lista JSON já pronta (começa com
 * `[`, devolvida como está) ou um slug solto/CSV de um registro legado, que é
 * embrulhado numa lista de 1 item. Vazio → `''`.
 * @param raw valor cru de `fm_roles`
 * @returns string JSON de array de strings, ou `''`
 */
function normalizeRoles(raw: unknown): string {
  const s = viewStr(raw).trim();
  if (!s) return '';
  if (s.startsWith('[')) return s;
  return toStringList([s]);
}

/**
 * Reverte `select_config_json` (camelCase do SelectField) → chaves `sel_*`
 * achatadas de `CampoLocal` — o inverso de `camposParaPayload()` (Bloco 6).
 * Tolera o valor vir já como objeto (driver) ou como string JSON; JSON inválido
 * devolve `{}` (o campo volta com os defaults, sem quebrar a hidratação).
 * @param raw valor cru de `fc_select_config_json`
 * @returns patch parcial de `CampoLocal` para o spread em `viewRowToCampo`
 * `labelKey` aceito como array é unido por vírgula (formato do estado).
 */
function selConfigToCampo(raw: unknown): Partial<CampoLocal> {
  let cfg: Record<string, unknown> | null = null;
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    cfg = raw as Record<string, unknown>;
  } else if (typeof raw === 'string' && raw.trim() !== '') {
    try {
      const p: unknown = JSON.parse(raw);
      if (p && typeof p === 'object' && !Array.isArray(p)) cfg = p as Record<string, unknown>;
    } catch {
      cfg = null;
    }
  }
  if (!cfg) return {};
  const s = (k: string): string => viewStr(cfg[k]);
  return {
    sel_multiple: cfg.multiple === true || cfg.multiple === 1 || cfg.multiple === '1',
    sel_src: s('src'),
    sel_value_key: s('valueKey'),
    sel_label_key: Array.isArray(cfg.labelKey) ? cfg.labelKey.join(',') : s('labelKey'),
    sel_label_template: s('labelTemplate'),
    sel_max_visible: viewIntStr(cfg.maxVisible),
    sel_rows: viewIntStr(cfg.rows),
    sel_auth_token: s('authToken'),
    sel_find_src: s('findSrc'),
    sel_find_column: s('findColumn'),
    sel_get_src: s('getSrc'),
  };
}

/**
 * Uma linha da view (campos `fc_*`) → `CampoLocal` pronto para o estado.
 * Parte de `campoInicial()` com uma `ColunaInfo` FALSA (`data_type: ''`,
 * `nullable: true`) só para reaproveitar os defaults do banco e o chute de
 * `field_type`; em seguida sobrescreve TUDO com os valores reais da view.
 * @param row linha achatada da view (prefixos `fc_*`)
 * @param fcId `dbId` do campo (PK já convertida por `viewNum`)
 * @returns campo hidratado, com os coercedores aplicados coluna a coluna e o
 *          select reconstruído de `fc_select_config_json` no fim
 */
function viewRowToCampo(row: Record<string, unknown>, fcId: number): CampoLocal {
  const base = campoInicial(
    { name: viewStr(row.fc_field_name), data_type: '', column_type: '', nullable: true, key: null },
    viewNum(row.fc_sort_order) ?? 0,
  );
  return {
    ...base,
    dbId: fcId,
    field_type: viewStr(row.fc_field_type) || base.field_type,
    col: viewNum(row.fc_col) ?? 12,
    sort_order: viewNum(row.fc_sort_order) ?? 0,
    label: viewStr(row.fc_label),
    field_name: viewStr(row.fc_field_name),
    field_key: viewStr(row.fc_field_key),
    placeholder: viewStr(row.fc_placeholder),
    default_value: viewStr(row.fc_default_value),
    help_text: viewStr(row.fc_help_text),
    required: viewBit(row.fc_required),
    disabled: viewBit(row.fc_disabled),
    read_only: viewBit(row.fc_read_only),
    is_hidden: viewBit(row.fc_is_hidden),
    max_length: viewIntStr(row.fc_max_length),
    min_length: viewIntStr(row.fc_min_length),
    pattern: viewStr(row.fc_pattern),
    input_mode: viewStr(row.fc_input_mode),
    autocomplete: viewStr(row.fc_autocomplete),
    no_numbers: viewBit(row.fc_no_numbers),
    no_letters: viewBit(row.fc_no_letters),
    no_special_chars: viewBit(row.fc_no_special_chars),
    strong_password: viewBit(row.fc_strong_password),
    double_field: viewBit(row.fc_double_field),
    with_seconds: viewBit(row.fc_with_seconds),
    show_counter: viewBit(row.fc_show_counter),
    inline: viewBit(row.fc_inline),
    rows_qty: viewIntStr(row.fc_rows_qty),
    min_date: viewStr(row.fc_min_date),
    max_date: viewStr(row.fc_max_date),
    options_json: viewJsonStr(row.fc_options_json),
    datalist_json: viewJsonStr(row.fc_datalist_json),
    allowed_domains_json: viewJsonStr(row.fc_allowed_domains_json),
    ...selConfigToCampo(row.fc_select_config_json),
  };
}

/**
 * Converte as linhas ACHATADAS da view `view_form_manager` no estado completo
 * do builder (ver regras no cabeçalho do BLOCO 8).
 * @param rows linhas da view (1 por campo; `fm_*` repetido em todas)
 * @returns `BuilderState` montado, ou `null` quando a lista vem vazia
 * @see viewRowToCampo  montagem de cada campo
 * @see tabelaDoEndpoint  fallback do nome da tabela
 */
export function viewRowsToBuilderState(
  rows: readonly Record<string, unknown>[],
): BuilderState | null {
  // Cabeçalho = primeira linha que traz o bloco `fm_*`. O fallback para
  // `rows[0]` só cobre resposta sem manager (aí o estado sai praticamente
  // vazio); sem nenhuma linha, devolve `null` e a página mantém o inicial.
  const head = rows.find((r) => viewNum(r.fm_id) !== null) ?? rows[0];
  if (!head) return null;

  const slug = viewStr(head.fm_slug);
  const tableName = viewStr(head.fm_table_name);
  const submitEndpoint = viewStr(head.fm_submit_endpoint);
  const statusRaw = viewStr(head.fm_status);
  const status: ManagerStatus = (['draft', 'active', 'inactive'] as const).includes(
    statusRaw as ManagerStatus,
  )
    ? (statusRaw as ManagerStatus)
    : 'draft';

  const manager: ManagerLocal = {
    dbId: viewNum(head.fm_id),
    slug,
    tableName,
    title: viewStr(head.fm_title),
    description: viewStr(head.fm_description),
    roles: normalizeRoles(head.fm_roles),
    react_route: viewStr(head.fm_react_route),
    submit_endpoint: submitEndpoint,
    http_method: viewStr(head.fm_http_method) || 'POST',
    status,
    version: viewNum(head.fm_version) ?? 1,
    slugAuto: false,
  };

  // Acumuladores do resultado + memória de quem já foi criado, para não
  // duplicar nó: a view repete o mesmo `fg_*`/`fr_*` em TODAS as linhas dos
  // seus filhos, então o grupo/linha só é criado na PRIMEIRA vez que o id
  // aparece (o mapa guarda o objeto já hidratado e evita uma 2ª cópia).
  const grupos: GrupoLocal[] = [];
  const linhas: Record<string, RowLocal[]> = {};
  const campos: Record<string, Record<string, CampoLocal>> = {};
  const grupoPorDbId = new Map<number, GrupoLocal>();
  const linhaPorDbId = new Map<number, RowLocal>();

  // Varre da raiz para a folha, pulando os níveis que não vieram naquela linha
  // (`fg_id`/`fr_id`/`fc_id` nulos): grupo/linha vazios entram sem filho, e a
  // linha só aparece quando há um `fr_id` no registro.
  for (const row of rows) {
    const fgId = viewNum(row.fg_id);
    if (fgId === null) continue;

    let g = grupoPorDbId.get(fgId);
    if (!g) {
      g = {
        id: crypto.randomUUID(),
        dbId: fgId,
        title: viewStr(row.fg_title),
        slug: viewStr(row.fg_slug),
        description: viewStr(row.fg_description),
        icon: viewStr(row.fg_icon),
        sort_order: viewNum(row.fg_sort_order) ?? 0,
        collapsed: viewBit(row.fg_collapsed),
        slugAuto: false,
      };
      grupoPorDbId.set(fgId, g);
      grupos.push(g);
      linhas[g.id] = [];
    }

    const frId = viewNum(row.fr_id);
    if (frId === null) continue;

    let r = linhaPorDbId.get(frId);
    if (!r) {
      r = {
        id: crypto.randomUUID(),
        dbId: frId,
        sort_order: viewNum(row.fr_sort_order) ?? 0,
        gutter: viewStr(row.fr_gutter) || 'g-3',
        note: viewStr(row.fr_note),
        columns: [],
      };
      linhaPorDbId.set(frId, r);
      (linhas[g.id] ??= []).push(r);
      campos[r.id] = {};
    }

    const fcId = viewNum(row.fc_id);
    if (fcId === null) continue;

    const fieldName =
      viewStr(row.fc_field_name) || viewStr(row.fc_field_key) || `campo_${fcId}`;
    if (r.columns.includes(fieldName)) continue;
    r.columns.push(fieldName);
    (campos[r.id] ??= {})[fieldName] = viewRowToCampo(row, fcId);
  }

  // A view não garante ordem: reordena grupos e linhas de cada grupo por
  // `sort_order` (o mesmo campo que a tela controla ao arrastar/reordenar).
  grupos.sort((a, b) => a.sort_order - b.sort_order);
  for (const arr of Object.values(linhas)) arr.sort((a, b) => a.sort_order - b.sort_order);

  // `fm_table_name` é a fonte da verdade (gravado na criação do registro).
  // O heurístico por `submit_endpoint` é só fallback para registros legados,
  // gravados antes de `table_name` existir; `slug` e o literal 'tabela' são o
  // último recurso, para a tela nunca ficar sem nome de tabela.
  const tabela = tableName || tabelaDoEndpoint(submitEndpoint, slug) || slug || 'tabela';
  return { tabela, manager, grupos, linhas, campos };
}
