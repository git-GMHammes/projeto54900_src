// Edicao de servico -- build 'editar-servico' (form_manager, tabela service_manager).
// Wrapper do RecordFormWithAttributes: busca o servico por id e preenche o nucleo e TODAS as caracteristicas do catalogo.
import { useParams } from 'react-router-dom';

import RecordFormWithAttributes from '@/components/global/RecordFormWithAttributes';
import { serviceCatalog } from '@/catalogs/serviceCatalog';
import { paths } from '@/routes/paths';
import { serviceAttributesView, serviceManagerTable } from '@/services/v1';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';

const toValues = (record: ApiRow): Record<string, string> => ({
  parent_id: toText(record.parent_id, ''),
  code: toText(record.code, ''),
  name: toText(record.name, ''),
  type: toText(record.type, ''),
  provider_type: toText(record.provider_type, ''),
  provider_document: toText(record.provider_document, ''),
  billing_unit: toText(record.billing_unit, ''),
  price: toText(record.price, ''),
  currency: toText(record.currency, ''),
  duration: toText(record.duration, ''),
  duration_unit: toText(record.duration_unit, ''),
  lead_time: toText(record.lead_time, ''),
  lead_time_unit: toText(record.lead_time_unit, ''),
  status: toText(record.status, 'active'),
  sort_order: toText(record.sort_order, ''),
  description: toText(record.description, ''),
});

const loadRecord = (id: string) => serviceManagerTable.get(id);

export default function UpdatePage() {
  const { id } = useParams();

  return (
    <RecordFormWithAttributes
      catalog={serviceCatalog}
      ownerKey="service_id"
      attributesView={serviceAttributesView}
      slug="editar-servico"
      backPath={paths.v1.serviceManager.list}
      recordId={id ?? ''}
      loadRecord={loadRecord}
      toValues={toValues}
      successMessage="Serviço atualizado."
      fallbackTitle={`Editar serviço #${id ?? ''}`}
    />
  );
}
