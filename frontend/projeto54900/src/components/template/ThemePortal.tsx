// Portal que leva a paleta da empresa junto: o modal vai para o <body> (fixo na viewport, fora de qualquer
// modulo) e, la fora do `.tpl-app` do TemplateShell, perderia as variaveis de cor. Este wrapper repete
// `data-bs-theme`, `--bs-primary`/`--tpl-*` e a classe `.tpl-app` com a MESMA paleta do shell, que chega
// pelo provider. Sem provider (fora do shell) vale a paleta do env ou a padrao.

import { createContext, useContext, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { env } from '@/config/env';
import { getPalette, paletteToCssVars, type ThemePalette } from '@/config/theme';

const TemplatePaletteContext = createContext<ThemePalette | null>(null);

export function TemplatePaletteProvider({ palette, children }: { palette: ThemePalette; children: ReactNode }) {
  return <TemplatePaletteContext.Provider value={palette}>{children}</TemplatePaletteContext.Provider>;
}

export default function ThemePortal({ children }: { children: ReactNode }) {
  const palette = useContext(TemplatePaletteContext) ?? getPalette(env.theme ?? null);

  return createPortal(
    // backgroundImage none: o degrade de fundo da pagina (.tpl-app) nao deve se repetir no portal.
    <div
      className="tpl-app"
      data-bs-theme={palette.mode}
      style={{ ...paletteToCssVars(palette), backgroundImage: 'none' }}
    >
      {children}
    </div>,
    document.body,
  );
}
