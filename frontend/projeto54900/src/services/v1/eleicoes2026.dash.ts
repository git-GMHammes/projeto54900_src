/**
 * =========================================================================
 * FILE HEADER — services/v1/eleicoes2026.dash.ts
 * =========================================================================
 *
 * PROPOSITO: leitura das views de dashboard `view_dash_*` (dominio Eleicoes2026) para a Home da empresa
 * menezes22001, SEM LOGIN, pelo token especial (eleicoes2026.public.ts). Espelho de
 * app/Config/Routes/Api/v1/Eleicoes2026/Dash*\/EndPointView.php. Somente leitura (GET get-no-pagination).
 *   - A API devolve numeros como texto: aqui tudo vira number/string tipado (nenhum `any`).
 *   - Os candidatos se distinguem por `ds_cargo` + `nr_votavel` (PRESIDENTE 22 = Flavio Bolsonaro;
 *     DEPUTADO ESTADUAL 22001 = Coronel Menezes, 70222 = Helcio Angelo; GOVERNADOR 22 = Douglas Ruas).
 *
 * CONSUMIDORES: pages/Home/company/menezes22001/useDashboardData.ts.
 * Documentacao: markdown/geral/README_dashboard_eleicoes.md.
 * -------------------------------------------------------------------------
 */

import { API_GROUPS } from '@/constants/api';
import { eleicoesPublicGet } from '@/services/v1/eleicoes2026.public';
import type { QueryParams } from '@/types/api';
import { normalizeList } from '@/utils/apiResult';

export const CARGO_PRESIDENTE = 'PRESIDENTE';
export const CARGO_DEPUTADO = 'DEPUTADO ESTADUAL';
export const CARGO_GOVERNADOR = 'GOVERNADOR';

type Raw = Record<string, unknown>;

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const txt = (v: unknown): string => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '');

async function fetchRows(group: string, params?: QueryParams): Promise<Raw[]> {
  const raw = await eleicoesPublicGet(group, 'get-no-pagination', params);
  return normalizeList<Raw>(raw).rows;
}

/** Totais do estado por cargo (view_dash_resumo_geral). */
export interface DashResumo {
  cargo: string;
  /** nr_votavel: distingue candidatos do mesmo cargo (ex.: Dep. Estadual 22001 x 70222). */
  numero: string;
  votos: number;
  secoesComVoto: number;
  eleitores: number;
  secoes: number;
  locais: number;
  municipios: number;
  zonas: number;
  bairros: number;
  pctEleitorado: number;
}

/** Votos e eleitorado por municipio e cargo (view_dash_votos_municipio). */
export interface DashVotosMunicipio {
  cd: string;
  nome: string;
  cargo: string;
  /** nr_votavel: distingue candidatos do mesmo cargo (ex.: Dep. Estadual 22001 x 70222). */
  numero: string;
  votos: number;
  eleitores: number;
  pctEleitorado: number;
  pctEstado: number;
}

/** Votos e eleitorado por municipio, zona e cargo (view_dash_votos_zona). */
export interface DashVotosZona {
  cd: string;
  nome: string;
  zona: string;
  cargo: string;
  /** nr_votavel: distingue candidatos do mesmo cargo (ex.: Dep. Estadual 22001 x 70222). */
  numero: string;
  votos: number;
  eleitores: number;
  pctEleitorado: number;
}

/** Votos e eleitorado por municipio, bairro e cargo (view_dash_votos_bairro). */
export interface DashVotosBairro {
  cd: string;
  municipio: string;
  bairro: string;
  cargo: string;
  /** nr_votavel: distingue candidatos do mesmo cargo (ex.: Dep. Estadual 22001 x 70222). */
  numero: string;
  votos: number;
  eleitores: number;
  pctEleitorado: number;
}

/** Votos e eleitorado por local de votacao e cargo (view_dash_votos_local_votacao). */
export interface DashVotosLocal {
  municipio: string;
  zona: string;
  local: string;
  bairro: string;
  cargo: string;
  /** nr_votavel: distingue candidatos do mesmo cargo (ex.: Dep. Estadual 22001 x 70222). */
  numero: string;
  votos: number;
  eleitores: number;
  pctEleitorado: number;
}

export async function fetchDashResumo(): Promise<DashResumo[]> {
  const rows = await fetchRows(API_GROUPS.eleicoes2026DashResumoGeralView);
  return rows.map((r) => ({
    cargo: txt(r.ds_cargo),
    numero: txt(r.nr_votavel),
    votos: num(r.qt_votos),
    secoesComVoto: num(r.qt_secoes_com_voto),
    eleitores: num(r.qt_eleitores),
    secoes: num(r.qt_secoes),
    locais: num(r.qt_locais_votacao),
    municipios: num(r.qt_municipios),
    zonas: num(r.qt_zonas),
    bairros: num(r.qt_bairros),
    pctEleitorado: num(r.pct_votos_eleitorado),
  }));
}

export async function fetchDashVotosMunicipio(): Promise<DashVotosMunicipio[]> {
  const rows = await fetchRows(API_GROUPS.eleicoes2026DashVotosMunicipioView, { sort: 'qt_votos', order: 'desc' });
  return rows.map((r) => ({
    cd: txt(r.cd_municipio),
    nome: txt(r.nm_municipio),
    cargo: txt(r.ds_cargo),
    numero: txt(r.nr_votavel),
    votos: num(r.qt_votos),
    eleitores: num(r.qt_eleitores),
    pctEleitorado: num(r.pct_votos_eleitorado),
    pctEstado: num(r.pct_votos_estado),
  }));
}

export async function fetchDashVotosZona(): Promise<DashVotosZona[]> {
  const rows = await fetchRows(API_GROUPS.eleicoes2026DashVotosZonaView, { sort: 'qt_votos', order: 'desc' });
  return rows.map((r) => ({
    cd: txt(r.cd_municipio),
    nome: txt(r.nm_municipio),
    zona: txt(r.nr_zona),
    cargo: txt(r.ds_cargo),
    numero: txt(r.nr_votavel),
    votos: num(r.qt_votos),
    eleitores: num(r.qt_eleitores),
    pctEleitorado: num(r.pct_votos_eleitorado),
  }));
}

export async function fetchDashVotosBairro(): Promise<DashVotosBairro[]> {
  const rows = await fetchRows(API_GROUPS.eleicoes2026DashVotosBairroView, { sort: 'qt_votos', order: 'desc' });
  return rows.map((r) => ({
    cd: txt(r.cd_municipio),
    municipio: txt(r.nm_municipio),
    bairro: txt(r.nm_bairro),
    cargo: txt(r.ds_cargo),
    numero: txt(r.nr_votavel),
    votos: num(r.qt_votos),
    eleitores: num(r.qt_eleitores),
    pctEleitorado: num(r.pct_votos_eleitorado),
  }));
}

/** Alvo de uma consulta: um candidato = cargo + numero (nr_votavel). */
export interface AlvoCandidato {
  cargo: string;
  numero: string;
}

/** Os 600 locais de votacao com mais votos de CADA candidato informado (a view tem ~9.400 linhas; o grafico nao precisa de todas). */
export async function fetchDashVotosLocais(alvos: readonly AlvoCandidato[]): Promise<DashVotosLocal[]> {
  const porCargo = await Promise.all(
    alvos.map(async ({ cargo, numero }) => {
      const raw = await eleicoesPublicGet(API_GROUPS.eleicoes2026DashVotosLocalVotacaoView, 'search', {
        'filters[ds_cargo]': cargo,
        'filters[nr_votavel]': numero,
        sort: 'qt_votos',
        order: 'desc',
        limit: 600,
      });
      return normalizeList<Raw>(raw).rows;
    }),
  );
  return porCargo.flat().map((r) => ({
    municipio: txt(r.nm_municipio),
    zona: txt(r.nr_zona),
    local: txt(r.nm_local_votacao),
    bairro: txt(r.nm_bairro),
    cargo: txt(r.ds_cargo),
    numero: txt(r.nr_votavel),
    votos: num(r.qt_votos),
    eleitores: num(r.qt_eleitores),
    pctEleitorado: num(r.pct_votos_eleitorado),
  }));
}
