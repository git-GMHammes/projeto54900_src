// Linhas de nav_manager/menu_manager usadas pelo Navbar dinamico.
// Espelha as tabelas nav_manager (config/branding do app) e menu_manager
// (arvore de itens navegaveis, ligada por nav_manager_id/parent_id).

export type MenuManagerStatus = 'draft' | 'active' | 'inactive';

export interface NavManagerItem {
  id: number | string;
  title: string;
  status: MenuManagerStatus;
}

export interface MenuManagerItem {
  id: number | string;
  nav_manager_id: number | string;
  parent_id: number | string | null;
  title: string;
  react_route: string | null;
  roles: string[] | null;
  sort_order: number | string;
  status: MenuManagerStatus;
}
