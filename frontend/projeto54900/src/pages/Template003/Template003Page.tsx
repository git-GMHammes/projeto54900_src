/**
 * =========================================================================
 * FILE HEADER — pages/Template003/Template003Page.tsx
 * =========================================================================
 *
 * O QUE FAZ: variante do Template002 SEM MENU LATERAL FIXO. Mesmos componentes
 * (cabeçalho, nav, conteúdo e rodapé), mesmas animações e mesmos JSONs de paleta.
 * O menu lateral deixa de ser coluna: vira um painel Offcanvas (pela esquerda) aberto
 * pelo ícone da grade no nav, em qualquer tamanho de tela. O conteúdo ocupa a
 * largura toda. Sem bordas, sombras, cantos arredondados nem margens; o fundo de
 * cada região é um degradê vertical que se mistura com a vizinha
 * (`sectionBlendCssVars`).
 *
 * PALETA: mesmas 24 chaves; as chaves de borda ficam no contrato e são ignoradas.
 *
 * RESPONSIVO: ocupa a tela toda. Abaixo de `lg` a navegação vira sanfona (hambúrguer
 * à direita) e o nav fica fixo no topo. O ícone da grade (à esquerda) existe em
 * todos os tamanhos. Em telas ≥1920px a fonte base cresce (`styles/_custom.scss`).
 *
 * FECHAR REGIÕES: cabeçalho, nav e rodapé têm um X discreto no canto superior
 * direito (sem desfazer; recarregar restaura). O painel do menu tem o próprio botão
 * fechar do Offcanvas. Com o nav fechado, resta uma barra mínima só com o ícone do menu.
 *
 * DEPENDÊNCIAS:
 *   - `./template003.json` — dados estáticos (header, nav, menu,
 *     content_headings, footer).
 *   - `@/config/env` (`env.basePath`) — prefixo público de `public/img/template003/`.
 *   - `@/config/theme` — paleta ativa, variáveis CSS e degradê por região.
 *   - `@/hooks/useReveal`, `@/hooks/useScrolled` — animações ao rolar.
 *   - `styles/_animations.scss` — animações, escopo `.template001`/`.template003`.
 *
 * CONSUMIDOR: `routes/template003.routes.tsx` (rota `/template003`).
 *
 * REGRAS DE MANUTENÇÃO:
 *   1. Para trocar a fonte dos dados, substituir só o `import` do JSON por uma
 *      chamada de API que devolva o mesmo formato (`Template003Data`).
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
import { useNavScroll } from '@/hooks/useNavScroll';
import { useScrolled } from '@/hooks/useScrolled';
import template003Json from './template003.json';

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
  /** Ícone opcional (Bootstrap Icons, sem o prefixo `bi-`). */
  icon?: string;
}

interface MenuItem {
  id: number;
  order: number;
  label: string;
  url: string;
  /** Ícone opcional (Bootstrap Icons, sem o prefixo `bi-`). */
  icon?: string;
}

interface HeadingItem {
  id: number;
  order: number;
  title: string;
  text: string;
  /** Imagem opcional do bloco (só o conteúdo usa); título e texto vazios mostram só a imagem. */
  image?: { url: string; alt: string };
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

interface Template003Data {
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

/** Regiões que o usuário pode ocultar (o conteúdo não tem botão fechar; o menu é um Offcanvas). */
type ClosableSection = 'header' | 'nav' | 'footer';

/** Duração da animação de fechar (ms); precisa coincidir com `.tpl-collapsible` em `_animations.scss`. */
const CLOSE_ANIMATION_MS = 350;

const data: Template003Data = template003Json;

/** Monta a URL pública de um arquivo de `public/` a partir do caminho do JSON. */
const assetUrl = (path: string): string => `${env.basePath}/${path}`;

/** Ícone do item de menu (Bootstrap Icons, sem o prefixo `bi-`); nome fora de [a-z0-9-] é ignorado. */
function ItemIcon({ icon, className = 'me-1' }: { icon: string | undefined; className?: string }) {
  if (!icon || !/^[a-z0-9-]+$/.test(icon)) return null;
  return <i className={`bi bi-${icon} ${className}`} aria-hidden="true" />;
}

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

function Heading({ title, text, image }: HeadingItem) {
  return (
    <>
      {image && <img src={assetUrl(image.url)} alt={image.alt} className="img-fluid mb-2" />}
      {title && <h1 className="h4 fw-bold">{title}</h1>}
      {text && <p className="small mb-0">{text}</p>}
    </>
  );
}

/** Bloco de conteúdo em cartão uniforme (sem borda, fundo suave): etiqueta do tipo, e imagem ao lado do texto a partir de `md`. */
function ContentBlock(item: ContentHeadingItem) {
  const { id, image, ...rest } = item;
  const hasText = Boolean(item.title || item.text);
  const kind = image && hasText ? 'imagem + texto' : image ? 'imagem' : 'texto';
  return (
    <div className="bg-body-tertiary p-3 h-100">
      <span className="badge text-bg-secondary mb-2">
        Bloco {id} · {kind}
      </span>
      {image && hasText ? (
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-4">
            <img src={assetUrl(image.url)} alt={image.alt} className="img-fluid" />
          </div>
          <div className="col-12 col-md-8">
            <Heading id={id} {...rest} />
          </div>
        </div>
      ) : image ? (
        <div className="text-center">
          <img src={assetUrl(image.url)} alt={image.alt} className="img-fluid" />
        </div>
      ) : (
        <Heading id={id} {...rest} />
      )}
    </div>
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

export default function Template003Page() {
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
  const navScroll = useNavScroll(navOpen);
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
      className="template003 min-vh-100 d-flex"
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

        {/* Barra fixa no topo abaixo de lg: ícone da grade (abre o Offcanvas do menu) à esquerda
            e hambúrguer (nav vertical) à direita. Com o nav fechado, resta uma barra mínima só com o ícone. */}
        <div className="template003-sticky sticky-top bg-body d-flex flex-column">
          {navOpen ? (
            <div className={collapsibleClass('nav')}>
              {/* minWidth 0: o item do grid não pode ter a largura mínima dos itens do nav (senão a página estoura) */}
              <div className="tpl-collapsible-inner" style={{ minWidth: 0 }}>
                <nav
                  className={`tpl-region tpl-blend navbar navbar-expand-lg position-relative text-body ps-3 pe-5 pe-lg-4 ${scrolled ? 'tpl-scrolled py-1 py-lg-2' : 'py-2'}`}
                  style={{ ...regionStyle(palette, 'nav'), ...NAV_NO_BORDER_VARS }}
                >
                  {/* Todas as telas, à esquerda: ícone de 9 quadradinhos abre o painel do menu.
                      A caixa de 1,5em x 1,5em iguala o tamanho do ícone do hambúrguer (navbar-toggler-icon). */}
                  <button
                    type="button"
                    className="btn border-0 text-body px-3 py-1"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#template003-menu"
                    aria-controls="template003-menu"
                    aria-label="Abrir menu"
                  >
                    <span
                      className="d-inline-flex align-items-center justify-content-center"
                      style={{ width: '1.5em', height: '1.5em' }}
                    >
                      <i className="bi bi-grid-3x3-gap-fill fs-5 lh-1" aria-hidden="true" />
                    </span>
                  </button>
                  {/* Celular, à direita: hambúrguer abre o nav vertical */}
                  <button
                    type="button"
                    className="navbar-toggler ms-auto"
                    data-bs-toggle="collapse"
                    data-bs-target="#template003-nav"
                    aria-controls="template003-nav"
                    aria-expanded="false"
                    aria-label="Alternar navegação"
                  >
                    <span className="navbar-toggler-icon" />
                  </button>
                  <div className="collapse navbar-collapse justify-content-center overflow-hidden" id="template003-nav">
                    {/* A partir de lg a lista fica em uma linha; se passar da largura, as setas deslizam o nav. */}
                    {navScroll.overflow && (
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
                      className="navbar-nav flex-lg-row flex-lg-nowrap overflow-hidden mx-lg-auto align-items-lg-center small"
                    >
                      {navItems.map((item, i) => (
                        <li
                          key={item.id}
                          className="tpl-nav-item nav-item flex-shrink-0 text-nowrap d-lg-flex align-items-lg-center"
                        >
                          <a href={item.url} className="tpl-nav-link nav-link px-lg-1">
                            <ItemIcon icon={item.icon} />
                              {item.label}
                          </a>
                          {i < navItems.length - 1 && (
                            <span className="d-none d-lg-inline mx-1 text-body-secondary">|</span>
                          )}
                        </li>
                      ))}
                    </ul>
                    {navScroll.overflow && (
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
                  </div>
                  <CloseButton label="Fechar navegação" onClose={() => close('nav')} />
                </nav>
              </div>
            </div>
          ) : (
            <div
              className="tpl-blend d-flex justify-content-start text-body px-3 py-1"
              style={regionStyle(palette, 'menu')}
            >
              <button
                type="button"
                className="btn btn-sm border-0 text-body fs-5 lh-1"
                data-bs-toggle="offcanvas"
                data-bs-target="#template003-menu"
                aria-controls="template003-menu"
                aria-label="Abrir menu"
              >
                <i className="bi bi-grid-3x3-gap-fill" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {/* Menu: painel Offcanvas pela esquerda, fora do fluxo da página, sem borda. */}
        <div
          className="offcanvas offcanvas-start tpl-blend text-body"
          tabIndex={-1}
          id="template003-menu"
          aria-labelledby="template003-menu-title"
          style={{ ...regionStyle(palette, 'menu'), ...OFFCANVAS_NO_BORDER_VARS }}
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="template003-menu-title">
              Menu
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Fechar" />
          </div>
          <div className="offcanvas-body p-0">
            <ul className="list-unstyled py-3 px-2 mb-0">
              {menuItems.map((item) => (
                <li key={item.id} className="tpl-menu-item small py-2">
                  <a href={item.url} className="tpl-menu-link d-flex align-items-center gap-2 text-decoration-none px-2">
                    <ItemIcon icon={item.icon} className="fs-5 lh-1 flex-shrink-0" />
                              {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Conteúdo: largura total */}
        <main className="flex-grow-1">
          <div className="tpl-region tpl-blend text-body p-3 p-md-4 h-100" style={regionStyle(palette, 'content')}>
            {contentRows.map((columns) => (
              <div key={columns[0]?.row} className="tpl-reveal row g-3 mb-3">
                {columns.map((item) => (
                  <div key={item.id} className={`col-12 col-md-${12 / item.columns_in_row}`}>
                    <ContentBlock {...item} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </main>

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
