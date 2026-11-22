// Visualizacao da identidade de saude de um usuario (view_health_user_identity; o id e o do usuario). Wrapper do RecordDetail.
import { useParams } from 'react-router-dom';

import RecordDetail from '@/components/global/RecordDetail';
import { paths } from '@/routes/paths';
import { healthUserIdentityView } from '@/services/v1';
import { toText } from '@/utils/format';

const load = (id: string) => healthUserIdentityView.get(id);

const yesNo = (value: unknown): string => (Number(value) === 1 ? 'Sim' : 'Não');

export default function GetPage() {
  const { id = '' } = useParams();

  return (
    <RecordDetail
      id={id}
      load={load}
      title={(row) => toText(row.name, '') || toText(row.username, '')}
      fallbackTitle={`Usuário #${id}`}
      subtitle="Identidade de saúde do usuário na empresa."
      backPath={paths.v1.healthUserIdentity.list}
      fields={[
        { label: 'Usuário', value: (row) => toText(row.username, '') },
        { label: 'Nome', value: (row) => toText(row.name, '') },
        { label: 'Médico (registro ativo)', value: (row) => yesNo(row.is_doctor) },
        { label: 'Paciente', value: (row) => yesNo(row.is_patient) },
      ]}
    />
  );
}

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 13:51:23
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122170800_saude_front_identity_plano.json
Objetivo: Detalhe somente leitura da identidade de saude.
Proposito: telas do modulo Health (Saude) no frontend: lista, cadastro, edicao e detalhe de cada submodulo, dirigidas pelo banco (form_manager e list_manager) e pelos componentes globais FormBuild/ListBuild/RecordDetail.
Motivo: pedido do usuario para o frontend do modulo Health, um plano por submodulo e um plano global.
Ligacoes: API V1 health-* (Models/Processors do backend), constants/api.ts, services/v1, routes/paths.ts, routes/v1/health.routes.tsx, registros de form_manager/list_manager/temp_menu no banco DEV.
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-user-identity\GetPage.tsx
*/
