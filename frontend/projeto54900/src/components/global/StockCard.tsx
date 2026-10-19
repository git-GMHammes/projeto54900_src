// Componente global reutilizavel: CARTAO DE SALDO de um produto (saldo, reservado, encomendado,
// disponivel e alerta de abaixo do minimo) sobre a view de saldo, por PROPS -- nao le useParams().
// `load` devolve a linha de view_movement_stock do produto. Sem linha (produto sem movimento ou
// modulo Movimento sem uso) o cartao nao aparece: nenhum modulo e requisito do outro.
import { useEffect, useState } from 'react';

import { normalizeItem } from '@/utils/apiResult';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';

export interface StockCardProps {
  /** Busca a linha de saldo do produto (ex.: `() => movementStockView.get(productId)`). Deve ser estavel. */
  load: () => Promise<unknown>;
  /** Chave que muda para forcar nova leitura (ex.: apos um movimento). */
  reloadKey?: number;
}

const num = (value: unknown): string => {
  const n = Number(value);
  return Number.isFinite(n) ? String(Math.round(n * 1000) / 1000) : '0';
};

export default function StockCard({ load, reloadKey = 0 }: StockCardProps) {
  const [row, setRow] = useState<ApiRow | null>(null);

  useEffect(() => {
    let alive = true;
    load()
      .then((raw) => {
        if (alive) setRow(normalizeItem(raw));
      })
      .catch(() => {
        if (alive) setRow(null);
      });
    return () => {
      alive = false;
    };
  }, [load, reloadKey]);

  if (!row) return null;

  const items: [string, string][] = [
    ['Saldo', num(row.on_hand)],
    ['Reservado', num(row.reserved)],
    ['Encomendado', num(row.ordered)],
    ['Disponível', num(row.available)],
  ];
  const below = Number(row.below_min) === 1;
  const nextExpected = toText(row.next_expected_at, '');

  return (
    <div className="card mb-3">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span>Estoque</span>
        {below ? <span className="badge text-bg-danger">Abaixo do mínimo ({num(row.stock_min)})</span> : null}
      </div>
      <div className="card-body">
        <div className="row text-center">
          {items.map(([label, value]) => (
            <div className="col-6 col-md-3 mb-2" key={label}>
              <div className="small text-body-secondary">{label}</div>
              <div className="fs-4">{value}</div>
            </div>
          ))}
        </div>
        {nextExpected ? <p className="small text-body-secondary mb-0">Próxima chegada prevista: {nextExpected}</p> : null}
      </div>
    </div>
  );
}
