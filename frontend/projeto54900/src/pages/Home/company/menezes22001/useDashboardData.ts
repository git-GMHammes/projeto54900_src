// Carrega, em paralelo, as views view_dash_* usadas no dashboard da Home menezes22001 (token especial, sem login).
// Falha de qualquer chamada vira estado `error` (a Home nao quebra); `reload` tenta de novo.

import { useCallback, useEffect, useState } from 'react';

import {
  type DashResumo,
  type DashVotosBairro,
  type DashVotosLocal,
  type DashVotosMunicipio,
  type DashVotosZona,
  fetchDashResumo,
  fetchDashVotosBairro,
  fetchDashVotosLocais,
  fetchDashVotosMunicipio,
  fetchDashVotosZona,
} from '@/services/v1/eleicoes2026.dash';

export interface DashboardData {
  resumo: DashResumo[];
  municipios: DashVotosMunicipio[];
  zonas: DashVotosZona[];
  bairros: DashVotosBairro[];
  locais: DashVotosLocal[];
  carregadoEm: Date;
}

export type DashboardState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ok'; data: DashboardData };

export function useDashboardData(): { state: DashboardState; reload: () => void } {
  const [state, setState] = useState<DashboardState>({ status: 'loading' });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    Promise.all([
      fetchDashResumo(),
      fetchDashVotosMunicipio(),
      fetchDashVotosZona(),
      fetchDashVotosBairro(),
      fetchDashVotosLocais(),
    ])
      .then(([resumo, municipios, zonas, bairros, locais]) => {
        if (cancelled) return;
        setState({ status: 'ok', data: { resumo, municipios, zonas, bairros, locais, carregadoEm: new Date() } });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setState({ status: 'error', message: e instanceof Error ? e.message : 'Falha ao carregar os dados.' });
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const reload = useCallback(() => {
    setTick((n) => n + 1);
  }, []);

  return { state, reload };
}
