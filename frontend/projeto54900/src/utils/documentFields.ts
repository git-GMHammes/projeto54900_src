// Identifica, no texto de um documento (OCR), os campos do dicionario do SGD.
//
// Dicionario: `{ chave: [rotulos...] }` (ver catalogs/sgd). O rotulo no documento pode
// vir como "Nome", "NOME", "nome" ou "Nome Completo": a comparacao ignora acento e
// caixa. O valor e o que vem depois do rotulo:
//   1. "Nome: Maria"                     -> mesma linha, depois de `:`;
//   2. "Nome: Maria   CPF: 123.456..."   -> varios rotulos na mesma linha;
//   3. "Nome:" (valor vazio) ou so "Nome" numa caixa -> o valor esta AO LADO ou ABAIXO do rotulo, pela
//      posicao na pagina (utils/documentLayout.ts); em texto puro, a linha seguinte.
// Quando uma chave aparece mais de uma vez, vale a primeira ocorrencia NO DOCUMENTO (ordem das linhas).
// Secoes (`sections`, ver catalogs/sgd/secoes.json): `{ prefixo: [titulos] }`. Campo achado abaixo de um titulo
// (mesma pagina, mais acima) vira `<prefixo>_<chave>` (ex.: "DESTINATARIO" -> `recipient_zip_code`), porque o
// mesmo rotulo se repete em cada bloco do documento. Prefixo `main` (ou vazio) volta ao nivel sem prefixo.

import { assignValues, continuation } from '@/utils/documentLayout';
import type { TextLine } from '@/utils/documentLayout';
import { extraKey, valueTypes } from '@/utils/documentValueTypes';

export type FieldDictionary = Readonly<Record<string, readonly string[]>>;

/** `prefixo -> titulos de secao` (catalogs/sgd/secoes.json). */
export type SectionDictionary = Readonly<Record<string, readonly string[]>>;

/** `chave -> tipo de valor` (utils/documentValueTypes.ts); chave fora do mapa nao e ajustada. */
export type FieldTypes = Readonly<Record<string, string>>;

export interface FoundField {
  /** Chave do sistema (ex.: `name`). */
  key: string;
  /** Rotulo (do dicionario) encontrado no documento. */
  alias: string;
  /** Valor lido no documento. */
  value: string;
}

interface Entry {
  key: string;
  alias: string;
  folded: string;
  inline: RegExp;
}

interface Hit {
  entry: Entry;
  start: number;
  end: number;
}

// Sem acento e minusculo, mantendo UM caractere por caractere: os indices do texto
// dobrado valem no texto original.
export function fold(text: string): string {
  return text
    .split('')
    .map((ch) => ch.normalize('NFD').charAt(0).toLowerCase())
    .join('');
}

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

const compile = (dictionary: FieldDictionary): Entry[] => {
  const entries: Entry[] = [];
  for (const [key, aliases] of Object.entries(dictionary)) {
    for (const alias of aliases) {
      const folded = fold(alias).trim();
      if (!folded) continue;
      entries.push({
        key,
        alias,
        folded,
        // Fronteira antes do rotulo, depois dele `:` (ou `;`, que o OCR confunde).
        inline: new RegExp(`(^|[^a-z0-9])(${escapeRegExp(folded)})(\\s*[:;])`, 'g'),
      });
    }
  }
  // Rotulo mais longo primeiro: "nome da mae" vence "nome" e "mae".
  return entries.sort((a, b) => b.folded.length - a.folded.length);
};

const findHits = (folded: string, entries: Entry[]): Hit[] => {
  const hits: Hit[] = [];
  for (const entry of entries) {
    entry.inline.lastIndex = 0;
    for (const m of folded.matchAll(entry.inline)) {
      const start = m.index + (m[1]?.length ?? 0);
      const end = m.index + m[0].length;
      // `;` no lugar de `:` e erro de OCR so no comeco da linha; no meio dela e pontuacao de frase ("no local;").
      if (m[3]?.includes(';') && start > 0) continue;
      if (hits.some((h) => start < h.end && end > h.start)) continue;
      hits.push({ entry, start, end });
    }
  }
  return hits.sort((a, b) => a.start - b.start);
};

const clean = (value: string): string => value.replace(/^[\s:;|_-]+|[\s;|_]+$/g, '').trim();

export function extractFields(
  input: string | readonly TextLine[],
  dictionary: FieldDictionary,
  types: FieldTypes = {},
  sections: SectionDictionary = {},
): FoundField[] {
  const entries = compile(dictionary);
  const lines: readonly TextLine[] = (
    typeof input === 'string' ? input.split(/\r?\n/).map((text) => ({ text, page: 0 })) : input
  ).map((line) => ({ ...line, text: line.text.trim() }));
  const folded = lines.map((l) => fold(l.text));
  const hitsByLine = folded.map((f) => findHits(f, entries));

  // Caixa so com o rotulo, sem `:` (ex.: "Nome").
  const byFolded = new Map<string, Entry>();
  for (const entry of entries) if (!byFolded.has(entry.folded)) byFolded.set(entry.folded, entry);
  const aloneEntry = (i: number): Entry | undefined =>
    (hitsByLine[i]?.length ?? 0) > 0 ? undefined : byFolded.get((folded[i] ?? '').replace(/[^a-z0-9/.]+$/g, '').trim());

  // Secao de cada linha: o ultimo titulo acima dela (pagina e posicao vertical; em texto puro, a ordem das linhas).
  const sectionTitles = new Map<string, string>();
  for (const [prefix, titles] of Object.entries(sections)) {
    for (const title of titles) sectionTitles.set(fold(title).trim(), prefix);
  }
  const headings: { prefix: string; page: number; pos: number; line: number }[] = [];
  folded.forEach((f, i) => {
    const line = lines[i];
    const prefix = sectionTitles.get(f.replace(/[^a-z0-9/.]+$/g, '').trim());
    if (line && prefix !== undefined) headings.push({ prefix, page: line.page, pos: line.box?.y0 ?? i, line: i });
  });
  const sectionOf = (i: number): string => {
    const line = lines[i];
    if (!line) return '';
    const pos = line.box?.y0 ?? i;
    let best: (typeof headings)[number] | undefined;
    for (const h of headings) {
      const above = h.page < line.page || (h.page === line.page && h.pos <= pos);
      if (above && (!best || h.page > best.page || (h.page === best.page && h.pos > best.pos))) best = h;
    }
    return best && best.prefix !== 'main' ? best.prefix : '';
  };

  // Rotulo nunca vale como valor: rotulo do dicionario, titulo de secao ou texto que termina em `:` (rotulo desconhecido).
  const isHeading = (i: number): boolean => headings.some((h) => h.line === i);
  const isLabel = (i: number): boolean =>
    (hitsByLine[i]?.length ?? 0) > 0 || aloneEntry(i) !== undefined || isHeading(i) || /[:;]$/.test(lines[i]?.text ?? '');

  // Rotulos na ordem do documento; `value` null = sem valor na propria caixa (vem ao lado ou abaixo).
  const labels: { entry: Entry; line: number; value: string | null }[] = [];
  hitsByLine.forEach((hits, i) => {
    hits.forEach((hit, h) => {
      const text = lines[i]?.text ?? '';
      const inline = clean(text.slice(hit.end, hits[h + 1]?.start ?? text.length));
      const last = h === hits.length - 1;
      labels.push({ entry: hit.entry, line: i, value: inline || (last ? null : '') });
    });
  });
  folded.forEach((_f, i) => {
    const entry = aloneEntry(i);
    if (entry) labels.push({ entry, line: i, value: null });
  });

  // Primeira ocorrencia vale a do topo do documento, seja rotulo com `:` ou caixa so com o rotulo.
  labels.sort((a, b) => a.line - b.line);

  // Valor ao lado/abaixo, pela posicao na pagina (ou a linha seguinte, em texto puro).
  const needers = [...new Set(labels.filter((l) => l.value === null).map((l) => l.line))];
  const assigned = assignValues(lines, needers, isLabel);

  // Valor ao lado do rotulo que quebra de linha na celula: as linhas coladas abaixo continuam o valor.
  const owned = new Set(assigned.values());
  const continued = new Map<number, number[]>();
  for (const [label, value] of assigned) {
    const rest = continuation(lines, label, value, (k) => isLabel(k) || owned.has(k));
    if (rest.length === 0) continue;
    rest.forEach((k) => owned.add(k));
    continued.set(label, rest);
  }

  const found = new Map<string, FoundField>();
  for (const { entry, line, value } of labels) {
    const parts = [assigned.get(line) ?? -1, ...(continued.get(line) ?? [])].map((k) => lines[k]?.text ?? '');
    const raw = value ?? clean(parts.join(' '));
    if (!raw) continue;

    const section = sectionOf(line);
    // Em secao, `document_date` vira `<secao>_date` (o atributo e da secao, nao do documento).
    const key = section ? `${section}_${entry.key.replace(/^document_/, '')}` : entry.key;
    if (found.has(key)) continue;
    const normalize = valueTypes[types[entry.key] ?? ''];
    const result = normalize ? normalize(raw) : raw;
    found.set(key, { key, alias: entry.alias, value: typeof result === 'string' ? result : result.value });
    // Partes extras (ex.: horario separado da data) viram campos `<chave>_<sufixo>`.
    if (typeof result !== 'string') {
      for (const [suffix, extra] of Object.entries(result.extra)) {
        const extraField = extraKey(key, suffix);
        found.set(extraField, { key: extraField, alias: entry.alias, value: extra });
      }
    }
  }
  return [...found.values()];
}
