// Lista de prontuários (view_health_records) -- api/v1/health-records-view. Wrapper do ListBuild (slug 'health-records': colunas, acoes e busca vem do banco).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="health-records"
      backFallback={paths.home}
      /*
      CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 14:18:32
      Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-records\GetAllPage.tsx
      LINHA ADICIONADA - linha 18 neste arquivo editado: mediaModule="HealthRecords"
      Antes de :       backFallback={paths.home}
      Depois de :       createPath={paths.v1.healthRecords.create}
      Motivo: ligar a acao Visualizador de Midias aos anexos do modulo HealthRecords.
      */
      mediaModule="HealthRecords"
      createPath={paths.v1.healthRecords.create}
      createLabel="Novo prontuário"
      searchPlaceholder="Buscar por paciente, profissional, OS, CID ou diagnóstico"
      emptyTitle="Nenhum prontuário encontrado"
      emptyDescription="Registre o primeiro prontuário."
    />
  );
}
