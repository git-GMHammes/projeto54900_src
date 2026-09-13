// Formulario de edicao de item de menu — EM BRANCO ate a fabrica de formularios (FormGrid).
//
// Wiring anterior (preservar para religar na fabrica):
//   - edit:    menuManagerTable.update(id, values)  [PUT api/v1/menu-manager/update/{id}]
//   - preload: menuManagerTable.get(id) -> normalizeItem
//   - campos: nav_manager_id | parent_id | title | react_route | roles (select multiple) |
//     sort_order | status (select active|draft|inactive)
// Ver src/markdown/geral/README_FormGrid.md e README_campo_json_montado.md (roles).

import { useParams } from 'react-router-dom';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <>
      <PageHeader title={`Editar item de menu #${id ?? ''}`} subtitle="PUT api/v1/menu-manager/update" />

      <EmptyState
        title="Formulario em branco"
        description="Aguardando a fabrica de formularios (FormGrid). Os campos nav, item pai, titulo, rota, roles, ordem e status serao montados por ela."
      />
    </>
  );
}
