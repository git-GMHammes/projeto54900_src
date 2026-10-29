// Home da rota "/" (e "/<slug>"): escolhe a landing page pelo slug da empresa da URL (companySlug).
// Sem slug na URL, ou empresa sem Home propria, usa a Home da `default`. Registro em company/companyHomes.ts.

import { companySlug } from '@/config/env';
import { COMPANY_HOMES, DEFAULT_HOME_SLUG } from '@/pages/Home/company/companyHomes';
import DefaultHome from '@/pages/Home/company/DefaultHome';

export default function CompanyHome() {
  const Home = COMPANY_HOMES[companySlug ?? DEFAULT_HOME_SLUG] ?? COMPANY_HOMES[DEFAULT_HOME_SLUG] ?? DefaultHome;
  return <Home />;
}
