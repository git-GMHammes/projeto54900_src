// Home (landing page) da empresa `menezes22001`: dashboard eleitoral (pages/Home/company/menezes22001). Ao abrir,
// obtem o JWT especial das APIs Eleicoes2026 (sem login); o token fica em memoria
// (services/v1/eleicoes2026.public.ts) e e usado nas chamadas as views view_dash_*. Falha ao obter o token mostra o
// aviso do proprio dashboard, sem quebrar a Home.

import EleicoesDashboard from '@/pages/Home/company/menezes22001/EleicoesDashboard';

export default function Menezes22001Home() {
  return <EleicoesDashboard />;
}
