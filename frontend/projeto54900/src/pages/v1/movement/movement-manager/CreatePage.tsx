// Cadastro de movimento -- build 'criar-movimento' (form_manager, tabela movement_manager).
// Wrapper do MovementForm (campos por tipo). `?product_id=` pre-seleciona o produto.
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { paths } from '@/routes/paths';
import MovementForm from './MovementForm';

export default function CreatePage() {
  const [params] = useSearchParams();
  const productId = params.get('product_id') ?? '';
  const defaults = useMemo(() => (productId ? { product_id: productId } : {}), [productId]);

  return (
    <MovementForm
      slug="criar-movimento"
      backPath={paths.v1.movementManager.list}
      defaults={defaults}
      successMessage="Movimento registrado."
      fallbackTitle="Novo Movimento"
    />
  );
}
