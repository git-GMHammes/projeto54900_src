// Cabecalho do template: imagem como fundo, logomarcas (esquerda, centro, direita) no topo e o nome
// social do meio para baixo. Tudo opcional: logo com imagem substitui o texto. Dados de temp_header
// (via template-render/get). Migrado dos templates estaticos (pages/Template00XPage.tsx).

import CloseButton from '@/components/template/CloseButton';
import { regionStyle } from '@/components/template/templateRegionStyle';
import { env } from '@/config/env';
import type { ThemePalette } from '@/config/theme';
import type { TemplateHeaderData, TemplateLogo } from '@/types/template';

const assetUrl = (path: string): string => `${env.basePath}/${path}`;

const POSITIONS: { position: TemplateLogo['position']; className: string }[] = [
  { position: 'left', className: 'text-start' },
  { position: 'center', className: 'text-center' },
  { position: 'right', className: 'text-end' },
];

export interface TemplateHeaderRegionProps {
  header: TemplateHeaderData;
  flat: boolean;
  palette: ThemePalette;
  /** Classe do invólucro `tpl-collapsible` (inclui `tpl-closing` durante o fechamento). */
  collapsibleClass: string;
  onClose: () => void;
}

export default function TemplateHeaderRegion({ header, flat, palette, collapsibleClass, onClose }: TemplateHeaderRegionProps) {
  const background = header.background_image[0];
  const logos = header.logo;
  const names = header.company_name;

  return (
    <div className={collapsibleClass}>
      <div className="tpl-collapsible-inner">
        <header
          className={`tpl-region tpl-enter-down position-relative overflow-hidden text-body p-3 p-md-4 d-flex flex-column justify-content-between gap-4 ${flat ? '' : 'border shadow rounded-5'}`}
          style={regionStyle(palette, 'header', flat)}
        >
          {background && (
            <img
              src={assetUrl(background.url)}
              alt={background.alt}
              className="tpl-fade-in position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
            />
          )}
          {/* Camada na cor do cabecalho sobre a imagem: garante contraste da letra com qualquer imagem. */}
          <div
            className={`position-absolute top-0 start-0 w-100 h-100 ${flat ? 'tpl-blend opacity-75' : 'bg-body bg-opacity-75'}`}
          />
          {logos.length > 0 && (
            <div className="position-relative row g-2 align-items-center fs-3">
              {POSITIONS.map(({ position, className }) => {
                const logo = logos.find((l) => l.position === position);
                return (
                  <div key={position} className={`col-4 ${className}`}>
                    {logo &&
                      (logo.image_url ? (
                        <img src={assetUrl(logo.image_url)} alt={logo.alt} className="img-fluid" />
                      ) : (
                        logo.text
                      ))}
                  </div>
                );
              })}
            </div>
          )}
          {names.length > 0 && (
            <div className="position-relative text-center fs-2">
              {names.map((name) => (
                <div key={name.id}>{name.text}</div>
              ))}
            </div>
          )}
          <CloseButton label="Fechar cabeçalho" onClose={onClose} />
        </header>
      </div>
    </div>
  );
}
