// Tabela de ranking de bairros do dashboard de Eleicoes: busca, paginacao simples e barra de % do eleitorado.
// Dados de view_dash_votos_bairro (ordenados por votos); filtro e pagina ficam no navegador.

import { useMemo, useState } from 'react';

import type { DashVotosBairro } from '@/services/v1/eleicoes2026.dash';

import { type Cargo, colorOf, fmtInt, fmtPct, titleCase } from './dashFormat';

const PAGE = 10;

interface RankingBairrosProps {
  rows: DashVotosBairro[];
  cargo: Cargo;
}

export default function RankingBairros({ rows, cargo }: RankingBairrosProps) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);

  const ranked = useMemo(() => {
    const base = rows.filter((r) => r.cargo === cargo).sort((a, b) => b.votos - a.votos);
    return base.map((r, i) => ({ ...r, pos: i + 1 }));
  }, [rows, cargo]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return ranked;
    return ranked.filter((r) => `${r.bairro} ${r.municipio}`.toLowerCase().includes(term));
  }, [ranked, q]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, pages - 1);
  const slice = filtered.slice(current * PAGE, current * PAGE + PAGE);
  const maxPct = Math.max(...ranked.map((r) => r.pctEleitorado), 0.0001);

  return (
    <>
      <div className="input-group input-group-sm mb-3">
        <span className="input-group-text">
          <i className="bi bi-search" aria-hidden="true" />
        </span>
        <input
          type="search"
          className="form-control"
          placeholder="Buscar bairro ou município"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
        />
      </div>
      <div className="table-responsive">
        <table className="table table-sm table-hover align-middle mb-0">
          <thead>
            <tr>
              <th className="text-end">#</th>
              <th>Bairro</th>
              <th>Município</th>
              <th className="text-end">Votos</th>
              <th className="text-end d-none d-md-table-cell">Eleitores</th>
              <th style={{ minWidth: 140 }}>% do eleitorado</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((r) => (
              <tr key={`${r.cd}-${r.bairro}`}>
                <td className="text-end text-body-secondary">{r.pos}</td>
                <td className="fw-semibold">{titleCase(r.bairro)}</td>
                <td>{titleCase(r.municipio)}</td>
                <td className="text-end fw-semibold">{fmtInt(r.votos)}</td>
                <td className="text-end d-none d-md-table-cell">{fmtInt(r.eleitores)}</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className="progress flex-grow-1" style={{ height: 6 }}>
                      <div
                        className="progress-bar"
                        style={{ width: `${String((r.pctEleitorado / maxPct) * 100)}%`, backgroundColor: colorOf(cargo) }}
                      />
                    </div>
                    <span className="small text-body-secondary text-nowrap">{fmtPct(r.pctEleitorado)}</span>
                  </div>
                </td>
              </tr>
            ))}
            {slice.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-body-secondary py-4">
                  Nenhum bairro encontrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-between align-items-center mt-3 small text-body-secondary">
        <span>
          {fmtInt(filtered.length)} bairros · página {current + 1} de {pages}
        </span>
        <div className="btn-group btn-group-sm">
          <button
            type="button"
            className="btn btn-outline-secondary"
            disabled={current === 0}
            onClick={() => {
              setPage(current - 1);
            }}
          >
            Anterior
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            disabled={current >= pages - 1}
            onClick={() => {
              setPage(current + 1);
            }}
          >
            Próxima
          </button>
        </div>
      </div>
    </>
  );
}
