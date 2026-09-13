// Formulario de edicao de usuario — EM BRANCO ate a fabrica de formularios (FormGrid).
//
// Wiring anterior (preservar para religar na fabrica):
//   - edit:   userManagerTable.update(id, values)    [PUT  api/v1/user-manager/update/{id}]
//   - preload: userManagerView.get(id) -> normalizeItem -> { name, email, status }
//   - validacao: runValidators({ name: [required, minLength(2), maxLength(120)],
//                                email: [required, isEmail] })
//   - campos: name (text) | email (email) | status (select active|inactive)
// Ver src/markdown/geral/README_FormGrid.md.

import { useParams } from 'react-router-dom';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <>
      <PageHeader title={`Editar usuario #${id ?? ''}`} subtitle="PUT api/v1/user-manager/update" />

      <EmptyState
        title="Formulario em branco"
        description="Aguardando a fabrica de formularios (FormGrid). Os campos nome, e-mail e status serao montados por ela."
      />
    </>
  );
}
