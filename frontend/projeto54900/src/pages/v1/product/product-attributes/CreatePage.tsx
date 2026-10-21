// Cadastro de caracteristica de produto -- build 'criar-atributo-de-produto' (form_manager, tabela product_attributes).
// Wrapper do RecordFormWithRoles (campo roles por registro). `?product_id=` pre-seleciona o campo correspondente.
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import RecordFormWithRoles from '@/components/global/RecordFormWithRoles';
import { paths } from '@/routes/paths';

export default function CreatePage() {
  const [params] = useSearchParams();
  const productId = params.get('product_id') ?? '';
  const defaults = useMemo(() => ({ ...(productId ? { product_id: productId } : {}) }), [productId]);

  return (
    <RecordFormWithRoles
      slug="criar-atributo-de-produto"
      backPath={paths.v1.productAttributes.list}
      defaults={defaults}
      successMessage="Característica cadastrada."
      fallbackTitle="Nova Característica de Produto"
    />
  );
}
