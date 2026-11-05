/**
 * =========================================================================
 * FILE HEADER — components/charts/EChart.tsx
 * =========================================================================
 *
 * PROPOSITO: componente base de grafico (Apache ECharts, import modular). Recebe `build(theme)`, que devolve as
 * opcoes do grafico ja com as cores do tema Bootstrap em uso (claro/escuro), lidas do proprio DOM:
 * `data-bs-theme` do ancestral mais proximo e variaveis `--bs-*` do elemento. Reage a troca de tema
 * (MutationObserver) e redimensiona com o container.
 *
 * COMO REAPROVEITAR: <EChart height={320} build={(t) => ({ ... })} />. Para um grafico novo, registrar aqui o tipo
 * (BarChart, LineChart...) em `echarts.use([...])`; nao importar `echarts` inteiro.
 *
 * CONSUMIDORES: pages/Home/company/menezes22001/EleicoesDashboard.tsx.
 * -------------------------------------------------------------------------
 */

import type { EChartsOption } from 'echarts';
import { BarChart, GaugeChart, HeatmapChart, PieChart, ScatterChart, TreemapChart } from 'echarts/charts';
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { useEffect, useMemo, useRef, useState } from 'react';

echarts.use([
  BarChart,
  GaugeChart,
  HeatmapChart,
  PieChart,
  ScatterChart,
  TreemapChart,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

/** Cores do tema Bootstrap vigente, entregues a quem monta as opcoes do grafico. */
export interface ChartTheme {
  mode: 'light' | 'dark';
  text: string;
  muted: string;
  border: string;
  surface: string;
}

const FALLBACK: ChartTheme = { mode: 'light', text: '#212529', muted: '#6c757d', border: '#dee2e6', surface: '#ffffff' };

function readTheme(el: HTMLElement): ChartTheme {
  const holder = el.closest<HTMLElement>('[data-bs-theme]');
  const mode = holder?.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light';
  const css = getComputedStyle(el);
  const v = (name: string, fallback: string): string => css.getPropertyValue(name).trim() || fallback;
  return {
    mode,
    text: v('--bs-body-color', FALLBACK.text),
    muted: v('--bs-secondary-color', FALLBACK.muted),
    border: v('--bs-border-color', FALLBACK.border),
    surface: v('--bs-body-bg', FALLBACK.surface),
  };
}

interface EChartProps {
  build: (theme: ChartTheme) => EChartsOption;
  height?: number;
  className?: string;
}

export default function EChart({ build, height = 320, className }: EChartProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<ChartTheme>(FALLBACK);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    setTheme(readTheme(el));
    const holder = el.closest<HTMLElement>('[data-bs-theme]');
    if (!holder) return undefined;
    const observer = new MutationObserver(() => {
      setTheme(readTheme(el));
    });
    observer.observe(holder, { attributes: true, attributeFilter: ['data-bs-theme', 'style', 'class'] });
    return () => {
      observer.disconnect();
    };
  }, []);

  const option = useMemo<EChartsOption>(
    () => ({ backgroundColor: 'transparent', textStyle: { color: theme.text }, ...build(theme) }),
    [build, theme],
  );

  return (
    <div ref={boxRef} className={className}>
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        notMerge
        lazyUpdate
        style={{ height, width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}
