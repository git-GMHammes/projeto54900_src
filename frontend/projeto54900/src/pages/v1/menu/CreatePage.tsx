// Formulario de criacao de item de menu — EM BRANCO ate a fabrica de formularios (FormGrid).
//
// Wiring anterior (preservar para religar na fabrica):
//   - create: menuManagerTable.create(values)   [POST api/v1/menu-manager/create]
//   - preenche nav_manager_id a partir de ?nav_manager_id= na querystring quando presente
//   - campos: nav_manager_id (select/hidden) | parent_id (select, opcional, mesmo nav_manager_id) |
//     title (text) | react_route (text) | roles (select multiple de user-roles) |
//     sort_order (number) (status nao entra no create - nasce 'draft')
// Ver src/markdown/geral/README_FormGrid.md e README_campo_json_montado.md (roles).

import { useSearchParams } from 'react-router-dom';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';

export default function CreatePage() {
  const [searchParams] = useSearchParams();
  const navManagerId = searchParams.get('nav_manager_id');

  return (
    <>
      <PageHeader
        title={navManagerId ? `Novo item (nav #${navManagerId})` : 'Novo item de menu'}
        subtitle="POST api/v1/menu-manager/create"
      />

      <EmptyState
        title="Formulario em branco"
        description="Aguardando a fabrica de formularios (FormGrid). Os campos nav, item pai, titulo, rota, roles e ordem serao montados por ela."
      />
    </>
  );
}
