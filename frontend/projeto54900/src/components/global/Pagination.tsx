/**
 * =========================================================================
 * FILE HEADER — components/global/Pagination.tsx
 * =========================================================================
 *
 * PROPOSITO: STUB — paginacao EM BRANCO ate a fabrica de listas (list
 * factory). A versao anterior (limites 10/20/50/100 + janela de 5 numeros)
 * esta no backup e voltara acoplada a fabrica. Enquanto isso, nao renderiza
 * nada (retorna null). NAO REIMPLEMENTAR AQUI: este arquivo so mantem o
 * modulo importavel e preserva o contrato de props (`PaginationProps`).
 *
 * Para o CALCULO da janela de paginas (sem UI), ja existe
 * utils/pagination.ts (paginationWindow) — cada pagina hoje monta seu
 * proprio JSX de paginacao usando esse helper, sem depender deste stub.
 *
 * DEPENDENCIAS: nenhuma.
 * CONSUMIDORES: nenhum ainda.
 *
 * COMO REAPROVEITAR: nao criar uma paginacao paralela em outra pagina —
 * usar utils/pagination.ts (paginationWindow) para o calculo e este
 * componente (quando implementado) para o chrome visual padrao.
 * -------------------------------------------------------------------------
 */

export interface PaginationProps {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export default function Pagination(_props: PaginationProps): null {
  return null;
}
