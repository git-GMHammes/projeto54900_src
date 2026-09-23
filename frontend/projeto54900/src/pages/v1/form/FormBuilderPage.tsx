/**
 * =============================================================================
 * FILE HEADER — FormBuilderPage (construtor de formulários com árvore + modal)
 * =============================================================================
 *
 * O QUE FAZ:
 *   Página `/v1/form-constructor` (criação) e `/v1/form-constructor/update/:id`
 *   (edição). O usuário escolhe 1+ tabelas reais do banco (vindas da API de
 *   introspecção, não uma lista fixa no código) e cada tabela vira um card com
 *   uma árvore de 4 níveis: form_manager (1:1 com a tabela) → form_groups (N)
 *   → form_rows (N por grupo) → form_fields (1 por coluna escolhida na linha).
 *   Cada nível é uma linha compacta e colapsável (`<TreeNode>`); o formulário
 *   de edição de cada nó abre num modal (`<FormModal>`), nunca inline na árvore.
 *
 * DEPENDÊNCIAS (arquivos deste projeto que este arquivo consome):
 *   - `./formBuilder.model.ts` — TODOS os tipos (`ManagerLocal`/`GrupoLocal`/
 *     `RowLocal`/`CampoLocal`), os construtores `*Inicial()`, os mappers
 *     estado→payload (`*Payload()`) e o hidratador reverso do modo edição
 *     (`viewRowsToBuilderState`). Esta página só monta ESTADO e SCHEMA; a
 *     forma dos dados vive isolada no model.
 *   - `./FormBuilderTree.tsx` (`<FormTree>`/`<TreeNode>`) — componente
 *     GENÉRICO e reutilizável de árvore pai→filho com colapso em estado React
 *     (nunca o plugin JS do Bootstrap). Não tem nenhum conhecimento de
 *     form_manager/form_groups/etc.; só recebe `id`/`parents`/`level`/`name`.
 *   - `./FormModal.tsx` — modal genérico controlado por React (portal +
 *     Esc/clique fora), com rodapé "Salvar"/"Fechar" quando recebe `onSave`.
 *   - `@/components/ui/FormGrid/Input` (`<FormGrid>`) — fábrica de campos por
 *     schema JSON; nenhum `<input>`/`<select>`/`<textarea>` é escrito à mão
 *     aqui (ver `src/markdown/geral/README_render_via_formgrid.md`).
 *   - `@/components/ui/IconSelect` — seletor visual de ícone (só no subcard
 *     GRUPOS, fica fora do `<FormGrid>` porque não é um campo de formulário).
 *   - `@/services/v1` (`dbSchema`, `formManagerTable`, `formManagerView`,
 *     `formGroupsTable`, `formRowsTable`, `formCamposTable`) — cada tabela
 *     do módulo Form tem seu próprio service REST (`createResource`); a
 *     página chama `create`/`update`/`deleteSoft` diretamente, nó a nó.
 *   - `@/utils/apiResult` (`normalizeItem`/`normalizeList`) — extraem
 *     `{ data }`/`{ rows }` de respostas HTTP em formatos variados.
 *   - `@/utils/jsonList`, `@/utils/slug` — helpers de lista-em-JSON (campo
 *     "Grupo de perfil") e slugify automático (título → slug).
 *
 * CONSUMIDORES (quem monta esta página):
 *   - `src/routes/v1/form.routes.tsx` — rota lazy do construtor.
 *
 * COMO FUNCIONA A PERSISTÊNCIA (ponto mais importante para manutenção):
 *   Estado 100% local (React) até o usuário clicar "Salvar" no modal de um
 *   nó específico. Cada nível só pode ser salvo DEPOIS que o pai já tem
 *   `dbId` (reforçado tanto no desabilitar do botão `[+]` quanto dentro da
 *   própria função `salvarXxx`, que barra com `setErroSalvar(...)` se a FK
 *   do pai ainda não existe). O `dbId` retornado pela API vira a chave que
 *   liga a camada filha (ex.: só depois que `form_groups` tem `dbId` é que
 *   `form_rows` pode ser criado apontando para ele).
 *
 * COMO CRIAR UMA TELA SIMILAR (árvore pai→filho de N níveis + modal por nó):
 *   1. Modelar os tipos `*Local` (estado de UI) e as funções `*Inicial()` +
 *      `*Payload()` num arquivo `<nome>.model.ts` próprio, separado da página
 *      (ver `formBuilder.model.ts` como referência).
 *   2. Reaproveitar `<FormTree>`/`<TreeNode>` (genéricos) e `<FormModal>`
 *      (genérico) — não recriar árvore nem modal do zero.
 *   3. Um `useState` por nível (`Record<chaveDoPai, NivelLocal[]>`), nunca um
 *      array só; a chave é sempre o `id` (uuid) do pai, não o `dbId`.
 *   4. Uma função `<nivel>Schema(...)` por nível, devolvendo `FormGridSchema`,
 *      igual a `managerSchema`/`grupoSchema`/`rowSchema`/`campoSchema` abaixo.
 *   5. Um `ModalAlvo` (union discriminada por `kind`) guardando qual nó está
 *      aberto, e uma função `salvar<Nivel>` por nível, todas passando por um
 *      `executarSalvar` comum (liga/desliga `saving`, trata `ApiError`).
 */

import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import FormGrid from '@/components/ui/FormGrid/Input';
import type {
  AnyFieldSchema,
  FormGridSchema,
  FormRowSchema,
} from '@/components/ui/FormGrid/Input';
import IconSelect from '@/components/ui/IconSelect';
import { FormTree, TreeNode } from './FormBuilderTree';
import FormModal from './FormModal';
import {
  dbSchema,
  formCamposTable,
  formGroupsTable,
  formManagerTable,
  formManagerView,
  formRowsTable,
} from '@/services/v1';
import { normalizeItem, normalizeList } from '@/utils/apiResult';
import { ApiError } from '@/services/http';
import { useToast } from '@/hooks/useToast';
import { slugify } from '@/utils/slug';
import { parseStringList, toStringList } from '@/utils/jsonList';
import { paths } from '@/routes/paths';
import { env } from '@/config/env';
import {
  type CampoLocal,
  type ColunaInfo,
  type ColunasState,
  type GrupoLocal,
  type ManagerLocal,
  type ManagerStatus,
  type RowLocal,
  type TabelaInfo,
  MAX_COLUNAS_POR_LINHA,
  adicionarColunas,
  campoInicial,
  campoPayload,
  grupoInicial,
  grupoPayload,
  managerInicial,
  managerPayload,
  removerColuna,
  rowInicial,
  rowPayload,
  toColuna,
  toTabela,
  viewRowsToBuilderState,
} from './formBuilder.model';

/**
 * =============================================================================
 * BLOCO 1 — TIPOS DE APOIO (assinaturas de patch + alvo do modal)
 * =============================================================================
 *
 * O QUE FAZ:
 *   `*Patch` são as assinaturas das 4 funções `atualizarXxx` (definidas mais
 *   abaixo, dentro do componente) que cada `<Xxx>Schema` recebe para escrever
 *   de volta no estado — um "setter parcial" por nível, sempre identificando
 *   o nó pela cadeia de chaves do pai (`tabela`, depois `id`/`grupoId`, etc.).
 *   `ModalAlvo` é uma union discriminada por `kind`: descreve QUAL nó da
 *   árvore está com o formulário aberto no `<FormModal>` (só um de cada vez).
 *
 * POR QUE É IMPORTANTE:
 *   Os IDs encadeados (`tabela` → `grupoId` → `linhaId` → `coluna`)
 *   em `ModalAlvo` espelham exatamente a hierarquia de chaves dos `useState`
 *   do componente (`managers[tabela]`, `grupos[tabela]`, `linhas[grupoId]`,
 *   `campos[linhaId][coluna]`) — por isso `renderModal()` consegue reidratar
 *   o nó certo só com o `ModalAlvo` guardado.
 *
 * CONEXÃO: `*Patch` é o tipo dos parâmetros `patch` de `managerSchema`/
 *   `grupoSchema`/`rowSchema`/`campoSchema`, que por sua vez chamam
 *   `atualizarManager`/`atualizarGrupo`/`atualizarLinha`/`atualizarCampo`
 *   (ver "BLOCO — Handlers de CRUD local do estado", dentro do componente).
 *   `ModalAlvo` é o tipo do estado `modal` e do parâmetro de `setModal(...)`.
 *
 * COMO REAPROVEITAR: numa árvore nova de N níveis, criar 1 `*Patch` por nível
 *   (parâmetros = chaves de todos os ancestrais + `patch` parcial) e um
 *   `ModalAlvo` com 1 variante de `kind` por nível, cada uma carregando a
 *   cadeia completa de chaves até aquele nó.
 * -----------------------------------------------------------------------------
 */
type ManagerPatch = (tabela: string, patch: Partial<ManagerLocal>) => void;
type GrupoPatch = (tabela: string, id: string, patch: Partial<GrupoLocal>) => void;
type RowPatch = (grupoId: string, id: string, patch: Partial<RowLocal>) => void;
type CampoPatch = (
  linhaId: string,
  coluna: string,
  patch: Partial<CampoLocal>,
) => void;

// Nó cujo formulário está aberto no <FormModal> — um por vez.
type ModalAlvo =
  | { kind: 'manager'; tabela: string }
  | { kind: 'group'; tabela: string; grupoId: string }
  | { kind: 'row'; tabela: string; grupoId: string; linhaId: string }
  | { kind: 'field'; tabela: string; grupoId: string; linhaId: string; coluna: string };

/**
 * =============================================================================
 * BLOCO 2 — CONSTANTES DE MÓDULO (opções de select + config por field_type)
 * =============================================================================
 *
 * O QUE FAZ:
 *   `*_OPCOES` são listas fixas no formato `{ value, label }` (ou `{ name }`
 *   quando o `valueKey`/`labelKey` é `name`) consumidas pelo `options`/
 *   `valueKey`/`labelKey` dos campos `type: 'select'` dos schemas abaixo —
 *   nenhuma vem de API, são enums do próprio banco/protocolo HTTP/Bootstrap.
 *   `CAMPOS_POR_TIPO` é o mapa que decide, por `field_type` escolhido no
 *   subcard CAMPO, quais linhas extras aparecem na seção "Específico — {tipo}"
 *   (montada em `campoSchema`, mais abaixo).
 *
 * POR QUE É IMPORTANTE:
 *   `FIELD_TYPE_OPCOES` precisa bater exatamente com o enum `field_type` da
 *   coluna no banco (migration `2026-09-06-012303`) — divergência aqui não dá
 *   erro de TypeScript (é `string`), só falha silenciosa ao salvar. `CAMPOS_
 *   POR_TIPO` precisa bater com o que cada `<Tipo>FieldSchema` de
 *   `src/components/ui/FormGrid/<tipo>` realmente lê; um campo aqui que o
 *   componente de campo não lê fica visível no builder sem nenhum efeito.
 *
 * CONEXÃO: `CAMPOS_POR_TIPO[c.field_type]` é consumido só em `campoSchema()`
 *   (bloco "Específico — {tipo}"), que mapeia cada nome para uma prop via
 *   `colunaField()`. Tipos mascarados (`cpf`…`sei`) e `moeda` não aparecem
 *   como chave aqui de propósito — não têm opção de produto além dos blocos
 *   comuns (Estrutura / Estado e validação).
 *
 * COMO REAPROVEITAR: para dar suporte a um `field_type` novo com opções
 *   próprias, (1) acrescentar a chave em `CAMPOS_POR_TIPO` com a lista de
 *   nomes de config, (2) tratar cada nome novo em `colunaField()` (switch
 *   mais abaixo), (3) garantir que o componente `FormGrid/<tipo>` realmente
 *   lê essas props.
 * -----------------------------------------------------------------------------
 */
const STATUS_OPCOES = [
  { value: 'draft', label: 'draft' },
  { value: 'active', label: 'active' },
  { value: 'inactive', label: 'inactive' },
];

const HTTP_OPCOES = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => ({
  value: m,
  label: m,
}));

const GUTTER_OPCOES = ['g-0', 'g-1', 'g-2', 'g-3', 'g-4', 'g-5'].map((g) => ({
  value: g,
  label: g,
}));

// Enum `field_type` do banco — ordem exata da migration 2026-09-06-012303,
// + 'datahora' (2026-09-22, ALTER TABLE direto no banco DEV — ver
// src/app/markdown/geral/README_migrate.md, seção da pausa das migrations).
const FIELD_TYPE_OPCOES = [
  'text', 'password', 'email', 'textarea', 'senha', 'select', 'radio',
  'checkbox', 'cpf', 'cnpj', 'phone', 'cep', 'data', 'hora', 'moeda',
  'pis', 'placa', 'titulo', 'cnh', 'processo', 'renavam', 'sei', 'datahora',
].map((t) => ({ value: t, label: t }));

const COL_OPCOES = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

const INPUT_MODE_OPCOES = [
  '', 'text', 'numeric', 'decimal', 'tel', 'email', 'url', 'search', 'none',
].map((v) => ({ value: v, label: v || '(nenhum)' }));

// Config específica de cada field_type, além dos blocos comuns (Estrutura,
// Estado/validação) — só o que o `<Tipo>FieldSchema` de
// `src/components/ui/FormGrid/<tipo>` declara como opção de produto. Tipos
// mascarados (`cpf`…`sei`) e `moeda` não acrescentam nada.
const CAMPOS_POR_TIPO: Record<string, string[]> = {
  text: ['datalist_json', 'no_numbers', 'no_letters', 'no_special_chars'],
  password: ['no_numbers', 'no_letters', 'no_special_chars'],
  senha: [
    'no_numbers', 'no_letters', 'no_special_chars',
    'strong_password', 'double_field',
  ],
  email: ['allowed_domains_json'],
  textarea: [
    'rows_qty', 'show_counter', 'no_numbers', 'no_letters', 'no_special_chars',
  ],
  select: [
    'sel_multiple', 'options_json',
    'sel_src', 'sel_value_key', 'sel_label_key', 'sel_label_template',
    'sel_max_visible', 'sel_rows', 'sel_auth_token',
    'sel_find_src', 'sel_find_column', 'sel_get_src',
  ],
  radio: ['options_json', 'inline'],
  checkbox: ['options_json', 'inline'],
  data: ['min_date', 'max_date'],
  hora: ['with_seconds'],
  datahora: ['min_date', 'max_date'],
};

/**
 * URLs consumidas diretamente por campos `type: 'select'` via prop `src` —
 * o próprio `SelectField` (`components/ui/FormGrid/select`) faz o `fetch`,
 * então basta passar a URL pronta (não passa por `http.ts`/`resourceFactory`,
 * que exigem `version`+`group`). `USER_ROLES_SRC` alimenta o "Grupo de
 * perfil" de `managerSchema`; `ROUTE_MANAGER_SRC` alimenta "Rota React" e
 * "Endpoint de envio".
 */
const USER_ROLES_SRC = `${env.apiBaseUrl}/v1/user-roles/get-no-pagination`;
const ROUTE_MANAGER_SRC = `${env.apiBaseUrl}/v1/route-manager/get-no-pagination`;

/**
 * Sufixo exibido no `name` de cada `<TreeNode>` indicando se aquele nó já
 * está gravado no banco (`#123`) ou só existe em memória (`não salvo`) — é a
 * única pista visual, na árvore, de que o botão `[+]` do nível abaixo está
 * habilitado (todo `addDisabled` do JSX depende de `dbId` truthy).
 */
const sufixoDbId = (dbId: number | null | undefined): string =>
  dbId ? ` · #${dbId}` : ' · não salvo';

/**
 * =============================================================================
 * BLOCO 3 — SCHEMA DO SUBCARD FORMULÁRIO (form_manager)
 * =============================================================================
 *
 * O QUE FAZ: monta o `FormGridSchema` (linhas/campos) do formulário que abre
 *   no `<FormModal>` do nível `manager` — 1 registro `form_manager` por
 *   tabela escolhida. Não tem estado próprio: recebe o `ManagerLocal` atual
 *   (`m`) e devolve `onChange` que chamam `patch(tabela, {...})`.
 *
 * CONEXÃO: chamada só em `renderModal()` quando `modal.kind === 'manager'`.
 *   O `patch` recebido é sempre `atualizarManager` (ver "Handlers de CRUD
 *   local", dentro do componente). O botão "Slug" ilustra o padrão de campo
 *   dependente: enquanto `m.slugAuto` é `true`, digitar em "Título" também
 *   atualiza `slug` via `slugify()`; editar "Slug" na mão desliga `slugAuto`.
 *   "Grupo de perfil" é o único campo que grava lista (JSON de slugs) — usa
 *   `parseStringList`/`toStringList` (`@/utils/jsonList`) para ir e voltar
 *   entre `string[]` (UI) e a string JSON persistida em `m.roles`.
 *
 * COMO REAPROVEITAR EM OUTRO NÓ: copiar a assinatura
 *   `(chaveDoPai, EstadoLocal, PatchDoNível) => FormGridSchema` e, para cada
 *   campo, ler o valor de `m.<campo>` e escrever via `patch(...)` — nunca
 *   `useState` dentro da função de schema (o estado mora sempre no
 *   componente `FormBuilderPage`, a função de schema é pura).
 * -----------------------------------------------------------------------------
 */
function managerSchema(
  tabela: string,
  m: ManagerLocal,
  patch: ManagerPatch,
): FormGridSchema {
  return {
    rows: [
      {
        fields: [
          {
            col: 12,
            label: 'Título',
            name: 'title',
            required: true,
            maxLength: 255,
            placeholder: 'Cabeçalho exibido no topo do formulário',
            value: m.title,
            onChange: (e) =>
              patch(
                tabela,
                m.slugAuto
                  ? { title: e.target.value, slug: slugify(e.target.value) }
                  : { title: e.target.value },
              ),
          },
        ],
      },
      {
        fields: [
          {
            type: 'select',
            col: 12,
            label: 'Grupo de perfil',
            required: true,
            multiple: true,
            src: USER_ROLES_SRC,
            valueKey: 'slug',
            labelKey: 'name',
            values: parseStringList(m.roles),
            onChangeMultiple: (values) =>
              patch(tabela, { roles: toStringList(values) }),
          },
        ],
      },
      {
        fields: [
          {
            col: 6,
            label: 'Slug',
            name: 'slug',
            required: true,
            maxLength: 255,
            placeholder: 'identificador-do-formulario',
            value: m.slug,
            onChange: (e) => patch(tabela, { slug: e.target.value, slugAuto: false }),
          },
          {
            type: 'select',
            col: 6,
            label: 'Status',
            required: true,
            options: STATUS_OPCOES,
            valueKey: 'value',
            labelKey: 'label',
            value: m.status,
            onChange: (value) => patch(tabela, { status: value as ManagerStatus }),
          },
        ],
      },
      {
        fields: [
          {
            type: 'select',
            col: 12,
            label: 'Rota React',
            src: ROUTE_MANAGER_SRC,
            labelTemplate: '{method} - {object} - {action}',
            valueKey: 'endpoint',
            value: m.react_route,
            onChange: (value) => patch(tabela, { react_route: value }),
          },
        ],
      },
      {
        fields: [
          {
            type: 'select',
            col: 4,
            label: 'Endpoint de envio',
            src: ROUTE_MANAGER_SRC,
            labelTemplate: '{method} - {object} - {action}',
            valueKey: 'endpoint',
            value: m.submit_endpoint,
            onChange: (value) => patch(tabela, { submit_endpoint: value }),
          },
          {
            type: 'select',
            col: 4,
            label: 'Método HTTP',
            required: true,
            options: HTTP_OPCOES,
            valueKey: 'value',
            labelKey: 'label',
            value: m.http_method,
            onChange: (value) => patch(tabela, { http_method: value }),
          },
          {
            col: 4,
            label: 'Versão',
            name: 'version',
            required: true,
            inputMode: 'numeric',
            value: String(m.version),
            onChange: (e) =>
              patch(tabela, {
                version: Number.parseInt(e.target.value, 10) || 1,
              }),
          },
        ],
      },
      {
        fields: [
          {
            type: 'textarea',
            col: 12,
            label: 'Descrição',
            rows: 2,
            showCounter: true,
            value: m.description,
            onChange: (e) => patch(tabela, { description: e.target.value }),
          },
        ],
      },
    ],
  };
}

/**
 * =============================================================================
 * BLOCO 4 — SCHEMA DO SUBCARD GRUPOS (form_groups)
 * =============================================================================
 *
 * O QUE FAZ: monta o `FormGridSchema` do formulário de UM `form_groups` (N
 *   por tabela). Mesmo padrão de `managerSchema`: recebe o `GrupoLocal` (`g`)
 *   e um `patch` que já sabe identificar esse grupo (`tabela` + `g.id`).
 *
 * CONEXÃO: chamada em `renderModal()` quando `modal.kind === 'group'`. O
 *   `patch` é `atualizarGrupo`. O `<FormGrid>` gerado aqui NÃO inclui o campo
 *   "Ícone" — esse campo é renderizado à parte, logo depois do `<FormGrid>`,
 *   em `renderModal()`, usando `<IconSelect>` (não é um tipo do `FormGrid`,
 *   por isso fica fora do schema). O checkbox "Recolhido" também segue o
 *   padrão de flag-única: um único `options` com 1 item, valor `['1']`/`[]`.
 *
 * COMO REAPROVEITAR: mesmo modelo de `managerSchema`; se o nó novo precisar
 *   de um controle que não existe no `FormGrid` (como o `IconSelect` aqui),
 *   renderizá-lo fora do `<FormGrid>` no `renderModal()`, nunca forçar dentro
 *   do schema.
 * -----------------------------------------------------------------------------
 */
function grupoSchema(
  tabela: string,
  g: GrupoLocal,
  patch: GrupoPatch,
): FormGridSchema {
  return {
    rows: [
      {
        fields: [
          {
            col: 12,
            label: 'Título',
            name: 'title',
            required: true,
            maxLength: 255,
            placeholder: 'Nome do grupo',
            value: g.title,
            onChange: (e) =>
              patch(
                tabela,
                g.id,
                g.slugAuto
                  ? { title: e.target.value, slug: slugify(e.target.value) }
                  : { title: e.target.value },
              ),
          },
        ],
      },
      {
        fields: [
          {
            col: 6,
            label: 'Slug',
            name: 'slug',
            maxLength: 255,
            value: g.slug,
            onChange: (e) =>
              patch(tabela, g.id, { slug: e.target.value, slugAuto: false }),
          },
          {
            col: 6,
            label: 'Ordem',
            name: 'sort_order',
            inputMode: 'numeric',
            value: String(g.sort_order),
            onChange: (e) =>
              patch(tabela, g.id, {
                sort_order: Number.parseInt(e.target.value, 10) || 0,
              }),
          },
        ],
      },
      {
        fields: [
          {
            type: 'checkbox',
            col: 12,
            name: `collapsed-${g.id}`,
            inline: true,
            options: [{ id: `collapsed-${g.id}`, value: '1', label: 'Recolhido' }],
            value: g.collapsed ? ['1'] : [],
            onChange: (values) =>
              patch(tabela, g.id, { collapsed: values.includes('1') }),
          },
        ],
      },
      {
        fields: [
          {
            type: 'textarea',
            col: 12,
            label: 'Descrição',
            rows: 2,
            showCounter: true,
            value: g.description,
            onChange: (e) => patch(tabela, g.id, { description: e.target.value }),
          },
        ],
      },
    ],
  };
}

/**
 * =============================================================================
 * BLOCO 5 — SCHEMA DO SUBCARD LINHAS (form_rows)
 * =============================================================================
 *
 * O QUE FAZ: monta o `FormGridSchema` de UM `form_rows` (N por grupo), com um
 *   3º campo que os outros níveis não têm: o select múltiplo "Colunas", que
 *   não edita uma propriedade de `RowLocal` diretamente — dispara
 *   `onAddColunas` (== `adicionarColunasLinha` do componente), que por sua
 *   vez cria um `CampoLocal` novo para cada coluna escolhida.
 *
 * PARÂMETROS EXTRAS (além de `grupoId`/`r`/`patch`, padrão dos outros níveis):
 *   - `todasColunas`: nomes de TODAS as colunas da tabela (metadata do banco).
 *   - `colunasUsadas`: nomes já escolhidos por QUALQUER linha do grupo — viram
 *     `disabledValues` no select (aparecem cinza, não removíveis por aqui).
 *   - `onAddColunas`: callback disparado a cada nova seleção múltipla.
 *
 * CONEXÃO: chamada em `renderModal()` quando `modal.kind === 'row'`. O select
 *   de colunas fica `disabled` enquanto `!r.dbId` — reforça a regra "salvar o
 *   pai antes do filho" também na UI, não só no `salvarCampo`. `values: []`
 *   fixo é proposital: cada seleção só ADICIONA (nunca reflete o que já foi
 *   escolhido), pois as colunas já usadas saem da lista de opções
 *   selecionáveis (viram `disabled`), não desaparecem.
 *
 * COMO REAPROVEITAR: para um nível cujo formulário precisa dar origem a
 *   registros de outro nível (aqui: escolher coluna → nasce `form_fields`),
 *   passar callbacks extras como estes em vez de tentar encaixar a criação
 *   dentro de um `onChange` de campo comum.
 * -----------------------------------------------------------------------------
 */
function rowSchema(
  grupoId: string,
  r: RowLocal,
  patch: RowPatch,
  todasColunas: string[],
  colunasUsadas: string[],
  onAddColunas: (escolhidas: string[]) => void,
): FormGridSchema {
  return {
    rows: [
      {
        fields: [
          {
            col: 6,
            label: 'Ordem',
            name: 'sort_order',
            inputMode: 'numeric',
            value: String(r.sort_order),
            onChange: (e) =>
              patch(grupoId, r.id, {
                sort_order: Number.parseInt(e.target.value, 10) || 0,
              }),
          },
          {
            type: 'select',
            col: 6,
            label: 'Gutter (espaço)',
            options: GUTTER_OPCOES,
            valueKey: 'value',
            labelKey: 'label',
            value: r.gutter,
            onChange: (value) => patch(grupoId, r.id, { gutter: value }),
          },
        ],
      },
      {
        fields: [
          {
            col: 12,
            label: 'Nota',
            name: 'note',
            maxLength: 255,
            placeholder: 'Nota interna',
            value: r.note,
            onChange: (e) => patch(grupoId, r.id, { note: e.target.value }),
          },
        ],
      },
      {
        fields: [
          {
            type: 'select',
            col: 12,
            label: `Colunas (${r.columns.length}/${MAX_COLUNAS_POR_LINHA})`,
            multiple: true,
            rows: 10,
            placeholder: 'Filtrar colunas...',
            // Só depois que a linha existe no banco (form_row_id) faz sentido
            // escolher colunas — cada uma vira um form_fields vinculado a ela.
            disabled: !r.dbId,
            valueKey: 'name',
            labelKey: 'name',
            // Listbox alto com a lista completa das colunas; as já usadas por
            // qualquer linha entram como <option disabled> (cinza, permanecem na
            // lista). A seleção não "gruda" (values fixo em []) — cada escolha só
            // acrescenta a coluna e dispara o subcard CAMPO correspondente.
            options: todasColunas.map((name) => ({ name })),
            disabledValues: colunasUsadas,
            values: [],
            onChangeMultiple: (values) => onAddColunas(values),
          },
        ],
      },
    ],
  };
}

/**
 * =============================================================================
 * BLOCO 6 — SCHEMA DO SUBCARD CAMPO (form_fields) — 1 por coluna selecionada
 * =============================================================================
 *
 * O QUE FAZ: dois níveis de função — `colunaField()` monta UM campo do bloco
 *   dinâmico "Específico — {tipo}" (chamado 1x por nome em `CAMPOS_POR_TIPO`);
 *   `campoSchema()` (mais abaixo) monta o `FormGridSchema` inteiro do
 *   `form_fields`: seção fixa "Estrutura", seção fixa "Estado e validação" e,
 *   só se `CAMPOS_POR_TIPO[c.field_type]` não for vazio, a seção dinâmica
 *   "Específico — {tipo}" formada pelos `colunaField()`.
 *
 * POR QUE É IMPORTANTE: `form_row_id` (a FK do pai) é implícito — nunca
 *   aparece em nenhum schema aqui, só é resolvido na hora de salvar
 *   (`salvarCampo`, dentro do componente) e serializado por `campoPayload()`
 *   (`formBuilder.model.ts`). Só entra na UI o que faz sentido alguém
 *   preencher ao criar um field; atributos DOM soltos (`title`, `className`,
 *   `tabIndex`, `dir`, `lang`, `spellCheck`, `autoFocus`, `list`) e
 *   `style_json` ficam fora de propósito — o renderer final e o submit
 *   assumem o default/null deles.
 *
 * CONEXÃO: `colunaField()` é chamada só de dentro de `campoSchema()` (loop
 *   sobre `CAMPOS_POR_TIPO[c.field_type]`). A config do `select` (prefixo
 *   `sel_*` em `CampoLocal`) é serializada para `select_config_json` só na
 *   hora de montar o payload, por `camposParaPayload()` (`formBuilder.model.ts`)
 *   — aqui na UI cada `sel_*` continua sendo um campo de texto/checkbox comum.
 *
 * DETALHE DOS 3 HELPERS INTERNOS DE `colunaField()`:
 *   - `flag(campo, label)` — monta um checkbox de UM item só (padrão "flag
 *     única": `value` é `['1']`/`[]`, nunca lista de verdade) para os `boolean`
 *     de `CampoLocal` (ex.: `no_numbers`, `strong_password`).
 *   - `json(campo, label, disabled?)` — textarea cru para as colunas
 *     `*_json` (`options_json`, `datalist_json`, `allowed_domains_json`);
 *     usado também para `sel_src` (indiretamente via `txt`, ver abaixo).
 *   - `txt(campo, label, col?, numeric?, disabled?)` — input de texto genérico
 *     para as colunas `sel_*` de configuração do `select`; `numeric: true`
 *     filtra dígitos no próprio `onChange` (`replace(/\D/g, '')`).
 *   `temOptions`/`temSrc` implementam a exclusividade "lista fixa (options_json)
 *   OU fonte remota (sel_src)" do tipo `select`: preencher um desabilita
 *   (visualmente, `disabled: true`) os campos que só servem ao outro modo —
 *   sem apagar o valor, então trocar de ideia não perde o que foi digitado.
 *
 * COMO REAPROVEITAR: para um `field_type` novo com config própria, acrescentar
 *   a chave em `CAMPOS_POR_TIPO` (bloco de constantes) e um novo `case` no
 *   `switch` de `colunaField()` — usando `flag`/`json`/`txt` quando servirem,
 *   ou um literal `AnyFieldSchema` inline (ver `rows_qty`/`min_date`/`max_date`)
 *   quando o tipo de campo do FormGrid for diferente dos 3 padrões.
 * -----------------------------------------------------------------------------
 */

type CampoSet = (patch: Partial<CampoLocal>) => void;

/** Um campo do bloco "Específico — {tipo}". */
function colunaField(
  nome: string,
  c: CampoLocal,
  set: CampoSet,
  keyBase: string,
): AnyFieldSchema | null {
  const flag = (
    campo:
      | 'no_numbers' | 'no_letters' | 'no_special_chars' | 'strong_password'
      | 'double_field' | 'with_seconds' | 'show_counter'
      | 'inline' | 'sel_multiple',
    label: string,
  ): AnyFieldSchema => ({
    type: 'checkbox',
    col: 6,
    name: `${campo}-${keyBase}`,
    inline: true,
    options: [{ id: `${campo}-${keyBase}`, value: '1', label }],
    value: c[campo] ? ['1'] : [],
    onChange: (values) => {
      const patch: Partial<CampoLocal> = {};
      patch[campo] = values.includes('1');
      set(patch);
    },
  });

  // select: options_json (lista estática) e src (GET dinâmico) são mutuamente
  // exclusivos — buildField() dá prioridade ao src. Preenchido um, o outro (e
  // as chaves que só servem ao src) fica visível porém desabilitado.
  const temOptions = c.options_json.trim() !== '';
  const temSrc = c.sel_src.trim() !== '';

  const json = (
    campo: 'options_json' | 'datalist_json' | 'allowed_domains_json',
    label: string,
    disabled = false,
  ): AnyFieldSchema => ({
    type: 'textarea',
    col: 12,
    label,
    rows: 2,
    ...(disabled ? { disabled: true } : {}),
    value: c[campo],
    onChange: (e) => {
      const patch: Partial<CampoLocal> = {};
      patch[campo] = e.target.value;
      set(patch);
    },
  });

  const txt = (
    campo:
      | 'sel_src' | 'sel_value_key' | 'sel_label_key' | 'sel_label_template'
      | 'sel_max_visible' | 'sel_rows' | 'sel_auth_token' | 'sel_find_src'
      | 'sel_find_column' | 'sel_get_src',
    label: string,
    col: 3 | 4 | 6 | 12 = 4,
    numeric = false,
    disabled = false,
  ): AnyFieldSchema => ({
    type: 'text',
    col,
    label,
    name: `${campo}-${keyBase}`,
    ...(numeric ? { inputMode: 'numeric' as const } : {}),
    ...(disabled ? { disabled: true } : {}),
    value: c[campo],
    onChange: (e) => {
      const patch: Partial<CampoLocal> = {};
      patch[campo] = numeric ? e.target.value.replace(/\D/g, '') : e.target.value;
      set(patch);
    },
  });

  switch (nome) {
    case 'datalist_json':
      return json('datalist_json', 'datalist_json — ["opção 1", "opção 2"]');
    case 'options_json':
      return json('options_json', 'options_json — [{ id, value, label, checked }]', temSrc);
    case 'allowed_domains_json':
      return json('allowed_domains_json', 'allowed_domains_json — ["gov.br", "com.br"]');
    case 'no_numbers':
      return flag('no_numbers', 'Sem números');
    case 'no_letters':
      return flag('no_letters', 'Sem letras');
    case 'no_special_chars':
      return flag('no_special_chars', 'Sem caracteres especiais');
    case 'strong_password':
      return flag('strong_password', 'Senha forte');
    case 'double_field':
      return flag('double_field', 'Campo de confirmação (exige igualdade)');
    case 'with_seconds':
      return flag('with_seconds', 'Com segundos');
    case 'show_counter':
      return flag('show_counter', 'Mostrar contador');
    case 'inline':
      return flag('inline', 'Inline');
    case 'sel_multiple':
      return flag('sel_multiple', 'Múltipla seleção');
    case 'rows_qty':
      return {
        type: 'text',
        col: 4,
        label: 'Linhas (rows_qty)',
        name: `rows_qty-${keyBase}`,
        inputMode: 'numeric',
        value: c.rows_qty,
        onChange: (e) => set({ rows_qty: e.target.value.replace(/\D/g, '') }),
      };
    case 'min_date':
      return {
        type: 'data',
        col: 6,
        label: 'Data mínima (min_date)',
        value: c.min_date,
        onChange: (e) => set({ min_date: e.target.value }),
      };
    case 'max_date':
      return {
        type: 'data',
        col: 6,
        label: 'Data máxima (max_date)',
        value: c.max_date,
        onChange: (e) => set({ max_date: e.target.value }),
      };
    case 'sel_src':
      return txt('sel_src', 'src (GET das opções)', 12, false, temOptions);
    case 'sel_value_key':
      return txt('sel_value_key', 'valueKey', 4, false, temOptions);
    case 'sel_label_key':
      return txt('sel_label_key', 'labelKey', 4, false, temOptions);
    case 'sel_label_template':
      return txt('sel_label_template', 'labelTemplate', 4, false, temOptions);
    case 'sel_max_visible':
      return txt('sel_max_visible', 'maxVisible', 3, true);
    case 'sel_rows':
      return txt('sel_rows', 'rows (dropdown)', 3, true);
    case 'sel_auth_token':
      return txt('sel_auth_token', 'authToken (Bearer)', 6);
    case 'sel_find_src':
      return txt('sel_find_src', 'findSrc (POST de busca)', 6);
    case 'sel_find_column':
      return txt('sel_find_column', 'findColumn', 6);
    case 'sel_get_src':
      return txt('sel_get_src', 'getSrc (GET por id)', 6);
    default:
      return null;
  }
}

// Monta o FormGridSchema completo do form_fields — ver Bloco 6 acima para o
// panorama; comentários pontuais abaixo só onde o agrupamento por seção não
// é óbvio pelo `sectionTitle`.
function campoSchema(keyBase: string, c: CampoLocal, set: CampoSet): FormGridSchema {
  const rows: FormRowSchema[] = [
    {
      sectionTitle: 'Estrutura',
      fields: [
        {
          type: 'select',
          col: 4,
          label: 'Tipo (field_type)',
          options: FIELD_TYPE_OPCOES,
          valueKey: 'value',
          labelKey: 'label',
          value: c.field_type,
          onChange: (value) => set({ field_type: value }),
        },
        {
          type: 'select',
          col: 4,
          label: 'Largura (col 1–12)',
          options: COL_OPCOES,
          valueKey: 'value',
          labelKey: 'label',
          value: String(c.col),
          onChange: (value) => set({ col: Number.parseInt(value, 10) || 12 }),
        },
        {
          col: 4,
          label: 'Ordem (sort_order)',
          name: `sort_order-${keyBase}`,
          inputMode: 'numeric',
          value: String(c.sort_order),
          onChange: (e) =>
            set({ sort_order: Number.parseInt(e.target.value, 10) || 0 }),
        },
      ],
    },
    {
      fields: [
        {
          col: 12,
          label: 'Label',
          name: `label-${keyBase}`,
          maxLength: 255,
          value: c.label,
          onChange: (e) => set({ label: e.target.value }),
        },
      ],
    },
    {
      fields: [
        {
          col: 6,
          label: 'Name (field_name)',
          name: `field_name-${keyBase}`,
          maxLength: 255,
          value: c.field_name,
          onChange: (e) => set({ field_name: e.target.value }),
        },
        {
          col: 6,
          label: 'Key (field_key → id)',
          name: `field_key-${keyBase}`,
          maxLength: 255,
          value: c.field_key,
          onChange: (e) => set({ field_key: e.target.value }),
        },
      ],
    },
    {
      fields: [
        {
          col: 6,
          label: 'Placeholder',
          name: `placeholder-${keyBase}`,
          maxLength: 255,
          value: c.placeholder,
          onChange: (e) => set({ placeholder: e.target.value }),
        },
        {
          col: 6,
          label: 'Valor padrão (default_value)',
          name: `default_value-${keyBase}`,
          maxLength: 255,
          value: c.default_value,
          onChange: (e) => set({ default_value: e.target.value }),
        },
      ],
    },
    {
      fields: [
        {
          type: 'textarea',
          col: 12,
          label: 'Texto de ajuda (help_text)',
          rows: 2,
          showCounter: true,
          value: c.help_text,
          onChange: (e) => set({ help_text: e.target.value }),
        },
      ],
    },
    {
      sectionTitle: 'Estado e validação',
      fields: [
        {
          type: 'checkbox',
          col: 12,
          name: `estado-${keyBase}`,
          inline: true,
          options: [
            { id: `required-${keyBase}`, value: 'required', label: 'Obrigatório' },
            { id: `disabled-${keyBase}`, value: 'disabled', label: 'Desabilitado' },
            { id: `read_only-${keyBase}`, value: 'read_only', label: 'Somente leitura' },
            { id: `is_hidden-${keyBase}`, value: 'is_hidden', label: 'Oculto' },
          ],
          value: [
            c.required ? 'required' : '',
            c.disabled ? 'disabled' : '',
            c.read_only ? 'read_only' : '',
            c.is_hidden ? 'is_hidden' : '',
          ].filter(Boolean),
          onChange: (values) =>
            set({
              required: values.includes('required'),
              disabled: values.includes('disabled'),
              read_only: values.includes('read_only'),
              is_hidden: values.includes('is_hidden'),
            }),
        },
      ],
    },
    {
      fields: [
        {
          col: 3,
          label: 'Mín. caracteres',
          name: `min_length-${keyBase}`,
          inputMode: 'numeric',
          value: c.min_length,
          onChange: (e) => set({ min_length: e.target.value.replace(/\D/g, '') }),
        },
        {
          col: 3,
          label: 'Máx. caracteres',
          name: `max_length-${keyBase}`,
          inputMode: 'numeric',
          value: c.max_length,
          onChange: (e) => set({ max_length: e.target.value.replace(/\D/g, '') }),
        },
        {
          col: 6,
          label: 'Pattern (regex)',
          name: `pattern-${keyBase}`,
          maxLength: 255,
          value: c.pattern,
          onChange: (e) => set({ pattern: e.target.value }),
        },
      ],
    },
    {
      fields: [
        {
          type: 'select',
          col: 6,
          label: 'Input Mode (Tec. Virtual)',
          options: INPUT_MODE_OPCOES,
          valueKey: 'value',
          labelKey: 'label',
          value: c.input_mode,
          onChange: (value) => set({ input_mode: value }),
        },
        {
          col: 6,
          label: 'Autocomplete',
          name: `autocomplete-${keyBase}`,
          maxLength: 64,
          value: c.autocomplete,
          onChange: (e) => set({ autocomplete: e.target.value }),
        },
      ],
    },
  ];

  const especificas = (CAMPOS_POR_TIPO[c.field_type] ?? [])
    .map((nome) => colunaField(nome, c, set, keyBase))
    .filter((f): f is AnyFieldSchema => f !== null);
  if (especificas.length > 0) {
    rows.push({ sectionTitle: `Específico — ${c.field_type}`, fields: especificas });
  }

  return { rows };
}

// ─── Página ────────────────────────────────────────────────────────────────

/**
 * =============================================================================
 * BLOCO 7 — ESTADO DO COMPONENTE
 * =============================================================================
 *
 * O QUE FAZ: declara TODO o estado local da página, em 4 grupos:
 *   1. Modo edição (`edicaoLoading`/`edicaoErro`) — só usados quando a rota
 *      tem `:id`.
 *   2. Tabelas disponíveis para escolher (`tabelasDisponiveis`/`tabelasLoading`/
 *      `tabelasErro`) — vem da 1ª chamada de API (`dbSchema.tables()`).
 *   3. A árvore em si: `tabelas` (quais foram escolhidas) e, para cada nível,
 *      um `Record` cuja CHAVE é sempre o `id`/nome do NÓ-PAI (nunca um array
 *      solto): `managers` por `tabela`, `colunas` (cache da 2ª API) por
 *      `tabela`, `grupos` por `tabela`, `linhas` por `grupo.id`, `campos` por
 *      `linha.id` e depois por nome da coluna.
 *   4. Persistência do nó aberto no modal (`salvando`/`erroSalvar`) — comum a
 *      todos os níveis, porque só um nó pode estar salvando por vez.
 *
 * POR QUE É IMPORTANTE: o padrão "`Record<chaveDoPai, NívelLocal[]>`" (em vez
 *   de um array plano) é o que permite achar/atualizar um nó sem varrer a
 *   árvore inteira — todo `atualizarXxx`/`removerXxx` (bloco seguinte) parte
 *   de `prev[chaveDoPai]` e faz um `.map()`/`.filter()` só naquele nível.
 *
 * CONEXÃO: este estado é lido por `renderModal()` (para reidratar o nó aberto
 *   a partir do `ModalAlvo`) e pelo JSX final (para desenhar a árvore com
 *   `<FormTree>`/`<TreeNode>`).
 * -----------------------------------------------------------------------------
 */
export default function FormBuilderPage() {
  // Modo edição: /v1/form-constructor/update/:id. Sem :id -> modo criação (padrão).
  const { id: routeId } = useParams();
  const recordId = routeId && /^\d+$/.test(routeId) ? Number(routeId) : null;
  const modoEdicao = recordId !== null;

  const [edicaoLoading, setEdicaoLoading] = useState(modoEdicao);
  const [edicaoErro, setEdicaoErro] = useState<string | null>(null);

  const [tabelasDisponiveis, setTabelasDisponiveis] = useState<TabelaInfo[]>([]);
  const [tabelasLoading, setTabelasLoading] = useState(true);
  const [tabelasErro, setTabelasErro] = useState<string | null>(null);

  const [tabelas, setTabelas] = useState<string[]>([]);
  const [managers, setManagers] = useState<Record<string, ManagerLocal>>({});
  // Cache das colunas por tabela (2a API) — renderizado no select "Colunas" de cada linha.
  const [colunas, setColunas] = useState<Record<string, ColunasState>>({});
  const [grupos, setGrupos] = useState<Record<string, GrupoLocal[]>>({});
  // Linhas (form_rows) por grupo — chave = grupo.id (uuid).
  const [linhas, setLinhas] = useState<Record<string, RowLocal[]>>({});
  // Campos (form_fields) por linha e coluna — chave = linha.id -> coluna.name.
  const [campos, setCampos] = useState<
    Record<string, Record<string, CampoLocal>>
  >({});

  const toast = useToast();
  // Persistência do nó aberto no modal (um por vez).
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);

  /**
   * ===========================================================================
   * BLOCO 8 — CARREGAMENTO DE DADOS (2 APIs de introspecção + hidratação da edição)
   * ===========================================================================
   *
   * O QUE FAZ: três fontes de dados independentes, cada uma com seu próprio
   *   `loading`/`erro`:
   *   1. `useEffect` (tabelas) — roda 1x ao montar, chama `dbSchema.tables()`
   *      e popula `tabelasDisponiveis` (o select do card de topo).
   *   2. `carregarColunas(tabela)` — chamada sob demanda (quando uma tabela é
   *      escolhida ou, em edição, para a tabela do registro), com cache: se
   *      `colunas[tabela]` já existe, não busca de novo.
   *   3. `useEffect` (modo edição) — só roda quando há `recordId` na rota;
   *      busca a `view_form_manager` agrupada por `fm_id` e usa
   *      `viewRowsToBuilderState()` (`formBuilder.model.ts`) para reconstruir
   *      TODO o estado da árvore (`tabelas`/`managers`/`grupos`/`linhas`/
   *      `campos`) a partir das linhas achatadas da view.
   *
   * POR QUE É IMPORTANTE: os 3 `useEffect`/callbacks usam `AbortController`
   *   e checam `ctrl.signal.aborted` no `.catch()` — se o componente
   *   desmontar (ou a rota mudar) no meio da requisição, o erro do fetch
   *   abortado é silenciosamente ignorado, evitando `setState` em componente
   *   desmontado. O Salvar de cada nó (Bloco 10) reaproveita o MESMO estado
   *   que a edição hidrata aqui — não existe um "modo edição" separado na
   *   persistência: um nó com `dbId` (vindo da view) já faz `update` normal.
   *
   * CONEXÃO: `carregarColunas` é chamada por `handleTabelas` (ao escolher
   *   tabela no card de topo) e pelo `useEffect` de edição (para a tabela do
   *   registro). `viewRowsToBuilderState` é o inverso exato dos `*Payload()`
   *   usados ao salvar — mesmo arquivo (`formBuilder.model.ts`), documentado
   *   lá como "Hidratação: view_form_manager → estado do builder".
   * ---------------------------------------------------------------------------
   */
  // 1a API — todas as tabelas do banco, sem paginação.
  useEffect(() => {
    const ctrl = new AbortController();
    setTabelasLoading(true);
    setTabelasErro(null);
    void dbSchema
      .tables({ signal: ctrl.signal })
      .then((raw) => {
        const { rows } = normalizeList<Record<string, unknown>>(raw);
        setTabelasDisponiveis(rows.map(toTabela).filter((t) => t.name !== ''));
        setTabelasLoading(false);
      })
      .catch((err: unknown) => {
        if (ctrl.signal.aborted || (err instanceof Error && err.name === 'AbortError')) {
          return;
        }
        setTabelasErro(
          err instanceof ApiError ? err.message : 'Falha ao carregar as tabelas.',
        );
        setTabelasLoading(false);
      });
    return () => {
      ctrl.abort();
    };
  }, []);

  // 2a API — colunas de uma tabela; uma vez por tabela, com cache em estado.
  const carregarColunas = useCallback((tabela: string) => {
    let jaTem = false;
    setColunas((prev) => {
      if (prev[tabela]) {
        jaTem = true;
        return prev;
      }
      return { ...prev, [tabela]: { loading: true, error: null, items: [] } };
    });
    if (jaTem) return;

    void dbSchema
      .columns(tabela)
      .then((raw) => {
        const { rows } = normalizeList<Record<string, unknown>>(raw);
        setColunas((prev) => ({
          ...prev,
          [tabela]: {
            loading: false,
            error: null,
            items: rows.map(toColuna).filter((c) => c.name !== ''),
          },
        }));
      })
      .catch((err: unknown) => {
        setColunas((prev) => ({
          ...prev,
          [tabela]: {
            loading: false,
            error:
              err instanceof ApiError ? err.message : 'Falha ao carregar as colunas.',
            items: [],
          },
        }));
      });
  }, []);

  // Handler do select "Escolha as tabelas" (card de topo, onChangeMultiple):
  // registra as tabelas escolhidas, garante um ManagerLocal inicial para cada
  // uma que ainda não tem (sem sobrescrever as que já têm) e dispara a 2a API
  // (colunas) para todas — parte do Bloco 8, mas é acionado pelo usuário, não
  // por montagem do componente.
  const handleTabelas = useCallback(
    (values: string[]) => {
      setTabelas(values);
      setManagers((prev) => {
        const next = { ...prev };
        values.forEach((t) => {
          if (!next[t]) next[t] = managerInicial(t);
        });
        return next;
      });
      values.forEach((t) => carregarColunas(t));
    },
    [carregarColunas],
  );

  // Modo edição — hidrata todo o estado a partir da view_form_manager do registro.
  // O Salvar de cada nó já faz update quando existe dbId, então a árvore fica
  // editável sem tocar na lógica de persistência.
  useEffect(() => {
    if (recordId === null) return;
    const ctrl = new AbortController();
    setEdicaoLoading(true);
    setEdicaoErro(null);
    void formManagerView
      .getGrouped(
        { fm_id: [recordId] },
        { limit: 1000, sort: 'fc_sort_order', order: 'ASC' },
        { signal: ctrl.signal },
      )
      .then((raw) => {
        const { rows } = normalizeList<Record<string, unknown>>(raw);
        const st = viewRowsToBuilderState(rows);
        if (!st) {
          setEdicaoErro(`Formulário #${recordId} não encontrado.`);
          setEdicaoLoading(false);
          return;
        }
        setTabelas([st.tabela]);
        setManagers({ [st.tabela]: st.manager });
        setGrupos({ [st.tabela]: st.grupos });
        setLinhas(st.linhas);
        setCampos(st.campos);
        carregarColunas(st.tabela);
        setEdicaoLoading(false);
      })
      .catch((err: unknown) => {
        if (ctrl.signal.aborted || (err instanceof Error && err.name === 'AbortError')) {
          return;
        }
        setEdicaoErro(
          err instanceof ApiError ? err.message : 'Falha ao carregar o formulário.',
        );
        setEdicaoLoading(false);
      });
    return () => {
      ctrl.abort();
    };
  }, [recordId, carregarColunas]);

  /**
   * ===========================================================================
   * BLOCO 9 — HANDLERS DE CRUD LOCAL DO ESTADO (adicionar/atualizar/remover)
   * ===========================================================================
   *
   * O QUE FAZ: um trio (`adicionar`/`atualizar`/`remover`) por nível — exceto
   *   `manager`, que não é removível nem tem "adicionar" (nasce ao escolher a
   *   tabela, em `handleTabelas`) — mais os dois handlers específicos de
   *   coluna (`adicionarColunasLinha`/`removerColunaLinha`), que também mexem
   *   em `campos` além de `linhas`. TODOS seguem o mesmo formato de updater
   *   funcional do React: `setEstado((prev) => ...)`, nunca leem `prev` fora
   *   do callback (evita stale closure em atualizações rápidas).
   *
   * POR QUE É IMPORTANTE — remoção com persistência:
   *   `removerGrupo`/`removerLinha`/`removerColunaLinha` (a de `form_fields`)
   *   verificam se o nó já tem `dbId`: se não tem, só limpam o estado local
   *   (`limparLocal()`); se tem, chamam `deleteSoft(dbId)` no service daquele
   *   nível ANTES de limpar o estado, com toast de sucesso/erro. Isso evita
   *   registros órfãos no banco quando o usuário remove um nó que já foi
   *   salvo. Note que `removerLinha`/`removerGrupo` também limpam os
   *   `Record`s filhos (`linhas[id]`/`campos[id]`) — sem isso, dados do nó
   *   removido ficariam "vazando" em memória (não apareceriam na árvore, mas
   *   continuariam no estado).
   *
   * DETALHE — `adicionarColunasLinha`/`removerColunaLinha`:
   *   são os únicos handlers que mexem em DOIS `Record`s ao mesmo tempo
   *   (`linhas` e `campos`), porque uma "coluna escolhida" em `RowLocal.columns`
   *   só faz sentido acompanhada do `CampoLocal` correspondente em `campos`.
   *   `adicionarColunasLinha` usa `campoInicial(info, ...)` (`formBuilder.model.ts`)
   *   para pré-preencher o field a partir da metadata real da coluna do banco
   *   (ex.: `required` = `!coluna.nullable`, `field_type` inferido do
   *   `data_type`). Entradas de `campos` sem coluna correspondente em
   *   `r.columns` (excedente do teto `MAX_COLUNAS_POR_LINHA`) ficam ociosas —
   *   nunca renderizadas, nunca limpas automaticamente.
   *
   * CONEXÃO: são os `patch`/callbacks passados aos `<Xxx>Schema` (Blocos 3-6)
   *   e aos `onAdd`/`onRemove` de cada `<TreeNode>` no JSX final.
   * ---------------------------------------------------------------------------
   */
  const atualizarManager = useCallback<ManagerPatch>((tabela, patch) => {
    setManagers((prev) => ({
      ...prev,
      [tabela]: { ...(prev[tabela] ?? managerInicial(tabela)), ...patch },
    }));
  }, []);

  const adicionarGrupo = useCallback((tabela: string) => {
    setGrupos((prev) => ({
      ...prev,
      [tabela]: [...(prev[tabela] ?? []), grupoInicial()],
    }));
  }, []);

  const atualizarGrupo = useCallback<GrupoPatch>((tabela, id, patch) => {
    setGrupos((prev) => ({
      ...prev,
      [tabela]: (prev[tabela] ?? []).map((g) => (g.id === id ? { ...g, ...patch } : g)),
    }));
  }, []);

  const adicionarLinha = useCallback((grupoId: string) => {
    setLinhas((prev) => ({
      ...prev,
      [grupoId]: [...(prev[grupoId] ?? []), rowInicial()],
    }));
  }, []);

  const atualizarLinha = useCallback<RowPatch>((grupoId, id, patch) => {
    setLinhas((prev) => ({
      ...prev,
      [grupoId]: (prev[grupoId] ?? []).map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  }, []);

  // Acrescenta colunas à linha e cria o CampoLocal (seed pela metadata) de cada
  // coluna nova. Entradas em `campos` sem coluna correspondente em `r.columns`
  // (excedente do teto 12) ficam ociosas — nunca são renderizadas.
  const adicionarColunasLinha = useCallback(
    (
      grupoId: string,
      linhaId: string,
      colunasInfo: ColunaInfo[],
      escolhidas: string[],
    ) => {
      setLinhas((prev) => ({
        ...prev,
        [grupoId]: (prev[grupoId] ?? []).map((r) =>
          r.id === linhaId
            ? { ...r, columns: adicionarColunas(r.columns, escolhidas) }
            : r,
        ),
      }));
      setCampos((prev) => {
        const doLinha = { ...(prev[linhaId] ?? {}) };
        let mudou = false;
        escolhidas.forEach((nome) => {
          if (doLinha[nome]) return;
          const info = colunasInfo.find((c) => c.name === nome);
          if (!info) return;
          doLinha[nome] = campoInicial(info, Object.keys(doLinha).length);
          mudou = true;
        });
        return mudou ? { ...prev, [linhaId]: doLinha } : prev;
      });
    },
    [],
  );

  // Remove a coluna da linha e apaga o CampoLocal — a coluna volta a ficar
  // selecionável no listbox. Se o campo já estava persistido, faz soft delete
  // no banco antes de limpar o estado local.
  const removerColunaLinha = useCallback(
    (grupoId: string, linhaId: string, coluna: string) => {
      const campoAlvo = campos[linhaId]?.[coluna];
      const limparLocal = () => {
        setLinhas((prev) => ({
          ...prev,
          [grupoId]: (prev[grupoId] ?? []).map((r) =>
            r.id === linhaId
              ? { ...r, columns: removerColuna(r.columns, coluna) }
              : r,
          ),
        }));
        setCampos((prev) => {
          if (!prev[linhaId]?.[coluna]) return prev;
          const doLinha = { ...prev[linhaId] };
          delete doLinha[coluna];
          return { ...prev, [linhaId]: doLinha };
        });
      };
      if (!campoAlvo?.dbId) {
        limparLocal();
        return;
      }
      void formCamposTable
        .deleteSoft(campoAlvo.dbId)
        .then(() => {
          limparLocal();
          toast.success('form_fields removido.');
        })
        .catch((err: unknown) => {
          toast.error(
            err instanceof ApiError ? err.message : 'Falha ao remover no banco.',
          );
        });
    },
    [campos, toast],
  );

  const atualizarCampo = useCallback<CampoPatch>((linhaId, coluna, patch) => {
    setCampos((prev) => {
      const base = prev[linhaId]?.[coluna];
      if (!base) return prev;
      return {
        ...prev,
        [linhaId]: { ...(prev[linhaId] ?? {}), [coluna]: { ...base, ...patch } },
      };
    });
  }, []);

  const removerGrupo = useCallback(
    (tabela: string, id: string) => {
      const alvo = (grupos[tabela] ?? []).find((g) => g.id === id);
      const limparLocal = () => {
        setGrupos((prev) => ({
          ...prev,
          [tabela]: (prev[tabela] ?? []).filter((g) => g.id !== id),
        }));
        setLinhas((prev) => {
          if (!prev[id]) return prev;
          const next = { ...prev };
          delete next[id];
          return next;
        });
      };
      if (!alvo?.dbId) {
        limparLocal();
        return;
      }
      void formGroupsTable
        .deleteSoft(alvo.dbId)
        .then(() => {
          limparLocal();
          toast.success('form_groups removido.');
        })
        .catch((err: unknown) => {
          toast.error(
            err instanceof ApiError ? err.message : 'Falha ao remover no banco.',
          );
        });
    },
    [grupos, toast],
  );

  const removerLinha = useCallback(
    (grupoId: string, id: string) => {
      const alvo = (linhas[grupoId] ?? []).find((r) => r.id === id);
      const limparLocal = () => {
        setLinhas((prev) => ({
          ...prev,
          [grupoId]: (prev[grupoId] ?? []).filter((r) => r.id !== id),
        }));
        setCampos((prev) => {
          if (!prev[id]) return prev;
          const next = { ...prev };
          delete next[id];
          return next;
        });
      };
      if (!alvo?.dbId) {
        limparLocal();
        return;
      }
      void formRowsTable
        .deleteSoft(alvo.dbId)
        .then(() => {
          limparLocal();
          toast.success('form_rows removido.');
        })
        .catch((err: unknown) => {
          toast.error(
            err instanceof ApiError ? err.message : 'Falha ao remover no banco.',
          );
        });
    },
    [linhas, toast],
  );

  // Nó cujo formulário está aberto no modal (null = nenhum).
  const [modal, setModal] = useState<ModalAlvo | null>(null);

  // Troca de nó no modal zera o estado de persistência.
  useEffect(() => {
    setSalvando(false);
    setErroSalvar(null);
  }, [modal]);

  /**
   * ===========================================================================
   * BLOCO 10 — PERSISTÊNCIA POR NÓ (Salvar no modal)
   * ===========================================================================
   *
   * O QUE FAZ: `create` quando o nó ainda não tem `dbId`, `update` quando já
   *   tem — nunca um "modo edição" separado, o próprio `dbId` decide. O `id`
   *   retornado pela API vira a chave que liga a camada filha (ex.: o `dbId`
   *   de `form_manager` é a FK `form_manager_id` que `grupoPayload()` exige
   *   para criar um `form_groups`). Sucesso: `toast.success` + fecha o modal
   *   (`setModal(null)`, dentro de `executarSalvar`). Erro: mensagem da
   *   `ApiError` aparece dentro do próprio `<FormModal>` (prop `saveError`),
   *   sem fechar — o usuário corrige e tenta salvar de novo sem perder o que
   *   digitou.
   *
   * PEÇAS:
   *   - `extrairId(raw)` — normaliza a resposta de `create`/`update` (formatos
   *     variados de envelope, via `normalizeItem`) e garante que veio um `id`
   *     numérico válido; lança `ApiError` se não veio (vira o `erroSalvar`).
   *   - `executarSalvar(fn, okMsg)` — wrapper comum aos 4 `salvarXxx`: liga
   *     `salvando`, zera `erroSalvar`, roda `fn()`, e trata sucesso/erro de
   *     forma idêntica para os 4 níveis. Nenhum `salvarXxx` duplica esse
   *     try/catch.
   *   - `salvarManager`/`salvarGrupo`/`salvarLinha`/`salvarCampo` — cada um:
   *     (1) acha o registro local pelo id de UI, (2) confere se o `dbId` do
   *     PAI existe (senão `setErroSalvar('Salve o X antes do Y.')` e para —
   *     é o reforço, em código, da regra que a UI já impõe desabilitando o
   *     botão `[+]`), (3) chama `create`/`update` do service daquele nível
   *     com o payload montado pelo `*Payload()` correspondente
   *     (`formBuilder.model.ts`), (4) grava o `dbId` novo de volta no estado
   *     via `atualizarXxx`.
   *
   * CONEXÃO: cada `salvarXxx` é passado como `onSave` ao `<FormModal>` dentro
   *   de `renderModal()` (bloco seguinte), 1 por `modal.kind`.
   * ---------------------------------------------------------------------------
   */
  const extrairId = (raw: unknown): number => {
    const rec = normalizeItem<Record<string, unknown>>(raw);
    const id = Number(rec?.id);
    if (!Number.isFinite(id) || id < 1) {
      throw new ApiError('A API não devolveu o id do registro.');
    }
    return id;
  };

  const executarSalvar = useCallback(
    async (fn: () => Promise<void>, okMsg: string) => {
      setSalvando(true);
      setErroSalvar(null);
      try {
        await fn();
        toast.success(okMsg);
        setModal(null);
      } catch (err) {
        setErroSalvar(
          err instanceof ApiError ? err.message : 'Falha ao salvar. Tente de novo.',
        );
      } finally {
        setSalvando(false);
      }
    },
    [toast],
  );

  const salvarManager = (tabela: string) => {
    const m = managers[tabela];
    if (!m) return;
    void executarSalvar(async () => {
      const raw = m.dbId
        ? await formManagerTable.update(m.dbId, managerPayload(m))
        : await formManagerTable.create(managerPayload(m));
      atualizarManager(tabela, { dbId: extrairId(raw) });
    }, m.dbId ? 'form_manager atualizado.' : 'form_manager salvo.');
  };

  const salvarGrupo = (tabela: string, grupoId: string) => {
    const fmId = managers[tabela]?.dbId;
    const g = (grupos[tabela] ?? []).find((x) => x.id === grupoId);
    if (!g) return;
    if (!fmId) {
      setErroSalvar('Salve o form_manager antes do grupo.');
      return;
    }
    void executarSalvar(async () => {
      const raw = g.dbId
        ? await formGroupsTable.update(g.dbId, grupoPayload(g, fmId))
        : await formGroupsTable.create(grupoPayload(g, fmId));
      atualizarGrupo(tabela, grupoId, { dbId: extrairId(raw) });
    }, g.dbId ? 'form_groups atualizado.' : 'form_groups salvo.');
  };

  const salvarLinha = (tabela: string, grupoId: string, linhaId: string) => {
    const fgId = (grupos[tabela] ?? []).find((x) => x.id === grupoId)?.dbId;
    const r = (linhas[grupoId] ?? []).find((x) => x.id === linhaId);
    if (!r) return;
    if (!fgId) {
      setErroSalvar('Salve o grupo antes da linha.');
      return;
    }
    void executarSalvar(async () => {
      const raw = r.dbId
        ? await formRowsTable.update(r.dbId, rowPayload(r, fgId))
        : await formRowsTable.create(rowPayload(r, fgId));
      atualizarLinha(grupoId, linhaId, { dbId: extrairId(raw) });
    }, r.dbId ? 'form_rows atualizado.' : 'form_rows salvo.');
  };

  const salvarCampo = (grupoId: string, linhaId: string, coluna: string) => {
    const frId = (linhas[grupoId] ?? []).find((x) => x.id === linhaId)?.dbId;
    const c = campos[linhaId]?.[coluna];
    if (!c) return;
    if (!frId) {
      setErroSalvar('Salve a linha antes do campo.');
      return;
    }
    void executarSalvar(async () => {
      const raw = c.dbId
        ? await formCamposTable.update(c.dbId, campoPayload(c, frId))
        : await formCamposTable.create(campoPayload(c, frId));
      atualizarCampo(linhaId, coluna, { dbId: extrairId(raw) });
    }, c.dbId ? 'form_fields atualizado.' : 'form_fields salvo.');
  };

  // Schema do card de topo (fora da árvore): 1 select múltiplo, opções vindas
  // de `tabelasDisponiveis` (Bloco 8). `onChangeMultiple: handleTabelas` é o
  // único ponto de entrada da árvore — escolher uma tabela aqui é o que cria
  // o ManagerLocal inicial dela (ver handleTabelas, Bloco 9 acima).
  const schema: FormGridSchema = {
    rows: [
      {
        fields: [
          {
            type: 'select',
            col: 12,
            id: 'tabelas',
            name: 'tabelas',
            multiple: true,
            rows: 10,
            placeholder: 'Filtrar tabelas...',
            valueKey: 'name',
            labelKey: 'name',
            options: tabelasDisponiveis.map((t) => ({ name: t.name })),
            onChangeMultiple: handleTabelas,
          },
        ],
      },
    ],
  };

  const fecharModal = () => {
    setModal(null);
    setErroSalvar(null);
  };

  /**
   * ===========================================================================
   * BLOCO 11 — RENDERMODAL (formulário do nó aberto)
   * ===========================================================================
   *
   * O QUE FAZ: função de renderização (não é `useCallback`/memoizada — roda a
   *   cada render da página) que devolve o `<FormModal>` do nó atualmente em
   *   `modal`, ou `null` se nenhum estiver aberto. Um `if`/early-return por
   *   `modal.kind`, sempre no mesmo formato: (1) acha o registro local pelo(s)
   *   id(s) do `ModalAlvo`, devolvendo `null` se não achar (nó removido
   *   enquanto o modal estava com dados antigos), (2) monta o `<FormModal>`
   *   com `title`, `onSave` = `salvar<Nível>`, `saving`/`saveError` do estado
   *   comum (Bloco 10), (3) dentro, um `<FormGrid schema={<nível>Schema(...)}>`.
   *
   * PARTICULARIDADES POR NÍVEL:
   *   - `group`: além do `<FormGrid>`, renderiza `<IconSelect>` à parte (não
   *     é campo do FormGrid — ver Bloco 4).
   *   - `row`: calcula `todasColunas` (metadata cacheada em `colunas`) e
   *     `colunasUsadas` (achatando `linhas` de TODOS os grupos da tabela) só
   *     nesta hora, porque só fazem sentido enquanto o modal de linha está
   *     aberto; mostra aviso/loading/erro de colunas conforme `colunas[tabela]`.
   *   - `field` (`default`, sem `if` próprio): busca `campos[linhaId][coluna]`
   *     — é o único nível que não tem `modal.kind === 'field'` explícito no
   *     código porque é o último `if` teria sobrado só esse caso; o comentário
   *     `// modal.kind === 'field'` marca isso no código.
   *
   * CONEXÃO: chamada 1x no fim do JSX da página (`{renderModal()}`), fora do
   *   `.map()` de tabelas — por isso o modal aparece sempre por cima da árvore
   *   inteira, não preso a um card específico.
   * ---------------------------------------------------------------------------
   */
  // Formulário do nó aberto — sempre via <FormGrid>, dentro do <FormModal>.
  const renderModal = () => {
    if (!modal) return null;

    if (modal.kind === 'manager') {
      const m = managers[modal.tabela] ?? managerInicial(modal.tabela);
      const tabela = modal.tabela;
      return (
        <FormModal
          title={
            <>
              <code>form_manager</code> · {tabela}
            </>
          }
          onClose={fecharModal}
          onSave={() => salvarManager(tabela)}
          saving={salvando}
          saveError={erroSalvar}
        >
          <FormGrid schema={managerSchema(tabela, m, atualizarManager)} />
        </FormModal>
      );
    }

    if (modal.kind === 'group') {
      const g = (grupos[modal.tabela] ?? []).find((x) => x.id === modal.grupoId);
      if (!g) return null;
      const tabela = modal.tabela;
      return (
        <FormModal
          title={
            <>
              <code>form_groups</code> · {g.title || 'sem título'}
            </>
          }
          onClose={fecharModal}
          onSave={() => salvarGrupo(tabela, g.id)}
          saving={salvando}
          saveError={erroSalvar}
        >
          <FormGrid schema={grupoSchema(tabela, g, atualizarGrupo)} />
          <div className="row g-3">
            <div className="col-md-6 mb-1">
              <label className="form-label">Ícone</label>
              <IconSelect
                value={g.icon}
                onChange={(nome) => atualizarGrupo(modal.tabela, g.id, { icon: nome })}
              />
            </div>
          </div>
        </FormModal>
      );
    }

    if (modal.kind === 'row') {
      const r = (linhas[modal.grupoId] ?? []).find((x) => x.id === modal.linhaId);
      if (!r) return null;
      const todasColunas = (colunas[modal.tabela]?.items ?? []).map((c) => c.name);
      // Colunas já usadas por qualquer linha da tabela — entram como
      // <option disabled> no select "Colunas".
      const colunasUsadas = [
        ...new Set(
          (grupos[modal.tabela] ?? []).flatMap((g) =>
            (linhas[g.id] ?? []).flatMap((rr) => rr.columns),
          ),
        ),
      ];
      const tabela = modal.tabela;
      return (
        <FormModal
          title={
            <>
              <code>form_rows</code> · {r.note || `linha ${r.sort_order}`}
            </>
          }
          onClose={fecharModal}
          onSave={() => salvarLinha(tabela, modal.grupoId, r.id)}
          saving={salvando}
          saveError={erroSalvar}
        >
          {!r.dbId && (
            <p className="text-body-secondary small mb-2">
              Salve a linha (botão <span className="fw-semibold">Salvar</span>) para
              escolher as colunas — cada uma vira um <code>form_fields</code> ligado a
              ela.
            </p>
          )}
          {colunas[tabela]?.loading && (
            <p className="text-body-secondary small">Carregando colunas…</p>
          )}
          {colunas[tabela]?.error && (
            <div className="alert alert-danger py-2 small">
              {colunas[tabela]?.error}
            </div>
          )}
          <FormGrid
            schema={rowSchema(
              modal.grupoId,
              r,
              atualizarLinha,
              todasColunas,
              colunasUsadas,
              (escolhidas) =>
                adicionarColunasLinha(
                  modal.grupoId,
                  r.id,
                  colunas[modal.tabela]?.items ?? [],
                  escolhidas,
                ),
            )}
          />
        </FormModal>
      );
    }

    // modal.kind === 'field'
    const campo = campos[modal.linhaId]?.[modal.coluna];
    if (!campo) return null;
    const { grupoId, linhaId, coluna } = modal;
    return (
      <FormModal
        title={
          <>
            <code>form_fields</code> · {coluna}
          </>
        }
        onClose={fecharModal}
        onSave={() => salvarCampo(grupoId, linhaId, coluna)}
        saving={salvando}
        saveError={erroSalvar}
      >
        <FormGrid
          schema={campoSchema(
            `${linhaId}-${coluna}`,
            campo,
            (patch) => atualizarCampo(linhaId, coluna, patch),
          )}
        />
      </FormModal>
    );
  };

  /**
   * =============================================================================
   * BLOCO 12 — RENDERIZAÇÃO (JSX)
   * =============================================================================
   *
   * O QUE FAZ: três partes, nesta ordem:
   *   1. Card de topo: em modo edição mostra o cabeçalho "Editar formulário
   *      #id" (+ link "Voltar" e erro, se houver); em modo criação mostra o
   *      `<FormGrid schema={schema}>` (o select de tabelas) ou "Carregando
   *      tabelas…"/erro.
   *   2. `{tabelas.map(...)}`: 1 card por tabela escolhida, cada um com uma
   *      `<FormTree>` de 4 níveis aninhados (`<TreeNode level="manager">` →
   *      `"group"` → `"row"` → `"field"`). Cada `<TreeNode>` recebe `id`
   *      (namespaced por tipo: `manager:`/`group:`/`row:`/`field:`, sempre
   *      único na árvore inteira), `parents` (cadeia de ids ancestrais, usada
   *      pelo `<FormTree>` para expandir a cadeia quando um nó novo nasce),
   *      `name` (rótulo + sufixo `sufixoDbId`), `onAdd`/`onEdit`/`onRemove`
   *      ligados aos handlers dos Blocos 9-10, e `addDisabled={!dbIdDoPai}`
   *      (o gate visual da regra "salva pai antes do filho").
   *   3. `{renderModal()}`: o modal do nó em edição, sempre por último, fora
   *      do `.map()` de tabelas.
   *
   * POR QUE É IMPORTANTE: os textos "Sem grupos —.../Sem linhas —.../Sem
   *   campos —..." dentro de cada `<TreeNode>` (children condicionais,
   *   `length === 0 ? <p>...</p> : null`) são o único feedback de árvore
   *   vazia — não há um `EmptyState` genérico aqui, porque cada nível tem uma
   *   instrução diferente (qual botão usar para o próximo nível).
   *
   * COMO REAPROVEITAR: para uma árvore de N níveis diferente, manter a mesma
   *   forma (`<FormTree>` uma vez, `<TreeNode>` aninhado por `.map()`,
   *   `parents` sempre a cadeia completa de ids acima, modal único fora do
   *   loop) — é o padrão descrito em `README_form_builder.md` como
   *   "reutilizável" (`FormBuilderTree.tsx` + `FormModal.tsx` não conhecem
   *   nada de form_manager/form_groups).
   * -----------------------------------------------------------------------------
   */
  return (
    <div className="container py-3">
      {modoEdicao ? (
        <div className="card shadow-sm">
          <div className="card-body p-3 p-sm-4">
            <div className="d-flex justify-content-between align-items-start gap-2">
              <h1 className="h5 mb-1">
                Editar formulário <span className="text-body-secondary">#{recordId}</span>
              </h1>
              <Link className="btn btn-sm btn-outline-secondary" to={paths.v1.form.list}>
                Voltar
              </Link>
            </div>
            <p className="text-body-secondary small mb-0">
              {edicaoLoading
                ? 'Carregando definição…'
                : tabelas[0]
                  ? `Tabela: ${tabelas[0]}`
                  : '—'}
            </p>
            {edicaoErro && (
              <div className="alert alert-danger mt-3 mb-0 py-2 small">{edicaoErro}</div>
            )}
          </div>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-3 p-sm-4">
            {tabelasLoading ? (
              <p className="text-muted small mb-0">Carregando tabelas…</p>
            ) : (
              <FormGrid schema={schema} />
            )}
            {tabelasErro && (
              <div className="alert alert-danger mt-3 mb-0 py-2 small">{tabelasErro}</div>
            )}
          </div>
        </div>
      )}

      {tabelas.map((tabela) => {
        const gruposTabela = grupos[tabela] ?? [];
        const managerId = `manager:${tabela}`;
        return (
          <div className="card shadow-sm mt-3" key={tabela}>
            <div className="card-header">
              <span className="fw-semibold text-nowrap">{tabela}</span>
            </div>
            <div className="card-body">
              {/* Hierarquia form_manager → form_groups → form_rows → form_fields:
                  cada nível é uma linha colapsável; o formulário abre no modal. */}
              <FormTree>
                <TreeNode
                  id={managerId}
                  parents={[]}
                  level="manager"
                  name={`${tabela}${sufixoDbId(managers[tabela]?.dbId)}`}
                  count={gruposTabela.length}
                  addLabel="form_groups"
                  addDisabled={!managers[tabela]?.dbId}
                  onAdd={() => adicionarGrupo(tabela)}
                  onEdit={() => setModal({ kind: 'manager', tabela })}
                >
                  {gruposTabela.length === 0 ? (
                    <p className="text-body-secondary small fst-italic py-1 mb-0">
                      Sem grupos — use <span className="fw-semibold">+ form_groups</span>.
                    </p>
                  ) : null}

                  {gruposTabela.map((grupo) => {
                    const groupId = `group:${grupo.id}`;
                    const linhasGrupo = linhas[grupo.id] ?? [];
                    return (
                      <TreeNode
                        key={grupo.id}
                        id={groupId}
                        parents={[managerId]}
                        level="group"
                        name={`${grupo.title || 'sem título'}${sufixoDbId(grupo.dbId)}`}
                        count={linhasGrupo.length}
                        addLabel="form_rows"
                        addDisabled={!grupo.dbId}
                        onAdd={() => adicionarLinha(grupo.id)}
                        onEdit={() => setModal({ kind: 'group', tabela, grupoId: grupo.id })}
                        onRemove={() => removerGrupo(tabela, grupo.id)}
                      >
                        {linhasGrupo.length === 0 ? (
                          <p className="text-body-secondary small fst-italic py-1 mb-0">
                            Sem linhas — use{' '}
                            <span className="fw-semibold">+ form_rows</span>.
                          </p>
                        ) : null}

                        {linhasGrupo.map((linha) => {
                          const rowId = `row:${linha.id}`;
                          const alvoLinha: ModalAlvo = {
                            kind: 'row',
                            tabela,
                            grupoId: grupo.id,
                            linhaId: linha.id,
                          };
                          return (
                            <TreeNode
                              key={linha.id}
                              id={rowId}
                              parents={[managerId, groupId]}
                              level="row"
                              name={`${linha.note || `linha ${linha.sort_order}`}${sufixoDbId(
                                linha.dbId,
                              )}`}
                              count={linha.columns.length}
                              addLabel="form_fields"
                              addDisabled={!linha.dbId}
                              onAdd={() => setModal(alvoLinha)}
                              onEdit={() => setModal(alvoLinha)}
                              onRemove={() => removerLinha(grupo.id, linha.id)}
                            >
                              {linha.columns.length === 0 ? (
                                <p className="text-body-secondary small fst-italic py-1 mb-0">
                                  Sem campos — em{' '}
                                  <span className="fw-semibold">form_fields</span> selecione
                                  colunas.
                                </p>
                              ) : null}

                              {linha.columns.map((coluna) => (
                                <TreeNode
                                  key={coluna}
                                  id={`field:${linha.id}:${coluna}`}
                                  parents={[managerId, groupId, rowId]}
                                  level="field"
                                  name={`${coluna}${sufixoDbId(
                                    campos[linha.id]?.[coluna]?.dbId,
                                  )}`}
                                  onEdit={() =>
                                    setModal({
                                      kind: 'field',
                                      tabela,
                                      grupoId: grupo.id,
                                      linhaId: linha.id,
                                      coluna,
                                    })
                                  }
                                  onRemove={() =>
                                    removerColunaLinha(grupo.id, linha.id, coluna)
                                  }
                                />
                              ))}
                            </TreeNode>
                          );
                        })}
                      </TreeNode>
                    );
                  })}
                </TreeNode>
              </FormTree>
            </div>
          </div>
        );
      })}

      {renderModal()}
    </div>
  );
}
