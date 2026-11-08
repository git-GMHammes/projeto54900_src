// Opcoes dos graficos ECharts do dashboard de Eleicoes (Home menezes22001). Funcoes puras: dados -> `build(theme)`.
// Todos os numeros vem de services/v1/eleicoes2026.dash.ts (views view_dash_*).

import type { EChartsOption } from 'echarts';

import type { ChartTheme } from '@/components/charts/EChart';
import {
  CARGO_DEPUTADO,
  type DashResumo,
  type DashVotosBairro,
  type DashVotosLocal,
  type DashVotosMunicipio,
  type DashVotosZona,
} from '@/services/v1/eleicoes2026.dash';

import { CARGOS, type Cargo, colorOf, esc, fmtCompact, fmtInt, fmtPct, labelOf, temCargo, titleCase } from './dashFormat';

export type Metrica = 'votos' | 'pct';
type Build = (t: ChartTheme) => EChartsOption;

const PALETA = ['#4f7cff', '#7c5cff', '#22b8cf', '#20c997', '#ff9f43', '#f06595', '#fcc419', '#339af0', '#868e96'];

const tip = (t: ChartTheme) => ({
  backgroundColor: t.surface,
  borderColor: t.border,
  textStyle: { color: t.text },
});

/** Um medidor por cargo exibido (CARGOS): % dos votos sobre o eleitorado. */
export function gaugeBuild(resumo: DashResumo[]): Build {
  return (t) => {
    const gauge = (cx: string, r: DashResumo | undefined, cargo: Cargo, max: number, name: string) => ({
      type: 'gauge' as const,
      center: [cx, '58%'],
      radius: '60%',
      min: 0,
      max,
      splitNumber: 4,
      progress: { show: true, width: 14, itemStyle: { color: colorOf(cargo) } },
      axisLine: { lineStyle: { width: 14, color: [[1, t.border]] as [number, string][] } },
      pointer: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { color: t.muted, distance: 22, fontSize: 10, formatter: (v: number) => `${String(v)}%` },
      anchor: { show: false },
      title: { offsetCenter: [0, '78%'], color: t.muted, fontSize: 12 },
      detail: {
        valueAnimation: true,
        offsetCenter: [0, '8%'],
        fontSize: 26,
        fontWeight: 700,
        color: t.text,
        formatter: (v: number) => fmtPct(v, max <= 1 ? 2 : 1),
      },
      data: [{ value: r?.pctEleitorado ?? 0, name }],
    });
    return {
      tooltip: { show: false },
      // Centros distribuidos por igual (3 cargos: 17%, 50%, 83%; 2 cargos: 25%, 75%).
      series: CARGOS.map((c, i) =>
        gauge(
          `${String(Math.round(((i + 0.5) / CARGOS.length) * 100))}%`,
          resumo.find((r) => r.cargo === c.key),
          c.key,
          c.gaugeMax,
          `${c.label} · escala 0–${String(c.gaugeMax)}%`,
        ),
      ),
    };
  };
}

/** Top 10 municipios por votos ou por % do eleitorado (barras horizontais). */
export function topMunicipiosBuild(rows: DashVotosMunicipio[], cargo: Cargo, metrica: Metrica): Build {
  const top = rows
    .filter((r) => r.cargo === cargo)
    .sort((a, b) => (metrica === 'votos' ? b.votos - a.votos : b.pctEleitorado - a.pctEleitorado))
    .slice(0, 10)
    .reverse();
  return (t) => ({
    tooltip: {
      ...tip(t),
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (p: unknown) => {
        const first = (Array.isArray(p) ? p[0] : p) as { dataIndex: number } | undefined;
        const r = first ? top[first.dataIndex] : undefined;
        if (!r) return '';
        return `<b>${esc(titleCase(r.nome))}</b><br/>Votos: <b>${fmtInt(r.votos)}</b><br/>Eleitores: ${fmtInt(r.eleitores)}<br/>% do eleitorado: ${fmtPct(r.pctEleitorado)}<br/>% do total do estado: ${fmtPct(r.pctEstado)}`;
      },
    },
    grid: { left: 8, right: 56, top: 8, bottom: 8, containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: t.muted, formatter: (v: number) => (metrica === 'votos' ? fmtCompact(v) : `${String(v)}%`) },
      splitLine: { lineStyle: { color: t.border, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: top.map((r) => titleCase(r.nome)),
      axisLabel: { color: t.text },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: top.map((r) => (metrica === 'votos' ? r.votos : r.pctEleitorado)),
        barWidth: '62%',
        itemStyle: { borderRadius: [0, 6, 6, 0], color: colorOf(cargo) },
        label: {
          show: true,
          position: 'right',
          color: t.muted,
          formatter: (p: { value?: unknown }) =>
            metrica === 'votos' ? fmtCompact(Number(p.value)) : fmtPct(Number(p.value), 1),
        },
        animationDuration: 900,
      },
    ],
  });
}

/** Treemap municipio -> bairro (votos), 12 municipios x 10 bairros. */
export function treemapBuild(rows: DashVotosBairro[], cargo: Cargo): Build {
  const porMun = new Map<string, { nome: string; total: number; bairros: DashVotosBairro[] }>();
  for (const r of rows) {
    if (r.cargo !== cargo) continue;
    const m = porMun.get(r.cd) ?? { nome: r.municipio, total: 0, bairros: [] };
    m.total += r.votos;
    m.bairros.push(r);
    porMun.set(r.cd, m);
  }
  const data = [...porMun.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, 12)
    .map((m) => ({
      name: titleCase(m.nome),
      value: m.total,
      children: m.bairros
        .sort((a, b) => b.votos - a.votos)
        .slice(0, 10)
        .map((b) => ({ name: titleCase(b.bairro), value: b.votos })),
    }));
  return (t) => ({
    tooltip: {
      ...tip(t),
      formatter: (p: unknown) => {
        const x = p as { name: string; value: number; treePathInfo: { name: string }[] };
        const path = x.treePathInfo
          .slice(1)
          .map((n) => esc(n.name))
          .join(' › ');
        return `<b>${path}</b><br/>Votos: <b>${fmtInt(x.value)}</b>`;
      },
    },
    series: [
      {
        type: 'treemap',
        roam: false,
        nodeClick: 'zoomToNode',
        breadcrumb: { show: true, bottom: 0, itemStyle: { color: t.border, textStyle: { color: t.text } } },
        top: 0,
        bottom: 28,
        left: 0,
        right: 0,
        label: { show: true, color: '#fff', formatter: '{b}', fontSize: 11 },
        upperLabel: { show: true, height: 22, color: '#fff', fontWeight: 600 },
        itemStyle: { borderColor: t.surface, borderWidth: 2, gapWidth: 2 },
        levels: [
          { itemStyle: { borderColor: t.surface, borderWidth: 3, gapWidth: 3 }, colorSaturation: [0.45, 0.75] },
          { colorSaturation: [0.35, 0.6], itemStyle: { gapWidth: 1, borderColorSaturation: 0.6 } },
        ],
        color: [...PALETA.slice(0, 8), '#ff6b6b', '#51cf66', '#94d82d', '#fab005'],
        data,
      },
    ],
  });
}

/** Rosca: participacao dos maiores municipios no total de votos do cargo. */
export function donutBuild(rows: DashVotosMunicipio[], cargo: Cargo): Build {
  const lista = rows.filter((r) => r.cargo === cargo).sort((a, b) => b.votos - a.votos);
  const top = lista.slice(0, 8);
  const resto = lista.slice(8).reduce((s, r) => s + r.votos, 0);
  const data = [
    ...top.map((r) => ({ name: titleCase(r.nome), value: r.votos })),
    { name: 'Demais municípios', value: resto },
  ];
  const total = lista.reduce((s, r) => s + r.votos, 0);
  return (t) => ({
    tooltip: {
      ...tip(t),
      trigger: 'item',
      formatter: (p: unknown) => {
        const x = p as { name: string; value: number; percent: number };
        return `<b>${esc(x.name)}</b><br/>Votos: <b>${fmtInt(x.value)}</b><br/>${fmtPct(x.percent, 1)} do total`;
      },
    },
    legend: { bottom: 0, type: 'scroll', textStyle: { color: t.muted }, pageTextStyle: { color: t.muted } },
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '35%',
        style: { text: fmtCompact(total), fill: t.text, fontSize: 26, fontWeight: 700, textAlign: 'center' },
      },
      {
        type: 'text',
        left: 'center',
        top: '46%',
        style: { text: `votos · ${labelOf(cargo)}`, fill: t.muted, fontSize: 12, textAlign: 'center' },
      },
    ],
    series: [
      {
        type: 'pie',
        radius: ['52%', '76%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: t.surface, borderWidth: 3, borderRadius: 8 },
        label: { show: false },
        emphasis: { scale: true, scaleSize: 6 },
        color: PALETA,
        data,
      },
    ],
  });
}

/** Mapa de calor: 20 maiores zonas (por eleitores) x cargo; cor = intensidade relativa ao maior % do cargo. */
export function heatmapBuild(rows: DashVotosZona[]): Build {
  const zonas = new Map<string, { nome: string; eleitores: number; pct: Map<string, number> }>();
  for (const r of rows) {
    const k = `${r.cd}-${r.zona}`;
    const z = zonas.get(k) ?? {
      nome: `${titleCase(r.nome)} · Z${r.zona}`,
      eleitores: r.eleitores,
      pct: new Map<string, number>(),
    };
    z.pct.set(r.cargo, r.pctEleitorado);
    zonas.set(k, z);
  }
  const top = [...zonas.values()].sort((a, b) => b.eleitores - a.eleitores).slice(0, 20);
  const max = new Map<string, number>(
    CARGOS.map((c) => [c.key, Math.max(...rows.filter((r) => r.cargo === c.key).map((r) => r.pctEleitorado), 0.0001)]),
  );
  const cells: [number, number, number][] = [];
  top.forEach((z, y) => {
    CARGOS.forEach((c, x) => {
      const p = z.pct.get(c.key) ?? 0;
      cells.push([x, y, Math.round((p / (max.get(c.key) ?? 1)) * 100)]);
    });
  });
  return (t) => ({
    tooltip: {
      ...tip(t),
      formatter: (p: unknown) => {
        const v = (p as { value: [number, number, number] }).value;
        const z = top[v[1]];
        const c = CARGOS[v[0]];
        if (!z || !c) return '';
        return `<b>${esc(z.nome)}</b><br/>${esc(c.label)}: <b>${fmtPct(z.pct.get(c.key) ?? 0)}</b> do eleitorado<br/>Eleitores da zona: ${fmtInt(z.eleitores)}`;
      },
    },
    grid: { left: 8, right: 16, top: 8, bottom: 56, containLabel: true },
    xAxis: {
      type: 'category',
      data: CARGOS.map((c) => c.label),
      axisLabel: { color: t.text },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: top.map((z) => z.nome),
      axisLabel: { color: t.muted, fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: false,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      itemWidth: 12,
      itemHeight: 120,
      text: ['mais forte', 'mais fraca'],
      textStyle: { color: t.muted },
      inRange: {
        color: t.mode === 'dark' ? ['#1b2540', '#2f5fd0', '#7fb2ff', '#ffe08a'] : ['#eef3ff', '#9db8ff', '#4f7cff', '#ff9f43'],
      },
    },
    series: [
      {
        type: 'heatmap',
        data: cells,
        itemStyle: { borderColor: t.surface, borderWidth: 3, borderRadius: 4 },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,.35)' } },
      },
    ],
  });
}

/** Dispersao dos 600 locais com mais votos de cada cargo: eleitores (x) x votos (y), um conjunto por cargo. */
export function scatterBuild(rows: DashVotosLocal[]): Build {
  return (t) => ({
    tooltip: {
      ...tip(t),
      trigger: 'item',
      formatter: (p: unknown) => {
        const l = (p as { data: { l: DashVotosLocal } }).data.l;
        return `<b>${esc(titleCase(l.local))}</b><br/>${esc(titleCase(l.municipio))} · ${esc(titleCase(l.bairro))} · Z${esc(l.zona)}<br/>${esc(labelOf(l.cargo))}: <b>${fmtInt(l.votos)}</b> votos (${fmtPct(l.pctEleitorado)})<br/>Eleitores: ${fmtInt(l.eleitores)}`;
      },
    },
    legend: { top: 0, textStyle: { color: t.muted } },
    grid: { left: 8, right: 8, top: 36, bottom: 8, containLabel: true },
    xAxis: {
      type: 'value',
      name: 'Eleitores no local',
      nameLocation: 'middle',
      nameGap: 28,
      nameTextStyle: { color: t.muted },
      axisLabel: { color: t.muted, formatter: (v: number) => fmtCompact(v) },
      splitLine: { lineStyle: { color: t.border, type: 'dashed' } },
    },
    // Presidente e Governador dividem o eixo da esquerda (mesma ordem de grandeza); Dep. Estadual tem eixo proprio.
    yAxis: [
      {
        type: 'value' as const,
        name: 'Votos (Pres./Gov.)',
        nameGap: 12,
        position: 'left' as const,
        nameTextStyle: { color: t.muted },
        axisLabel: { color: t.muted, formatter: (v: number) => fmtCompact(v) },
        splitLine: { lineStyle: { color: t.border, type: 'dashed' as const } },
      },
      // Eixo do Dep. Estadual so quando o cargo e exibido (empresa sem o cargo nao mostra o eixo).
      ...(temCargo(CARGO_DEPUTADO) ? [{
        type: 'value' as const,
        name: 'Votos (Dep.)',
        nameGap: 12,
        position: 'right' as const,
        nameTextStyle: { color: colorOf(CARGO_DEPUTADO) },
        axisLabel: { color: colorOf(CARGO_DEPUTADO), formatter: (v: number) => fmtCompact(v) },
        splitLine: { show: false },
      }] : []),
    ],
    dataZoom: [{ type: 'inside', xAxisIndex: 0 }],
    series: CARGOS.map((c) => ({
      yAxisIndex: c.key === CARGO_DEPUTADO ? 1 : 0,
      type: 'scatter' as const,
      name: c.label,
      symbolSize: 8,
      itemStyle: { color: c.color, opacity: 0.65 },
      emphasis: { itemStyle: { opacity: 1, borderColor: t.text, borderWidth: 1 } },
      data: rows.filter((r) => r.cargo === c.key).map((l) => ({ value: [l.eleitores, l.votos] as [number, number], l })),
    })),
  });
}
