// Formatadores e constantes visuais do dashboard de Eleicoes (Home menezes22001). Tudo em pt-BR.

import { companySlug } from '@/config/env';
import { CARGO_DEPUTADO, CARGO_DEPUTADO_FEDERAL, CARGO_GOVERNADOR, CARGO_PRESIDENTE } from '@/services/v1/eleicoes2026.dash';

const INT = new Intl.NumberFormat('pt-BR');
const COMPACT = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });

export const fmtInt = (n: number): string => INT.format(Math.round(n));
export const fmtCompact = (n: number): string => COMPACT.format(n);
export const fmtPct = (n: number, digits = 2): string =>
  `${n.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;

/** Escapa texto vindo da API antes de entrar em tooltip HTML do ECharts. */
export const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Candidato selecionado no painel: id = `cargo|numero` (ver idDe). Um cargo pode ter varios candidatos (ex.: Governador na paes55). */
export type Cargo = string;

type CargoKey = typeof CARGO_PRESIDENTE | typeof CARGO_DEPUTADO | typeof CARGO_DEPUTADO_FEDERAL | typeof CARGO_GOVERNADOR;
type Tone = 'primary' | 'warning' | 'info' | 'success' | 'danger' | 'secondary';

/** Id do candidato a partir da linha das views (ds_cargo + nr_votavel). */
export const idDe = (cargo: string, numero: string): string => `${cargo}|${numero}`;

export interface CargoInfo {
  /** Id unico do candidato (cargo|numero): chave de filtro, cor e rotulo em todo o painel. */
  id: Cargo;
  /** ds_cargo das views. */
  key: CargoKey;
  /** nr_votavel do candidato exibido no cargo (distingue candidatos do mesmo cargo nas views). */
  numero: string;
  label: string;
  candidato: string;
  /** Nome do candidato e cargo por extenso, para o texto do cabecalho. */
  descricao: string;
  color: string;
  /** Escala maxima do medidor (%). */
  gaugeMax: number;
  /** Icone (Bootstrap Icons) e tom do KPI do candidato. */
  icon: string;
  tone: Tone;
  /** Candidato principal da empresa (abre selecionado e recebe destaque). */
  principal?: boolean;
}

type CargoBase = Omit<CargoInfo, 'id'>;
const comId = (c: CargoBase): CargoInfo => ({ ...c, id: idDe(c.key, c.numero) });

const TODOS_CARGOS: readonly CargoInfo[] = ([
  { key: CARGO_PRESIDENTE, numero: '22', label: 'Presidente', candidato: 'Flávio Bolsonaro (22)', descricao: 'Flávio Bolsonaro (Presidente)', color: '#4f7cff', gaugeMax: 100, icon: 'bi-person-badge-fill', tone: 'info' },
  { key: CARGO_GOVERNADOR, numero: '22', label: 'Governador', candidato: 'Douglas Ruas (22)', descricao: 'Douglas Ruas (Governador)', color: '#2ecc71', gaugeMax: 100, icon: 'bi-bank2', tone: 'success' },
  { key: CARGO_DEPUTADO, numero: '22001', label: 'Dep. Estadual', candidato: 'Coronel Menezes (22001)', descricao: 'Coronel Menezes 22001 (Deputado Estadual)', color: '#ff9f43', gaugeMax: 1, icon: 'bi-patch-check-fill', tone: 'warning' },
] satisfies CargoBase[]).map(comId);

/** Cargos exibidos por empresa (slug da URL). Empresa sem entrada usa todos. */
const CARGOS_POR_EMPRESA: Readonly<Record<string, readonly CargoKey[]>> = {
  // Helcio Angelo: Presidente, Governador e Dep. Estadual (ele mesmo, 70222); o Coronel Menezes nao aparece.
  'helcio-angelo-70222': [CARGO_PRESIDENTE, CARGO_GOVERNADOR, CARGO_DEPUTADO],
};

/** Candidato do Dep. Estadual por empresa (substitui o padrao Coronel Menezes 22001). */
const DEPUTADO_POR_EMPRESA: Readonly<Record<string, Partial<CargoBase>>> = {
  'helcio-angelo-70222': { numero: '70222', candidato: 'Hélcio Ângelo (70222)', descricao: 'Hélcio Ângelo 70222 (Deputado Estadual)' },
};

/**
 * Empresas com lista propria de candidatos (varios no mesmo cargo). paes55: Eduardo Paes (55) e o principal;
 * Douglas Ruas (22) e Garotinho (10) sao secundarios. Todos GOVERNADOR, 1o turno.
 */
const CANDIDATOS_POR_EMPRESA: Readonly<Record<string, readonly CargoInfo[]>> = {
  paes55: ([
    { key: CARGO_GOVERNADOR, numero: '55', label: 'Eduardo Paes', candidato: 'Eduardo Paes (55) · principal', descricao: 'Eduardo Paes 55 (Governador, principal)', color: '#339af0', gaugeMax: 100, icon: 'bi-star-fill', tone: 'primary', principal: true },
    { key: CARGO_GOVERNADOR, numero: '22', label: 'Douglas Ruas', candidato: 'Douglas Ruas (22) · secundário', descricao: 'Douglas Ruas 22 (Governador)', color: '#2ecc71', gaugeMax: 100, icon: 'bi-bank2', tone: 'success' },
    { key: CARGO_GOVERNADOR, numero: '10', label: 'Garotinho', candidato: 'Garotinho (10) · secundário', descricao: 'Garotinho 10 (Governador)', color: '#f06595', gaugeMax: 10, icon: 'bi-person-fill', tone: 'danger' },
  ] satisfies CargoBase[]).map(comId),
  // isquierdo22077: Alexandre Isquierdo (Dep. Estadual 22077) e o principal; Dr. Luizinho (1177) e Sarah Poncio (7777) sao Dep. Federal.
  isquierdo22077: ([
    { key: CARGO_DEPUTADO, numero: '22077', label: 'Alexandre Isquierdo', candidato: 'Alexandre Isquierdo (22077) · principal', descricao: 'Alexandre Isquierdo Malafaia 22077 (Deputado Estadual, principal)', color: '#339af0', gaugeMax: 1, icon: 'bi-star-fill', tone: 'primary', principal: true },
    { key: CARGO_DEPUTADO_FEDERAL, numero: '1177', label: 'Dr. Luizinho', candidato: 'Dr. Luizinho (1177) · Dep. Federal', descricao: 'Dr. Luizinho 1177 (Deputado Federal)', color: '#2ecc71', gaugeMax: 2, icon: 'bi-person-fill', tone: 'success' },
    { key: CARGO_DEPUTADO_FEDERAL, numero: '7777', label: 'Sarah Poncio', candidato: 'Sarah Poncio (7777) · Dep. Federal', descricao: 'Sarah Poncio 7777 (Deputado Federal)', color: '#f06595', gaugeMax: 1, icon: 'bi-person-fill', tone: 'danger' },
  ] satisfies CargoBase[]).map(comId),
};

const slug = companySlug ?? '';
const cargosDaEmpresa = CARGOS_POR_EMPRESA[slug];
const deputadoDaEmpresa = DEPUTADO_POR_EMPRESA[slug];

export const CARGOS: readonly CargoInfo[] =
  CANDIDATOS_POR_EMPRESA[slug] ??
  (cargosDaEmpresa ? TODOS_CARGOS.filter((c) => cargosDaEmpresa.includes(c.key)) : TODOS_CARGOS).map((c) =>
    c.key === CARGO_DEPUTADO && deputadoDaEmpresa ? comId({ ...c, ...deputadoDaEmpresa }) : c,
  );

/** A linha da view (cargo + nr_votavel) e de um candidato exibido pela empresa? */
export const ehCandidatoExibido = (cargo: string, numero: string): boolean =>
  CARGOS.some((c) => c.key === cargo && c.numero === numero);

/** Candidato que abre selecionado: o principal da empresa; senao Dep. Estadual quando exibido; senao o primeiro da lista. */
export const CARGO_INICIAL: Cargo =
  CARGOS.find((c) => c.principal)?.id ?? CARGOS.find((c) => c.key === CARGO_DEPUTADO)?.id ?? CARGOS[0]?.id ?? idDe(CARGO_PRESIDENTE, '22');

/** Cargo de deputado (estadual ou federal): usa o eixo proprio dos graficos (escala menor que Presidente/Governador). */
export const ehDeputado = (cargo: string): boolean => cargo === CARGO_DEPUTADO || cargo === CARGO_DEPUTADO_FEDERAL;

/** A empresa exibe algum deputado? */
export const temDeputado = (): boolean => CARGOS.some((c) => ehDeputado(c.key));

/** O cargo (ds_cargo) e exibido pela empresa? */
export const temCargo = (cargo: CargoKey): boolean => CARGOS.some((c) => c.key === cargo);

export const colorOf = (id: Cargo): string => CARGOS.find((c) => c.id === id)?.color ?? '#4f7cff';
export const labelOf = (id: Cargo): string => CARGOS.find((c) => c.id === id)?.label ?? id;

/** Primeira letra de cada palavra em maiuscula ("RIO DE JANEIRO" -> "Rio de Janeiro"). */
export function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(' ')
    .map((w) => (['de', 'da', 'do', 'das', 'dos', 'e'].includes(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}
