// Rota do construtor — o usuario escolhe tabelas (TODAS vindas da API de
// introspeccao do banco) e cada tabela escolhida vira um card com o nome da
// tabela e um Alias (nome do formulario) no cabecalho. O corpo do card fica
// EM BRANCO por ora — nao renderiza nada da tabela ainda.
//
// Fonte dos dados — SEM lista estatica:
//   - tabelas : dbSchema.tables()        -> GET api/v1/db-schema/tables
//   - colunas : dbSchema.columns(tabela) -> GET api/v1/db-schema/columns/{tabela}
//               (disparada ao selecionar a tabela e guardada em cache; ainda
//                nao e exibida na tela)

import { useCallback, useEffect, useState } from 'react';
import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import IconSelect from '@/components/ui/IconSelect';
import { dbSchema } from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
import { ApiError } from '@/services/http';

interface TabelaInfo {
  name: string;
  type: string;
}

interface ColunaInfo {
  name: string;
  data_type: string;
  column_type: string;
  nullable: boolean;
  key: string | null;
}

interface ColunasState {
  loading: boolean;
  error: string | null;
  items: ColunaInfo[];
}

// Grupo de um formulario (subcard) — campos editaveis de form_groups.
// id/form_manager_id/timestamps ficam de fora. Somente na tela — nada persistido.
// `slugAuto` e so controle de UI (nao existe em form_groups): enquanto true, o
// slug acompanha o title; vira false quando o slug e editado a mao.
interface GrupoLocal {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
  collapsed: boolean;
  slugAuto: boolean;
}

// Dados do formulario (form_manager) — um por tabela escolhida (1:1). Campos
// editaveis de form_manager; id/version.auto e timestamps ficam de fora.
// `slugAuto` e so controle de UI (nao existe em form_manager): enquanto true, o
// slug acompanha o name; vira false quando o slug e editado a mao.
type ManagerStatus = 'draft' | 'active' | 'inactive';

interface ManagerLocal {
  name: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  profile_group: string;
  react_route: string;
  submit_endpoint: string;
  http_method: string;
  status: ManagerStatus;
  version: number;
  settings_json: string;
  slugAuto: boolean;
}

function managerInicial(): ManagerLocal {
  return {
    name: '',
    slug: '',
    title: '',
    subtitle: '',
    description: '',
    profile_group: '',
    react_route: '',
    submit_endpoint: '',
    http_method: 'POST',
    status: 'draft',
    version: 1,
    settings_json: '',
    slugAuto: true,
  };
}

function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove diacriticos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function asString(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return '';
}

function toTabela(row: Record<string, unknown>): TabelaInfo {
  return { name: asString(row.name), type: asString(row.type) || 'table' };
}

function toColuna(row: Record<string, unknown>): ColunaInfo {
  return {
    name: asString(row.name),
    data_type: asString(row.data_type),
    column_type: asString(row.column_type),
    nullable: row.nullable === true,
    key: typeof row.key === 'string' && row.key !== '' ? row.key : null,
  };
}

export default function FormBuilderPage() {
  const [tabelasDisponiveis, setTabelasDisponiveis] = useState<TabelaInfo[]>([]);
  const [tabelasLoading, setTabelasLoading] = useState(true);
  const [tabelasErro, setTabelasErro] = useState<string | null>(null);

  const [tabelas, setTabelas] = useState<string[]>([]);
  // Dados do form_manager por tabela — somente estado local, nada no banco.
  const [managers, setManagers] = useState<Record<string, ManagerLocal>>({});
  // Cache das colunas por tabela (2a API). Ainda nao renderizado — fica pronto
  // para quando o corpo do subcard for definido.
  const [, setColunas] = useState<Record<string, ColunasState>>({});
  // Grupos (subcards) por tabela — somente estado local, nada no banco.
  const [grupos, setGrupos] = useState<Record<string, GrupoLocal[]>>({});

  // 1a API — todas as tabelas do banco, sem paginacao.
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

  const atualizarManager = useCallback(
    (tabela: string, patch: Partial<ManagerLocal>) => {
      setManagers((prev) => ({
        ...prev,
        [tabela]: { ...(prev[tabela] ?? managerInicial()), ...patch },
      }));
    },
    [],
  );

  const adicionarGrupo = useCallback((tabela: string) => {
    const novo: GrupoLocal = {
      id: crypto.randomUUID(),
      title: '',
      slug: '',
      description: '',
      icon: '',
      sort_order: 0,
      collapsed: false,
      slugAuto: true,
    };
    setGrupos((prev) => ({
      ...prev,
      [tabela]: [...(prev[tabela] ?? []), novo],
    }));
  }, []);

  const atualizarGrupo = useCallback(
    (tabela: string, id: string, patch: Partial<GrupoLocal>) => {
      setGrupos((prev) => ({
        ...prev,
        [tabela]: (prev[tabela] ?? []).map((g) => (g.id === id ? { ...g, ...patch } : g)),
      }));
    },
    [],
  );

  // O SelectField le `options` so no mount (inicializador de estado). Por isso o
  // FormGrid so e montado depois que a lista de tabelas chegou.
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
                <div className="row g-2">
                  <div className="col-12">
                    <label className="form-label form-label-sm mb-1 small">
                      Nome
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      maxLength={255}
                      placeholder="Nome do formulário"
                      value={manager.name}
                      onChange={(e) =>
                        atualizarManager(
                          tabela,
                          manager.slugAuto
                            ? { name: e.target.value, slug: slugify(e.target.value) }
                            : { name: e.target.value },
                        )
                      }
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label mb-1 small">Slug</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      maxLength={255}
                      value={manager.slug}
                      onChange={(e) =>
                        atualizarManager(tabela, {
                          slug: e.target.value,
                          slugAuto: false,
                        })
                      }
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label mb-1 small">Status</label>
                    <select
                      className="form-select form-select-sm"
                      value={manager.status}
                      onChange={(e) =>
                        atualizarManager(tabela, {
                          status: e.target.value as ManagerStatus,
                        })
                      }
                    >
                      <option value="draft">draft</option>
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                    </select>
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label mb-1 small">Título</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      maxLength={255}
                      value={manager.title}
                      onChange={(e) =>
                        atualizarManager(tabela, { title: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label mb-1 small">Subtítulo</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      maxLength={255}
                      value={manager.subtitle}
                      onChange={(e) =>
                        atualizarManager(tabela, { subtitle: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label mb-1 small">Grupo de perfil</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      maxLength={255}
                      value={manager.profile_group}
                      onChange={(e) =>
                        atualizarManager(tabela, { profile_group: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label mb-1 small">Rota React</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      maxLength={255}
                      value={manager.react_route}
                      onChange={(e) =>
                        atualizarManager(tabela, { react_route: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-12 col-sm-8">
                    <label className="form-label mb-1 small">Endpoint de envio</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      maxLength={255}
                      value={manager.submit_endpoint}
                      onChange={(e) =>
                        atualizarManager(tabela, {
                          submit_endpoint: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-6 col-sm-4">
                    <label className="form-label mb-1 small">Método HTTP</label>
                    <select
                      className="form-select form-select-sm"
                      value={manager.http_method}
                      onChange={(e) =>
                        atualizarManager(tabela, { http_method: e.target.value })
                      }
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="PATCH">PATCH</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                  <div className="col-6 col-sm-4">
                    <label className="form-label mb-1 small">Versão</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      min={1}
                      value={manager.version}
                      onChange={(e) =>
                        atualizarManager(tabela, {
                          version: Number.parseInt(e.target.value, 10) || 1,
                        })
                      }
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label mb-1 small">Descrição</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={2}
                      value={manager.description}
                      onChange={(e) =>
                        atualizarManager(tabela, { description: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label mb-1 small">settings_json</label>
                    <textarea
                      className="form-control form-control-sm font-monospace"
                      rows={3}
                      placeholder="{ }"
                      value={manager.settings_json}
                      onChange={(e) =>
                        atualizarManager(tabela, { settings_json: e.target.value })
                      }
                    />
                  </div>
                </div>
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
                  <div className="row g-2">
                    <div className="col-12">
                      <label className="form-label form-label-sm mb-1 small">
                        Título
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        maxLength={255}
                        placeholder="Nome do grupo"
                        value={grupo.title}
                        onChange={(e) =>
                          atualizarGrupo(
                            tabela,
                            grupo.id,
                            grupo.slugAuto
                              ? { title: e.target.value, slug: slugify(e.target.value) }
                              : { title: e.target.value },
                          )
                        }
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label mb-1 small">Slug</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        maxLength={255}
                        value={grupo.slug}
                        onChange={(e) =>
                          atualizarGrupo(tabela, grupo.id, {
                            slug: e.target.value,
                            slugAuto: false,
                          })
                        }
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label mb-1 small">Ícone</label>
                      <IconSelect
                        value={grupo.icon}
                        onChange={(nome) =>
                          atualizarGrupo(tabela, grupo.id, { icon: nome })
                        }
                      />
                    </div>
                    <div className="col-6 col-sm-4">
                      <label className="form-label mb-1 small">Ordem</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={grupo.sort_order}
                        onChange={(e) =>
                          atualizarGrupo(tabela, grupo.id, {
                            sort_order: Number.parseInt(e.target.value, 10) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="col-6 col-sm-8 d-flex align-items-end">
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`collapsed-${grupo.id}`}
                          checked={grupo.collapsed}
                          onChange={(e) =>
                            atualizarGrupo(tabela, grupo.id, {
                              collapsed: e.target.checked,
                            })
                          }
                        />
                        <label
                          className="form-check-label small"
                          htmlFor={`collapsed-${grupo.id}`}
                        >
                          Recolhido
                        </label>
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label mb-1 small">Descrição</label>
                      <textarea
                        className="form-control form-control-sm"
                        rows={2}
                        value={grupo.description}
                        onChange={(e) =>
                          atualizarGrupo(tabela, grupo.id, {
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
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
