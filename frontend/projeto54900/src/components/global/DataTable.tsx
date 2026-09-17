/**
 * =========================================================================
 * FILE HEADER — components/global/DataTable.tsx
 * =========================================================================
 *
 * PROPOSITO: STUB — tabela EM BRANCO ate a fabrica de listas (list factory,
 * ver utils/listConstructor.tsx e o modulo list-constructor). A versao
 * anterior (tabela Bootstrap com ordenacao por coluna e estados de
 * loading/erro/vazio) esta no backup do projeto e sera substituida pela
 * fabrica. NAO REIMPLEMENTAR AQUI: este arquivo so mantem o modulo
 * importavel e preserva o contrato de props (`DataTableColumn`,
 * `DataTableProps`) enquanto as paginas de listagem estao em branco.
 *
 * DEPENDENCIAS: nenhuma (so tipos de react).
 * CONSUMIDORES: nenhum ainda — o contrato de props existe para paginas que
 * hoje renderizam so o stub e vao migrar para a fabrica de listas quando
 * ela existir.
 *
 * COMO REAPROVEITAR: nao criar uma tabela paralela em outra pagina — usar
 * este componente (mesmo em branco) para manter o ponto unico de futura
 * substituicao pela fabrica.
 * -------------------------------------------------------------------------
 */

import type { ReactNode } from 'react';

export interface DataTableColumn<Row = Record<string, unknown>> {
  key: string;
  label: ReactNode;
  sortable?: boolean;
  className?: string;
  render?: (row: Row) => ReactNode;
}

export interface DataTableProps<Row = Record<string, unknown>> {
  columns?: DataTableColumn<Row>[];
  rows?: Row[];
  rowKey?: string | ((row: Row) => string | number);
  loading?: boolean;
  error?: { message: string } | null;
  sort?: string;
  order?: 'ASC' | 'DESC';
  onSort?: (key: string) => void;
  onRetry?: () => void;
  emptyText?: string;
}

export default function DataTable<Row = Record<string, unknown>>(
  _props: DataTableProps<Row>,
): ReactNode {
  return (
    <div className="alert alert-secondary border d-flex align-items-center gap-2 mb-0" role="status">
      <span className="badge text-bg-secondary">stub</span>
      <span>Tabela em branco — aguardando a fabrica de listas.</span>
    </div>
  );
}
