// Lista de exames (view_health_exams) -- api/v1/health-exams-view. Wrapper do ListBuild (slug 'health-exams': colunas, acoes e busca vem do banco).
import ListBuild from '@/components/global/ListBuild';
import { paths } from '@/routes/paths';

export default function GetAllPage() {
  return (
    <ListBuild
      slug="health-exams"
      backFallback={paths.home}
      /*
      CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 14:18:32
      Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\pages\v1\health\health-exams\GetAllPage.tsx
      LINHA ADICIONADA - linha 18 neste arquivo editado: mediaModule="HealthExams"
      Antes de :       backFallback={paths.home}
      Depois de :       createPath={paths.v1.healthExams.create}
      Motivo: ligar a acao Visualizador de Midias aos anexos do modulo HealthExams.
      */
      mediaModule="HealthExams"
      createPath={paths.v1.healthExams.create}
      createLabel="Novo exame"
      searchPlaceholder="Buscar por paciente, exame ou resultado"
      emptyTitle="Nenhum exame encontrado"
      emptyDescription="Registre o primeiro exame."
    />
  );
}
