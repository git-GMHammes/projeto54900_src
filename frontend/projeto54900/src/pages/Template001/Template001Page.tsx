/**
 * =========================================================================
 * FILE HEADER — pages/Template001/Template001Page.tsx
 * =========================================================================
 *
 * O QUE FAZ: reproduz o desenho `doc/drawio_svg/template_001.drawio` com
 * Bootstrap 5: cabeçalho (imagem de fundo, logomarca escolhida pelo cliente e
 * nome da empresa), barra de navegação, menu lateral, área de conteúdo e
 * rodapé. Todo o conteúdo vem de `template001.json`, em arrays, para ser
 * trocado no futuro por dados do banco sem mexer no markup.
 *
 * TEMA: a paleta ativa (`env.theme`, JSON em `config/themes/`) vira variáveis CSS:
 * as globais (degradê, `primary`, 3D) no elemento raiz e as de fundo, borda e
 * letra de cada região (header, nav, menu, content, footer) no próprio elemento
 * dela; o Bootstrap aplica cores, borda e sombra 3D (`shadow`).
 *
 * RESPONSIVO: ocupa a tela toda (margem mínima `p-1`, reservada ao efeito 3D
 * das bordas). Abaixo de `lg` a navegação vira sanfona, o menu lateral vira
 * painel (offcanvas) pela esquerda e as duas barras ficam fixas no topo;
 * conteúdo e rodapé empilham. Em telas ≥1920px a fonte base cresce
 * (`styles/_custom.scss`, escopo `.template001`).
 *
 * FECHAR REGIÕES: cabeçalho, nav, menu lateral e rodapé têm um X discreto no
 * canto superior direito. Ele oculta a região (as demais ocupam o espaço) e não
 * tem desfazer: o estado fica só em memória, então recarregar a página restaura.
 *
 * DEPENDÊNCIAS:
 *   - `./template001.json` — dados estáticos (header, nav, menu,
 *     content_headings, footer).
 *   - `@/config/env` (`env.basePath`) — prefixo público dos arquivos de
 *     `public/img/template001/`.
 *   - `@/config/theme` — paleta ativa e variáveis CSS por região.
 *
 * CONSUMIDOR: `routes/template001.routes.tsx` (rota `/template001`).
 *
 * REGRAS DE MANUTENÇÃO:
 *   1. Para trocar a fonte dos dados, substituir só o `import` do JSON por uma
 *      chamada de API que devolva o mesmo formato (`Template001Data`).
 *   2. `header.logo[].position`: `left`, `center` ou `right`. Com `image_url`
 *      preenchida a imagem substitui o texto.
 *   3. Itens sempre ordenados por `order`; o conteúdo é agrupado por `row` e
 *      ordenado por `column`, e a quantidade de colunas da linha vem de
 *      `columns_in_row`.
 * -------------------------------------------------------------------------
 */

import { useState } from 'react';
import { env } from '@/config/env';
import { getPalette, paletteToCssVars, sectionCssVars } from '@/config/theme';
import { useReveal } from '@/hooks/useReveal';
import { useScrolled } from '@/hooks/useScrolled';
import template001Json from './template001.json';

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

interface Template001Data {
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

const data: Template001Data = template001Json;

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

export default function Template001Page() {
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
      className="template001 min-vh-100 p-1 d-flex"
      data-bs-theme={palette.mode}
      style={paletteToCssVars(palette)}
    >
      <div className="w-100 d-flex flex-column gap-2">
        {/* Cabeçalho: imagem como fundo, logomarca e nome sobre ela */}
        {headerOpen && (
          <div className={collapsibleClass('header')}>
            <div className="tpl-collapsible-inner">
              <header
                className="tpl-region tpl-enter-down position-relative overflow-hidden text-body border shadow rounded-5 p-3 p-md-4 d-flex flex-column justify-content-between gap-4"
                style={sectionCssVars(palette, 'header')}
              >
                {backgroundImage && (
                  <img
                    src={assetUrl(backgroundImage.url)}
                    alt={backgroundImage.alt}
                    className="tpl-fade-in position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                  />
                )}
                {/* Camada na cor do cabeçalho sobre a imagem: garante contraste da letra com qualquer imagem */}
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-body bg-opacity-75" />
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

        {/* Barra fixa no topo abaixo de lg: navegação (hambúrguer à esquerda, ícone do menu lateral à direita).
            Com o nav fechado, a barra só existe no celular, para o ícone do menu lateral. */}
        {(navOpen || menuOpen) && (
          <div
            className={`template001-sticky sticky-top bg-body d-flex flex-column gap-2 ${navOpen ? '' : 'd-lg-none'}`}
          >
            {navOpen && (
              <div className={collapsibleClass('nav')}>
                <div className="tpl-collapsible-inner">
                  <nav
                    className={`tpl-region navbar navbar-expand-lg position-relative bg-body text-body border shadow rounded-4 ps-3 pe-5 pe-lg-4 ${scrolled ? 'tpl-scrolled py-1 py-lg-2' : 'py-2'}`}
                    style={sectionCssVars(palette, 'nav')}
                  >
                    {/* Celular, à esquerda: ícone de 9 quadradinhos (como no app) abre o painel lateral do menu.
                        A caixa de 1,5em x 1,5em iguala o tamanho do ícone do hambúrguer (navbar-toggler-icon). */}
                    {menuOpen && (
                      <button
                        type="button"
                        className="navbar-toggler"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#template001-menu"
                        aria-controls="template001-menu"
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
                      data-bs-target="#template001-nav"
                      aria-controls="template001-nav"
                      aria-expanded="false"
                      aria-label="Alternar navegação"
                    >
                      <span className="navbar-toggler-icon" />
                    </button>
                    <div className="collapse navbar-collapse justify-content-center" id="template001-nav">
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
                className="d-flex justify-content-end bg-body text-body border shadow rounded-4 px-3 py-1"
                style={sectionCssVars(palette, 'menu')}
              >
                <button
                  type="button"
                  className="btn btn-sm border-0 text-body fs-5 lh-1"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#template001-menu"
                  aria-controls="template001-menu"
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
        <div className="row g-2 flex-grow-1">
          {menuOpen && (
            <aside
              className={`col-12 col-lg-3 col-xxl-2 position-relative ${closing.has('menu') ? 'tpl-fade-out' : ''}`}
              style={sectionCssVars(palette, 'menu')}
            >
              <div
                className="offcanvas-lg offcanvas-start h-100"
                tabIndex={-1}
                id="template001-menu"
                aria-labelledby="template001-menu-title"
              >
                <div className="offcanvas-header d-lg-none">
                  <h5 className="offcanvas-title" id="template001-menu-title">
                    Menu
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="offcanvas"
                    data-bs-target="#template001-menu"
                    aria-label="Fechar"
                  />
                </div>
                <div className="offcanvas-body h-100 p-lg-0">
                  <ul className="tpl-region list-unstyled bg-body text-body border shadow rounded-4 py-3 px-2 mb-0 w-100 h-100">
                    {menuItems.map((item) => (
                      <li key={item.id} className="tpl-menu-item text-center small border-bottom py-1">
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
            <div
              className="tpl-region bg-body text-body border shadow rounded-5 p-3 p-md-4 h-100"
              style={sectionCssVars(palette, 'content')}
            >
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
                className="tpl-region position-relative bg-body text-body border shadow rounded-4 p-3"
                style={sectionCssVars(palette, 'footer')}
              >
                <div className="tpl-reveal-group row g-3 align-items-center">
                  {footerColumns.map(({ order, heading, image }) => (
                    <div key={order} className="col-12 col-sm-6 col-lg-3">
                      {heading && <Heading {...heading} />}
                      {image && <img src={assetUrl(image.url)} alt={image.alt} className="img-fluid rounded" />}
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
