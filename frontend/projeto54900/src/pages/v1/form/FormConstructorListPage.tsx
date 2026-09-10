// Lista de formularios (form_manager) — index do modulo form-constructor.
//
// Espelha o padrao REST do backend:
//   /v1/form-constructor              -> esta lista (get-all)
//   /v1/form-constructor/create       -> FormBuilderPage (novo)
//   /v1/form-constructor/update/:id   -> FormBuilderPage (edicao)
//
// Cada linha leva ao BUILD do form (/v1/form/:slug) e ao editor (update/:id).

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { ApiError } from '@/services/http';
import { formManagerTable } from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
import { paths } from '@/routes/paths';

interface FormRow {
  id: number;
  slug: string;
  title: string;
  status: string;
  submitEndpoint: string;
  reactRoute: string;
}

function toFormRow(raw: Record<string, unknown>): FormRow {
  const s = (v: unknown): string =>
    typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '';
  return {
    id: Number(raw.id) || 0,
    slug: s(raw.slug),
    title: s(raw.title),
    status: s(raw.status),
    submitEndpoint: s(raw.submit_endpoint),
    reactRoute: s(raw.react_route),
  };
}

const STATUS_CLASS: Record<string, string> = {
  active: 'text-bg-success',
  draft: 'text-bg-secondary',
  inactive: 'text-bg-warning',
};

export default function FormConstructorListPage() {
  const [rows, setRows] = useState<FormRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await formManagerTable.getNoPagination({ sort: 'id', order: 'ASC' });
      const { rows: list } = normalizeList<Record<string, unknown>>(raw);
      setRows(list.map(toFormRow).filter((r) => r.id > 0));
    } catch (err) {
      setRows([]);
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar os formularios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <PageHeader title="Formularios" subtitle="api/v1/form-manager">
        <button className="btn btn-outline-secondary me-2" onClick={() => void load()} disabled={loading}>
          Recarregar
        </button>
        <Link className="btn btn-primary" to={paths.v1.form.create}>
          Novo formulario
        </Link>
      </PageHeader>

      {loading && <LoadingOverlay />}

      {error && !loading && <EmptyState title="Lista indisponivel" description={error} />}

      {!loading && !error && rows.length === 0 && (
        <EmptyState
          title="Nenhum formulario"
          description="Crie o primeiro em 'Novo formulario'."
        />
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: '4rem' }}>#</th>
                  <th>Titulo</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Endpoint de envio</th>
                  <th className="text-end">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="text-body-secondary">{r.id}</td>
                    <td className="fw-semibold">{r.title || <span className="text-body-secondary fst-italic">sem titulo</span>}</td>
                    <td><code>{r.slug}</code></td>
                    <td>
                      <span className={`badge ${STATUS_CLASS[r.status] ?? 'text-bg-light'}`}>
                        {r.status || '—'}
                      </span>
                    </td>
                    <td className="text-body-secondary small">{r.submitEndpoint || '—'}</td>
                    <td className="text-end text-nowrap">
                      <Link
                        className="btn btn-sm btn-outline-primary me-2"
                        to={paths.v1.form.render(r.slug)}
                      >
                        Build
                      </Link>
                      <Link
                        className="btn btn-sm btn-outline-secondary"
                        to={paths.v1.form.edit(r.id)}
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
