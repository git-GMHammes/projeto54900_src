// Dados do documento que NAO tem rotulo (`Campo:`), lidos por regras em JSON (catalogs/sgd):
//   patterns: o dado se reconhece pela forma (e-mail, telefone, "Oficio no 001/2026", data por extenso);
//   blocks:   o dado se reconhece pelo lugar — as linhas logo ABAIXO (`after`) ou ACIMA (`before`) de uma
//             linha ancora (ex.: o bloco do destinatario depois de "A(o) Senhor(a)");
//   texts:    o TEXTO corrido (redacao), do fim da saudacao ate o fecho, em um unico campo.
// Ancoras sao expressoes regulares sobre a linha sem acento e em minusculo. Funcao pura (sem DOM): so
// completa o que `extractFields` nao achou — a chave que ja existe no dicionario nao e sobrescrita.

import { fold } from '@/utils/documentFields';
import type { FieldTypes, FoundField } from '@/utils/documentFields';
import type { TextLine } from '@/utils/documentLayout';
import { extraKey, valueTypes } from '@/utils/documentValueTypes';

export interface BlockRule {
  /** Linha ancora; as `keys` sao as linhas seguintes (de cima para baixo). */
  after?: string;
  /** Linha ancora; as `keys` sao as linhas imediatamente acima dela (de cima para baixo). */
  before?: string;
  keys: readonly string[];
}

export interface TextRule {
  key: string;
  /** Ancora da linha logo ANTES do texto (saudacao). */
  after: string;
  /** Ancora da primeira linha DEPOIS do texto (fecho). */
  until: string;
}

export interface StructureRules {
  /** `chave -> regex` (flags `iu`, sobre o texto original); vale o 1o grupo de captura, ou o trecho todo. */
  patterns?: Readonly<Record<string, readonly string[]>>;
  blocks?: readonly BlockRule[];
  texts?: readonly TextRule[];
}

// Entre linhas do mesmo paragrafo o vao e pequeno; acima disso (em alturas de linha) comeca outro paragrafo.
const PARAGRAPH_GAP = 1;

const hasContent = (text: string): boolean => /[\p{L}\d]/u.test(text);
const foldLine = (text: string): string => fold(text).replace(/[^a-z0-9)]+$/g, '').trim();

// Ordem de leitura: pagina e posicao vertical (o OCR nem sempre entrega as caixas nessa ordem).
function readingOrder(input: readonly TextLine[]): TextLine[] {
  const key = (line: TextLine, i: number): number => (line.box ? (line.box.y0 + line.box.y1) / 2 : i);
  return input
    .map((line, i) => ({ line: { ...line, text: line.text.trim() }, i }))
    .filter(({ line }) => line.text)
    .sort((a, b) => a.line.page - b.line.page || key(a.line, a.i) - key(b.line, b.i))
    .map(({ line }) => line);
}

// Vao vertical entre duas linhas (em alturas de linha); sem posicao (texto puro) nao ha vao.
function gapBetween(a: TextLine | undefined, b: TextLine, step: number): number {
  if (!a?.box || !b.box) return 0;
  const [upper, lower] = step > 0 ? [a.box, b.box] : [b.box, a.box];
  return (lower.y0 - upper.y1) / Math.max(lower.y1 - lower.y0, 1);
}

export function extractStructure(
  input: readonly TextLine[],
  rules: StructureRules,
  types: FieldTypes = {},
): FoundField[] {
  const lines = readingOrder(input);
  const folded = lines.map((l) => foldLine(l.text));
  const found = new Map<string, FoundField>();

  const add = (key: string, alias: string, raw: string): void => {
    const value = raw.trim();
    if (!value || found.has(key)) return;
    const normalize = valueTypes[types[key] ?? ''];
    const result = normalize ? normalize(value) : value;
    found.set(key, { key, alias, value: typeof result === 'string' ? result : result.value });
    if (typeof result !== 'string') {
      for (const [suffix, extra] of Object.entries(result.extra)) {
        found.set(extraKey(key, suffix), { key: extraKey(key, suffix), alias, value: extra });
      }
    }
  };
  const anchor = (pattern: string): RegExp => new RegExp(pattern, 'iu');
  const samePage = (a: number, b: number): boolean => lines[a]?.page === lines[b]?.page;

  // Texto corrido: do fim da saudacao ate o fecho.
  for (const rule of rules.texts ?? []) {
    const start = folded.findIndex((f) => anchor(rule.after).test(f));
    if (start < 0) continue;
    let text = '';
    let previous: TextLine | undefined;
    for (let i = start + 1; i < lines.length && samePage(start, i); i += 1) {
      const line = lines[i];
      if (!line || anchor(rule.until).test(folded[i] ?? '')) break;
      const paragraph = gapBetween(previous, line, 1) > PARAGRAPH_GAP;
      text += (text ? (paragraph ? '\n\n' : ' ') : '') + line.text;
      previous = line;
    }
    add(rule.key, rule.after, text);
  }

  // Blocos: as linhas abaixo/acima de uma ancora, na ordem das chaves.
  for (const block of rules.blocks ?? []) {
    const pattern = block.after ?? block.before;
    if (!pattern) continue;
    const at = folded.findIndex((f) => anchor(pattern).test(f));
    if (at < 0) continue;

    // O bloco termina no primeiro vao de paragrafo ou em linha de rotulo (`Assunto:`).
    const picked: number[] = [];
    const step = block.after ? 1 : -1;
    let previous = lines[at];
    for (let i = at + step; i >= 0 && i < lines.length && picked.length < block.keys.length; i += step) {
      const line = lines[i];
      if (!line || !samePage(at, i)) break;
      if (!hasContent(line.text)) continue;
      if (/[:;]$/.test(line.text) || /^[^:]{1,40}:\s+\S/.test(line.text) || gapBetween(previous, line, step) > PARAGRAPH_GAP) break;
      picked.push(i);
      previous = line;
    }
    const ordered = block.after ? picked : picked.reverse();
    const keys = block.after ? block.keys : block.keys.slice(block.keys.length - ordered.length);
    ordered.forEach((lineIndex, k) => {
      const key = keys[k];
      if (key) add(key, pattern, lines[lineIndex]?.text ?? '');
    });
  }

  // Padroes: a forma do dado; vale a primeira ocorrencia no documento.
  for (const [key, sources] of Object.entries(rules.patterns ?? {})) {
    for (const source of sources) {
      const re = new RegExp(source, 'iu');
      const hit = lines.map((l) => re.exec(l.text)).find((m) => m !== null);
      if (hit) {
        add(key, source, hit[1] ?? hit[0]);
        break;
      }
    }
  }

  return [...found.values()];
}
