// Barra de navegacao do template (nav). Marca do app, itens (dropdown quando ha filhos), botao do menu
// lateral (grade de quadradinhos), badge de mensagens nao lidas e, com sessao, o menu do usuario
// (Editar Perfil, Seguranca, Sair). Visitante: so os itens que receber (Home e Entrar).
// Migrado dos templates estaticos (nav) somando o que o Navbar anterior fazia.

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { NAV_NO_BORDER_VARS, regionStyle } from '@/components/template/templateRegionStyle';
import { TEMPLATE_MENU_ID } from '@/components/template/templateNav';
import type { NavEntry } from '@/components/template/templateNav';
import { companySlug, env } from '@/config/env';
import type { ThemePalette } from '@/config/theme';
import { useAuth } from '@/context/AuthContext';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { paths } from '@/routes/paths';

const NAV_COLLAPSE_ID = 'tpl-nav';

function UnreadBadge({ total, floating = false }: { total: number; floating?: boolean }) {
  if (total <= 0) return null;

  return (
    <span
      className={`badge rounded-pill text-bg-danger ${floating ? 'position-absolute top-0 start-100 translate-middle' : 'ms-2'}`}
      style={floating ? { fontSize: '0.65rem' } : undefined}
    >
      {total > 99 ? '99+' : total}
      <span className="visually-hidden"> mensagens nao lidas</span>
    </span>
  );
}

/** A marca do app (`navbar-brand`) nao herda a letra da regiao: segue a cor `nav_text` da paleta. */
const brandVars = (palette: ThemePalette) =>
  ({ '--bs-navbar-brand-color': palette.nav_text, '--bs-navbar-brand-hover-color': palette.nav_text }) as CSSProperties;

export interface TemplateNavRegionProps {
  entries: NavEntry[];
  /** Mostra o botao da grade que abre o menu lateral (Offcanvas). */
  menuButton: 'none' | 'below-lg' | 'always';
  flat: boolean;
  palette: ThemePalette;
  /** A pagina foi rolada: a barra encolhe e ganha sombra. */
  scrolled: boolean;
  brandName: string;
  brandVersion: string | null;
}

export default function TemplateNavRegion({
  entries,
  menuButton,
  flat,
  palette,
  scrolled,
  brandName,
  brandVersion,
}: TemplateNavRegionProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const unread = useUnreadMessages(isAuthenticated && user?.role?.slug !== 'guest');
  const isAdmin = user?.role?.slug === 'admin' || user?.role?.slug === 'superuser';

  /** Sair: revoga no backend + limpeza local (AuthContext) e volta para a Home. */
  const handleLogout = async () => {
    setLeaving(true);
    try {
      await logout();
    } finally {
      setLeaving(false);
      // Com slug de empresa na URL, sair volta para a raiz sem slug (navegacao completa).
      if (companySlug) window.location.assign(`${env.basePath}/`);
      else void navigate(paths.home, { replace: true });
    }
  };

  const hasChatChild = (entry: NavEntry) => entry.children.some((c) => c.to === paths.v1.messageChat.home);

  return (
    <nav
      className={`tpl-region navbar navbar-expand-lg position-relative text-body px-3 ${flat ? 'tpl-blend' : 'bg-body border shadow rounded-4'} ${scrolled ? 'tpl-scrolled py-1 py-lg-2' : 'py-2'}`}
      style={{ ...regionStyle(palette, 'nav', flat), ...brandVars(palette), ...(flat ? NAV_NO_BORDER_VARS : {}) }}
    >
      {menuButton !== 'none' && (
        <button
          type="button"
          className={`btn border-0 text-body px-3 py-1 ${menuButton === 'below-lg' ? 'd-lg-none' : ''}`}
          data-bs-toggle="offcanvas"
          data-bs-target={`#${TEMPLATE_MENU_ID}`}
          aria-controls={TEMPLATE_MENU_ID}
          aria-label="Abrir menu"
          title="Mais opções"
        >
          <span className="d-inline-flex align-items-center justify-content-center" style={{ width: '1.5em', height: '1.5em' }}>
            <i className="bi bi-grid-3x3-gap-fill fs-5 lh-1" aria-hidden="true" />
          </span>
        </button>
      )}

      <NavLink className="navbar-brand fw-semibold me-3" to={paths.home}>
        {brandName}
        {brandVersion && <span className="badge text-bg-light ms-2 align-middle">{brandVersion}</span>}
      </NavLink>

      <button
        type="button"
        className="navbar-toggler ms-auto"
        data-bs-toggle="collapse"
        data-bs-target={`#${NAV_COLLAPSE_ID}`}
        aria-controls={NAV_COLLAPSE_ID}
        aria-expanded="false"
        aria-label="Alternar navegação"
      >
        <span className="navbar-toggler-icon" />
      </button>

      <div className="collapse navbar-collapse" id={NAV_COLLAPSE_ID}>
        <ul className="navbar-nav ms-auto flex-lg-row flex-wrap align-items-lg-center small">
          {entries.map((entry, i) =>
            entry.children.length > 0 ? (
              <li className="tpl-nav-item nav-item dropdown position-relative" key={entry.key}>
                {entry.to ? (
                  <NavLink className="tpl-nav-link nav-link dropdown-toggle" to={entry.to} end role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    {entry.icon && <i className={`bi bi-${entry.icon} me-1`} aria-hidden="true" />}
                    {entry.label}
                    {hasChatChild(entry) && <UnreadBadge total={unread} />}
                  </NavLink>
                ) : (
                  <a
                    className="tpl-nav-link nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    onClick={(e) => e.preventDefault()}
                  >
                    {entry.icon && <i className={`bi bi-${entry.icon} me-1`} aria-hidden="true" />}
                    {entry.label}
                    {hasChatChild(entry) && <UnreadBadge total={unread} />}
                  </a>
                )}
                <ul className="dropdown-menu dropdown-menu-end">
                  {entry.children.map((child) => (
                    <li key={child.key}>
                      <NavLink className="dropdown-item" to={child.to} end>
                        {child.label}
                        {child.to === paths.v1.messageChat.home && <UnreadBadge total={unread} />}
                      </NavLink>
                    </li>
                  ))}
                </ul>
                {i < entries.length - 1 && <span className="d-none d-lg-inline mx-1 text-body-secondary">|</span>}
              </li>
            ) : (
              <li className="tpl-nav-item nav-item d-lg-flex align-items-lg-center" key={entry.key}>
                <NavLink className="tpl-nav-link nav-link px-lg-1" to={entry.to ?? '#'} end>
                  {entry.label}
                </NavLink>
                {i < entries.length - 1 && <span className="d-none d-lg-inline mx-1 text-body-secondary">|</span>}
              </li>
            ),
          )}

          {isAuthenticated && user && (
            <li className="nav-item dropdown ms-lg-2">
              <a
                className="nav-link dropdown-toggle d-flex align-items-center gap-1"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                onClick={(e) => e.preventDefault()}
              >
                <i className={`bi bi-person-circle ${isAdmin ? 'text-danger' : 'text-success'}`} aria-hidden="true" />
                {user.username}
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <h6 className="dropdown-header">{user.full_name ?? user.username}</h6>
                </li>
                <li>
                  <span className="dropdown-item-text small text-body-secondary">Empresa: {user.company_slug ?? 'default'}</span>
                </li>
                <li>
                  <NavLink className="dropdown-item" to={paths.v1.account.profile}>
                    Editar Perfil
                  </NavLink>
                </li>
                <li>
                  <NavLink className="dropdown-item" to={paths.v1.account.security}>
                    Segurança
                  </NavLink>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button type="button" className="dropdown-item" onClick={() => void handleLogout()} disabled={leaving}>
                    <i className="bi bi-box-arrow-right me-1" aria-hidden="true" />
                    {leaving ? 'Saindo...' : 'Sair'}
                  </button>
                </li>
              </ul>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
