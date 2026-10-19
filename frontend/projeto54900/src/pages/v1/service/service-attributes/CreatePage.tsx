// Cadastro de caracteristica de servico -- build 'criar-atributo-de-servico' (form_manager, tabela service_attributes).
// Wrapper do RecordFormWithRoles (campo roles por registro). `?service_id=` pre-seleciona o campo correspondente.
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import RecordFormWithRoles from '@/components/global/RecordFormWithRoles';
import { paths } from '@/routes/paths';

export default function CreatePage() {
  const [params] = useSearchParams();
  const serviceId = params.get('service_id') ?? '';
  const defaults = useMemo(() => ({ ...(serviceId ? { service_id: serviceId } : {}) }), [serviceId]);

  return (
    <RecordFormWithRoles
      slug="criar-atributo-de-servico"
      backPath={paths.v1.serviceAttributes.list}
      defaults={defaults}
      successMessage="Característica cadastrada."
      fallbackTitle="Nova Característica de Serviço"
    />
  );
}
