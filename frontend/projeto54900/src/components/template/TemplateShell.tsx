// Casca global do template: UM codigo que reune os componentes do modelo — cabecalho(s), nav, menu lateral
// (coluna ou Offcanvas), conteudo e rodape(s) — para as tres variantes (template001, 002 e 003). Migrada dos
// templates estaticos (pages/Template00XPage.tsx, que continuam intactos), usando a copia global dos efeitos
// (styles/_template-global.scss, hooks/template/*, components/template/CloseButton).
//
// Dois modos, pelo estado da sessao:
//   visitante (sem login): nav so com Home e Entrar e conteudo; cabecalho(s) e rodape(s) da empresa do slug da URL
//     (template-public/get/{slug}) ou, sem eles, o rodape simples; sem menu lateral;
//   com sessao: nav, menu lateral, cabecalho(s) e rodape(s) do template (dados de template-render/get).
// Todas as cores vem da paleta do env (config/theme.ts): degrade da pagina e cores de cada regiao.

import type { ReactNode } from 'react';

import ApiDebugPanel from '@/components/global/ApiDebugPanel';
import BookmarksBar from '@/components/layout/BookmarksBar';
import TemplateFooterRegion from '@/components/template/TemplateFooterRegion';
import TemplateHeaderRegion from '@/components/template/TemplateHeaderRegion';
import TemplateNavRegion from '@/components/template/TemplateNavRegion';
import TemplateSideMenu from '@/components/template/TemplateSideMenu';
import { TemplatePaletteProvider } from '@/components/template/ThemePortal';
import { GUEST_ENTRIES, HOME_ONLY_ENTRIES, TEMPLATE_MENU_ID, toNavEntries } from '@/components/template/templateNav';
import { regionStyle } from '@/components/template/templateRegionStyle';
import type { TemplateVariant } from '@/components/template/templateVariants';
import { env } from '@/config/env';
import { getPalette, paletteToCssVars } from '@/config/theme';
import { useAppConfig } from '@/context/AppConfigContext';
import { useAuth } from '@/context/AuthContext';
import { useClosableRegions } from '@/hooks/template/useClosableRegions';
import { useReveal } from '@/hooks/template/useReveal';
import { useScrolled } from '@/hooks/template/useScrolled';
import type { TemplateRenderData } from '@/types/template';

export interface TemplateShellProps {
  variant: TemplateVariant;
  /** Dados do template da sessao; null = visitante ou template indisponivel. */
  data: TemplateRenderData | null;
  children: ReactNode;
}

export default function TemplateShell({ variant, data, children }: TemplateShellProps) {
  const { isAuthenticated, bootstrapping } = useAuth();
  const { appName } = useAppConfig();
  // Paleta: a do env, quando fixada; senao a color_theme da empresa (slug da URL ou da sessao); senao a padrao.
  const palette = getPalette(env.theme ?? data?.color_theme ?? null);
  const rootRef = useReveal<HTMLDivElement>();
  const scrolled = useScrolled(16);
  const { close, isOpen, isClosing, collapsibleClass } = useClosableRegions<string>();

  const { flat, offcanvasOnly } = variant;

  let navEntries = GUEST_ENTRIES;
  if (bootstrapping) navEntries = HOME_ONLY_ENTRIES;
  else if (isAuthenticated) navEntries = data ? toNavEntries(data.nav) : HOME_ONLY_ENTRIES;

  const menuEntries = isAuthenticated && data ? toNavEntries(data.menu) : [];
  // Cabecalhos e rodapes vem de `data` nos dois modos: da sessao (logado) ou da empresa do slug (visitante).
  const headers = data ? data.headers : [];
  const footers = data ? data.footers : [];

  // Nome do app: so titulo do menu lateral/Offcanvas (o nav nao mostra marca nem versao).
  const brandName = data?.temp_nav?.title || appName;

  // Regioes que o X fecha (so em memoria, sem desfazer): cabecalho(s), nav, menu lateral e rodape(s).
  // O menu lateral so existe com sessao; no 003 (Offcanvas) nao ha coluna nem X permanente.
  const navOpen = isOpen('nav');
  const menuOpen = isAuthenticated && (offcanvasOnly || isOpen('menu'));
  const menuButton = menuOpen ? (offcanvasOnly ? 'always' : 'below-lg') : 'none';
  const withColumn = menuOpen && !offcanvasOnly;
  // Nav fechado e menu aberto: barra minima so com o icone da grade (no 001 e 002 so abaixo de lg).
  const showMenuBar = !navOpen && menuOpen;

  return (
    <TemplatePaletteProvider palette={palette}>
    <div
      ref={rootRef}
      className={`tpl-app ${flat ? 'tpl-flat' : 'p-1'} min-vh-100 d-flex`}
      data-bs-theme={palette.mode}
      style={paletteToCssVars(palette)}
    >
      <div className={`w-100 d-flex flex-column ${flat ? '' : 'gap-2'}`}>
        {headers.map((header) => {
          const key = `header-${header.id}`;
          return isOpen(key) ? (
            <TemplateHeaderRegion
              key={key}
              header={header}
              flat={flat}
              palette={palette}
              collapsibleClass={collapsibleClass(key)}
              onClose={() => close(key)}
            />
          ) : null;
        })}

        {(navOpen || showMenuBar) && (
          <div
            className={`tpl-sticky sticky-top bg-body d-flex flex-column ${flat ? '' : 'gap-2'} ${navOpen || offcanvasOnly ? '' : 'd-lg-none'}`}
          >
            {navOpen ? (
              <div className={collapsibleClass('nav')}>
                {/* minWidth 0: o item do grid nao pode ter a largura minima dos itens do nav (senao a pagina estoura). */}
                <div className="tpl-collapsible-inner" style={{ minWidth: 0 }}>
                  <TemplateNavRegion
                    entries={navEntries}
                    menuButton={menuButton}
                    flat={flat}
                    palette={palette}
                    scrolled={scrolled}
                    onClose={() => close('nav')}
                  />
                </div>
              </div>
            ) : (
              <div
                className={`d-flex ${offcanvasOnly ? 'justify-content-start' : 'justify-content-end'} text-body px-3 py-1 ${flat ? 'tpl-blend' : 'tpl-region bg-body border shadow rounded-4'}`}
                style={regionStyle(palette, 'menu', flat)}
              >
                <button
                  type="button"
                  className="btn btn-sm border-0 text-body fs-5 lh-1"
                  data-bs-toggle="offcanvas"
                  data-bs-target={`#${TEMPLATE_MENU_ID}`}
                  aria-controls={TEMPLATE_MENU_ID}
                  aria-label="Abrir menu"
                >
                  <i className="bi bi-grid-3x3-gap-fill" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        )}

        {menuOpen && offcanvasOnly && (
          <TemplateSideMenu entries={menuEntries} mode="offcanvas" flat={flat} palette={palette} title={brandName} />
        )}

        <div className={`row ${flat ? 'g-0' : 'g-2'} flex-grow-1`}>
          {withColumn && (
            <TemplateSideMenu
              entries={menuEntries}
              mode="column"
              flat={flat}
              palette={palette}
              title={brandName}
              closing={isClosing('menu')}
              onClose={() => close('menu')}
            />
          )}
          <main className={withColumn ? 'col-12 col-lg-9 col-xxl-10' : 'col-12'}>
            <div
              className={`tpl-region text-body p-3 p-md-4 h-100 ${flat ? 'tpl-blend' : 'bg-body border shadow rounded-5'}`}
              style={regionStyle(palette, 'content', flat)}
            >
              {isAuthenticated && <BookmarksBar />}
              {children}
              <ApiDebugPanel />
            </div>
          </main>
        </div>

        {footers.length === 0 ? (
          <TemplateFooterRegion footer={null} flat={flat} palette={palette} collapsibleClass="" onClose={() => undefined} />
        ) : (
          footers.map((footer) => {
            const key = `footer-${footer.id}`;
            return isOpen(key) ? (
              <TemplateFooterRegion
                key={key}
                footer={footer}
                flat={flat}
                palette={palette}
                collapsibleClass={collapsibleClass(key)}
                onClose={() => close(key)}
              />
            ) : null;
          })
        )}
      </div>
    </div>
    </TemplatePaletteProvider>
  );
}
