// Cartao de indicador (KPI) do dashboard de Eleicoes: icone, rotulo, numero com contagem animada e legenda.
// Bootstrap puro (card, utilitarios); a animacao e feita em JS (requestAnimationFrame), sem CSS proprio.

import { useEffect, useState } from 'react';

import { fmtInt } from './dashFormat';

function useCountUp(target: number, ms = 1100): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      setValue(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [target, ms]);
  return value;
}

interface KpiCardProps {
  icon: string;
  label: string;
  value: number;
  hint?: string;
  tone?: 'primary' | 'warning' | 'info' | 'success' | 'danger' | 'secondary';
}

export default function KpiCard({ icon, label, value, hint, tone = 'primary' }: KpiCardProps) {
  const shown = useCountUp(value);
  return (
    <div className="card h-100 border-0 shadow-sm">
      <div className="card-body d-flex align-items-center gap-3">
        <span
          className={`d-inline-flex align-items-center justify-content-center rounded-3 bg-${tone} bg-opacity-25 text-${tone} flex-shrink-0`}
          style={{ width: 48, height: 48 }}
        >
          <i className={`bi ${icon} fs-4`} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="text-body-secondary small text-uppercase fw-semibold text-truncate">{label}</div>
          <div className="fs-3 fw-bold lh-1 my-1">{fmtInt(shown)}</div>
          {hint ? <div className="small text-body-secondary text-truncate">{hint}</div> : null}
        </div>
      </div>
    </div>
  );
}
