// Visualizacao de um produto (view_product_manager): dados, saldo de estoque (StockCard), caracteristicas
// (AttributeEditor sobre o catalogo de produto) e produtos filhos. Wrapper do RecordDetail: a logica e
// dos componentes globais. O saldo so aparece se o modulo Movimento tiver linha para o produto.
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import AttributeEditor from '@/components/global/AttributeEditor';
import RecordDetail from '@/components/global/RecordDetail';
import StockCard from '@/components/global/StockCard';
import { productCatalog } from '@/catalogs/productCatalog';
import { paths } from '@/routes/paths';
import { movementStockView, productAttributesTable, productAttributesView, productManagerView } from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
import { toText } from '@/utils/format';
import { PRODUCT_STATUS, labelOf } from '@/utils/recordLabels';
import type { ApiRow } from '@/types/api';

const load = (id: string) => productManagerView.get(id);

function ProductExtras({ id }: { id: string }) {
  const loadStock = useCallback(() => movementStockView.get(id), [id]);
  const [children, setChildren] = useState<ApiRow[]>([]);

  useEffect(() => {
    let alive = true;
    productManagerView
      .find({ parent_id: id })
      .then((raw) => {
        if (alive) setChildren(normalizeList(raw).rows);
      })
      .catch(() => {
        if (alive) setChildren([]);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  return (
    <>
      <StockCard load={loadStock} />
      <AttributeEditor
        catalog={productCatalog}
        ownerKey="product_id"
        ownerId={id}
        list={productAttributesView}
        table={productAttributesTable}
        title="Características"
      />
      <h2 className="h5 mt-4">Produtos dentro deste ({children.length})</h2>
      {children.length === 0 ? (
        <p className="text-body-secondary">Nenhum produto filho.</p>
      ) : (
        <ul className="list-group mb-4">
          {children.map((child) => (
            <li className="list-group-item" key={toText(child.id, '')}>
              <Link to={paths.v1.productManager.view(toText(child.id, ''))}>{toText(child.name, '')}</Link>
              <span className="text-body-secondary small ms-2">{toText(child.code, '')}</span>
            </li>
          ))}
        </ul>
      )}
      <Link className="btn btn-outline-primary btn-sm" to={`${paths.v1.productManager.create}?parent_id=${id}`}>
        Novo produto dentro deste
      </Link>
    </>
  );
}

export default function GetPage() {
  const { id = '' } = useParams();

  return (
    <RecordDetail
      id={id}
      load={load}
      title={(row) => toText(row.name, '')}
      fallbackTitle={`Produto #${id}`}
      subtitle="Dados do produto, estoque e características."
      backPath={paths.v1.productManager.list}
      editPath={paths.v1.productManager.update(id)}
      fields={[
        { label: 'Código', value: (row) => toText(row.code, '') },
        { label: 'Tipo', value: (row) => toText(row.type, '') },
        { label: 'Status', value: (row) => labelOf(PRODUCT_STATUS, row.status) },
        { label: 'Produto pai', value: (row) => toText(row.parent_name, '') },
        { label: 'Local', value: (row) => toText(row.location_path_names, '') },
        { label: 'Estoque mínimo', value: (row) => toText(row.stock_min, '') },
        { label: 'Estoque máximo', value: (row) => toText(row.stock_max, '') },
        { label: 'Produtos filhos', value: (row) => toText(row.children_count, '') },
        { label: 'Características', value: (row) => toText(row.attributes_count, '') },
        { label: 'Descrição', value: (row) => toText(row.description, '') },
      ]}
    >
      {() => <ProductExtras id={id} />}
    </RecordDetail>
  );
}
