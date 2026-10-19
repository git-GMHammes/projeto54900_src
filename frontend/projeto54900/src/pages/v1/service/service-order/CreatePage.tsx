// Cadastro de pedido de servico -- build 'criar-pedido-de-servico' (form_manager, tabela service_order).
// Wrapper do RecordFormWithRoles (campo roles por registro). `?service_id=` e `?parent_id=` pre-seleciona o campo correspondente.
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import RecordFormWithRoles from '@/components/global/RecordFormWithRoles';
import { paths } from '@/routes/paths';

export default function CreatePage() {
  const [params] = useSearchParams();
  const serviceId = params.get('service_id') ?? '';
  const parentId = params.get('parent_id') ?? '';
  const defaults = useMemo(() => ({ ...(serviceId ? { service_id: serviceId } : {}), ...(parentId ? { parent_id: parentId } : {}) }), [serviceId, parentId]);

  return (
    <RecordFormWithRoles
      slug="criar-pedido-de-servico"
      backPath={paths.v1.serviceOrder.list}
      defaults={defaults}
      successMessage="Pedido registrado."
      fallbackTitle="Novo Pedido de Serviço"
    />
  );
}
