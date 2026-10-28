/**
 * =========================================================================
 * FILE HEADER — config/theme.ts
 * =========================================================================
 *
 * O QUE FAZ: carrega as paletas de cores (JSONs de `config/themes/`), escolhe
 * a ativa por `env.theme` e converte as chaves da paleta em variáveis CSS do
 * Bootstrap. Há dois níveis:
 *   - global (`paletteToCssVars`): degradê de fundo da página, cor `primary` e
 *     a sombra 3D das bordas (`--bs-box-shadow`, aplicada pela classe `shadow`);
 *   - por componente (`sectionCssVars`): fundo, borda e letra de cada região
 *     (`header`, `nav`, `menu`, `content`, `footer`), para cada região poder ter
 *     cor própria.
 *
 * COMO FUNCIONA O CARREGAMENTO: `import.meta.glob` registra, em tempo de
 * build, todo `themes/*.json`. Paleta nova = soltar o JSON na pasta, sem
 * alterar código. Nome inexistente em `env.theme` cai em `DEFAULT_THEME`.
 *
 * CONTRATO: todo JSON tem as mesmas chaves (`ThemePalette`). Cores no formato
 * `#rrggbb` (as variáveis `-rgb` do Bootstrap são calculadas a partir delas).
 * Em dev, chave faltante gera aviso no console.
 *
 * DEPENDÊNCIAS: `config/env` (`env.theme`, `env.isDev`).
 * CONSUMIDORES: `pages/Template001/Template001Page.tsx`.
 * -------------------------------------------------------------------------
 */

import type { CSSProperties } from 'react';
import { env } from '@/config/env';

/** Regiões do template que têm fundo, borda e letra próprios. */
export const THEME_SECTIONS = ['header', 'nav', 'menu', 'content', 'footer'] as const;
export type ThemeSection = (typeof THEME_SECTIONS)[number];

type SectionKeys = {
  [S in ThemeSection as `${S}_background` | `${S}_border` | `${S}_text`]: string;
};

export interface ThemePalette extends SectionKeys {
  name: string;
  mode: 'light' | 'dark';
  background_from: string;
  background_to: string;
  background_angle: string;
  primary: string;
  border_highlight: string;
  border_shadow: string;
  border_depth: number;
}

export const DEFAULT_THEME = 'Blue_white';

const REQUIRED_KEYS: readonly string[] = [
  'name',
  'mode',
  'background_from',
  'background_to',
  'background_angle',
  'primary',
  'border_highlight',
  'border_shadow',
  'border_depth',
  ...THEME_SECTIONS.flatMap((section) => [`${section}_background`, `${section}_border`, `${section}_text`]),
];

const modules = import.meta.glob<ThemePalette>('./themes/*.json', { eager: true, import: 'default' });

/** Paletas disponíveis, indexadas pelo nome do arquivo (sem ".json"). */
const palettes: Record<string, ThemePalette> = {};
for (const [path, palette] of Object.entries(modules)) {
  const fileName = path.split('/').pop()?.replace(/\.json$/, '') ?? path;
  palettes[fileName] = palette;
  if (env.isDev) {
    const missing = REQUIRED_KEYS.filter((key) => !(key in palette));
    if (missing.length > 0) console.warn(`[theme] ${fileName}.json sem as chaves: ${missing.join(', ')}`);
  }
}

/** Devolve a paleta pedida; nome inexistente cai no tema padrão. */
export function getPalette(name: string = env.theme): ThemePalette {
  const palette = palettes[name] ?? palettes[DEFAULT_THEME];
  if (!palette) throw new Error(`[theme] paleta padrão "${DEFAULT_THEME}" não encontrada em config/themes`);
  return palette;
}

/** "#rrggbb" -> "r, g, b" (formato das variáveis `--bs-*-rgb`). */
function hexToRgb(hex: string): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

/** Sombra 3D: realce no topo, sombra na base e sombra projetada difusa. */
function buildBoxShadow(palette: ThemePalette): string {
  const depth = palette.border_depth;
  return [
    `inset 0 2px 0 ${palette.border_highlight}`,
    `inset 0 -2px 0 ${palette.border_shadow}`,
    `${depth}px ${depth}px ${depth * 2}px color-mix(in srgb, ${palette.border_shadow} 60%, transparent)`,
  ].join(', ');
}

/**
 * Variáveis globais, para o elemento raiz: degradê da página, `primary`, 3D e
 * os valores-base do Bootstrap (fundo = início do degradê, letra = conteúdo),
 * usados pelo que não pertence a nenhuma região (ex.: barra fixa no celular).
 */
export function paletteToCssVars(palette: ThemePalette): CSSProperties {
  const vars: Record<string, string> = {
    '--bs-body-bg': palette.background_from,
    '--bs-body-bg-rgb': hexToRgb(palette.background_from),
    '--bs-body-color': palette.content_text,
    '--bs-body-color-rgb': hexToRgb(palette.content_text),
    '--bs-primary': palette.primary,
    '--bs-primary-rgb': hexToRgb(palette.primary),
    '--bs-box-shadow': buildBoxShadow(palette),
    '--tpl-bg-from': palette.background_from,
    '--tpl-bg-to': palette.background_to,
    '--tpl-bg-angle': palette.background_angle,
  };
  return vars;
}

/**
 * Variáveis de UMA região: fundo (`bg-body`), borda (`border`) e letra
 * (`text-body`, títulos, links e texto secundário) do Bootstrap. Para a `nav`
 * entram também as `--bs-navbar-*`, que o `.navbar` define em si mesmo e por
 * isso não herdam da raiz.
 */
export function sectionCssVars(palette: ThemePalette, section: ThemeSection): CSSProperties {
  const background = palette[`${section}_background`];
  const border = palette[`${section}_border`];
  const text = palette[`${section}_text`];
  const rgb = hexToRgb(text);

  const vars: Record<string, string> = {
    '--bs-body-bg': background,
    '--bs-body-bg-rgb': hexToRgb(background),
    '--bs-body-color': text,
    '--bs-body-color-rgb': rgb,
    '--bs-secondary-color': `rgba(${rgb}, 0.75)`,
    '--bs-heading-color': text,
    '--bs-link-color': text,
    '--bs-link-color-rgb': rgb,
    '--bs-link-hover-color': text,
    '--bs-link-hover-color-rgb': rgb,
    '--bs-border-color': border,
  };
  if (section === 'nav') {
    vars['--bs-navbar-color'] = text;
    vars['--bs-navbar-hover-color'] = text;
    vars['--bs-navbar-active-color'] = text;
    vars['--bs-navbar-toggler-border-color'] = `rgba(${rgb}, 0.4)`;
  }
  return vars;
}

/** Vizinhas de cada região na tela (cima e baixo), para o degradê entre componentes. */
const BLEND_NEIGHBORS: Record<ThemeSection, { prev: ThemeSection | null; next: ThemeSection | null }> = {
  header: { prev: null, next: 'nav' },
  nav: { prev: 'header', next: 'content' },
  menu: { prev: 'nav', next: 'footer' },
  content: { prev: 'nav', next: 'footer' },
  footer: { prev: 'content', next: null },
};

/**
 * Parcela (%) da cor da região vizinha misturada nas pontas do degradê. Com 20%
 * o menor contraste letra/fundo nas 11 paletas é 4,54; com 30% duas paletas
 * (CopaDoMundo e Natal) ficavam abaixo de 4,5.
 */
export const BLEND_NEIGHBOR_PERCENT = 20;

/**
 * Template sem bordas: variáveis do degradê vertical de UMA região. No topo a
 * cor da região recebe uma parcela da região de cima; na base, da região de
 * baixo (via `color-mix`), de modo que as regiões se misturem sem linha de
 * separação. Sem vizinha, a ponta fica na cor da própria região.
 */
export function sectionBlendCssVars(palette: ThemePalette, section: ThemeSection): CSSProperties {
  const own = palette[`${section}_background`];
  const { prev, next } = BLEND_NEIGHBORS[section];
  const mix = (neighbor: ThemeSection | null) =>
    neighbor
      ? `color-mix(in srgb, ${own} ${100 - BLEND_NEIGHBOR_PERCENT}%, ${palette[`${neighbor}_background`]})`
      : own;

  const vars: Record<string, string> = {
    '--tpl-blend-from': mix(prev),
    '--tpl-blend-to': mix(next),
  };
  return vars;
}
