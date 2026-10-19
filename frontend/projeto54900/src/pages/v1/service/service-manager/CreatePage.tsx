// Cadastro de servico -- build 'criar-servico' (form_manager, tabela service_manager) + TODAS as caracteristicas do
// catalogo de servico (RecordFormWithAttributes: identificacao, classificacao, execucao, agenda, preco, fiscal,
// exigencias, seguranca e especificacao), tudo no mesmo envio. `?parent_id=` pre-seleciona o servico pai.
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import RecordFormWithAttributes from '@/components/global/RecordFormWithAttributes';
import { serviceCatalog } from '@/catalogs/serviceCatalog';
import { paths } from '@/routes/paths';
import { serviceAttributesView } from '@/services/v1';

export default function CreatePage() {
  const [params] = useSearchParams();
  const parentId = params.get('parent_id') ?? '';
  const defaults = useMemo(
    () => ({ status: 'active', currency: 'BRL', billing_unit: '1', ...(parentId ? { parent_id: parentId } : {}) }),
    [parentId],
  );

  return (
    <RecordFormWithAttributes
      catalog={serviceCatalog}
      ownerKey="service_id"
      attributesView={serviceAttributesView}
      slug="criar-servico"
      backPath={paths.v1.serviceManager.list}
      defaults={defaults}
      successMessage="Serviço cadastrado."
      fallbackTitle="Novo Serviço"
    />
  );
}
