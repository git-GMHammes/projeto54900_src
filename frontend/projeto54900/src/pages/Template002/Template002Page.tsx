/**
 * =========================================================================
 * FILE HEADER — pages/Template002/Template002Page.tsx
 * =========================================================================
 *
 * O QUE FAZ: variante do Template001 SEM BORDAS. Mesmos componentes (cabeçalho,
 * nav, menu lateral, conteúdo e rodapé), mesmas animações, mesmo JSON de
 * conteúdo (`template002.json`, cópia do contrato do 001) e mesmos JSONs de
 * paleta. A diferença é visual: os blocos ficam encostados, sem borda, sombra,
 * canto arredondado nem margem, e o fundo de cada região é um degradê vertical
 * que se mistura com a região vizinha (`sectionBlendCssVars`), para o conjunto
 * parecer contínuo.
 *
 * PALETA: usa as mesmas 24 chaves; as chaves de borda (`<região>_border`,
 * `border_*`) ficam no contrato e são ignoradas aqui. Fundo, letra e degradê da
 * página vêm de `config/theme.ts`.
 *
 * RESPONSIVO: ocupa a tela toda. Abaixo de `lg` a navegação vira sanfona, o menu
 * lateral vira painel (offcanvas) pela esquerda e as duas barras ficam fixas no
 * topo; conteúdo e rodapé empilham. Em telas ≥1920px a fonte base cresce
 * (`styles/_custom.scss`).
 *
 * FECHAR REGIÕES: cabeçalho, nav, menu lateral e rodapé têm um X discreto no
 * canto superior direito. Oculta a região (as demais ocupam o espaço) e não tem
 * desfazer: o estado fica só em memória, então recarregar a página restaura.
 *
 * DEPENDÊNCIAS:
 *   - `./template002.json` — dados estáticos (header, nav, menu,
 *     content_headings, footer).
 *   - `@/config/env` (`env.basePath`) — prefixo público de `public/img/template002/`.
 *   - `@/config/theme` — paleta ativa, variáveis CSS e degradê por região.
 *   - `@/hooks/useReveal`, `@/hooks/useScrolled` — animações ao rolar.
 *   - `styles/_animations.scss` — animações, escopo `.template001`/`.template002`.
 *
 * CONSUMIDOR: `routes/template002.routes.tsx` (rota `/template002`).
 *
 * REGRAS DE MANUTENÇÃO:
 *   1. Para trocar a fonte dos dados, substituir só o `import` do JSON por uma
 *      chamada de API que devolva o mesmo formato (`Template002Data`).
 *   2. `header.logo[].position`: `left`, `center` ou `right`. Com `image_url`
 *      preenchida a imagem substitui o texto.
 *   3. Itens sempre ordenados por `order`; o conteúdo é agrupado por `row` e
 *      ordenado por `column`, e a quantidade de colunas da linha vem de
 *      `columns_in_row`.
 * -------------------------------------------------------------------------
 */

import { useState } from 'react';
import { env } from '@/config/env';
import { getPalette, paletteToCssVars, sectionBlendCssVars, sectionCssVars } from '@/config/theme';
import type { ThemePalette, ThemeSection } from '@/config/theme';
import { useReveal } from '@/hooks/useReveal';
import { useScrolled } from '@/hooks/useScrolled';
import template002Json from './template002.json';

interface LogoItem {
  id: number;
  position: string;
  text: string;
  image_url: string;
  alt: string;
}

interface NavItem {
  id: number;
  order: number;
  label: string;
  url: string;
  type: string;
}

interface MenuItem {
  id: number;
  order: number;
  label: string;
  url: string;
}

interface HeadingItem {
  id: number;
  order: number;
  title: string;
  text: string;
}

interface ContentHeadingItem extends HeadingItem {
  row: number;
  column: number;
  columns_in_row: number;
}

interface FooterHeadingItem extends HeadingItem {
  column: number;
}

interface ImageItem {
  id: number;
  url: string;
  alt: string;
}

interface FooterImageItem extends ImageItem {
  order: number;
  column: number;
}

interface CompanyNameItem {
  id: number;
  text: string;
}

interface Template002Data {
  template: { id: string; source: string };
  header: {
    background_image: ImageItem[];
    logo: LogoItem[];
    company_name: CompanyNameItem[];
  };
  nav: NavItem[];
  menu: MenuItem[];
  content_headings: ContentHeadingItem[];
  footer: {
    footer_headings: FooterHeadingItem[];
    footer_images: FooterImageItem[];
  };
}

/** Regiões que o usuário pode ocultar (o conteúdo não tem botão fechar). */
type ClosableSection = 'header' | 'nav' | 'menu' | 'footer';

/** Duração da animação de fechar (ms); precisa coincidir com `.tpl-collapsible` em `_animations.scss`. */
const CLOSE_ANIMATION_MS = 350;

const data: Template002Data = template002Json;

/** Monta a URL pública de um arquivo de `public/` a partir do caminho do JSON. */
const assetUrl = (path: string): string => `${env.basePath}/${path}`;

/** Alinhamento horizontal da logomarca conforme `position` do JSON. */
const LOGO_ALIGNMENT: Record<string, string> = {
  left: 'justify-content-start',
  center: 'justify-content-center',
  right: 'justify-content-end',
};

/** Agrupa os itens de conteúdo por linha, com as colunas ordenadas. */
function groupByRow(items: ContentHeadingItem[]): ContentHeadingItem[][] {
  const rows = new Map<number, ContentHeadingItem[]>();
  for (const item of items) {
    const row = rows.get(item.row) ?? [];
    row.push(item);
    rows.set(item.row, row);
  }
  return [...rows.entries()].sort(([a], [b]) => a - b).map(([, columns]) => columns.sort((a, b) => a.column - b.column));
}

function Heading({ title, text }: HeadingItem) {
  return (
    <>
      <h1 className="h4 fw-bold">{title}</h1>
      <p className="small mb-0">{text}</p>
    </>
  );
}

interface CloseButtonProps {
  label: string;
  onClose: () => void;
  className?: string;
}

/**
 * Botão X pequeno e discreto (meia opacidade), no canto superior direito da
 * região mais próxima com `position-relative`. Herda a cor da letra da região.
 */
function CloseButton({ label, onClose, className = '' }: CloseButtonProps) {
  return (
    <button
      type="button"
      className={`btn btn-sm border-0 px-1 py-0 lh-1 text-body opacity-50 position-absolute top-0 end-0 m-1 z-1 ${className}`}
      aria-label={label}
      title={label}
      onClick={onClose}
    >
      <i className="bi bi-x small" />
    </button>
  );
}

/** O Bootstrap desenha contorno nos botões da navbar e uma linha no painel offcanvas; aqui não há bordas. */
const NAV_NO_BORDER_VARS: Record<string, string> = { '--bs-navbar-toggler-border-color': 'transparent' };
const OFFCANVAS_NO_BORDER_VARS: Record<string, string> = { '--bs-offcanvas-border-width': '0' };

/** Variáveis de uma região: cores do tema (fundo, letra) mais o degradê com as vizinhas. */
const regionStyle = (palette: ThemePalette, section: ThemeSection) => ({
  ...sectionCssVars(palette, section),
  ...sectionBlendCssVars(palette, section),
});

export default function Template002Page() {
  const { header, nav, menu, content_headings, footer } = data;

  const palette = getPalette();
  const rootRef = useReveal<HTMLDivElement>();
  const scrolled = useScrolled(16);

  // Fechar em duas etapas: `closing` dispara a animação; `closed` retira a região da tela.
  const [closing, setClosing] = useState<ReadonlySet<ClosableSection>>(new Set());
  const [closed, setClosed] = useState<ReadonlySet<ClosableSection>>(new Set());
  const close = (section: ClosableSection) => {
    setClosing((prev) => new Set(prev).add(section));
    window.setTimeout(() => setClosed((prev) => new Set(prev).add(section)), CLOSE_ANIMATION_MS);
  };
  const collapsibleClass = (section: ClosableSection) =>
    `tpl-collapsible ${closing.has(section) ? 'tpl-closing' : ''}`;

  const headerOpen = !closed.has('header');
  const navOpen = !closed.has('nav');
  const menuOpen = !closed.has('menu');
  const footerOpen = !closed.has('footer');

  const backgroundImage = header.background_image[0];
  const navItems = [...nav].sort((a, b) => a.order - b.order);
  const menuItems = [...menu].sort((a, b) => a.order - b.order);
  const contentRows = groupByRow(content_headings);

  // Rodapé: textos e imagem ocupam colunas numeradas na mesma sequência.
  const footerColumns = [
    ...footer.footer_headings.map((item) => ({ order: item.order, heading: item, image: undefined })),
    ...footer.footer_images.map((item) => ({ order: item.order, heading: undefined, image: item })),
  ].sort((a, b) => a.order - b.order);

  return (
    <div
      ref={rootRef}
      className="template002 min-vh-100 d-flex"
      data-bs-theme={palette.mode}
      style={paletteToCssVars(palette)}
    >
      <div className="w-100 d-flex flex-column">
        {/* Cabeçalho: imagem como fundo, logomarca e nome sobre ela */}
        {headerOpen && (
          <div className={collapsibleClass('header')}>
            <div className="tpl-collapsible-inner">
              <header
                className="tpl-region tpl-enter-down position-relative overflow-hidden text-body p-3 p-md-4 d-flex flex-column justify-content-between gap-4"
                style={regionStyle(palette, 'header')}
              >
                {backgroundImage && (
                  <img
                    src={assetUrl(backgroundImage.url)}
                    alt={backgroundImage.alt}
                    className="tpl-fade-in position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                  />
                )}
                {/* Camada com o degradê do cabeçalho sobre a imagem: garante contraste da letra com qualquer imagem */}
                <div className="tpl-blend position-absolute top-0 start-0 w-100 h-100 opacity-75" />
                {header.logo.map((logo) => (
                  <div
                    key={logo.id}
                    className={`position-relative d-flex fs-3 ${LOGO_ALIGNMENT[logo.position] ?? 'justify-content-center'}`}
                  >
                    {logo.image_url ? (
                      <img src={assetUrl(logo.image_url)} alt={logo.alt} className="img-fluid" />
                    ) : (
                      logo.text
                    )}
                  </div>
                ))}
                <div className="position-relative text-center fs-2">
                  {header.company_name.map((name) => (
                    <div key={name.id}>{name.text}</div>
                  ))}
                </div>
                <CloseButton label="Fechar cabeçalho" onClose={() => close('header')} />
              </header>
            </div>
          </div>
        )}

        {/* Barra fixa no topo abaixo de lg: navegação (grade à esquerda, hambúrguer à direita).
            Com o nav fechado, a barra só existe no celular, para o ícone do menu lateral. */}
        {(navOpen || menuOpen) && (
          <div className={`template002-sticky sticky-top bg-body d-flex flex-column ${navOpen ? '' : 'd-lg-none'}`}>
            {navOpen && (
              <div className={collapsibleClass('nav')}>
                <div className="tpl-collapsible-inner">
                  <nav
                    className={`tpl-region tpl-blend navbar navbar-expand-lg position-relative text-body ps-3 pe-5 pe-lg-4 ${scrolled ? 'tpl-scrolled py-1 py-lg-2' : 'py-2'}`}
                    style={{ ...regionStyle(palette, 'nav'), ...NAV_NO_BORDER_VARS }}
                  >
                    {/* Celular, à esquerda: ícone de 9 quadradinhos abre o painel lateral do menu.
                        A caixa de 1,5em x 1,5em iguala o tamanho do ícone do hambúrguer (navbar-toggler-icon). */}
                    {menuOpen && (
                      <button
                        type="button"
                        className="navbar-toggler"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#template002-menu"
                        aria-controls="template002-menu"
                        aria-label="Abrir menu lateral"
                      >
                        <span
                          className="d-inline-flex align-items-center justify-content-center"
                          style={{ width: '1.5em', height: '1.5em' }}
                        >
                          <i className="bi bi-grid-3x3-gap-fill fs-5 lh-1" aria-hidden="true" />
                        </span>
                      </button>
                    )}
                    {/* Celular, à direita: hambúrguer abre o nav vertical */}
                    <button
                      type="button"
                      className="navbar-toggler ms-auto"
                      data-bs-toggle="collapse"
                      data-bs-target="#template002-nav"
                      aria-controls="template002-nav"
                      aria-expanded="false"
                      aria-label="Alternar navegação"
                    >
                      <span className="navbar-toggler-icon" />
                    </button>
                    <div className="collapse navbar-collapse justify-content-center" id="template002-nav">
                      <ul className="navbar-nav flex-lg-row flex-wrap justify-content-center align-items-lg-center small">
                        {navItems.map((item, i) => (
                          <li key={item.id} className="tpl-nav-item nav-item d-lg-flex align-items-lg-center">
                            <a href={item.url} className="tpl-nav-link nav-link px-lg-1">
                              {item.label}
                            </a>
                            {i < navItems.length - 1 && (
                              <span className="d-none d-lg-inline mx-1 text-body-secondary">|</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <CloseButton label="Fechar navegação" onClose={() => close('nav')} />
                  </nav>
                </div>
              </div>
            )}
            {/* Nav fechado: barra mínima só com o ícone do menu lateral, na cor da região do menu */}
            {!navOpen && menuOpen && (
              <div
                className="tpl-blend d-flex justify-content-end text-body px-3 py-1"
                style={regionStyle(palette, 'menu')}
              >
                <button
                  type="button"
                  className="btn btn-sm border-0 text-body fs-5 lh-1"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#template002-menu"
                  aria-controls="template002-menu"
                  aria-label="Abrir menu lateral"
                >
                  <i className="bi bi-grid-3x3-gap-fill" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Menu lateral: painel (offcanvas) da esquerda abaixo de lg, coluna fixa de lg para cima.
            Sem o menu, o conteúdo ocupa a largura toda. */}
        <div className="row g-0 flex-grow-1">
          {menuOpen && (
            <aside
              className={`col-12 col-lg-3 col-xxl-2 position-relative ${closing.has('menu') ? 'tpl-fade-out' : ''}`}
              style={{ ...regionStyle(palette, 'menu'), ...OFFCANVAS_NO_BORDER_VARS }}
            >
              <div
                className="offcanvas-lg offcanvas-start h-100"
                tabIndex={-1}
                id="template002-menu"
                aria-labelledby="template002-menu-title"
              >
                <div className="offcanvas-header d-lg-none">
                  <h5 className="offcanvas-title" id="template002-menu-title">
                    Menu
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="offcanvas"
                    data-bs-target="#template002-menu"
                    aria-label="Fechar"
                  />
                </div>
                <div className="offcanvas-body h-100 p-lg-0">
                  <ul className="tpl-region tpl-blend list-unstyled text-body py-3 px-2 mb-0 w-100 h-100">
                    {menuItems.map((item) => (
                      <li key={item.id} className="tpl-menu-item text-center small py-2">
                        <a href={item.url} className="tpl-menu-link d-block text-decoration-none">
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* No celular o painel já tem o próprio botão fechar; o X permanente é só da coluna lateral */}
              <CloseButton label="Fechar menu lateral" onClose={() => close('menu')} className="d-none d-lg-block" />
            </aside>
          )}
          <main className={menuOpen ? 'col-12 col-lg-9 col-xxl-10' : 'col-12'}>
            <div className="tpl-region tpl-blend text-body p-3 p-md-4 h-100" style={regionStyle(palette, 'content')}>
              {contentRows.map((columns) => (
                <div key={columns[0]?.row} className="tpl-reveal row mb-3">
                  {columns.map((item) => (
                    <div key={item.id} className={`col-12 col-md-${12 / item.columns_in_row}`}>
                      <Heading {...item} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </main>
        </div>

        {/* Rodapé: 1 coluna no celular, 2 em sm, 4 em lg */}
        {footerOpen && (
          <div className={collapsibleClass('footer')}>
            <div className="tpl-collapsible-inner">
              <footer
                className="tpl-region tpl-blend position-relative text-body p-3"
                style={regionStyle(palette, 'footer')}
              >
                <div className="tpl-reveal-group row g-3 align-items-center">
                  {footerColumns.map(({ order, heading, image }) => (
                    <div key={order} className="col-12 col-sm-6 col-lg-3">
                      {heading && <Heading {...heading} />}
                      {image && <img src={assetUrl(image.url)} alt={image.alt} className="img-fluid" />}
                    </div>
                  ))}
                </div>
                <CloseButton label="Fechar rodapé" onClose={() => close('footer')} />
              </footer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
