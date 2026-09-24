// Busca o nav_manager ativo e seus itens do navbar principal para popular o
// Navbar dinamicamente. menu_manager guarda TODAS as rotas do site (inclusive
// sub-rotas de CRUD como /v1/user-manager/create) na mesma tabela, sem campo
// dedicado para "aparece no navbar" — a convencao adotada e sort_order: itens
// do navbar principal ficam abaixo de NAVBAR_SORT_ORDER_LIMIT, o restante do
// catalogo de rotas fica em sort_order >= 1000.
//
// Hierarquia: um item de topo (parent_id null) pode ter filhos (parent_id =
// id do pai) — vira dropdown no Navbar. Um item de topo sem react_route
// propria (organizacional, so agrupa filhos) tambem vira dropdown, so que sem
// link no proprio toggle. Enforcement de roles fica fora desta fase — ver
// src/frontend/projeto54900/CLAUDE.md.
//
// Destino (placement): so o item de topo decide — 'navbar' (barra superior) ou
// 'offcanvas' (painel lateral aberto pelo botao antes de Home). Os filhos
// seguem o pai; o placement gravado num filho e ignorado. Sem a coluna (antes
// da migration) tudo cai em 'navbar'.
//
// Em erro, `menu` volta null; com lista vazia, as duas listas vem vazias. Nos
// dois casos o Navbar usa o fallback estatico (FALLBACK_NAV).
//
// Sessao: o menu so e buscado com usuario autenticado. Sem sessao nenhuma
// chamada a nav-manager/menu-manager sai daqui e `menu` fica null; ao deslogar,
// o menu carregado e descartado (reset). O Navbar anonimo usa GUEST_NAV.

const NAVBAR_SORT_ORDER_LIMIT = 100;

import { useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import type { UseApiResult } from '@/hooks/useApi';
import { navManagerTable } from '@/services/v1/navManager.table';
import { menuManagerTable } from '@/services/v1/menuManager.table';
import { normalizeList } from '@/utils/apiResult';
import type { MenuManagerItem, NavManagerItem } from '@/types/menu';

export interface SiteMenuLink {
  to: string;
  label: string;
  end: boolean;
}

export interface SiteMenuItem {
  label: string;
  link: SiteMenuLink | null;
  children: SiteMenuLink[];
}

export interface SiteMenu {
  navbar: SiteMenuItem[];
  offcanvas: SiteMenuItem[];
}

function toLink(item: MenuManagerItem): SiteMenuLink | null {
  if (!item.react_route) return null;
  // end: true sempre — cada item aponta pra uma pagina distinta (nao um layout
  // pai), entao so deve marcar .active na rota exata. Sem isso, "/v1/user-manager"
  // (Listar) ficava marcado ativo tambem em "/v1/user-manager/create".
  return { to: item.react_route, label: item.title, end: true };
}

async function fetchSiteMenu(signal: AbortSignal): Promise<SiteMenu> {
  const navPayload = await navManagerTable.find({ status: 'active' }, { limit: 1 }, { signal });
  const { rows: navRows } = normalizeList<NavManagerItem>(navPayload);
  const nav = navRows[0];
  if (!nav) return { navbar: [], offcanvas: [] };

  const menuPayload = await menuManagerTable.find(
    { nav_manager_id: nav.id, status: 'active' },
    { limit: 100 },
    { signal },
  );
  const { rows: menuRows } = normalizeList<MenuManagerItem>(menuPayload);

  const byParent = new Map<string, MenuManagerItem[]>();
  for (const item of menuRows) {
    if (item.parent_id === null) continue;
    const key = String(item.parent_id);
    (byParent.get(key) ?? byParent.set(key, []).get(key)!).push(item);
  }

  const roots = menuRows
    .filter((item) => item.parent_id === null && Number(item.sort_order) < NAVBAR_SORT_ORDER_LIMIT)
    .sort((a, b) => Number(a.sort_order) - Number(b.sort_order));

  const build = (items: MenuManagerItem[]): SiteMenuItem[] =>
    items
      .map((item) => {
        const children = (byParent.get(String(item.id)) ?? [])
          .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
          .map(toLink)
          .filter((link): link is SiteMenuLink => link !== null);
        return { label: item.title, link: toLink(item), children };
      })
      .filter((item) => item.link !== null || item.children.length > 0);

  return {
    navbar: build(roots.filter((item) => item.placement !== 'offcanvas')),
    offcanvas: build(roots.filter((item) => item.placement === 'offcanvas')),
  };
}

export interface UseSiteMenuResult {
  menu: SiteMenu | null;
  loading: boolean;
}

export function useSiteMenu(): UseSiteMenuResult {
  const { isAuthenticated } = useAuth();
  const { data, loading, error, run, reset }: UseApiResult<SiteMenu> = useApi(fetchSiteMenu);

  useEffect(() => {
    if (isAuthenticated) void run();
    else reset();
  }, [isAuthenticated, run, reset]);

  return { menu: error ? null : data, loading };
}
