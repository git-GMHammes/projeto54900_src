// Pagina /v1/svg-map (modulo svgMap): mapa SVG dos 92 municipios do RJ
// (malha SVG simplificada, <path id="CD_MUN">) com tooltip de nome no hover
// e checklist de municipios sincronizado com o mapa nos 2 sentidos:
//   - marcar/desmarcar o checkbox -> pinta/limpa o municipio no SVG
//   - clicar no municipio do SVG  -> marca/desmarca o checkbox
// Ao marcar, o municipio recebe a cor dele (fill inline), o nome aparece acima
// e uma bolinha branca e desenhada no centro (<text>/<circle> via getBBox()).
//
// Origem: projeto CakePHP diarias — templates/Web/V1A/Mapa/Page/index.php +
// webroot/js/sad/v1a/pages/mapa/mapa_rj_tooltip.js e mapa_rj_checklist.js.
// O checklist usa o CheckboxField do FormGrid (controlado) no lugar do
// field_checkbox.js do Cake e fica num Offcanvas (Bootstrap), aberto pelo
// botao bi-card-checklist no canto superior esquerdo.
//
// Arquivos estaticos em public/svg-map/:
//   - rj_municipios.svg         — mapa (inserido inline para permitir hover/clique por path)
//   - rj_municipios_nomes.json  — [{CD_MUN, NM_MUN}] (fonte dos nomes; obrigatorio)
//   - rj_municipios_cores.json  — [{CD_MUN, NM_MUN, cor}] (cor por municipio, vizinhos
//                                 com cores distintas; opcional — fallback corPorIndice)

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import PageHeader from '@/components/global/PageHeader';
import { CheckboxField } from '@/components/ui/FormGrid/checkbox';
import { env } from '@/config/env';

const ASSET_BASE = `${env.basePath}/svg-map`;
const SVG_NS = 'http://www.w3.org/2000/svg';
const LABELS_GROUP_ID = 'svgMapLabels';
const TENTATIVAS_AUTOMATICAS = 1; // 1 nova tentativa silenciosa antes de pedir acao do usuario
const TOOLTIP_PADRAO = 'Passe o mouse sobre um município.';
const TODOS = 'todos';

interface Municipio {
  CD_MUN: string;
  NM_MUN: string;
}

interface AjusteLabel {
  dx?: number;
  dy?: number;
  dxNome?: number;
  dyNome?: number;
}

// Ajustes manuais de posicao do rotulo (bolinha + nome), em unidades do viewBox
// do SVG — municipios cujo centro do bbox cai fora/na borda do proprio desenho.
const AJUSTES_LABEL_MANUAIS: Record<string, AjusteLabel> = {
  '3304201': { dx: 14, dy: -12 },
  '3305901': { dx: 5, dy: -9 },
  '3301405': { dx: -8, dy: -9 },
  '3300233': { dx: -10, dy: 6, dxNome: 30 },
  '3303955': { dx: 0, dy: 5, dxNome: 0 },
  '3301009': { dx: 0, dy: 40, dxNome: 0 },
  '3301504': { dx: 0, dy: 0, dxNome: 0 },
};

// Fallback: so entra em jogo se o CD_MUN nao estiver em rj_municipios_cores.json.
function corPorIndice(indice: number): string {
  const hue = (indice * 137.508) % 360;
  return `hsl(${hue.toFixed(1)}, 65%, 45%)`;
}

function isMunicipio(value: unknown): value is Municipio {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.CD_MUN === 'string' && v.CD_MUN !== '' && typeof v.NM_MUN === 'string' && v.NM_MUN !== '';
}

function parseMunicipios(payload: unknown): Municipio[] {
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error('Resposta vazia ou inválida de rj_municipios_nomes.json.');
  }
  const lista = payload.filter(isMunicipio);
  if (lista.length === 0) {
    throw new Error('Formato inesperado em rj_municipios_nomes.json (esperado CD_MUN/NM_MUN).');
  }
  return lista.map((m) => ({ CD_MUN: m.CD_MUN, NM_MUN: m.NM_MUN }));
}

function parseCores(payload: unknown): Record<string, string> {
  const dict: Record<string, string> = {};
  if (!Array.isArray(payload)) return dict;
  for (const item of payload) {
    if (typeof item !== 'object' || item === null) continue;
    const v = item as Record<string, unknown>;
    if (typeof v.CD_MUN === 'string' && typeof v.cor === 'string') dict[v.CD_MUN] = v.cor;
  }
  return dict;
}

async function fetchText(url: string): Promise<string> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} ao buscar ${url}.`);
  return resp.text();
}

async function fetchJson(url: string): Promise<unknown> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} ao buscar ${url}.`);
  return resp.json() as Promise<unknown>;
}

// Cores sao opcionais: falha aqui nao bloqueia o mapa.
async function fetchCores(): Promise<Record<string, string>> {
  try {
    return parseCores(await fetchJson(`${ASSET_BASE}/rj_municipios_cores.json`));
  } catch {
    return {};
  }
}

function desenharLabel(grupo: SVGGElement, path: SVGPathElement, cdMun: string, nome: string): void {
  const bbox = path.getBBox();
  const ajuste = AJUSTES_LABEL_MANUAIS[cdMun];
  const cx = bbox.x + bbox.width / 2 + (ajuste?.dx ?? 0);
  const cy = bbox.y + bbox.height / 2 + (ajuste?.dy ?? 0);
  const nomeX = cx + (ajuste?.dxNome ?? 0);
  const nomeY = cy + (ajuste?.dyNome ?? 0);

  const g = document.createElementNS(SVG_NS, 'g');
  g.setAttribute('data-cdmun', cdMun);

  const texto = document.createElementNS(SVG_NS, 'text');
  texto.setAttribute('x', String(nomeX));
  texto.setAttribute('y', String(nomeY - 5));
  texto.setAttribute('text-anchor', 'middle');
  texto.setAttribute('font-size', '7');
  texto.setAttribute('font-weight', 'bold');
  texto.setAttribute('fill', '#1a1a2e');
  texto.setAttribute('stroke', '#ffffff');
  texto.setAttribute('stroke-width', '2.5');
  texto.setAttribute('paint-order', 'stroke');
  texto.textContent = nome;
  g.appendChild(texto);

  // Bolinha branca com borda escura: visivel em qualquer cor de municipio.
  const bolinha = document.createElementNS(SVG_NS, 'circle');
  bolinha.setAttribute('cx', String(cx));
  bolinha.setAttribute('cy', String(cy));
  bolinha.setAttribute('r', '2.2');
  bolinha.setAttribute('fill', '#ffffff');
  bolinha.setAttribute('stroke', '#1a1a2e');
  bolinha.setAttribute('stroke-width', '0.8');
  g.appendChild(bolinha);

  grupo.appendChild(g);
}

interface MapaDados {
  svg: string;
  municipios: Municipio[];
  cores: Record<string, string>;
}

export default function SvgMapPage() {
  const [dados, setDados] = useState<MapaDados | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [tooltip, setTooltip] = useState(TOOLTIP_PADRAO);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const carregar = useCallback((tentativa: number, signal: AbortSignal) => {
    setErro(null);
    Promise.all([
      fetchText(`${ASSET_BASE}/rj_municipios.svg`),
      fetchJson(`${ASSET_BASE}/rj_municipios_nomes.json`).then(parseMunicipios),
      fetchCores(),
    ])
      .then(([svg, municipios, cores]) => {
        if (!signal.aborted) setDados({ svg, municipios, cores });
      })
      .catch((err: unknown) => {
        if (signal.aborted) return;
        console.error(`[SvgMap] Falha ao carregar o mapa (tentativa ${tentativa + 1}):`, err);
        if (tentativa < TENTATIVAS_AUTOMATICAS) {
          setTimeout(() => { if (!signal.aborted) carregar(tentativa + 1, signal); }, 800);
          return;
        }
        setErro('Não foi possível carregar o mapa e a lista de municípios.');
      });
  }, []);

  const [tentativaManual, setTentativaManual] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    carregar(0, controller.signal);
    return () => controller.abort();
  }, [carregar, tentativaManual]);

  // Objeto estavel: o React so reescreve o innerHTML do SVG quando o markup
  // muda — os fills/labels aplicados direto no DOM sobrevivem aos re-renders.
  const svgHtml = useMemo(() => (dados ? { __html: dados.svg } : null), [dados]);

  // Cor final de cada municipio: JSON de cores, senao fallback por indice.
  const corPorCdMun = useMemo(() => {
    const dict: Record<string, string> = {};
    dados?.municipios.forEach((m, indice) => {
      dict[m.CD_MUN] = dados.cores[m.CD_MUN] ?? corPorIndice(indice);
    });
    return dict;
  }, [dados]);

  const nomePorCdMun = useMemo(() => {
    const dict: Record<string, string> = {};
    dados?.municipios.forEach((m) => { dict[m.CD_MUN] = m.NM_MUN; });
    return dict;
  }, [dados]);

  const options = useMemo(
    () => (dados?.municipios ?? []).map((m) => ({ id: `svg-mun-${m.CD_MUN}`, value: m.CD_MUN, label: m.NM_MUN })),
    [dados],
  );

  // Hover (tooltip) e clique (marca/desmarca) em cada <path id> do SVG.
  useEffect(() => {
    const svg = wrapperRef.current?.querySelector('svg');
    if (!svg) return undefined;

    const paths = Array.from(svg.querySelectorAll<SVGPathElement>('path[id]'));
    const handlers = paths.map((path) => {
      const cdMun = path.id;
      const onEnter = () => setTooltip(nomePorCdMun[cdMun] ?? cdMun);
      const onClick = () => {
        if (!(cdMun in nomePorCdMun)) return;
        setSelecionados((atual) => (atual.includes(cdMun) ? atual.filter((v) => v !== cdMun) : [...atual, cdMun]));
      };
      path.addEventListener('mouseenter', onEnter);
      path.addEventListener('click', onClick);
      return { path, onEnter, onClick };
    });

    return () => {
      handlers.forEach(({ path, onEnter, onClick }) => {
        path.removeEventListener('mouseenter', onEnter);
        path.removeEventListener('click', onClick);
      });
    };
  }, [svgHtml, nomePorCdMun]);

  // Aplica a selecao no SVG: fill inline + rotulo (nome e bolinha) dos marcados.
  useEffect(() => {
    const svg = wrapperRef.current?.querySelector('svg');
    if (!svg) return;

    let grupo = svg.querySelector<SVGGElement>(`#${LABELS_GROUP_ID}`);
    if (!grupo) {
      grupo = document.createElementNS(SVG_NS, 'g');
      grupo.setAttribute('id', LABELS_GROUP_ID);
      grupo.style.pointerEvents = 'none'; // nao bloquear clique nos municipios por baixo
      svg.appendChild(grupo);
    }
    grupo.replaceChildren();

    const marcados = new Set(selecionados);
    svg.querySelectorAll<SVGPathElement>('path[id]').forEach((path) => {
      path.style.fill = marcados.has(path.id) ? (corPorCdMun[path.id] ?? '') : '';
    });

    // Rotulos depois dos fills, na ordem da lista, sempre acima dos paths.
    selecionados.forEach((cdMun) => {
      const path = svg.querySelector<SVGPathElement>(`path[id="${cdMun}"]`);
      const nome = nomePorCdMun[cdMun];
      if (path && nome && grupo) desenharLabel(grupo, path, cdMun, nome);
    });
  }, [svgHtml, selecionados, corPorCdMun, nomePorCdMun]);

  const todosMarcados = options.length > 0 && selecionados.length === options.length;

  return (
    <>
      <PageHeader title="SVG — Mapa do Rio de Janeiro" subtitle="Municípios (malha SVG)" />

      {/* Botao do checklist: sticky abaixo do menu, sempre visivel ao rolar. */}
      <div className="sticky-top py-2">
        <button
          type="button"
          className="btn btn-outline-primary"
          data-bs-toggle="offcanvas"
          data-bs-target="#svgMapOffcanvas"
          aria-controls="svgMapOffcanvas"
          title="Municípios"
        >
          <i className="bi bi-card-checklist" aria-hidden="true" />
          <span className="visually-hidden">Municípios</span>
        </button>
      </div>

      {/* Checklist em Offcanvas sem backdrop: o mapa segue clicavel com a lista aberta. */}
      <div
        className="offcanvas offcanvas-start bg-white"
        tabIndex={-1}
        id="svgMapOffcanvas"
        aria-labelledby="svgMapOffcanvasLabel"
        data-bs-backdrop="false"
        data-bs-scroll="true"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title" id="svgMapOffcanvasLabel">
            Municípios
          </h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Fechar" />
        </div>
        <div className="offcanvas-body" id="svgMapChecklist">
          {erro ? (
            <>
              <div className="small text-danger mb-2">{erro}</div>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => setTentativaManual((n) => n + 1)}
              >
                Tentar novamente
              </button>
            </>
          ) : !dados ? (
            <div className="text-center text-muted small py-3">
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              Carregando municípios...
            </div>
          ) : (
            <>
              <div className="border-bottom mb-2">
                <CheckboxField
                  field={{
                    type: 'checkbox',
                    col: 12,
                    name: 'svg_map_todos',
                    className: 'fw-semibold',
                    options: [{ id: 'svg-mun-toggle-todos', value: TODOS, label: 'Selecione' }],
                    value: todosMarcados ? [TODOS] : [],
                    onChange: (values) => setSelecionados(values.includes(TODOS) ? options.map((o) => o.value) : []),
                  }}
                />
              </div>
              <CheckboxField
                field={{
                  type: 'checkbox',
                  col: 12,
                  label: `Municípios (${options.length})`,
                  name: 'svg_map_municipios',
                  className: 'small',
                  options,
                  value: selecionados,
                  onChange: setSelecionados,
                }}
              />
            </>
          )}
        </div>
      </div>

      <div className="text-center">
        {/* SVG estatico do proprio projeto (public/svg-map), inline para hover/clique por path. */}
        {svgHtml && <div id="svgMapWrapper" ref={wrapperRef} dangerouslySetInnerHTML={svgHtml} />}
        <div className="small text-muted mt-2">{tooltip}</div>
      </div>
    </>
  );
}
