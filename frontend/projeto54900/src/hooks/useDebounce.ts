/**
 * =========================================================================
 * FILE HEADER — hooks/useDebounce.ts
 * =========================================================================
 *
 * PROPOSITO: devolve uma versao com atraso de qualquer valor — util para
 * campo de busca, evitando disparar 1 chamada de API por tecla digitada.
 *
 *   const term = useDebounce(inputValue, 400);
 *
 * DEPENDENCIAS: nenhuma (arquivo autocontido).
 * CONSUMIDORES: componentes de busca com filtro local que chama a API (ex.:
 * campo de busca de uma listagem antes de reconsultar).
 *
 * COMO REAPROVEITAR: usar o valor "debounced" retornado (nao o valor bruto
 * do input) como dependencia de um useEffect/useApi que chama a API.
 * -------------------------------------------------------------------------
 */

import { useEffect, useState } from 'react';

/** Atualiza o valor retornado so `delay` ms depois da ultima mudanca de `value`. */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
