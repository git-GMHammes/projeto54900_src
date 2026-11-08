// Formatadores e constantes visuais do dashboard de Eleicoes (Home menezes22001). Tudo em pt-BR.

import { companySlug } from '@/config/env';
import { CARGO_DEPUTADO, CARGO_GOVERNADOR, CARGO_PRESIDENTE } from '@/services/v1/eleicoes2026.dash';

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
export type Cargo = typeof CARGO_PRESIDENTE | typeof CARGO_DEPUTADO | typeof CARGO_GOVERNADOR;

export interface CargoInfo {
  key: Cargo;
  /** nr_votavel do candidato exibido no cargo (distingue candidatos do mesmo cargo nas views). */
  numero: string;
  label: string;
  candidato: string;
  /** Nome do candidato e cargo por extenso, para o texto do cabecalho. */
  descricao: string;
  color: string;
  /** Escala maxima do medidor (%). */
  gaugeMax: number;
}

const TODOS_CARGOS: readonly CargoInfo[] = [
  { key: CARGO_PRESIDENTE, numero: '22', label: 'Presidente', candidato: 'Flávio Bolsonaro (22)', descricao: 'Flávio Bolsonaro (Presidente)', color: '#4f7cff', gaugeMax: 100 },
  { key: CARGO_GOVERNADOR, numero: '22', label: 'Governador', candidato: 'Douglas Ruas (22)', descricao: 'Douglas Ruas (Governador)', color: '#2ecc71', gaugeMax: 100 },
  { key: CARGO_DEPUTADO, numero: '22001', label: 'Dep. Estadual', candidato: 'Coronel Menezes (22001)', descricao: 'Coronel Menezes 22001 (Deputado Estadual)', color: '#ff9f43', gaugeMax: 1 },
];

/** Cargos exibidos por empresa (slug da URL). Empresa sem entrada usa todos. */
const CARGOS_POR_EMPRESA: Readonly<Record<string, readonly Cargo[]>> = {
  // Helcio Angelo: Presidente, Governador e Dep. Estadual (ele mesmo, 70222); o Coronel Menezes nao aparece.
  'helcio-angelo-70222': [CARGO_PRESIDENTE, CARGO_GOVERNADOR, CARGO_DEPUTADO],
};

/** Candidato do Dep. Estadual por empresa (substitui o padrao Coronel Menezes 22001). */
const DEPUTADO_POR_EMPRESA: Readonly<Record<string, Partial<CargoInfo>>> = {
  'helcio-angelo-70222': { numero: '70222', candidato: 'Hélcio Ângelo (70222)', descricao: 'Hélcio Ângelo 70222 (Deputado Estadual)' },
};

const cargosDaEmpresa = CARGOS_POR_EMPRESA[companySlug ?? ''];
const deputadoDaEmpresa = DEPUTADO_POR_EMPRESA[companySlug ?? ''];

export const CARGOS: readonly CargoInfo[] = (
  cargosDaEmpresa ? TODOS_CARGOS.filter((c) => cargosDaEmpresa.includes(c.key)) : TODOS_CARGOS
).map((c) => (c.key === CARGO_DEPUTADO && deputadoDaEmpresa ? { ...c, ...deputadoDaEmpresa } : c));

/** A linha da view (cargo + nr_votavel) e de um candidato exibido pela empresa? */
export const ehCandidatoExibido = (cargo: string, numero: string): boolean =>
  CARGOS.some((c) => c.key === cargo && c.numero === numero);

/** Cargo que abre selecionado: Dep. Estadual quando exibido; senao o primeiro da lista. */
export const CARGO_INICIAL: Cargo = CARGOS.some((c) => c.key === CARGO_DEPUTADO) ? CARGO_DEPUTADO : (CARGOS[0]?.key ?? CARGO_PRESIDENTE);

export const temCargo = (cargo: Cargo): boolean => CARGOS.some((c) => c.key === cargo);

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
