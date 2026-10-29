// Registro das Homes (landing pages) por empresa: slug da empresa -> componente da Home.
// Empresa sem entrada usa a `default` (ver pages/Home/CompanyHome.tsx).
//
// Para criar a Home de uma empresa: criar `pages/Home/company/<Slug>Home.tsx` e acrescentar uma linha
// aqui, com o slug exatamente como esta em company_manager.slug (ex.: tryikads: TryikadsHome).

import type { ComponentType } from 'react';

import DefaultHome from '@/pages/Home/company/DefaultHome';
import TryikadsHome from '@/pages/Home/company/TryikadsHome';

export const COMPANY_HOMES: Readonly<Record<string, ComponentType>> = {
  default: DefaultHome,
  tryikads: TryikadsHome,
};

/** Slug usado quando a URL nao traz empresa e como Home de quem nao tem a propria. */
export const DEFAULT_HOME_SLUG = 'default';
