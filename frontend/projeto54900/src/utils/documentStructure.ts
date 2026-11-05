// Dados do documento que NAO tem rotulo (`Campo:`), lidos por regras em JSON (catalogs/sgd):
//   patterns: o dado se reconhece pela forma (e-mail, telefone, "Oficio no 001/2026", data por extenso);
//   blocks:   o dado se reconhece pelo lugar — as linhas logo ABAIXO (`after`) ou ACIMA (`before`) de uma
//             linha ancora (ex.: o bloco do destinatario depois de "A(o) Senhor(a)");
//   texts:    o TEXTO corrido (redacao), do fim da saudacao ate o fecho, em um unico campo;
//   titles:   TITULO isolado: linha sozinha na 1a pagina (vao de paragrafo acima e abaixo), com maiuscula so na
//             inicial (caixa alta e cabecalho/tipo do documento), sem digitos nem pontuacao final; vale a primeira;
//   occurrences: o dado que se repete (CPF, CNPJ) vira um campo por ocorrencia, na ordem do documento
//             (`cpf_001`, `cpf_002`...), sem repetir o mesmo valor;
//   tables:   TABELA com cabecalho (ex.: "Conselheiro(a) | Representacao | Assinatura"): cada coluna vira um campo
//             com os valores das linhas abaixo separados por virgula (a coluna e achada pela posicao horizontal).
// Um pattern que nao casa em nenhuma linha e tentado de novo no texto da pagina (linhas unidas por espaco), para
// o valor que o documento quebra em duas linhas ("saldo de R$" / "181.600,00").
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
  /** Vao maximo (em alturas de linha) entre as linhas do bloco; sem ele vale o de paragrafo. */
  gap?: number;
}

export interface TextRule {
  key: string;
  /** Ancora da linha logo ANTES do texto (saudacao). */
  after: string;
  /** Ancora da primeira linha DEPOIS do texto (fecho). */
  until: string;
}

export interface TableColumn {
  /** Regex do titulo da coluna (sobre a linha sem acento e em minusculo). */
  header: string;
  key: string;
}

export interface TableRule {
  /** Colunas que viram campo; a tabela so vale se TODOS os titulos estiverem na mesma linha. */
  columns: readonly TableColumn[];
}

export interface TitleRule {
  key: string;
  /** Minimo de palavras do titulo. */
  minWords: number;
  /** Maximo de palavras do titulo. */
  maxWords: number;
  /** Regex (sobre a linha sem acento e em minusculo) de linhas que nao sao titulo, ex.: cabecalho de orgao. */
  skip: readonly string[];
}

export interface OccurrenceRule {
  /** Chave base: cada ocorrencia vira `<chave>_001`, `<chave>_002`... (o tipo do valor e o da chave base). */
  key: string;
  /** Regex (flags `giu`, sobre o texto da pagina com as linhas unidas); vale o 1o grupo de captura. */
  pattern: string;
}

export interface StructureRules {
  /** `chave -> regex` (flags `iu`, sobre o texto original); vale o 1o grupo de captura, ou o trecho todo. */
  patterns?: Readonly<Record<string, readonly string[]>>;
  blocks?: readonly BlockRule[];
  texts?: readonly TextRule[];
  tables?: readonly TableRule[];
  titles?: readonly TitleRule[];
  occurrences?: readonly OccurrenceRule[];
}

// Entre linhas do mesmo paragrafo o vao e pequeno; acima disso (em alturas de linha) comeca outro paragrafo.
const PARAGRAPH_GAP = 1;
// Tabela: mesma linha (diferenca dos centros verticais, em alturas) e vao maximo entre uma linha e a seguinte.
const TABLE_SAME_ROW = 0.6;
const TABLE_ROW_GAP = 2;
// Colunas de paragrafos: largura minima da linha (fracao da largura do texto da pagina) e de linhas lado a lado.
const COLUMN_MIN_WIDTH = 0.3;
const COLUMN_MIN_ROWS = 3;

// Duas caixas na mesma linha de texto (diferenca dos centros verticais menor que 0,6 da altura).
function gapRow(a: TextLine, b: TextLine): boolean {
  if (!a.box || !b.box) return false;
  const h = Math.max(a.box.y1 - a.box.y0, 1);
  return Math.abs((a.box.y0 + a.box.y1) / 2 - (b.box.y0 + b.box.y1) / 2) <= TABLE_SAME_ROW * h;
}

// Bloco: linha com menos letras/digitos que isto e ruido do OCR (pedaco de marca d'agua, carimbo) e nao vale como dado.
const MIN_BLOCK_CHARS = 4;

const hasContent = (text: string): boolean => /[\p{L}\d]/u.test(text);
const isNoise = (text: string): boolean => (text.match(/[\p{L}\d]/gu)?.length ?? 0) < MIN_BLOCK_CHARS;
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

  const add = (key: string, alias: string, raw: string, typeKey: string = key): void => {
    const value = raw.trim();
    if (!value || found.has(key)) return;
    const normalize = valueTypes[types[typeKey] ?? ''];
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

  // Blocos: as linhas abaixo/acima de uma ancora, na ordem das chaves (linhas de ruido sao puladas).
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
      if (!hasContent(line.text) || isNoise(line.text)) continue;
      if (/[:;]$/.test(line.text) || /^[^:]{1,40}:\s+\S/.test(line.text) || gapBetween(previous, line, step) > (block.gap ?? PARAGRAPH_GAP)) break;
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

  // Tabelas: titulo das colunas numa linha; as linhas abaixo, ate o primeiro vao grande, sao os registros.
  for (const table of rules.tables ?? []) {
    const first = table.columns[0];
    if (!first) continue;
    const titles = table.columns.map((c) => anchor(c.header));
    const rowOf = (a: TextLine, b: TextLine): boolean => {
      if (!a.box || !b.box || a.page !== b.page) return false;
      const h = Math.max(a.box.y1 - a.box.y0, 1);
      return Math.abs((a.box.y0 + a.box.y1) / 2 - (b.box.y0 + b.box.y1) / 2) <= TABLE_SAME_ROW * h;
    };

    let headerAt = -1;
    let cells: { line: TextLine; key: string | undefined }[] = [];
    for (let i = 0; i < lines.length && headerAt < 0; i += 1) {
      const line = lines[i];
      if (!line?.box || !titles[0]?.test(folded[i] ?? '')) continue;
      const row = lines.flatMap((other, k) => (other.box && rowOf(line, other) ? [{ line: other, k }] : []));
      const matched = titles.map((t) => row.some(({ k }) => t.test(folded[k] ?? '')));
      if (!matched.every(Boolean)) continue;
      headerAt = i;
      cells = row
        .sort((a, b) => (a.line.box?.x0 ?? 0) - (b.line.box?.x0 ?? 0))
        .map(({ line: cell, k }) => ({
          line: cell,
          key: table.columns.find((c) => anchor(c.header).test(folded[k] ?? ''))?.key,
        }));
    }
    const header = lines[headerAt];
    if (!header?.box) continue;

    const columnOf = (cell: TextLine): string | undefined => {
      const h = Math.max(header.box!.y1 - header.box!.y0, 1);
      let key: string | undefined;
      let found = false;
      for (const c of cells) {
        if ((c.line.box?.x0 ?? 0) <= (cell.box?.x0 ?? 0) + 0.5 * h) {
          key = c.key;
          found = true;
        }
      }
      return found ? key : undefined;
    };

    const values = new Map<string, string[]>();
    let rowLine: TextLine = header;
    let rowBottom = header.box.y1;
    let current = new Map<string, string>();
    const flush = (): void => {
      current.forEach((text, key) => values.set(key, [...(values.get(key) ?? []), text]));
      current = new Map();
    };
    for (let i = headerAt + 1; i < lines.length; i += 1) {
      const line = lines[i];
      if (!line?.box || line.page !== header.page || !hasContent(line.text)) continue;
      if (rowOf(header, line)) continue;
      const h = Math.max(line.box.y1 - line.box.y0, 1);
      if ((line.box.y0 - rowBottom) / h > TABLE_ROW_GAP) break;
      if (!rowOf(rowLine, line)) {
        flush();
        rowLine = line;
      }
      rowBottom = Math.max(rowBottom, line.box.y1);
      const key = columnOf(line);
      if (key) current.set(key, current.has(key) ? `${current.get(key)} ${line.text}` : line.text);
    }
    flush();
    for (const column of table.columns) add(column.key, column.header, (values.get(column.key) ?? []).join(', '));
  }

  // Padroes: a forma do dado; vale a primeira ocorrencia no documento. Sem casar em nenhuma linha, tenta no texto
  // da pagina (linhas unidas por espaco), para o valor quebrado em duas linhas.
  // Em duas colunas de paragrafos (as linhas das colunas ficam na mesma altura), le uma coluna inteira e depois a
  // outra, senao a frase de uma coluna e cortada pela da outra. Rotulo/valor e tabela (linhas curtas) nao contam.
  const inColumns = (run: readonly TextLine[], width: number, mid: number, tol: number): TextLine[] => {
    const wide = (l: TextLine): boolean => !!l.box && l.box.x1 - l.box.x0 >= COLUMN_MIN_WIDTH * width;
    const left = run.filter((l) => l.box && l.box.x1 <= mid + tol);
    const right = run.filter((l) => l.box && l.box.x0 >= mid - tol && !left.includes(l));
    const rows = left.filter(
      (a) => wide(a) && right.some((b) => wide(b) && gapRow(a, b)),
    ).length;
    return rows >= COLUMN_MIN_ROWS && left.length + right.length === run.length ? [...left, ...right] : [...run];
  };
  const pageLines = (page: number): TextLine[] => {
    const all = lines.filter((l) => l.page === page);
    const boxes = all.flatMap((l) => (l.box ? [l.box] : []));
    if (boxes.length < 2 * COLUMN_MIN_ROWS) return all;
    const minX = Math.min(...boxes.map((b) => b.x0));
    const maxX = Math.max(...boxes.map((b) => b.x1));
    const [width, mid] = [maxX - minX, (minX + maxX) / 2];
    const tol = width * 0.02;
    const ordered: TextLine[] = [];
    let run: TextLine[] = [];
    const flush = (): void => {
      ordered.push(...inColumns(run, width, mid, tol));
      run = [];
    };
    for (const line of all) {
      const spans = !line.box || (line.box.x0 < mid - tol && line.box.x1 > mid + tol);
      if (spans) {
        flush();
        ordered.push(line);
      } else run.push(line);
    }
    flush();
    return ordered;
  };
  const pageText = (page: number): string =>
    pageLines(page)
      .map((l) => l.text)
      .join(' ');
  const pages = [...new Set(lines.map((l) => l.page))];
  // Linha visual: caixas na mesma altura, da esquerda para a direita (rotulo e valor de tabela sao caixas separadas).
  const visualRows: string[] = [];
  {
    const rows: TextLine[][] = [];
    for (const line of lines) {
      if (!line.box) continue;
      const row = rows.find((r) => r[0]?.page === line.page && r[0] && gapRow(r[0], line));
      if (row) row.push(line);
      else rows.push([line]);
    }
    for (const row of rows) {
      if (row.length < 2) continue;
      visualRows.push([...row].sort((a, b) => (a.box?.x0 ?? 0) - (b.box?.x0 ?? 0)).map((l) => l.text).join(' '));
    }
  }
  for (const [key, sources] of Object.entries(rules.patterns ?? {})) {
    const regexes = sources.map((source) => ({ source, re: new RegExp(source, 'iu') }));
    const byLine = regexes.flatMap(({ source, re }) => {
      const hit = lines.map((l) => re.exec(l.text)).find((m) => m !== null);
      return hit ? [{ source, hit }] : [];
    })[0];
    const byRow = regexes.flatMap(({ source, re }) => {
      const hit = visualRows.map((t) => re.exec(t)).find((m) => m !== null);
      return hit ? [{ source, hit }] : [];
    })[0];
    const hit =
      byLine ??
      byRow ??
      regexes.flatMap(({ source, re }) => {
        for (const page of pages) {
          const m = re.exec(pageText(page));
          if (m) return [{ source, hit: m }];
        }
        return [];
      })[0];
    if (hit) add(key, hit.source, hit.hit[1] ?? hit.hit[0]);
  }

  // Ocorrencias: todas as aparicoes do padrao, na ordem de leitura (pagina a pagina), numeradas.
  for (const rule of rules.occurrences ?? []) {
    const seen = new Set<string>();
    for (const page of pages) {
      for (const m of pageText(page).matchAll(new RegExp(rule.pattern, 'giu'))) {
        const raw = (m[1] ?? m[0]).trim();
        const identity = raw.replace(/[^\p{L}\d]/gu, '').toLowerCase();
        if (!identity || seen.has(identity)) continue;
        seen.add(identity);
        add(`${rule.key}_${String(seen.size).padStart(3, '0')}`, rule.pattern, raw, rule.key);
      }
    }
  }

  // Titulos: por ultimo, para a linha nao ser valor de outro campo ja achado.
  const firstPage = Math.min(...lines.map((l) => l.page));
  for (const rule of rules.titles ?? []) {
    const taken = new Set([...found.values()].map((f) => f.value));
    const index = lines.findIndex((line, i) => {
      const text = line.text;
      if (line.page !== firstPage || !line.box || taken.has(text)) return false;
      const words = text.split(/\s+/).length;
      const shape =
        /^\p{Lu}/u.test(text) && text !== text.toUpperCase() && !/[\d:]/.test(text) && !/[.,;:]$/.test(text);
      if (!shape || words < rule.minWords || words > rule.maxWords) return false;
      if (rule.skip.some((pattern) => anchor(pattern).test(folded[i] ?? ''))) return false;
      const above = lines[i - 1];
      const below = lines[i + 1];
      const gapAbove = above?.page === line.page ? gapBetween(above, line, 1) : Infinity;
      const gapBelow = below?.page === line.page ? gapBetween(line, below, 1) : Infinity;
      return gapAbove > PARAGRAPH_GAP && gapBelow > PARAGRAPH_GAP;
    });
    const title = lines[index];
    if (title) add(rule.key, 'titulo isolado', title.text);
  }

  return [...found.values()];
}
