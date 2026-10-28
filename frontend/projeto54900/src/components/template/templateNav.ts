// Itens de navegacao do template: converte a arvore de template-render (nav/menu) no formato que o
// nav e o menu lateral desenham. Regras herdadas do Navbar anterior (hooks/useSiteMenu.ts):
//  - item sem rota e sem filhos com rota nao aparece;
//  - o filho e sempre um link (um nivel de submenu);
//  - a rota de login some do nivel raiz para quem ja esta logado.

import { paths } from '@/routes/paths';
import type { TemplateMenuItem } from '@/types/template';

/** Id do painel do menu lateral (alvo do botao da grade no nav). */
export const TEMPLATE_MENU_ID = 'tpl-menu';

export interface NavLinkEntry {
  key: string;
  label: string;
  to: string;
}

export interface NavEntry {
  key: string;
  label: string;
  /** Rota propria do item; null = item so agrupador (nao navega). */
  to: string | null;
  /** Nome do icone Bootstrap, sem `bi-`. */
  icon: string | null;
  children: NavLinkEntry[];
}

export function toNavEntries(items: readonly TemplateMenuItem[]): NavEntry[] {
  const entries: NavEntry[] = [];

  for (const item of items) {
    if (item.url === paths.v1.auth.login) continue;

    const children: NavLinkEntry[] = item.children
      .filter((child): child is TemplateMenuItem & { url: string } => child.url !== null)
      .map((child) => ({ key: String(child.id), label: child.label, to: child.url }));

    if (item.url === null && children.length === 0) continue;

    entries.push({ key: String(item.id), label: item.label, to: item.url, icon: item.icon, children });
  }

  return entries;
}

/** Navegacao do visitante: so Home e Entrar. */
export const GUEST_ENTRIES: NavEntry[] = [
  { key: 'home', label: 'Home', to: paths.home, icon: null, children: [] },
  { key: 'login', label: 'Entrar', to: paths.v1.auth.login, icon: null, children: [] },
];

/** So Home: durante a restauracao da sessao (para "Entrar" nao piscar) e quando o template nao carrega. */
export const HOME_ONLY_ENTRIES: NavEntry[] = GUEST_ENTRIES.slice(0, 1);
