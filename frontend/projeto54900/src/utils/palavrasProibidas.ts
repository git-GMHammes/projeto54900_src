// Dicionário de palavras proibidas do chat. A lista fica em
// src/config/palavras-proibidas.json (campo 'palavras'): para adicionar ou
// remover, edite só o JSON.
//
// Regras:
//  - Não diferencia maiúscula de minúscula nem acento ('Cú' = 'cu').
//  - Só palavras INTEIRAS: 'cu' bloqueia 'vai tomar no cu', mas não 'custo' nem 'cuidado'.
//  - Frases também valem (espaços são comparados como um espaço só).
//
// Usado pelo frontend para impedir o envio (chat de salas e módulo Messages). No módulo Messages o BACKEND valida
// com a mesma regra e o mesmo JSON (App\Libraries\ForbiddenWords): a mensagem é recusada (422), fica bloqueada e gera
// advertência. O chat de salas ainda não tem esta validação no backend (ver README_modulo_chatrooms.md).

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

/**
 * Aviso pronto para o texto de uma mensagem do módulo Messages (admin isento — área administrativa irrestrita).
 * null = texto liberado.
 */
export function avisoPalavrasProibidas(texto: string, isAdmin: boolean): string | null {
  if (isAdmin) return null;
  const achadas = palavrasProibidasEncontradas(texto);

  return achadas.length > 0 ? `Palavra proibida: ${achadas.join(', ')}. Remova para enviar.` : null;
}
