// Dados e regras de apresentacao das Eleicoes 2026 no mapa SVG-2026.
// Candidatos: na view os dois se distinguem apenas por ds_cargo (Menezes =
// DEPUTADO ESTADUAL, Flavio Bolsonaro = PRESIDENTE). Ordem de exibicao sempre
// do maior para o menor voto.

import { env } from '@/config/env';
import {
  eleicoes2026Candidato22001BairroView,
  eleicoes2026Candidato22001MunicipioView,
  eleicoes2026Candidato22001View,
} from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';

export interface Candidato {
  chave: 'menezes' | 'flavio';
  nome: string;
  cargo: string;
  numero: string;
  /** Foto 200x200 (~10 KB) em public/svg-2026/. */
  foto: string;
}

export const MENEZES: Candidato = { chave: 'menezes', nome: 'Coronel Menezes', cargo: 'DEPUTADO ESTADUAL', numero: '22001', foto: 'menezes_22001.jpg' };
export const FLAVIO: Candidato = { chave: 'flavio', nome: 'Flávio Bolsonaro', cargo: 'PRESIDENTE', numero: '22', foto: 'flavio_22.jpg' };
export const CANDIDATOS: Candidato[] = [MENEZES, FLAVIO];

/** Votos por ds_cargo. */
export type VotosPorCargo = Record<string, number>;

export interface TotaisMunicipio {
  cdTse: string;
  nome: string;
  votos: VotosPorCargo;
}

export interface BairroVotos {
  bairro: string;
  votos: number;
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
  const linhas = await buscarTudo(
    (f, p) => eleicoes2026Candidato22001MunicipioView.find(f, p),
    {},
    'qt_votos',
  );
  const porMunicipio: Record<string, TotaisMunicipio> = {};
  const totalRj: VotosPorCargo = {};
  for (const l of linhas) {
    const cdTse = txt(l.cd_municipio);
    const cargo = txt(l.ds_cargo);
    const votos = num(l.qt_votos);
    const atual = porMunicipio[cdTse] ?? { cdTse, nome: txt(l.nm_municipio), votos: {} };
    atual.votos[cargo] = (atual.votos[cargo] ?? 0) + votos;
    porMunicipio[cdTse] = atual;
    totalRj[cargo] = (totalRj[cargo] ?? 0) + votos;
  }
  return { porMunicipio, totalRj };
}

/** Bairros de um municipio com os votos de cada candidato, cada lista do maior para o menor. */
export async function carregarBairros(cdTse: string): Promise<Record<Candidato['chave'], BairroVotos[]>> {
  const linhas = await buscarTudo(
    (f, p) => eleicoes2026Candidato22001BairroView.find(f, p),
    { cd_municipio: cdTse },
    'qt_votos',
  );
  const resultado: Record<Candidato['chave'], BairroVotos[]> = { menezes: [], flavio: [] };
  for (const c of CANDIDATOS) {
    resultado[c.chave] = linhas
      .filter((l) => txt(l.ds_cargo) === c.cargo)
      .map((l) => ({ bairro: txt(l.nm_bairro).trim() || SEM_BAIRRO, votos: num(l.qt_votos) }))
      .sort((a, b) => b.votos - a.votos);
  }
  return resultado;
}

/** Secoes de um bairro (local, endereco, zona/secao, votos), do maior para o menor voto. */
export async function carregarSecoes(cdTse: string, bairro: string, cargo: string): Promise<SecaoVotos[]> {
  const linhas = await buscarTudo(
    (f, p) => eleicoes2026Candidato22001View.find(f, p),
    { cd_municipio: cdTse, nm_bairro: bairro, ds_cargo: cargo },
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

export { SEM_BAIRRO };
