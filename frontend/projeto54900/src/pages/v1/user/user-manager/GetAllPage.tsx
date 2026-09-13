// Lista de usuarios — EM BRANCO ate a fabrica de listas (list factory).
//
// Wiring anterior (preservar para religar na fabrica):
//   - dados:      userManagerView.getAll(params) | userManagerView.search(term, params)
//   - exclusao:   userManagerTable.deleteSoft(id)  (+ ConfirmModal)
//   - paginacao:  usePagination() -> page/limit/sort/order sincronizados na URL
//   - busca:      useDebounce(term, 400)
//   - colunas:    id | name(||nome) | email(truncate 40) | created_at(formatDateTime) |
//                 acoes(Ver / Editar / Excluir)
// Ver src/markdown/geral/README_FormGrid.md e o backup do projeto.

import { useNavigate } from 'react-router-dom';
import { paths } from '@/routes/paths';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';

export default function GetAllPage() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="Usuarios" subtitle="api/v1/user-manager">
        <button className="btn btn-primary" onClick={() => void navigate(paths.v1.user.create)}>
          Novo usuario
        </button>
      </PageHeader>

      <EmptyState
        title="Listagem em branco"
        description="Aguardando a fabrica de listas. A tabela de usuarios sera montada por ela."
      />
    </>
  );
}
