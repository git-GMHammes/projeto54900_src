// Formatadores e constantes visuais do dashboard de Eleicoes (Home menezes22001). Tudo em pt-BR.

import { CARGO_DEPUTADO, CARGO_PRESIDENTE } from '@/services/v1/eleicoes2026.dash';

const INT = new Intl.NumberFormat('pt-BR');
const COMPACT = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });

export const fmtInt = (n: number): string => INT.format(Math.round(n));
export const fmtCompact = (n: number): string => COMPACT.format(n);
export const fmtPct = (n: number, digits = 2): string =>
  `${n.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;

/** Escapa texto vindo da API antes de entrar em tooltip HTML do ECharts. */
export const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Cargo selecionado no painel. */
export type Cargo = typeof CARGO_PRESIDENTE | typeof CARGO_DEPUTADO;

export const CARGOS: readonly { key: Cargo; label: string; candidato: string; color: string }[] = [
  { key: CARGO_PRESIDENTE, label: 'Presidente', candidato: 'Flávio Bolsonaro (22)', color: '#4f7cff' },
  { key: CARGO_DEPUTADO, label: 'Dep. Estadual', candidato: 'Coronel Menezes (22001)', color: '#ff9f43' },
];

export const colorOf = (cargo: string): string => CARGOS.find((c) => c.key === cargo)?.color ?? '#4f7cff';
export const labelOf = (cargo: string): string => CARGOS.find((c) => c.key === cargo)?.label ?? cargo;

/** Primeira letra de cada palavra em maiuscula ("RIO DE JANEIRO" -> "Rio de Janeiro"). */
export function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(' ')
    .map((w) => (['de', 'da', 'do', 'das', 'dos', 'e'].includes(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}
