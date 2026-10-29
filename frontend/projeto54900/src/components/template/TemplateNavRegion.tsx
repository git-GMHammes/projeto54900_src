// Barra de navegacao do template (nav). Marca do app, itens (dropdown quando ha filhos), botao do menu
// lateral (grade de quadradinhos), badge de mensagens nao lidas e, com sessao, o menu do usuario
// (Editar Perfil, Seguranca, Sair). Visitante: so os itens que receber (Home e Entrar).
// Migrado dos templates estaticos (nav) somando o que o Navbar anterior fazia.

import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate } from 'react-router-dom';

import CloseButton from '@/components/template/CloseButton';
import { NAV_NO_BORDER_VARS, regionStyle } from '@/components/template/templateRegionStyle';
import { TEMPLATE_MENU_ID } from '@/components/template/templateNav';
import type { NavEntry } from '@/components/template/templateNav';
import { companySlug, env } from '@/config/env';
import type { ThemePalette } from '@/config/theme';
import { useAuth } from '@/context/AuthContext';
import { useNavScroll } from '@/hooks/useNavScroll';
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

export interface TemplateNavRegionProps {
  entries: NavEntry[];
  /** Mostra o botao da grade que abre o menu lateral (Offcanvas). */
  menuButton: 'none' | 'below-lg' | 'always';
  flat: boolean;
  palette: ThemePalette;
  /** A pagina foi rolada: a barra encolhe e ganha sombra. */
  scrolled: boolean;
  /** Fecha o nav (X no canto direito); o estado fica so em memoria, no TemplateShell. */
  onClose: () => void;
}

export default function TemplateNavRegion({ entries, menuButton, flat, palette, scrolled, onClose }: TemplateNavRegionProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const unread = useUnreadMessages(isAuthenticated && user?.role?.slug !== 'guest');
  const isAdmin = user?.role?.slug === 'admin' || user?.role?.slug === 'superuser';

  // Variante plana (002 e 003): os itens ficam em uma linha e as setas deslizam a lista (mesmo padrao dos modelos).
  const navScroll = useNavScroll(flat);

  // Submenus da variante plana sao controlados pelo React, nao pelo dropdown do Bootstrap: a lista tem
  // overflow-hidden e cortaria o menu. A partir de lg o menu aberto e desenhado (portal) dentro do <nav>,
  // fora da lista, sob o item; abaixo de lg ele fica em fluxo, dentro do item da sanfona.
  const [navEl, setNavEl] = useState<HTMLElement | null>(null);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [isLg, setIsLg] = useState(() => window.matchMedia('(min-width: 992px)').matches);
  const menuLeft = useRef(0);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 992px)');
    const onChange = () => setIsLg(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  // Menu aberto fecha ao clicar fora, Escape, rolar a lista ou redimensionar.
  useEffect(() => {
    if (openKey === null) return;
    const close = () => setOpenKey(null);
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target;
      if (target instanceof Element && (target.closest('[data-tpl-group-toggle]') || target.closest('.tpl-group-menu'))) return;
      close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const list = navScroll.ref.current;
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    list?.addEventListener('scroll', close, { passive: true });
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      list?.removeEventListener('scroll', close);
      window.removeEventListener('resize', close);
    };
  }, [openKey, navScroll.ref]);

  const closeGroup = () => setOpenKey(null);

  const toggleGroup = (e: MouseEvent<HTMLElement>, key: string) => {
    if (openKey === key) {
      setOpenKey(null);
      return;
    }
    if (navEl) menuLeft.current = e.currentTarget.getBoundingClientRect().left - navEl.getBoundingClientRect().left;
    setOpenKey(key);
  };

  /** Posiciona o menu em lg: sob o item, sem passar da largura do nav. */
  const placeMenu = (menu: HTMLUListElement | null) => {
    if (!menu || !navEl) return;
    menu.style.left = `${Math.max(0, Math.min(menuLeft.current, navEl.clientWidth - menu.offsetWidth))}px`;
  };

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

  /** Itens do submenu da variante plana: a rota propria do grupo (se houver) e os filhos. */
  const groupMenuItems = (entry: NavEntry) => (
    <>
      {entry.to && (
        <li>
          <NavLink className="dropdown-item" to={entry.to} end onClick={closeGroup}>
            {entry.label}
          </NavLink>
        </li>
      )}
      {entry.children.map((child) => (
        <li key={child.key}>
          <NavLink className="dropdown-item" to={child.to} end onClick={closeGroup}>
            {child.label}
            {child.to === paths.v1.messageChat.home && <UnreadBadge total={unread} />}
          </NavLink>
        </li>
      ))}
    </>
  );

  const openEntry = entries.find((entry) => entry.key === openKey) ?? null;

  return (
    <nav
      ref={setNavEl}
      className={`tpl-region navbar navbar-expand-lg position-relative text-body ps-3 pe-5 pe-lg-4 ${flat ? 'tpl-blend' : 'bg-body border shadow rounded-4'} ${scrolled ? 'tpl-scrolled py-1 py-lg-2' : 'py-2'}`}
      style={{ ...regionStyle(palette, 'nav', flat), ...(flat ? NAV_NO_BORDER_VARS : {}) }}
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

      {/* minWidth 0 (variante plana): o item flex nao pode ter a largura minima dos itens, senao a lista nunca passa da caixa. */}
      <div className="collapse navbar-collapse" id={NAV_COLLAPSE_ID} style={flat ? { minWidth: 0 } : undefined}>
        {flat && navScroll.overflow && (
          <button
            type="button"
            className="btn btn-sm border-0 text-body fs-5 lh-1 px-1 flex-shrink-0 d-none d-lg-inline-flex"
            aria-label="Rolar nav para a esquerda"
            disabled={navScroll.atStart}
            onClick={() => navScroll.scrollNav('prev')}
          >
            <i className="bi bi-chevron-left" aria-hidden="true" />
          </button>
        )}
        <ul
          ref={navScroll.ref}
          className={`navbar-nav flex-lg-row align-items-lg-center small ${flat ? 'flex-lg-nowrap overflow-hidden ms-lg-auto' : 'ms-auto flex-wrap'}`}
        >
          {entries.map((entry, i) =>
            entry.children.length > 0 && flat ? (
              <li className="tpl-nav-item nav-item flex-shrink-0 text-nowrap d-lg-flex align-items-lg-center" key={entry.key}>
                <button
                  type="button"
                  data-tpl-group-toggle=""
                  className="tpl-nav-link nav-link px-lg-1"
                  aria-haspopup="true"
                  aria-expanded={openKey === entry.key}
                  onClick={(e) => toggleGroup(e, entry.key)}
                >
                  {entry.icon && <i className={`bi bi-${entry.icon} me-1`} aria-hidden="true" />}
                  {entry.label}
                  {hasChatChild(entry) && <UnreadBadge total={unread} />}
                </button>
                {!isLg && openKey === entry.key && <ul className="tpl-group-menu dropdown-menu show">{groupMenuItems(entry)}</ul>}
                {i < entries.length - 1 && <span className="d-none d-lg-inline mx-1 text-body-secondary">|</span>}
              </li>
            ) : entry.children.length > 0 ? (
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
              <li
                className={`tpl-nav-item nav-item d-lg-flex align-items-lg-center ${flat ? 'flex-shrink-0 text-nowrap' : ''}`}
                key={entry.key}
              >
                <NavLink className="tpl-nav-link nav-link px-lg-1" to={entry.to ?? '#'} end>
                  {entry.label}
                </NavLink>
                {i < entries.length - 1 && <span className="d-none d-lg-inline mx-1 text-body-secondary">|</span>}
              </li>
            ),
          )}
        </ul>

        {flat && navScroll.overflow && (
          <button
            type="button"
            className="btn btn-sm border-0 text-body fs-5 lh-1 px-1 flex-shrink-0 d-none d-lg-inline-flex"
            aria-label="Rolar nav para a direita"
            disabled={navScroll.atEnd}
            onClick={() => navScroll.scrollNav('next')}
          >
            <i className="bi bi-chevron-right" aria-hidden="true" />
          </button>
        )}

        {/* Submenu aberto (lg): dentro do nav, fora da lista que rola, para o overflow-hidden nao cortar. */}
        {flat &&
          isLg &&
          openEntry &&
          navEl &&
          createPortal(
            <ul ref={placeMenu} className="tpl-group-menu dropdown-menu show" style={{ top: '100%' }}>
              {groupMenuItems(openEntry)}
            </ul>,
            navEl,
          )}

        {/* Menu do usuario fora da lista que rola: nao e cortado nem some ao deslizar o nav. */}
        {isAuthenticated && user && (
          <ul className="navbar-nav flex-shrink-0 ms-lg-2">
            <li className="nav-item dropdown">
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
          </ul>
        )}
      </div>
      <CloseButton label="Fechar navegação" onClose={onClose} />
    </nav>
  );
}
