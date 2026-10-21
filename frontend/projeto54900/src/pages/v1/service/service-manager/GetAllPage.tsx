// Lista de servicos (service_manager) -- api/v1/service-manager-view. Duas visoes: Arvore (RecordTree sobre o TreeBuild
// global) e Tabela (ListBuild, slug 'service-manager': colunas e acoes vem do banco). Wrapper fino: a logica
// e dos componentes globais.
import RecordTree from '@/components/global/RecordTree';
import TreeListPage from '@/components/global/TreeListPage';
import { paths } from '@/routes/paths';
import { serviceManagerTable, serviceManagerView } from '@/services/v1';
import { toText } from '@/utils/format';
import { PROVIDER_TYPE, PRODUCT_STATUS, labelOf } from '@/utils/recordLabels';

const load = () => serviceManagerView.getNoPagination({ sort: 'name', order: 'asc' });
const remove = (id: string) => serviceManagerTable.deleteSoft(id);

export default function GetAllPage() {
  return (
    <TreeListPage
      title="Serviços"
      subtitle="Catálogo de serviços, do pacote à etapa. Um serviço pode ser filho de outro (obra, pacote)."
      slug="service-manager"
      createPath={paths.v1.serviceManager.create}
      createLabel="Novo serviço"
      searchPlaceholder="Buscar por nome, código ou tipo"
      emptyTitle="Nenhum serviço encontrado"
      emptyDescription="Cadastre o primeiro serviço."
      tree={
        <RecordTree
          load={load}
          remove={remove}
          viewPath={paths.v1.serviceManager.view}
          updatePath={paths.v1.serviceManager.update}
          createPath={paths.v1.serviceManager.create}
          entity="serviço"
          emptyTitle="Nenhum serviço encontrado"
          emptyDescription="Cadastre o primeiro serviço."
          renderLabel={(row) => (
            <>
              <i className="bi bi-tools me-2" aria-hidden="true" />
              {toText(row.name, '')}
              {toText(row.code, '') ? <code className="ms-2 small">{toText(row.code, '')}</code> : null}
            </>
          )}
          renderMeta={(row) => (
            <>
              {toText(row.type, '')}
              {toText(row.provider_type, '') ? <span className="badge text-bg-info ms-2">{labelOf(PROVIDER_TYPE, row.provider_type)}</span> : null}
              {toText(row.status, '') !== 'active' ? <span className="badge text-bg-secondary ms-2">{labelOf(PRODUCT_STATUS, row.status)}</span> : null}
            </>
          )}
        />
      }
    />
  );
}
