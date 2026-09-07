// STUB — paginacao EM BRANCO ate a fabrica de listas (list factory).
//
// A versao anterior (limites 10/20/50/100 + janela de 5 numeros) esta no backup
// e voltara acoplada a fabrica. Enquanto isso, nao renderiza nada.

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
