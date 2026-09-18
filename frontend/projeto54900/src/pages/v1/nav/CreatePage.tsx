// Formulario de criacao de nav — EM BRANCO ate a fabrica de formularios (FormGrid).
//
// Wiring anterior (preservar para religar na fabrica):
//   - create: navManagerTable.create(values)   [POST api/v1/nav-manager/create]
//   - campos: title (text) | image (text/upload) | message_icon (text) | system_version (text)
//     (status nao entra no create - nasce 'draft' pelo DEFAULT da coluna)
// Ver src/markdown/geral/README_FormGrid.md.

import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';

export default function CreatePage() {
  return (
    <>
      <PageHeader title="Novo nav" subtitle="POST api/v1/nav-manager/create" />

      <EmptyState
        title="Formulario em branco"
        description="Aguardando a fabrica de formularios (FormGrid). Os campos titulo, imagem, icone de mensagens e versao serao montados por ela."
      />
    </>
  );
}
