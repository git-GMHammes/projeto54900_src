// Barra de navegacao principal. Links via NavLink (marca .active automaticamente).
// Item com filhos vira dropdown Bootstrap (bootstrap.ts ja carrega o bundle
// com Popper); item sem link proprio e so agrupador (toggle nao navega).

import { NavLink } from 'react-router-dom';
import { paths } from '@/routes/paths';
import { useAppConfig } from '@/context/AppConfigContext';
import { useSiteMenu } from '@/hooks/useSiteMenu';
import type { SiteMenuItem } from '@/hooks/useSiteMenu';

// Fallback usado enquanto o menu carrega e sempre que nav-manager/menu-manager
// falhar ou vier vazio — garante que a navegacao nunca fica sem itens.
const FALLBACK_NAV: SiteMenuItem[] = [
  { label: 'Home', link: { to: paths.home, label: 'Home', end: true }, children: [] },
];

export default function Navbar() {
  const { appName, apiVersion } = useAppConfig();
  const { items } = useSiteMenu();
  const nav: SiteMenuItem[] = items && items.length > 0 ? items : FALLBACK_NAV;

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
              item.children.length > 0 ? (
                <li className="nav-item dropdown" key={item.label}>
                  {item.link ? (
                    <NavLink
                      className="nav-link dropdown-toggle"
                      to={item.link.to}
                      end={item.link.end}
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      {item.label}
                    </NavLink>
                  ) : (
                    <a
                      className="nav-link dropdown-toggle"
                      href="#"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      onClick={(e) => e.preventDefault()}
                    >
                      {item.label}
                    </a>
                  )}
                  <ul className="dropdown-menu dropdown-menu-end">
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
                <li className="nav-item" key={item.label}>
                  <NavLink className="nav-link" to={item.link?.to ?? '#'} end={item.link?.end ?? false}>
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
