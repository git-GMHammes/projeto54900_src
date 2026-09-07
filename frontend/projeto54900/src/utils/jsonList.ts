// Par montar/parse para campos cujo valor persistido é uma LISTA JSON de strings
// (ex.: form_manager.profile_group = ["admin","user"]), mas cuja edição é um
// controle comum (select múltiplo). O usuário nunca digita JSON.
// Ver src/markdown/geral/README_campo_json_montado.md.

/**
 * Estado da UI (array de strings) → string para persistir.
 * Lista vazia vira `''` (não `'[]'`).
 */
export function toStringList(items: readonly string[]): string {
  return items.length > 0 ? JSON.stringify(items) : '';
}

/**
 * String persistida → array de strings, tolerante:
 * `''`, JSON inválido ou formato inesperado (não-array / itens não-string)
 * devolvem `[]`, nunca lançam.
 */
export function parseStringList(raw: string): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === 'string')
      : [];
  } catch {
    return [];
  }
}
