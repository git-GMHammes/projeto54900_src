// Edicao de produto -- build 'editar-produto' (form_manager, tabela product_manager) + todas as
// caracteristicas do catalogo (RecordFormWithAttributes): busca o produto por id e preenche nucleo e caracteristicas.
import { useParams } from 'react-router-dom';

import RecordFormWithAttributes from '@/components/global/RecordFormWithAttributes';
import { productCatalog } from '@/catalogs/productCatalog';
import { paths } from '@/routes/paths';
import { productAttributesView, productManagerTable } from '@/services/v1';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';

const toValues = (record: ApiRow): Record<string, string> => ({
  parent_id: toText(record.parent_id, ''),
  location_id: toText(record.location_id, ''),
  code: toText(record.code, ''),
  name: toText(record.name, ''),
  type: toText(record.type, ''),
  status: toText(record.status, 'active'),
  stock_min: toText(record.stock_min, ''),
  stock_max: toText(record.stock_max, ''),
  sort_order: toText(record.sort_order, ''),
  description: toText(record.description, ''),
});

const loadRecord = (id: string) => productManagerTable.get(id);

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <RecordFormWithAttributes
      catalog={productCatalog}
      ownerKey="product_id"
      attributesView={productAttributesView}
      slug="editar-produto"
      backPath={paths.v1.productManager.list}
      recordId={id ?? ''}
      loadRecord={loadRecord}
      toValues={toValues}
      successMessage="Produto atualizado."
      fallbackTitle={`Editar produto #${id ?? ''}`}
    />
  );
}
