// Dicionário de palavras proibidas do chat. A lista fica em
// src/config/palavras-proibidas.json (campo 'palavras'): para adicionar ou
// remover, edite só o JSON.
//
// Regras:
//  - Não diferencia maiúscula de minúscula nem acento ('Cú' = 'cu').
//  - Só palavras INTEIRAS: 'cu' bloqueia 'vai tomar no cu', mas não 'custo' nem 'cuidado'.
//  - Frases também valem (espaços são comparados como um espaço só).
//
// Usado pelo frontend para impedir o envio. O backend ainda não tem esta
// validação (ver README_modulo_chatrooms.md, filtro de palavrão).

import dicionario from '@/config/palavras-proibidas.json';

/** Minúsculas, sem acento e com espaços simples. */
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Padrões prontos: a palavra precisa ter fronteira de letra/número (ou início/fim) dos dois lados.
const padroes = dicionario.palavras
  .map((original) => ({ original, normalizada: normalizar(original) }))
  .filter((p) => p.normalizada !== '')
  .map((p) => ({
    original: p.original,
    regex: new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(p.normalizada)}(?![\\p{L}\\p{N}])`, 'u'),
  }));

/** Palavras proibidas presentes no texto (como cadastradas no JSON). Lista vazia = texto liberado. */
export function palavrasProibidasEncontradas(texto: string): string[] {
  const alvo = normalizar(texto);
  if (alvo === '') return [];
  return padroes.filter((p) => p.regex.test(alvo)).map((p) => p.original);
}
