// Barra de navegacao principal. Links via NavLink (marca .active automaticamente).

import { NavLink } from 'react-router-dom';
import { paths } from '@/routes/paths';
import { useAppConfig } from '@/context/AppConfigContext';
import { useSiteMenu } from '@/hooks/useSiteMenu';

interface NavItem {
  to: string;
  label: string;
  end: boolean;
}

// Fallback usado enquanto o menu carrega e sempre que nav-manager/menu-manager
// falhar ou vier vazio — garante que a navegacao nunca fica sem itens.
const FALLBACK_NAV: NavItem[] = [
  { to: paths.home, label: 'Inicio', end: true },
  { to: paths.v1.user.list, label: 'Usuarios', end: false },
  { to: paths.v1.upload.list, label: 'Uploads', end: false },
  { to: paths.v1.form.list, label: 'Formularios', end: false },
  { to: paths.v1.nav.list, label: 'Nav', end: false },
  { to: paths.v1.menu.list, label: 'Menus', end: false },
  { to: paths.v1.form.render('calendario'), label: 'Google Calendars', end: false },
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
            {nav.map((item) => (
              <li className="nav-item" key={item.to}>
                <NavLink className="nav-link" to={item.to} end={item.end}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
