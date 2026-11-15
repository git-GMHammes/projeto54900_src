// Dica do NOME DO ARQUIVO para campos que o OCR nao achou (ex.: o tipo do documento em "Relatorio.pdf").
// Regra: o que o OCR identificou SEMPRE vale; o nome do arquivo so completa a chave ausente.
// Dicionario (catalogs/sgd/arquivo.json): `{ chave: { valor: [termos...] } }` — termos sem acento e em minusculo;
// o nome do arquivo e comparado sem extensao, sem acento, em minusculo, com qualquer simbolo virando espaco
// ("Nota_Tecnica-01.pdf" -> "nota tecnica 01") e o termo precisa casar palavra inteira. Termo mais longo vence
// ("termo de referencia" antes de "termo"). Funcao pura (sem DOM): nada de rota nem modulo.

import { fold } from '@/utils/documentFields';
import type { FoundField } from '@/utils/documentFields';

/** `chave -> valor -> termos do nome do arquivo` (catalogs/sgd/arquivo.json). */
export type FileHintDictionary = Readonly<Record<string, Readonly<Record<string, readonly string[]>>>>;

/** Alias gravado no campo vindo do nome do arquivo (distingue de rotulo lido no documento). */
export const FILE_NAME_ALIAS = 'nome do arquivo';

const normalizeName = (fileName: string): string =>
  ` ${fold(fileName.replace(/\.[^.\\/]+$/, '')).replace(/[^a-z0-9]+/g, ' ').trim()} `;

/** `chave -> valor` que o nome do arquivo indica (ex.: `{ document_type: 'Relatório' }`); chave sem indicio fica de fora. */
export function matchFileHints(fileName: string, dictionary: FileHintDictionary): Record<string, string> {
  const name = normalizeName(fileName);
  const matched: Record<string, string> = {};

  for (const [key, values] of Object.entries(dictionary)) {
    let best: { value: string; length: number } | undefined;
    for (const [value, terms] of Object.entries(values)) {
      for (const term of terms) {
        const folded = fold(term).trim();
        if (!folded || !name.includes(` ${folded} `)) continue;
        if (!best || folded.length > best.length) best = { value, length: folded.length };
      }
    }
    if (best) matched[key] = best.value;
  }
  return matched;
}

/** Completa so a chave que o OCR nao achou com o que o nome do arquivo indica. */
export function applyFileHints(
  fields: readonly FoundField[],
  fileName: string,
  dictionary: FileHintDictionary,
): FoundField[] {
  const taken = new Set(fields.map((f) => f.key));
  const extra = Object.entries(matchFileHints(fileName, dictionary))
    .filter(([key]) => !taken.has(key))
    .map(([key, value]) => ({ key, alias: FILE_NAME_ALIAS, value }));
  return [...fields, ...extra];
}
