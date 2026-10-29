// Home (landing page) da empresa `default` e de toda empresa que ainda nao tem Home propria
// (ver companyHomes.ts). Estatica: nao consulta API. Mantem a pagina de cards informativos do projeto
// (pages/Home/HomePage.tsx); cada empresa que ganhar Home propria deixa de usar esta.

import HomePage from '@/pages/Home/HomePage';

export default function DefaultHome() {
  return <HomePage />;
}
