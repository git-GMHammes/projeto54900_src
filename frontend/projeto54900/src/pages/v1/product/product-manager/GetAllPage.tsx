// Lista de produtos (product_manager) -- api/v1/product-manager-view. Duas visoes: Arvore (RecordTree sobre o TreeBuild
// global) e Tabela (ListBuild, slug 'product-manager': colunas e acoes vem do banco). Wrapper fino: a logica
// e dos componentes globais.
import RecordTree from '@/components/global/RecordTree';
import TreeListPage from '@/components/global/TreeListPage';
import { paths } from '@/routes/paths';
import { productManagerTable, productManagerView } from '@/services/v1';
import { toText } from '@/utils/format';
import { PRODUCT_STATUS, labelOf } from '@/utils/recordLabels';

const load = () => productManagerView.getNoPagination({ sort: 'name', order: 'asc' });
const remove = (id: string) => productManagerTable.deleteSoft(id);

export default function GetAllPage() {
  return (
    <TreeListPage
      title="Produtos"
      subtitle="Produtos e conjuntos, do maior ao menor. Um produto pode ser filho de outro (kit, componente)."
      slug="product-manager"
      createPath={paths.v1.productManager.create}
      createLabel="Novo produto"
      searchPlaceholder="Buscar por nome, código ou tipo"
      emptyTitle="Nenhum produto encontrado"
      emptyDescription="Cadastre o primeiro produto."
      tree={
        <RecordTree
          load={load}
          remove={remove}
          viewPath={paths.v1.productManager.view}
          updatePath={paths.v1.productManager.update}
          createPath={paths.v1.productManager.create}
          entity="produto"
          emptyTitle="Nenhum produto encontrado"
          emptyDescription="Cadastre o primeiro produto."
          renderLabel={(row) => (
            <>
              <i className="bi bi-box-seam me-2" aria-hidden="true" />
              {toText(row.name, '')}
              {toText(row.code, '') ? <code className="ms-2 small">{toText(row.code, '')}</code> : null}
            </>
          )}
          renderMeta={(row) => (
            <>
              {toText(row.type, '')}
              {toText(row.location_name, '') ? (
                <span className="ms-2 text-body-secondary">
                  <i className="bi bi-geo-alt me-1" aria-hidden="true" />
                  {toText(row.location_name, '')}
                </span>
              ) : null}
              {toText(row.status, '') !== 'active' ? <span className="badge text-bg-secondary ms-2">{labelOf(PRODUCT_STATUS, row.status)}</span> : null}
            </>
          )}
        />
      }
    />
  );
}
