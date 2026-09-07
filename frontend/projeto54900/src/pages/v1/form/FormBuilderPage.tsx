// Construtor — o usuário escolhe tabelas (todas vindas da API de introspecção do
// banco) e cada tabela vira um card com um subcard FORMULÁRIO (campos de
// form_manager) e N subcards GRUPOS (campos de form_groups). Estado só local:
// nada é persistido ainda.
//
// Campos: renderizados por <FormGrid> a partir de um FormGridSchema. Nenhum
// <input>/<select>/<textarea> escrito à mão aqui — ver
// src/markdown/geral/README_render_via_formgrid.md.
//
// Fonte dos dados — sem lista estática:
//   - tabelas : dbSchema.tables()        -> GET api/v1/db-schema/tables
//   - colunas : dbSchema.columns(tabela) -> GET api/v1/db-schema/columns/{tabela}
//   - perfis  : o próprio campo select "Grupo de perfil" carrega via `src`
//               -> GET {apiBaseUrl}/v1/user-roles/get-no-pagination

import { useCallback, useEffect, useState } from 'react';
import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import IconSelect from '@/components/ui/IconSelect';
import { dbSchema } from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
import { ApiError } from '@/services/http';
import { slugify } from '@/utils/slug';
import { parseStringList, toStringList } from '@/utils/jsonList';
import { env } from '@/config/env';
import {
  type ColunasState,
  type GrupoLocal,
  type ManagerLocal,
  type ManagerStatus,
  type RowLocal,
  type TabelaInfo,
  grupoInicial,
  managerInicial,
  rowInicial,
  toColuna,
  toTabela,
} from './formBuilder.model';

type ManagerPatch = (tabela: string, patch: Partial<ManagerLocal>) => void;
type GrupoPatch = (tabela: string, id: string, patch: Partial<GrupoLocal>) => void;
type RowPatch = (grupoId: string, id: string, patch: Partial<RowLocal>) => void;

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

const USER_ROLES_SRC = `${env.apiBaseUrl}/v1/user-roles/get-no-pagination`;

// ─── Schema do subcard FORMULÁRIO (form_manager) ────────────────────────────

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
            values: parseStringList(m.profile_group),
            onChangeMultiple: (values) =>
              patch(tabela, { profile_group: toStringList(values) }),
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
            col: 12,
            label: 'Rota React',
            name: 'react_route',
            required: true,
            maxLength: 255,
            placeholder: '/v1/meu-form',
            value: m.react_route,
            onChange: (e) => patch(tabela, { react_route: e.target.value }),
          },
        ],
      },
      {
        fields: [
          {
            col: 4,
            label: 'Endpoint de envio',
            name: 'submit_endpoint',
            required: true,
            maxLength: 255,
            placeholder: '/api/v1/...',
            value: m.submit_endpoint,
            onChange: (e) => patch(tabela, { submit_endpoint: e.target.value }),
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

// ─── Schema do subcard GRUPOS (form_groups) — o ícone fica fora (IconSelect) ──

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

// ─── Schema do subcard LINHAS (form_rows) ───────────────────────────────────

function rowSchema(grupoId: string, r: RowLocal, patch: RowPatch): FormGridSchema {
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
    ],
  };
}

// ─── Página ────────────────────────────────────────────────────────────────

export default function FormBuilderPage() {
  const [tabelasDisponiveis, setTabelasDisponiveis] = useState<TabelaInfo[]>([]);
  const [tabelasLoading, setTabelasLoading] = useState(true);
  const [tabelasErro, setTabelasErro] = useState<string | null>(null);

  const [tabelas, setTabelas] = useState<string[]>([]);
  const [managers, setManagers] = useState<Record<string, ManagerLocal>>({});
  // Cache das colunas por tabela (2a API). Ainda não renderizado — reservado.
  const [, setColunas] = useState<Record<string, ColunasState>>({});
  const [grupos, setGrupos] = useState<Record<string, GrupoLocal[]>>({});
  // Linhas (form_rows) por grupo — chave = grupo.id (uuid).
  const [linhas, setLinhas] = useState<Record<string, RowLocal[]>>({});

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

  const handleTabelas = useCallback(
    (values: string[]) => {
      setTabelas(values);
      setManagers((prev) => {
        const next = { ...prev };
        values.forEach((t) => {
          if (!next[t]) next[t] = managerInicial();
        });
        return next;
      });
      values.forEach((t) => carregarColunas(t));
    },
    [carregarColunas],
  );

  const atualizarManager = useCallback<ManagerPatch>((tabela, patch) => {
    setManagers((prev) => ({
      ...prev,
      [tabela]: { ...(prev[tabela] ?? managerInicial()), ...patch },
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

  // Card seletor de tabelas — já era FormGrid.
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

  return (
    <div className="container py-3">
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

      {tabelas.map((tabela) => {
        const manager = managers[tabela] ?? managerInicial();
        return (
          <div className="card shadow-sm mt-3" key={tabela}>
            <div className="card-header">
              <span className="fw-semibold text-nowrap">{tabela}</span>
            </div>
            <div className="card-body">
              <div className="mb-2">
                <span className="fw-semibold small text-uppercase text-muted">
                  Formulário
                </span>
              </div>
              <div className="card bg-body-tertiary mb-3">
                <div className="card-body py-2">
                  <FormGrid schema={managerSchema(tabela, manager, atualizarManager)} />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-semibold small text-uppercase text-muted">
                  Grupos
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  title="Adicionar grupo"
                  onClick={() => adicionarGrupo(tabela)}
                >
                  +
                </button>
              </div>

              {(grupos[tabela] ?? []).map((grupo) => (
                <div className="card bg-body-tertiary mb-2" key={grupo.id}>
                  <div className="card-body py-2">
                    <FormGrid schema={grupoSchema(tabela, grupo, atualizarGrupo)} />
                    <div className="row g-3">
                      <div className="col-md-6 mb-1">
                        <label className="form-label">Ícone</label>
                        <IconSelect
                          value={grupo.icon}
                          onChange={(nome) =>
                            atualizarGrupo(tabela, grupo.id, { icon: nome })
                          }
                        />
                      </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mt-3 mb-2">
                      <span className="fw-semibold small text-uppercase text-muted">
                        Linhas
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        title="Adicionar linha"
                        onClick={() => adicionarLinha(grupo.id)}
                      >
                        +
                      </button>
                    </div>

                    {(linhas[grupo.id] ?? []).map((linha) => (
                      <div className="card border mb-2" key={linha.id}>
                        <div className="card-body py-2">
                          <FormGrid
                            schema={rowSchema(grupo.id, linha, atualizarLinha)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
