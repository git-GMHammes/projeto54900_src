// Visualizacao de um documento do SGD (view_sgd). Wrapper do RecordDetail.
import { useParams } from 'react-router-dom';

import RecordDetail from '@/components/global/RecordDetail';
import { paths } from '@/routes/paths';
import { sgdView } from '@/services/v1';
import { formatBytes, formatDateTime, toText } from '@/utils/format';

const load = (id: string) => sgdView.get(id);

export default function GetPage() {
  const { id = '' } = useParams();

  return (
    <RecordDetail
      id={id}
      load={load}
      title={(row) => toText(row.sg_name, '')}
      fallbackTitle={`Documento #${id}`}
      subtitle="Dados do documento."
      backPath={paths.v1.sgd.list}
      editPath={paths.v1.sgd.update(id)}
      fields={[
        { label: 'Arquivo', value: (row) => toText(row.sg_name, '') },
        { label: 'Tipo', value: (row) => toText(row.sg_mime, '') },
        { label: 'Tamanho', value: (row) => formatBytes(row.sg_size) },
        { label: 'Status', value: (row) => toText(row.sg_status, '') },
        { label: 'Criado em', value: (row) => formatDateTime(row.sg_created_at) },
      ]}
    />
  );
}
