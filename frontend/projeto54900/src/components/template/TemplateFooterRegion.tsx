// Rodape do template: ate 4 colunas (titulo + texto, ou imagem). Imagem preenchida vence titulo e texto.
// Modelo 'highlight' (temp_footer.layout): titulo do rodape a esquerda e itens com icone (Bootstrap Icons) em circulo.
// Dados de temp_footer (via template-render/get). Migrado dos templates estaticos. Sem dados (visitante),
// mostra o rodape simples de sempre (nome do projeto e ano), nas cores da paleta.

import type { ReactNode } from 'react';

import CloseButton from '@/components/template/CloseButton';
import { regionStyle } from '@/components/template/templateRegionStyle';
import { env } from '@/config/env';
import type { ThemePalette } from '@/config/theme';
import type { TemplateFooterData } from '@/types/template';

const assetUrl = (path: string): string => `${env.basePath}/${path}`;

/** So classes do Bootstrap Icons (bi-xxx) entram no atributo class; qualquer outra coisa e ignorada. */
const ICON_PATTERN = /^bi-[a-z0-9-]+$/;

/** Titulo com [d]palavra[/d]: a palavra ganha a cor primaria da paleta. Sem HTML cru (so spans do React). */
function renderAccent(text: string): ReactNode[] {
  return text.split(/\[d\](.*?)\[\/d\]/g).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="text-primary">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export interface TemplateFooterRegionProps {
  /** null = rodape simples do visitante. */
  footer: TemplateFooterData | null;
  flat: boolean;
  palette: ThemePalette;
  collapsibleClass: string;
  onClose: () => void;
}

export default function TemplateFooterRegion({ footer, flat, palette, collapsibleClass, onClose }: TemplateFooterRegionProps) {
  const frame = `tpl-region position-relative text-body p-3 ${flat ? 'tpl-blend' : 'bg-body border shadow rounded-4'}`;

  if (footer === null) {
    return (
      <footer className={frame} style={regionStyle(palette, 'footer', flat)}>
        <div className="d-flex flex-wrap justify-content-between gap-2 small">
          <span>projeto54900 &middot; MAPA / AGENDA / CHAT</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    );
  }

  // Textos e imagens ocupam colunas numeradas na mesma sequencia.
  const columns = [
    ...footer.footer_headings.map((item) => ({ order: item.order, heading: item, image: undefined })),
    ...footer.footer_images.map((item) => ({ order: item.order, heading: undefined, image: item })),
  ].sort((a, b) => a.order - b.order);

  // Modelo 'highlight': titulo a esquerda, divisor e itens com icone em circulo, num cartao com borda.
  if (footer.layout === 'highlight') {
    return (
      <div className={collapsibleClass}>
        <div className="tpl-collapsible-inner">
          <footer className={`${frame} p-md-4`} style={regionStyle(palette, 'footer', flat)}>
            <div className="border rounded-4 p-3 p-lg-4">
              <div className="tpl-reveal-group row g-3 align-items-center">
                {footer.title !== '' && (
                  <div className="col-12 col-lg-3">
                    <h2 className="h2 fw-bold mb-0">{renderAccent(footer.title)}</h2>
                  </div>
                )}
                <div className="col-12 d-lg-none">
                  <hr className="m-0" />
                </div>
                <div className="col-lg-auto d-none d-lg-flex align-self-stretch">
                  <div className="vr" />
                </div>
                {columns.map(({ order, heading, image }) => (
                  <div key={order} className="col-6 col-lg text-center">
                    {heading && ICON_PATTERN.test(heading.icon) && (
                      <span className="d-inline-flex p-3 mb-2 rounded-circle border fs-2 lh-1">
                        <i className={`bi ${heading.icon}`} aria-hidden="true" />
                      </span>
                    )}
                    {heading && heading.title !== '' && <h3 className="h6 fw-bold">{heading.title}</h3>}
                    {heading && <p className="small mb-0">{heading.text}</p>}
                    {image && <img src={assetUrl(image.url)} alt={image.alt} className={`img-fluid ${flat ? '' : 'rounded'}`} />}
                  </div>
                ))}
              </div>
            </div>
            <CloseButton label="Fechar rodapé" onClose={onClose} />
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className={collapsibleClass}>
      <div className="tpl-collapsible-inner">
        <footer className={frame} style={regionStyle(palette, 'footer', flat)}>
          <div className="tpl-reveal-group row g-3 align-items-center">
            {columns.map(({ order, heading, image }) => (
              <div key={order} className="col-12 col-sm-6 col-lg-3">
                {heading && (
                  <>
                    <h1 className="h4 fw-bold">{heading.title}</h1>
                    <p className="small mb-0">{heading.text}</p>
                  </>
                )}
                {image && <img src={assetUrl(image.url)} alt={image.alt} className={`img-fluid ${flat ? '' : 'rounded'}`} />}
              </div>
            ))}
          </div>
          <CloseButton label="Fechar rodapé" onClose={onClose} />
        </footer>
      </div>
    </div>
  );
}
