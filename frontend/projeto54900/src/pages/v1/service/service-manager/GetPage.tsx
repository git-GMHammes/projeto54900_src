// Visualizacao de um servico (view_service_manager): dados, caracteristicas (AttributeEditor sobre o
// catalogo de servico), servicos filhos (etapas) e atalho para pedir o servico. Wrapper do RecordDetail.
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import AttributeEditor from '@/components/global/AttributeEditor';
import RecordDetail from '@/components/global/RecordDetail';
import { serviceCatalog } from '@/catalogs/serviceCatalog';
import { paths } from '@/routes/paths';
import { serviceAttributesTable, serviceAttributesView, serviceManagerView } from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
import { toText } from '@/utils/format';
import { PRODUCT_STATUS, PROVIDER_TYPE, TIME_UNIT, labelOf } from '@/utils/recordLabels';
import type { ApiRow } from '@/types/api';

const load = (id: string) => serviceManagerView.get(id);

const withUnit = (value: unknown, unit: unknown): string => {
  const text = toText(value, '');
  return text ? `${text} ${labelOf(TIME_UNIT, unit)}`.trim() : '';
};

function ServiceExtras({ id }: { id: string }) {
  const [children, setChildren] = useState<ApiRow[]>([]);

  useEffect(() => {
    let alive = true;
    serviceManagerView
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
      <AttributeEditor
        catalog={serviceCatalog}
        ownerKey="service_id"
        ownerId={id}
        list={serviceAttributesView}
        table={serviceAttributesTable}
        title="Características"
      />
      <h2 className="h5 mt-4">Serviços dentro deste ({children.length})</h2>
      {children.length === 0 ? (
        <p className="text-body-secondary">Nenhum serviço filho.</p>
      ) : (
        <ul className="list-group mb-4">
          {children.map((child) => (
            <li className="list-group-item" key={toText(child.id, '')}>
              <Link to={paths.v1.serviceManager.view(toText(child.id, ''))}>{toText(child.name, '')}</Link>
              <span className="text-body-secondary small ms-2">{toText(child.code, '')}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="d-flex flex-wrap gap-2">
        <Link className="btn btn-outline-secondary btn-sm" to={`${paths.v1.serviceManager.create}?parent_id=${id}`}>
          Novo serviço dentro deste
        </Link>
        <Link className="btn btn-outline-primary btn-sm" to={`${paths.v1.serviceOrder.create}?service_id=${id}`}>
          Novo pedido deste serviço
        </Link>
      </div>
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
      fallbackTitle={`Serviço #${id}`}
      subtitle="Dados do serviço, características e etapas."
      backPath={paths.v1.serviceManager.list}
      editPath={paths.v1.serviceManager.update(id)}
      fields={[
        { label: 'Código', value: (row) => toText(row.code, '') },
        { label: 'Tipo', value: (row) => toText(row.type, '') },
        { label: 'Prestador', value: (row) => labelOf(PROVIDER_TYPE, row.provider_type) },
        { label: 'CPF/CNPJ do prestador', value: (row) => toText(row.provider_document, '') },
        {
          label: 'Cobrança',
          value: (row) =>
            toText(row.price, '') ? `${toText(row.currency, 'BRL')} ${toText(row.price, '')} por ${toText(row.billing_unit, '1')}` : '',
        },
        { label: 'Duração estimada', value: (row) => withUnit(row.duration, row.duration_unit) },
        { label: 'Prazo para iniciar', value: (row) => withUnit(row.lead_time, row.lead_time_unit) },
        { label: 'Status', value: (row) => labelOf(PRODUCT_STATUS, row.status) },
        { label: 'Serviço pai', value: (row) => toText(row.parent_name, '') },
        { label: 'Serviços filhos', value: (row) => toText(row.children_count, '') },
        { label: 'Pedidos abertos', value: (row) => toText(row.open_orders_count, '') },
        { label: 'Descrição', value: (row) => toText(row.description, '') },
      ]}
    >
      {() => <ServiceExtras id={id} />}
    </RecordDetail>
  );
}
