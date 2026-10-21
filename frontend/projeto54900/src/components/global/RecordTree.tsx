// Componente global reutilizavel: ARVORE de registros com Ver, Novo filho, Editar e Excluir, por PROPS --
// nao le useParams() e nao conhece nenhum modulo. Cobre qualquer tabela/view com id + parent_id
// (produto, servico...). A lista plana vem de `load`; o delete-soft de `remove` (registro com
// filhos devolve 409 e a mensagem da API vira toast). Wrapper fino em cada modulo; a logica da
// arvore e do TreeBuild.
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import ConfirmModal from '@/components/global/ConfirmModal';
import TreeBuild from '@/components/global/TreeBuild';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';

export interface RecordTreeProps {
  /** Busca a lista plana (sem paginacao) da view. */
  load: () => Promise<unknown>;
  /** Exclusao logica do registro (ex.: `(id) => productManagerTable.deleteSoft(id)`). */
  remove: (id: string) => Promise<unknown>;
  viewPath: (id: string) => string;
  updatePath: (id: string) => string;
  /** Caminho do cadastro; `?parent_id=` pre-seleciona o pai. */
  createPath: string;
  /** Nome do registro nos textos (ex.: 'produto'). */
  entity: string;
  /** Texto principal do no. */
  renderLabel: (row: ApiRow) => ReactNode;
  /** Texto secundario ao lado do rotulo. */
  renderMeta?: (row: ApiRow) => ReactNode;
  /** Chave com o nome usado na confirmacao de exclusao. Padrao: 'name'. */
  nameKey?: string;
  /** Chave com a contagem de filhos; com filhos o Excluir fica desabilitado. Padrao: 'children_count'. */
  childrenKey?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export default function RecordTree({
  load,
  remove,
  viewPath,
  updatePath,
  createPath,
  entity,
  renderLabel,
  renderMeta,
  nameKey = 'name',
  childrenKey = 'children_count',
  emptyTitle = 'Nenhum registro encontrado',
  emptyDescription = 'Cadastre o primeiro registro.',
}: RecordTreeProps) {
  const toast = useToast();
  const [target, setTarget] = useState<{ row: ApiRow; reload: () => void } | null>(null);
  const [busy, setBusy] = useState(false);

  const confirmDelete = async () => {
    if (!target) return;
    setBusy(true);
    try {
      await remove(toText(target.row.id, ''));
      toast.success(`Registro excluído (${entity}).`);
      target.reload();
      setTarget(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : `Falha ao excluir (${entity}).`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <TreeBuild
        load={load}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        renderLabel={renderLabel}
        {...(renderMeta ? { renderMeta } : {})}
        renderActions={(row, reload) => {
          const id = toText(row.id, '');
          return (
            <>
              <Link className="btn btn-sm btn-outline-secondary ms-1" to={viewPath(id)} title="Ver" aria-label="Ver">
                <i className="bi bi-eye" aria-hidden="true" />
              </Link>
              <Link
                className="btn btn-sm btn-outline-secondary ms-1"
                to={`${createPath}?parent_id=${id}`}
                title={`Novo ${entity} dentro deste`}
                aria-label={`Novo ${entity} dentro deste`}
              >
                <i className="bi bi-plus-lg" aria-hidden="true" />
              </Link>
              <Link className="btn btn-sm btn-outline-primary ms-1" to={updatePath(id)} title="Editar" aria-label="Editar">
                <i className="bi bi-pencil" aria-hidden="true" />
              </Link>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger ms-1"
                title="Excluir"
                aria-label="Excluir"
                disabled={Number(row[childrenKey]) > 0}
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
        title={`Excluir ${entity}`}
        message={`Excluir "${toText(target?.row[nameKey], '')}"?`}
        confirmLabel="Excluir"
        variant="danger"
        busy={busy}
        onConfirm={() => void confirmDelete()}
        onClose={() => setTarget(null)}
      />
    </>
  );
}
