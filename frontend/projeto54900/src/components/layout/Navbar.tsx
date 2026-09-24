// Barra de navegacao principal. Links via NavLink (marca .active automaticamente).
// Item com filhos vira dropdown Bootstrap (bootstrap.ts ja carrega o bundle
// com Popper); item sem link proprio e so agrupador (toggle nao navega).
//
// Itens de topo com placement 'offcanvas' (e seus filhos) nao entram na barra:
// vao para o Offcanvas lateral, aberto pelo botao com icone antes do primeiro
// item (Home). Com sessao o botao aparece sempre; sem item offcanvas o painel avisa. Tudo
// acionado por data-attributes do Bootstrap (padrao do projeto — sem API JS).
// Links do painel NAO levam data-bs-dismiss: em <a> o Bootstrap chama
// preventDefault (listener em captura no document, antes do React) e o Link do
// React Router deixa de navegar. Em vez disso o onClick do link aciona o botao
// fechar do painel (closeRef), que mantem o data-bs-dismiss.
//
// Sessao: sem usuario autenticado a barra mostra so GUEST_NAV (Home + Entrar);
// botao e painel do Offcanvas nem entram no DOM e useSiteMenu nao consulta a
// API. Durante o refresh silencioso inicial (bootstrapping) mostra so Home,
// para "Entrar" nao piscar antes da sessao ser restaurada. Com sessao, "Entrar"
// some (inclusive se cadastrado no menu_manager — withoutLogin) e aparece o
// botao "Sair": logout() do AuthContext (revoga no backend + limpeza local) e
// volta para a Home com replace.

import { useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { paths } from '@/routes/paths';
import { useAppConfig } from '@/context/AppConfigContext';
import { useAuth } from '@/context/AuthContext';
import { useSiteMenu } from '@/hooks/useSiteMenu';
import type { SiteMenuItem } from '@/hooks/useSiteMenu';

// Fallback usado enquanto o menu carrega e sempre que nav-manager/menu-manager
// falhar ou vier vazio — garante que a navegacao nunca fica sem itens.
const FALLBACK_NAV: SiteMenuItem[] = [
  { label: 'Home', link: { to: paths.home, label: 'Home', end: true }, children: [] },
];

// Navegacao do visitante sem sessao — nenhum item do menu dinamico aparece.
const GUEST_NAV: SiteMenuItem[] = [
  ...FALLBACK_NAV,
  { label: 'Entrar', link: { to: paths.v1.auth.login, label: 'Entrar', end: true }, children: [] },
];

const OFFCANVAS_ID = 'siteMenuOffcanvas';

// Remove a rota de login (item ou filho) do menu dinamico — com sessao ativa
// "Entrar" nunca aparece, mesmo que esteja cadastrado no menu_manager.
function withoutLogin(items: SiteMenuItem[]): SiteMenuItem[] {
  const login = paths.v1.auth.login;
  return items
    .map((item) => ({
      ...item,
      link: item.link?.to === login ? null : item.link,
      children: item.children.filter((child) => child.to !== login),
    }))
    .filter((item) => item.link !== null || item.children.length > 0);
}

export default function Navbar() {
  const { appName, apiVersion } = useAppConfig();
  const { isAuthenticated, bootstrapping, logout } = useAuth();
  const { menu } = useSiteMenu();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  /** Fecha o Offcanvas pelo botao fechar (data-bs-dismiss) sem bloquear a navegacao do link. */
  const closeOffcanvas = () => closeRef.current?.click();
  const hasMenu = menu !== null && (menu.navbar.length > 0 || menu.offcanvas.length > 0);
  let nav: SiteMenuItem[] = GUEST_NAV;
  if (isAuthenticated) nav = hasMenu ? withoutLogin(menu.navbar) : FALLBACK_NAV;
  else if (bootstrapping) nav = FALLBACK_NAV;
  const offcanvas: SiteMenuItem[] = isAuthenticated && hasMenu ? withoutLogin(menu.offcanvas) : [];

  /** Sair: revoga no backend + limpeza local (AuthContext) e volta para a Home. */
  const handleLogout = async () => {
    setLeaving(true);
    try {
      await logout();
    } finally {
      setLeaving(false);
      void navigate(paths.home, { replace: true });
    }
  };

  return (
    <>
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
              {isAuthenticated && (
                <li className="nav-item">
                  <button
                    type="button"
                    className="nav-link btn btn-link"
                    data-bs-toggle="offcanvas"
                    data-bs-target={`#${OFFCANVAS_ID}`}
                    aria-controls={OFFCANVAS_ID}
                    title="Mais opcoes"
                  >
                    <i className="bi bi-grid-3x3-gap-fill" aria-hidden="true" />
                    <span className="visually-hidden">Mais opcoes</span>
                  </button>
                </li>
              )}
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
              {isAuthenticated && (
                <li className="nav-item">
                  <button
                    type="button"
                    className="nav-link btn btn-link"
                    onClick={() => void handleLogout()}
                    disabled={leaving}
                  >
                    <i className="bi bi-box-arrow-right me-1" aria-hidden="true" />
                    {leaving ? 'Saindo...' : 'Sair'}
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {isAuthenticated && (
        <div className="offcanvas offcanvas-start" tabIndex={-1} id={OFFCANVAS_ID} aria-labelledby={`${OFFCANVAS_ID}Label`}>
          <div className="offcanvas-header border-bottom">
            <h5 className="offcanvas-title" id={`${OFFCANVAS_ID}Label`}>
              {appName}
            </h5>
            <button ref={closeRef} type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Fechar" />
          </div>
          <div className="offcanvas-body p-0">
            {offcanvas.length === 0 && (
              <p className="text-body-secondary small p-3 mb-0">
                Nenhum menu no Offcanvas. Mova um item em Menus pelo icone de Offcanvas.
              </p>
            )}
            <div className="list-group list-group-flush">
              {offcanvas.map((item, index) =>
                item.children.length > 0 ? (
                  <div key={item.label}>
                    <button
                      type="button"
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center fw-semibold"
                      data-bs-toggle="collapse"
                      data-bs-target={`#${OFFCANVAS_ID}Group${index}`}
                      aria-expanded="false"
                      aria-controls={`${OFFCANVAS_ID}Group${index}`}
                    >
                      {item.label}
                      <i className="bi bi-chevron-down small" aria-hidden="true" />
                    </button>
                    <div className="collapse" id={`${OFFCANVAS_ID}Group${index}`}>
                      {item.link && (
                        <NavLink
                          className="list-group-item list-group-item-action ps-4"
                          to={item.link.to}
                          end={item.link.end}
                          onClick={closeOffcanvas}
                        >
                          {item.link.label}
                        </NavLink>
                      )}
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          className="list-group-item list-group-item-action ps-4"
                          to={child.to}
                          end={child.end}
                          onClick={closeOffcanvas}
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ) : (
                  <NavLink
                    key={item.label}
                    className="list-group-item list-group-item-action"
                    to={item.link?.to ?? '#'}
                    end={item.link?.end ?? false}
                    onClick={closeOffcanvas}
                  >
                    {item.label}
                  </NavLink>
                ),
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
