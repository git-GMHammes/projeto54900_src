// Arvore de locais (view_location_manager) sobre o componente global TreeBuild.
// Acoes por no: Novo filho, Editar e Excluir (delete-soft; local com filhos devolve 409 e a
// mensagem da API vira toast). Wrapper fino: a logica da arvore e do TreeBuild.
import { useState } from 'react';
import { Link } from 'react-router-dom';

import ConfirmModal from '@/components/global/ConfirmModal';
import TreeBuild from '@/components/global/TreeBuild';
import { useToast } from '@/hooks/useToast';
import { paths } from '@/routes/paths';
import { ApiError } from '@/services/http';
import { locationManagerTable, locationManagerView } from '@/services/v1';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';

const load = () => locationManagerView.getNoPagination({ sort: 'path_names', order: 'asc' });

export default function LocationTree() {
  const toast = useToast();
  const [target, setTarget] = useState<{ row: ApiRow; reload: () => void } | null>(null);
  const [busy, setBusy] = useState(false);

  const confirmDelete = async () => {
    if (!target) return;
    setBusy(true);
    try {
      await locationManagerTable.deleteSoft(toText(target.row.id, ''));
      toast.success('Local excluído.');
      target.reload();
      setTarget(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao excluir o local.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <TreeBuild
        load={load}
        emptyTitle="Nenhum local encontrado"
        emptyDescription="Cadastre o primeiro local."
        renderLabel={(row) => (
          <>
            <i className={`bi bi-${toText(row.type_icon, '') || 'geo-alt'} me-2`} aria-hidden="true" />
            {toText(row.name, '')}
            {toText(row.code, '') ? <code className="ms-2 small">{toText(row.code, '')}</code> : null}
          </>
        )}
        renderMeta={(row) => (
          <>
            {toText(row.type_name, '')}
            {toText(row.status, '') === 'inactive' ? <span className="badge text-bg-secondary ms-2">Inativo</span> : null}
          </>
        )}
        renderActions={(row, reload) => {
          const id = toText(row.id, '');
          return (
            <>
              <Link
                className="btn btn-sm btn-outline-secondary ms-1"
                to={paths.v1.locationManager.view(id)}
                title="Ver"
                aria-label="Ver"
              >
                <i className="bi bi-eye" aria-hidden="true" />
              </Link>
              <Link
                className="btn btn-sm btn-outline-secondary ms-1"
                to={`${paths.v1.locationManager.create}?parent_id=${id}`}
                title="Novo local dentro deste"
                aria-label="Novo local dentro deste"
              >
                <i className="bi bi-plus-lg" aria-hidden="true" />
              </Link>
              <Link
                className="btn btn-sm btn-outline-primary ms-1"
                to={paths.v1.locationManager.update(id)}
                title="Editar"
                aria-label="Editar"
              >
                <i className="bi bi-pencil" aria-hidden="true" />
              </Link>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger ms-1"
                title="Excluir"
                aria-label="Excluir"
                disabled={Number(row.children_count) > 0}
                onClick={() => setTarget({ row, reload })}
              >
                <i className="bi bi-trash" aria-hidden="true" />
              </button>
            </>
          );
        }}
      />
      <ConfirmModal
        open={target !== null}
        title="Excluir local"
        message={`Excluir "${toText(target?.row.name, '')}"?`}
        confirmLabel="Excluir"
        variant="danger"
        busy={busy}
        onConfirm={() => void confirmDelete()}
        onClose={() => setTarget(null)}
      />
    </>
  );
}
