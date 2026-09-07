// Formulario de usuario — EM BRANCO ate a fabrica de formularios (FormGrid).
//
// Wiring anterior (preservar para religar na fabrica):
//   - create: userManagerTable.create(values)        [POST api/v1/user-manager/create]
//   - edit:   userManagerTable.update(id, values)    [PUT  api/v1/user-manager/update/{id}]
//   - preload (edit): userManagerView.get(id) -> normalizeItem -> { name, email, status }
//   - validacao: runValidators({ name: [required, minLength(2), maxLength(120)],
//                                email: [required, isEmail] })
//   - campos: name (text) | email (email) | status (select active|inactive)
// Ver src/markdown/geral/README_FormGrid.md.

import { useParams } from 'react-router-dom';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';

export interface UserFormPageProps {
  mode?: 'create' | 'edit';
}

export default function UserFormPage({ mode = 'create' }: UserFormPageProps) {
  const isEdit = mode === 'edit';
  const { id } = useParams();

  return (
    <>
      <PageHeader
        title={isEdit ? `Editar usuario #${id ?? ''}` : 'Novo usuario'}
        subtitle={isEdit ? 'PUT api/v1/user-manager/update' : 'POST api/v1/user-manager/create'}
      />

      <EmptyState
        title="Formulario em branco"
        description="Aguardando a fabrica de formularios (FormGrid). Os campos nome, e-mail e status serao montados por ela."
      />
    </>
  );
}
