// Estilo (variaveis CSS) de uma regiao do template: cores da paleta e, nos modelos sem bordas
// (flat), o degrade que mistura a regiao com a vizinha. Mesma regra dos templates estaticos
// (pages/Template00XPage.tsx: `regionStyle`).

import type { CSSProperties } from 'react';
import { sectionBlendCssVars, sectionCssVars } from '@/config/theme';
import type { ThemePalette, ThemeSection } from '@/config/theme';

export function regionStyle(palette: ThemePalette, section: ThemeSection, flat: boolean): CSSProperties {
  return flat ? { ...sectionCssVars(palette, section), ...sectionBlendCssVars(palette, section) } : sectionCssVars(palette, section);
}

/** O Bootstrap desenha contorno nos botoes da navbar e uma linha no painel offcanvas; sem bordas nao ha contorno. */
export const NAV_NO_BORDER_VARS = { '--bs-navbar-toggler-border-color': 'transparent' } as CSSProperties;
export const OFFCANVAS_NO_BORDER_VARS = { '--bs-offcanvas-border-width': '0' } as CSSProperties;
