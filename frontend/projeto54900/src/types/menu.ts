// Linhas de temp_nav/temp_menu usadas pelo Navbar dinamico.
// Espelha as tabelas temp_nav (config/branding do app) e temp_menu
// (arvore de itens navegaveis, ligada por temp_nav_id/parent_id).

export type TempMenuStatus = 'draft' | 'active' | 'inactive';

// Destino do item de topo (e de todos os seus filhos): barra superior ou
// painel lateral Offcanvas. Ausente (antes da migration) = 'navbar'.
export type MenuPlacement = 'navbar' | 'offcanvas';

export interface TempNavItem {
  id: number | string;
  title: string;
  status: TempMenuStatus;
}

export interface TempMenuItem {
  id: number | string;
  temp_nav_id: number | string;
  parent_id: number | string | null;
  title: string;
  react_route: string | null;
  icon?: string | null;
  placement?: MenuPlacement;
  is_bookmark?: boolean;
  roles: string[] | null;
  sort_order: number | string;
  status: TempMenuStatus;
}
