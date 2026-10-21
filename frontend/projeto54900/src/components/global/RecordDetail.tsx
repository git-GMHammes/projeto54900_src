// Componente global reutilizavel: VISUALIZACAO de um registro (dl com campos), por PROPS -- nao le
// useParams() e nao conhece nenhum modulo. `load` busca o registro (normalmente a view), `fields`
// descreve o que mostrar, `actions` entra no cabecalho (alem de Voltar e Editar) e `children`
// recebe o registro para blocos extras (filhos, atributos, saldo, status...). A GetPage de cada
// recurso e so um wrapper. `load` deve ser ESTAVEL (funcao de modulo ou useCallback): ele entra nas
// dependencias do efeito de carga.
import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import PageHeader from '@/components/global/PageHeader';
import { useGoBack } from '@/hooks/useGoBack';
import { ApiError } from '@/services/http';
import { normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';

export interface DetailField {
  label: string;
  value: (row: ApiRow) => ReactNode;
}

export interface RecordDetailProps {
  id: string;
  /** Busca o registro (ex.: `(id) => productManagerView.get(id)`). */
  load: (id: string) => Promise<unknown>;
  title: (row: ApiRow) => string;
  fallbackTitle: string;
  subtitle: string;
  fields: DetailField[];
  /** Reserva do Voltar quando nao ha historico. */
  backPath: string;
  /** Sem ele nao ha botao Editar (recursos so de leitura). Funcao: decide por registro (ex.: so movimento aberto). */
  editPath?: string | ((row: ApiRow) => string | undefined);
  /** Botoes extras do cabecalho. */
  actions?: (row: ApiRow, reload: () => void) => ReactNode;
  /** Blocos extras abaixo dos campos. */
  children?: (row: ApiRow, reload: () => void) => ReactNode;
}

export default function RecordDetail({
  id,
  load,
  title,
  fallbackTitle,
  subtitle,
  fields,
  backPath,
  editPath,
  actions,
  children,
}: RecordDetailProps) {
  const goBack = useGoBack(backPath);
  const [row, setRow] = useState<ApiRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    load(id)
      .then((raw) => {
        if (!alive) return;
        setRow(normalizeItem(raw));
        setError(null);
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof ApiError ? err.message : 'Falha ao carregar o registro.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id, load, version]);

  const editTo = typeof editPath === 'function' ? (row ? editPath(row) : undefined) : editPath;

  return (
    <div className="container py-3">
      <PageHeader title={row ? title(row) : fallbackTitle} subtitle={subtitle}>
        <button type="button" className="btn btn-outline-secondary" onClick={goBack}>
          Voltar
        </button>
        {row && actions ? actions(row, reload) : null}
        {editTo ? (
          <Link className="btn btn-primary" to={editTo}>
            Editar
          </Link>
        ) : null}
      </PageHeader>
      {loading && !row ? <LoadingOverlay /> : null}
      {error ? <EmptyState variant="danger" title="Erro ao carregar" description={error} /> : null}
      {row ? (
        <>
          <dl className="row">
            {fields.map((field) => (
              <div className="col-md-6 mb-2" key={field.label}>
                <dt className="small text-body-secondary">{field.label}</dt>
                <dd className="mb-0">{field.value(row) || '—'}</dd>
              </div>
            ))}
          </dl>
          {children ? children(row, reload) : null}
        </>
      ) : null}
    </div>
  );
}
