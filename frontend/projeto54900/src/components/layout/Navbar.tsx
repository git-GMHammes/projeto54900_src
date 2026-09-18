/**
 * =========================================================================
 * FILE HEADER — components/layout/Navbar.tsx
 * =========================================================================
 *
 * PROPOSITO: barra de navegacao principal. Links via NavLink (marca
 * `.active` automaticamente conforme a rota atual). Item com `children`
 * vira dropdown Bootstrap nativo (`data-bs-toggle`, sem JS proprio). O menu
 * e DINAMICO: hooks/useSiteMenu.ts busca o nav-manager ativo e sua arvore
 * de menu-manager; em erro ou lista vazia, cai no FALLBACK_NAV estatico
 * abaixo (que espelha a arvore semeada pelo MenuManagerSeeder).
 *
 * DEPENDENCIAS: routes/paths (todas as URLs, nunca string solta),
 * context/AppConfigContext (appName/apiVersion exibidos na marca) e
 * hooks/useSiteMenu (arvore dinamica de navegacao).
 * CONSUMIDORES: layouts/RootLayout.tsx (montado uma vez, em toda pagina que
 * usa o layout raiz).
 *
 * COMO REAPROVEITAR AO ADICIONAR UM LINK: se o item deve aparecer sempre
 * (mesmo com menu-manager fora do ar), acrescentar em FALLBACK_NAV; para
 * aparecer via banco, cadastrar a linha em menu_manager (ligada a um
 * nav_manager ativo) — nao editar so o fallback esperando que reflita no
 * menu real.
 * -------------------------------------------------------------------------
 */

import { NavLink } from 'react-router-dom';
import { paths } from '@/routes/paths';
import { useAppConfig } from '@/context/AppConfigContext';
import { useSiteMenu } from '@/hooks/useSiteMenu';
import type { SiteMenuLink } from '@/hooks/useSiteMenu';

type NavItem = SiteMenuLink;

// Fallback usado enquanto o menu carrega e sempre que nav-manager/menu-manager
// falhar ou vier vazio — garante que a navegacao nunca fica sem itens. Espelha
// a arvore do MenuManagerSeeder (grupos User/Form com dropdown).
const FALLBACK_NAV: NavItem[] = [
  { to: paths.home, label: 'Inicio', end: true },
  {
    to: '#',
    label: 'User',
    end: false,
    children: [
      { to: paths.v1.user.list, label: 'Usuarios', end: false },
      { to: paths.v1.user.register, label: 'Cadastro', end: false },
    ],
  },
  { to: paths.v1.upload.list, label: 'Upload', end: false },
  {
    to: '#',
    label: 'Form',
    end: false,
    children: [
      { to: paths.v1.form.list, label: 'Formularios', end: false },
      { to: paths.v1.form.render('calendario'), label: 'Calendário', end: false },
    ],
  },
  { to: paths.v1.nav.list, label: 'Nav', end: false },
  { to: paths.v1.menu.list, label: 'Menu', end: false },
  { to: paths.v1.auth.login, label: 'Entrar', end: false },
];

export default function Navbar() {
  const { appName, apiVersion } = useAppConfig();
  const { items } = useSiteMenu();
  const nav: NavItem[] = items && items.length > 0 ? items : FALLBACK_NAV;

  return (
    <nav className="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
      <div className="container">
        <NavLink className="navbar-brand fw-semibold" to={paths.home}>
          {appName}
          <span className="badge text-bg-light ms-2 align-middle">{apiVersion}</span>
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Alternar navegacao"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav ms-auto">
            {nav.map((item) =>
              item.children && item.children.length > 0 ? (
                <li className="nav-item dropdown" key={item.label}>
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {item.label}
                  </a>
                  <ul className="dropdown-menu">
                    {item.children.map((child) => (
                      <li key={child.to}>
                        <NavLink className="dropdown-item" to={child.to} end={child.end}>
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li className="nav-item" key={item.to}>
                  <NavLink className="nav-link" to={item.to} end={item.end}>
                    {item.label}
                  </NavLink>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
