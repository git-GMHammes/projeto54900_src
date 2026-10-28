// Rodape do template: ate 4 colunas (titulo + texto, ou imagem). Imagem preenchida vence titulo e texto.
// Dados de temp_footer (via template-render/get). Migrado dos templates estaticos. Sem dados (visitante),
// mostra o rodape simples de sempre (nome do projeto e ano), nas cores da paleta.

import CloseButton from '@/components/template/CloseButton';
import { regionStyle } from '@/components/template/templateRegionStyle';
import { env } from '@/config/env';
import type { ThemePalette } from '@/config/theme';
import type { TemplateFooterData } from '@/types/template';

const assetUrl = (path: string): string => `${env.basePath}/${path}`;

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
