// Menu lateral do template: itens de temp_menu com placement 'offcanvas' (grupos recolhiveis quando ha
// filhos). Duas formas, as mesmas dos modelos estaticos:
//   mode 'column'    (template001 e 002) coluna fixa a partir de lg e painel (offcanvas-lg) abaixo de lg;
//   mode 'offcanvas' (template003)       sempre painel Offcanvas, sem coluna, aberto pelo botao da grade no nav.
// O Offcanvas e o menu lateral quando o template exige esse tipo de menu (README_menu.md).
// Acionado por data-attributes do Bootstrap (padrao do projeto); clicar num link fecha o painel pelo
// botao fechar (closeRef), sem bloquear a navegacao do Link.

import { useRef } from 'react';
import { NavLink } from 'react-router-dom';

import CloseButton from '@/components/template/CloseButton';
import { TEMPLATE_MENU_ID } from '@/components/template/templateNav';
import { OFFCANVAS_NO_BORDER_VARS, regionStyle } from '@/components/template/templateRegionStyle';
import type { NavEntry } from '@/components/template/templateNav';
import type { ThemePalette } from '@/config/theme';

function MenuList({ entries, onNavigate }: { entries: NavEntry[]; onNavigate: () => void }) {
  if (entries.length === 0) {
    return <p className="small p-3 mb-0 opacity-75">Nenhum item no menu lateral.</p>;
  }

  return (
    <ul className="list-unstyled mb-0">
      {entries.map((entry, index) => {
        const groupId = `${TEMPLATE_MENU_ID}-group-${index}`;

        if (entry.children.length === 0) {
          return (
            <li key={entry.key} className="tpl-menu-item small">
              <NavLink className="tpl-menu-link d-block text-decoration-none px-3 py-2" to={entry.to ?? '#'} end onClick={onNavigate}>
                {entry.icon && <i className={`bi bi-${entry.icon} me-2`} aria-hidden="true" />}
                {entry.label}
              </NavLink>
            </li>
          );
        }

        return (
          <li key={entry.key} className="tpl-menu-item small">
            <button
              type="button"
              className="tpl-menu-link btn border-0 rounded-0 text-body fw-semibold w-100 d-flex justify-content-between align-items-center px-3 py-2"
              data-bs-toggle="collapse"
              data-bs-target={`#${groupId}`}
              aria-expanded="false"
              aria-controls={groupId}
            >
              <span>
                {entry.icon && <i className={`bi bi-${entry.icon} me-2`} aria-hidden="true" />}
                {entry.label}
              </span>
              <i className="bi bi-chevron-down small" aria-hidden="true" />
            </button>
            <div className="collapse" id={groupId}>
              {entry.to && (
                <NavLink className="tpl-menu-link d-block text-decoration-none ps-4 pe-3 py-2" to={entry.to} end onClick={onNavigate}>
                  {entry.label}
                </NavLink>
              )}
              {entry.children.map((child) => (
                <NavLink key={child.key} className="tpl-menu-link d-block text-decoration-none ps-4 pe-3 py-2" to={child.to} end onClick={onNavigate}>
                  {child.label}
                </NavLink>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export interface TemplateSideMenuProps {
  entries: NavEntry[];
  mode: 'column' | 'offcanvas';
  flat: boolean;
  palette: ThemePalette;
  title: string;
  /** Modo coluna: o X esta fechando a coluna (so desvanece; a largura nao anima). */
  closing?: boolean;
  /** Modo coluna: fecha a coluna pelo X (a partir de lg). No modo Offcanvas nao ha X permanente. */
  onClose?: () => void;
}

export default function TemplateSideMenu({ entries, mode, flat, palette, title, closing = false, onClose }: TemplateSideMenuProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const closePanel = () => closeRef.current?.click();
  const labelId = `${TEMPLATE_MENU_ID}-title`;

  if (mode === 'offcanvas') {
    return (
      <div
        className="offcanvas offcanvas-start tpl-blend text-body"
        tabIndex={-1}
        id={TEMPLATE_MENU_ID}
        aria-labelledby={labelId}
        style={{ ...regionStyle(palette, 'menu', true), ...OFFCANVAS_NO_BORDER_VARS }}
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id={labelId}>
            {title}
          </h5>
          <button ref={closeRef} type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Fechar" />
        </div>
        <div className="offcanvas-body p-0">
          <MenuList entries={entries} onNavigate={closePanel} />
        </div>
      </div>
    );
  }

  return (
    <aside
      className={`col-12 col-lg-3 col-xxl-2 position-relative ${closing ? 'tpl-fade-out' : ''}`}
      style={flat ? { ...regionStyle(palette, 'menu', flat), ...OFFCANVAS_NO_BORDER_VARS } : regionStyle(palette, 'menu', flat)}
    >
      <div className="offcanvas-lg offcanvas-start h-100" tabIndex={-1} id={TEMPLATE_MENU_ID} aria-labelledby={labelId}>
        <div className="offcanvas-header d-lg-none">
          <h5 className="offcanvas-title" id={labelId}>
            {title}
          </h5>
          <button ref={closeRef} type="button" className="btn-close" data-bs-dismiss="offcanvas" data-bs-target={`#${TEMPLATE_MENU_ID}`} aria-label="Fechar" />
        </div>
        <div className="offcanvas-body h-100 p-lg-0">
          <div
            className={`tpl-region text-body w-100 h-100 py-2 ${flat ? 'tpl-blend' : 'bg-body border shadow rounded-4'}`}
          >
            <MenuList entries={entries} onNavigate={closePanel} />
          </div>
        </div>
      </div>
      {/* No celular o painel ja tem o proprio botao fechar; o X permanente e so da coluna (a partir de lg). */}
      {onClose && <CloseButton label="Fechar menu lateral" onClose={onClose} className="d-none d-lg-block" />}
    </aside>
  );
}
