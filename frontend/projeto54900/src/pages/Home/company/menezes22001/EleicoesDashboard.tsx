// Dashboard de Eleicoes 2026 (RJ) da Home da empresa menezes22001: KPIs, medidores, ranking de municipios, treemap,
// rosca, mapa de calor, dispersao de locais e tabela de bairros. Dados das views view_dash_* (token especial, sem
// login). Cargo e metrica sao filtros do painel todo. Documentacao: markdown/geral/README_dashboard_eleicoes.md.

import { useMemo, useState, type ReactNode } from 'react';

import EChart from '@/components/charts/EChart';
import { CARGO_DEPUTADO, CARGO_GOVERNADOR, CARGO_PRESIDENTE } from '@/services/v1/eleicoes2026.dash';

import { donutBuild, gaugeBuild, heatmapBuild, type Metrica, scatterBuild, topMunicipiosBuild, treemapBuild } from './chartOptions';
import { CARGOS, type Cargo, fmtInt, fmtPct } from './dashFormat';
import KpiCard from './KpiCard';
import RankingBairros from './RankingBairros';
import { useDashboardData } from './useDashboardData';

interface PanelProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

function Panel({ title, subtitle, actions, children }: PanelProps) {
  return (
    <div className="card h-100 border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
          <div>
            <h2 className="h6 fw-bold mb-0">{title}</h2>
            {subtitle ? <div className="small text-body-secondary">{subtitle}</div> : null}
          </div>
          {actions}
        </div>
        {children}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="placeholder-glow" aria-busy="true">
      <div className="row g-3 mb-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="col-6 col-lg-4 col-xxl">
            <span className="placeholder col-12 rounded-3" style={{ height: 92 }} />
          </div>
        ))}
      </div>
      <div className="row g-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="col-lg-6">
            <span className="placeholder col-12 rounded-3" style={{ height: 340 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EleicoesDashboard() {
  const { state, reload } = useDashboardData();
  const [cargo, setCargo] = useState<Cargo>(CARGO_DEPUTADO);
  const [metrica, setMetrica] = useState<Metrica>('votos');

  const data = state.status === 'ok' ? state.data : null;

  const gauge = useMemo(() => (data ? gaugeBuild(data.resumo) : null), [data]);
  const top = useMemo(() => (data ? topMunicipiosBuild(data.municipios, cargo, metrica) : null), [data, cargo, metrica]);
  const treemap = useMemo(() => (data ? treemapBuild(data.bairros, cargo) : null), [data, cargo]);
  const donut = useMemo(() => (data ? donutBuild(data.municipios, cargo) : null), [data, cargo]);
  const heatmap = useMemo(() => (data ? heatmapBuild(data.zonas) : null), [data]);
  const scatter = useMemo(() => (data ? scatterBuild(data.locais) : null), [data]);

  const pres = data?.resumo.find((r) => r.cargo === CARGO_PRESIDENTE);
  const gov = data?.resumo.find((r) => r.cargo === CARGO_GOVERNADOR);
  const dep = data?.resumo.find((r) => r.cargo === CARGO_DEPUTADO);
  const base = pres ?? gov ?? dep;
  const cargoAtual = CARGOS.find((c) => c.key === cargo);

  return (
    <div className="container-fluid py-4">
      <div className="rounded-4 p-4 p-lg-5 mb-4 text-white bg-gradient shadow" style={{ backgroundColor: '#1d2b64' }}>
        <div className="row align-items-center g-3">
          <div className="col-lg-8">
            <div className="text-uppercase small fw-semibold opacity-75">
              <i className="bi bi-bar-chart-line-fill me-2" aria-hidden="true" />
              Painel eleitoral · Rio de Janeiro · 1º turno 2026
            </div>
            <h1 className="display-6 fw-bold my-2">Sistema Eleitoral 2026</h1>
            <p className="mb-0 opacity-75">
              Votação de Flávio Bolsonaro (Presidente), Douglas Ruas (Governador) e Coronel Menezes 22001 (Deputado
              Estadual) cruzada com o
              eleitorado de {base ? fmtInt(base.municipios) : '—'} municípios, {base ? fmtInt(base.zonas) : '—'} zonas e{' '}
              {base ? fmtInt(base.locais) : '—'} locais de votação.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end">
            <div className="btn-group" role="group" aria-label="Cargo">
              {CARGOS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className={`btn ${cargo === c.key ? 'btn-light' : 'btn-outline-light'}`}
                  onClick={() => {
                    setCargo(c.key);
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="small opacity-75 mt-2">{cargoAtual?.candidato}</div>
          </div>
        </div>
      </div>

      {state.status === 'loading' ? <Skeleton /> : null}

      {state.status === 'error' ? (
        <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
          <span>Não foi possível carregar o painel: {state.message}</span>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={reload}>
            Tentar de novo
          </button>
        </div>
      ) : null}

      {data && gauge && top && treemap && donut && heatmap && scatter ? (
        <>
          <div className="row g-3 mb-3">
            <div className="col-6 col-lg-4 col-xxl">
              <KpiCard icon="bi-people-fill" label="Eleitores" value={base?.eleitores ?? 0} hint={`${fmtInt(base?.secoes ?? 0)} seções`} />
            </div>
            <div className="col-6 col-lg-4 col-xxl">
              <KpiCard icon="bi-person-badge-fill" label="Votos Presidente" value={pres?.votos ?? 0} tone="info" hint={`${fmtPct(pres?.pctEleitorado ?? 0)} do eleitorado`} />
            </div>
            <div className="col-6 col-lg-4 col-xxl">
              <KpiCard icon="bi-bank2" label="Votos Governador" value={gov?.votos ?? 0} tone="success" hint={`${fmtPct(gov?.pctEleitorado ?? 0)} do eleitorado`} />
            </div>
            <div className="col-6 col-lg-4 col-xxl">
              <KpiCard icon="bi-patch-check-fill" label="Votos Dep. Estadual" value={dep?.votos ?? 0} tone="warning" hint={`${fmtPct(dep?.pctEleitorado ?? 0)} do eleitorado`} />
            </div>
            <div className="col-6 col-lg-4 col-xxl">
              <KpiCard icon="bi-geo-alt-fill" label="Municípios" value={base?.municipios ?? 0} tone="success" hint={`${fmtInt(base?.bairros ?? 0)} bairros`} />
            </div>
            <div className="col-6 col-lg-4 col-xxl">
              <KpiCard icon="bi-diagram-3-fill" label="Zonas eleitorais" value={base?.zonas ?? 0} tone="danger" hint={`${fmtInt(pres?.secoesComVoto ?? 0)} seções com voto`} />
            </div>
            <div className="col-6 col-lg-4 col-xxl">
              <KpiCard icon="bi-building-fill" label="Locais de votação" value={base?.locais ?? 0} tone="secondary" />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-lg-5">
              <Panel title="Votos sobre o eleitorado" subtitle="Quanto do eleitorado do estado votou em cada candidatura">
                <EChart build={gauge} height={300} />
              </Panel>
            </div>
            <div className="col-lg-7">
              <Panel
                title="Maiores municípios"
                subtitle={`Top 10 · ${cargoAtual?.label ?? ''}`}
                actions={
                  <div className="btn-group btn-group-sm" role="group" aria-label="Métrica">
                    <button type="button" className={`btn ${metrica === 'votos' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => { setMetrica('votos'); }}>
                      Votos
                    </button>
                    <button type="button" className={`btn ${metrica === 'pct' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => { setMetrica('pct'); }}>
                      % do eleitorado
                    </button>
                  </div>
                }
              >
                <EChart build={top} height={300} />
              </Panel>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-lg-8">
              <Panel title="Mapa de votos: município › bairro" subtitle="Clique num município para entrar; use o caminho abaixo para voltar">
                <EChart build={treemap} height={420} />
              </Panel>
            </div>
            <div className="col-lg-4">
              <Panel title="Participação dos municípios" subtitle="Peso de cada município no total de votos">
                <EChart build={donut} height={420} />
              </Panel>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-lg-5">
              <Panel title="Força por zona eleitoral" subtitle="20 maiores zonas · cor relativa ao melhor resultado do cargo">
                <EChart build={heatmap} height={520} />
              </Panel>
            </div>
            <div className="col-lg-7">
              <Panel title="Locais de votação" subtitle="600 maiores locais de cada cargo · eleitores x votos · role para ampliar">
                <EChart build={scatter} height={520} />
              </Panel>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12">
              <Panel title="Ranking de bairros" subtitle={`${cargoAtual?.label ?? ''} · todos os bairros com voto`}>
                <RankingBairros rows={data.bairros} cargo={cargo} />
              </Panel>
            </div>
          </div>

          <p className="small text-body-secondary text-end mt-3 mb-0">
            Atualizado em {data.carregadoEm.toLocaleString('pt-BR')} · fonte: views view_dash_* (dados importados do TSE)
          </p>
        </>
      ) : null}
    </div>
  );
}
