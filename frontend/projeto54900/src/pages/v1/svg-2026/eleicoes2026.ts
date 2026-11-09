// Dados e regras de apresentacao das Eleicoes 2026 no mapa SVG-2026.
// Candidatos: nas views se distinguem por ds_cargo + nr_votavel (Menezes = DEPUTADO ESTADUAL 22001,
// Helcio = DEPUTADO ESTADUAL 70222, Flavio Bolsonaro = PRESIDENTE 22, Douglas Ruas = GOVERNADOR 22).
// Cada empresa so exibe os seus: as linhas dos demais sao descartadas nos loaders abaixo.
// Ordem de exibicao dos bairros/secoes sempre do maior para o menor voto.

import { companySlug, env } from '@/config/env';
import {
  eleicoes2026Candidato22001BairroView,
  eleicoes2026Candidato22001MunicipioView,
  eleicoes2026Candidato22001View,
} from '@/services/v1';
import { fetchDashVotosBairro, fetchDashVotosMunicipio } from '@/services/v1/eleicoes2026.dash';
import { normalizeList } from '@/utils/apiResult';

export interface Candidato {
  chave: 'menezes' | 'flavio' | 'douglas' | 'helcio' | 'paes' | 'garotinho' | 'isquierdo' | 'luizinho' | 'sarah';
  nome: string;
  cargo: string;
  numero: string;
  /** Foto 200x200 (~10 KB) em public/svg-2026/. */
  foto: string;
}

export const MENEZES: Candidato = { chave: 'menezes', nome: 'Coronel Menezes', cargo: 'DEPUTADO ESTADUAL', numero: '22001', foto: 'menezes_22001.jpg' };
export const FLAVIO: Candidato = { chave: 'flavio', nome: 'Flávio Bolsonaro', cargo: 'PRESIDENTE', numero: '22', foto: 'flavio_22.jpg' };
export const DOUGLAS: Candidato = { chave: 'douglas', nome: 'Douglas Ruas', cargo: 'GOVERNADOR', numero: '22', foto: 'douglas_22.jpg' };
export const HELCIO: Candidato = { chave: 'helcio', nome: 'Hélcio Ângelo', cargo: 'DEPUTADO ESTADUAL', numero: '70222', foto: 'ha_70222.jpg' };
export const PAES: Candidato = { chave: 'paes', nome: 'Eduardo Paes', cargo: 'GOVERNADOR', numero: '55', foto: 'Paes_55.jpg' };
export const GAROTINHO: Candidato = { chave: 'garotinho', nome: 'Garotinho', cargo: 'GOVERNADOR', numero: '10', foto: 'Garotinho_55.jpg' };
export const ISQUIERDO: Candidato = { chave: 'isquierdo', nome: 'Alexandre Isquierdo', cargo: 'DEPUTADO ESTADUAL', numero: '22077', foto: 'isquierdo_22077_200.png' };
export const LUIZINHO: Candidato = { chave: 'luizinho', nome: 'Dr. Luizinho', cargo: 'DEPUTADO FEDERAL', numero: '1177', foto: 'luizinho_1177_200.jpg' };
export const SARAH: Candidato = { chave: 'sarah', nome: 'Sarah Poncio', cargo: 'DEPUTADO FEDERAL', numero: '7777', foto: 'sarah_7777_200.jpg' };

/** Candidatos exibidos por empresa (slug da URL). Empresa sem entrada usa a lista completa. */
const CANDIDATOS_POR_EMPRESA: Readonly<Record<string, Candidato[]>> = {
  // Helcio Angelo: Presidente, Governador e ele mesmo (Dep. Estadual 70222); o Coronel Menezes nao aparece.
  'helcio-angelo-70222': [HELCIO, FLAVIO, DOUGLAS],
  // Eduardo Paes (principal) com Douglas Ruas e Garotinho: os tres sao GOVERNADOR, distintos por nr_votavel.
  paes55: [PAES, DOUGLAS, GAROTINHO],
  // Alexandre Isquierdo (Dep. Estadual 22077, principal) com Dr. Luizinho (1177) e Sarah Poncio (7777), Dep. Federal.
  isquierdo22077: [ISQUIERDO, LUIZINHO, SARAH],
  // jcfroes: Douglas Ruas (Governador 22, principal) com Flavio Bolsonaro (Presidente 22) e Eduardo Paes (Governador 55).
  jcfroes: [DOUGLAS, FLAVIO, PAES],
};

export const CANDIDATOS: Candidato[] = CANDIDATOS_POR_EMPRESA[companySlug ?? ''] ?? [MENEZES, FLAVIO, DOUGLAS];

/** Coluna Bootstrap de cada card conforme a quantidade de candidatos (3 -> 4, 2 -> 6). */
/** A linha da view pertence a um candidato exibido pela empresa (cargo + numero)? */
function ehCandidatoDaEmpresa(l: Record<string, unknown>): boolean {
  return CANDIDATOS.some((c) => c.cargo === txt(l.ds_cargo) && c.numero === txt(l.nr_votavel));
}

export const COL_CANDIDATO = CANDIDATOS.length >= 3 ? 4 : 12 / Math.max(CANDIDATOS.length, 1);

/** Votos por candidato (chave = chaveVotos: ds_cargo + nr_votavel; um cargo pode ter varios candidatos). */
export type VotosPorCargo = Record<string, number>;

/** Chave de um candidato em VotosPorCargo. */
export const chaveVotos = (c: { cargo: string; numero: string }): string => `${c.cargo}|${c.numero}`;

export interface TotaisMunicipio {
  cdTse: string;
  nome: string;
  votos: VotosPorCargo;
  /** Eleitores aptos do municipio (view_dash_votos_municipio); 0 quando indisponivel. */
  eleitores: number;
}

export interface BairroVotos {
  bairro: string;
  votos: number;
  /** Eleitores aptos do bairro (view_dash_votos_bairro); 0 quando indisponivel. */
  eleitores: number;
}

export interface SecaoVotos {
  chave: string;
  local: string;
  endereco: string;
  zona: string;
  secao: string;
  votos: number;
}

type Linha = Record<string, unknown>;

const PAGE_LIMIT = 1000;
const SEM_BAIRRO = '(sem bairro)';

function txt(v: unknown): string {
  return typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '';
}

function num(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Percorre todas as paginas (limite maximo da API = 1000) de um find. */
async function buscarTudo(
  find: (filtros: Record<string, string>, pag: Record<string, string | number>) => Promise<unknown>,
  filtros: Record<string, string>,
  sort: string,
): Promise<Linha[]> {
  const todas: Linha[] = [];
  for (let page = 1; page <= 50; page += 1) {
    const { rows, total } = normalizeList<Linha>(await find(filtros, { page, limit: PAGE_LIMIT, sort, order: 'DESC' }));
    todas.push(...rows);
    if (rows.length === 0 || todas.length >= total) break;
  }
  return todas;
}

/** Totais de votos por municipio (chave = codigo TSE) e o total do RJ. */
export async function carregarTotaisMunicipios(): Promise<{
  porMunicipio: Record<string, TotaisMunicipio>;
  totalRj: VotosPorCargo;
}> {
  const [linhas, eleitorado] = await Promise.all([
    buscarTudo((f, p) => eleicoes2026Candidato22001MunicipioView.find(f, p), {}, 'qt_votos'),
    // O eleitorado e complemento: se falhar, o modal segue mostrando so os votos.
    fetchDashVotosMunicipio().catch((err: unknown) => {
      console.warn('[Svg2026] Eleitorado por municipio indisponivel:', err);
      return [];
    }),
  ]);
  const eleitoresPorMunicipio: Record<string, number> = {};
  for (const e of eleitorado) eleitoresPorMunicipio[e.cd] = e.eleitores;
  const porMunicipio: Record<string, TotaisMunicipio> = {};
  const totalRj: VotosPorCargo = {};
  for (const l of linhas.filter(ehCandidatoDaEmpresa)) {
    const cdTse = txt(l.cd_municipio);
    const cargo = `${txt(l.ds_cargo)}|${txt(l.nr_votavel)}`;
    const votos = num(l.qt_votos);
    const atual = porMunicipio[cdTse] ?? {
      cdTse,
      nome: txt(l.nm_municipio),
      votos: {},
      eleitores: eleitoresPorMunicipio[cdTse] ?? 0,
    };
    atual.votos[cargo] = (atual.votos[cargo] ?? 0) + votos;
    porMunicipio[cdTse] = atual;
    totalRj[cargo] = (totalRj[cargo] ?? 0) + votos;
  }
  return { porMunicipio, totalRj };
}

/** Eleitores por bairro (chave: codigo TSE do municipio + bairro em maiusculas), carregados uma unica vez. */
let cacheEleitoresBairro: Promise<Map<string, number>> | null = null;

function chaveBairro(cdTse: string, bairro: string): string {
  return `${cdTse}|${bairro.trim().toUpperCase()}`;
}

function eleitoresPorBairro(): Promise<Map<string, number>> {
  cacheEleitoresBairro ??= fetchDashVotosBairro()
    .then((linhas) => new Map(linhas.map((l) => [chaveBairro(l.cd, l.bairro), l.eleitores] as const)))
    .catch((err: unknown) => {
      // O eleitorado e complemento: sem ele a linha de percentual some. Na proxima abertura tenta de novo.
      console.warn('[Svg2026] Eleitorado por bairro indisponivel:', err);
      cacheEleitoresBairro = null;
      return new Map<string, number>();
    });
  return cacheEleitoresBairro;
}

/** Bairros de um municipio com os votos de cada candidato, cada lista do maior para o menor. */
export async function carregarBairros(cdTse: string): Promise<Record<Candidato['chave'], BairroVotos[]>> {
  const [linhas, eleitores] = await Promise.all([
    buscarTudo((f, p) => eleicoes2026Candidato22001BairroView.find(f, p), { cd_municipio: cdTse }, 'qt_votos'),
    eleitoresPorBairro(),
  ]);
  const resultado: Record<Candidato['chave'], BairroVotos[]> = { menezes: [], flavio: [], douglas: [], helcio: [], paes: [], garotinho: [], isquierdo: [], luizinho: [], sarah: [] };
  for (const c of CANDIDATOS) {
    resultado[c.chave] = linhas
      .filter((l) => txt(l.ds_cargo) === c.cargo && txt(l.nr_votavel) === c.numero)
      .map((l) => ({
        bairro: txt(l.nm_bairro).trim() || SEM_BAIRRO,
        votos: num(l.qt_votos),
        eleitores: eleitores.get(chaveBairro(cdTse, txt(l.nm_bairro))) ?? 0,
      }))
      .sort((a, b) => b.votos - a.votos);
  }
  return resultado;
}

/** Secoes de um bairro (local, endereco, zona/secao, votos), do maior para o menor voto. */
export async function carregarSecoes(cdTse: string, bairro: string, cargo: string, numero: string): Promise<SecaoVotos[]> {
  const linhas = await buscarTudo(
    (f, p) => eleicoes2026Candidato22001View.find(f, p),
    { cd_municipio: cdTse, nm_bairro: bairro, ds_cargo: cargo, nr_votavel: numero },
    'qt_votos',
  );
  return linhas
    .filter((l) => txt(l.nm_bairro).trim() === bairro)
    .map((l) => ({
      chave: txt(l.cd_municipio_zona_secao),
      local: txt(l.nm_local_votacao),
      endereco: txt(l.ds_endereco),
      zona: txt(l.nr_zona),
      secao: txt(l.nr_secao),
      votos: num(l.qt_votos),
    }))
    .sort((a, b) => b.votos - a.votos);
}

/** URL publica da foto do candidato. */
export function urlFoto(c: Candidato): string {
  return `${env.basePath}/svg-2026/${c.foto}`;
}

export function formatarVotos(n: number): string {
  return n.toLocaleString('pt-BR');
}

/** Percentual de votos sobre o eleitorado, com 2 casas (ex.: 46,16%); vazio se nao houver eleitorado. */
export function formatarPctEleitorado(votos: number, eleitores: number): string {
  if (eleitores <= 0) return '';
  return `${((votos / eleitores) * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

export { SEM_BAIRRO };
