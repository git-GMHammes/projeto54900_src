// Registro das Homes (landing pages) por empresa: slug da empresa -> componente da Home.
// Empresa sem entrada usa a `default` (ver pages/Home/CompanyHome.tsx).
//
// Para criar a Home de uma empresa: criar `pages/Home/company/<Slug>Home.tsx` e acrescentar uma linha
// aqui, com o slug exatamente como esta em company_manager.slug (ex.: tryikads: TryikadsHome).

import type { ComponentType } from 'react';

import DefaultHome from '@/pages/Home/company/DefaultHome';
import HelcioAngelo70222Home from '@/pages/Home/company/HelcioAngelo70222Home';
import IsquierdoHome from '@/pages/Home/company/IsquierdoHome';
import Menezes22001Home from '@/pages/Home/company/Menezes22001Home';
import PaesHome from '@/pages/Home/company/PaesHome';
import TryikadsHome from '@/pages/Home/company/TryikadsHome';

export const COMPANY_HOMES: Readonly<Record<string, ComponentType>> = {
  default: DefaultHome,
  tryikads: TryikadsHome,
  menezes22001: Menezes22001Home,
  'helcio-angelo-70222': HelcioAngelo70222Home,
  paes55: PaesHome,
  isquierdo22077: IsquierdoHome,
};

/** Slug usado quando a URL nao traz empresa e como Home de quem nao tem a propria. */
export const DEFAULT_HOME_SLUG = 'default';
