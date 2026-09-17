/**
 * =========================================================================
 * FILE HEADER — utils/jsonList.ts
 * =========================================================================
 *
 * PROPOSITO: par montar/parse para campos cujo valor persistido e uma LISTA
 * JSON de strings (ex.: form_manager.roles = ["admin","user"],
 * list_actions.roles), mas cuja edicao e um controle comum (select
 * multiplo/checkboxes). O usuario nunca digita JSON — ver
 * README_campo_json_montado.md para o contrato completo.
 *
 * DEPENDENCIAS: nenhuma (arquivo autocontido).
 * CONSUMIDORES: utils/listConstructor.tsx usa parseStringList() no renderer
 * de coluna `roles-badges` (mostra a lista de papeis como badges); qualquer
 * form de construtor com campo "roles"/"lista de strings" usa o par
 * toStringList/parseStringList para converter entre o array editado na UI e
 * a string JSON gravada no banco.
 *
 * COMO REAPROVEITAR EM OUTRO CAMPO JSON DE STRINGS: usar
 * parseStringList(valorDoBanco) para hidratar o estado da UI como array, e
 * toStringList(arrayEditado) para persistir de volta no submit.
 * -------------------------------------------------------------------------
 */

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
