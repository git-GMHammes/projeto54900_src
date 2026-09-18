// Formulario de edicao de nav — EM BRANCO ate a fabrica de formularios (FormGrid).
//
// Wiring anterior (preservar para religar na fabrica):
//   - edit:    navManagerTable.update(id, values)  [PUT api/v1/nav-manager/update/{id}]
//   - preload: navManagerTable.get(id) -> normalizeItem
//   - campos: title (text) | image (text/upload) | message_icon (text) | system_version (text) |
//             status (select draft|active|inactive)
// Ver src/markdown/geral/README_FormGrid.md.

import { useParams } from 'react-router-dom';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <>
      <PageHeader title={`Editar nav #${id ?? ''}`} subtitle="PUT api/v1/nav-manager/update" />

      <EmptyState
        title="Formulario em branco"
        description="Aguardando a fabrica de formularios (FormGrid). Os campos titulo, imagem, icone de mensagens, versao e status serao montados por ela."
      />
    </>
  );
}
