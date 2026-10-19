// Cadastro de produto -- build 'criar-produto' (form_manager, tabela product_manager) + todas as
// caracteristicas do catalogo (RecordFormWithAttributes). `?parent_id=` pre-seleciona o produto pai.
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import RecordFormWithAttributes from '@/components/global/RecordFormWithAttributes';
import { productCatalog } from '@/catalogs/productCatalog';
import { paths } from '@/routes/paths';
import { productAttributesView } from '@/services/v1';

export default function CreatePage() {
  const [params] = useSearchParams();
  const parentId = params.get('parent_id') ?? '';
  const defaults = useMemo(() => ({ status: 'active', ...(parentId ? { parent_id: parentId } : {}) }), [parentId]);

  return (
    <RecordFormWithAttributes
      catalog={productCatalog}
      ownerKey="product_id"
      attributesView={productAttributesView}
      slug="criar-produto"
      backPath={paths.v1.productManager.list}
      defaults={defaults}
      successMessage="Produto cadastrado."
      fallbackTitle="Novo Produto"
    />
  );
}
