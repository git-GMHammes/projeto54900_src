// Posicao do texto na pagina: acha o VALOR de cada rotulo pelo lugar onde ele esta, nao pela ordem de leitura
// do OCR. Serve a formularios em que o valor vem ao lado do rotulo ("Nome: Maria", em caixas separadas) ou
// ABAIXO dele (rotulo numa linha, valor na linha de baixo, varias colunas):
//
//   Nome:            Telefone:
//   Gustavo Hammes   (21) 9 8055-8545
//
// A ordem de leitura do OCR nesse caso e "Nome:, Telefone:, Gustavo, (21)..." — o vizinho na lista nao e o valor.
// Cada rotulo sem valor proprio disputa as caixas de texto proximas (a direita na mesma linha, ou logo abaixo,
// com folga horizontal porque o valor nem sempre comeca na coluna do rotulo); os pares sao escolhidos do mais
// perto para o mais longe e cada caixa vira valor de no maximo um rotulo.
// Funcao pura (sem DOM), usada por utils/documentFields.ts.

export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** Uma linha/caixa de texto do documento. Sem `box` (texto puro), o valor e a linha seguinte. */
export interface TextLine {
  text: string;
  /** Pagina (0, 1, ...): so linhas da mesma pagina sao vizinhas. */
  page: number;
  box?: Box;
}

/** Caixa que envolve o poligono (lista de pontos [x, y]) devolvido pelo OCR. */
export function boxFromPoly(poly: readonly (readonly number[])[]): Box {
  const xs = poly.map((p) => p[0] ?? 0);
  const ys = poly.map((p) => p[1] ?? 0);
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}

// Medidas em multiplos da altura do rotulo (a unidade acompanha o tamanho da letra e a resolucao).
const SAME_ROW = 0.6; // diferenca maxima entre os centros verticais para "mesma linha"
const MAX_RIGHT = 12; // distancia maxima a direita do rotulo
const MIN_GAP_BELOW = -0.4; // sobreposicao tolerada com a linha de baixo
const MAX_GAP_BELOW = 2.2; // distancia vertical maxima ate a linha de baixo
const MAX_SHIFT_BELOW = 6; // deslocamento horizontal maximo do valor em relacao ao rotulo
const RIGHT_WEIGHT = 0.04; // valor na mesma linha do rotulo e prova forte: vence qualquer valor abaixo (celula de tabela)
const BELOW_PENALTY = 0.5; // a direita vence abaixo quando a distancia e parecida

const centerY = (b: Box): number => (b.y0 + b.y1) / 2;

// Custo do par rotulo -> caixa candidata (menor = mais provavel), ou null se nao for vizinha.
// `rightLimit` e onde comeca o proximo rotulo da mesma linha (Infinity se nao ha): a "celula" do rotulo vai
// de `label.x0` ate la, e um valor abaixo dentro da celula nao paga deslocamento — vale para valor alinhado
// a direita (numeros em tabela), que fica longe do rotulo mas dentro da mesma celula.
function pairCost(label: Box, cand: Box, rightLimit: number): number | null {
  const h = Math.max(label.y1 - label.y0, 1);
  let best: number | null = null;

  if (Math.abs(centerY(cand) - centerY(label)) <= SAME_ROW * h && cand.x0 >= label.x1 - 0.5 * h) {
    const dx = Math.max(cand.x0 - label.x1, 0) / h;
    if (dx <= MAX_RIGHT) best = dx * RIGHT_WEIGHT;
  }

  const gap = (cand.y0 - label.y1) / h;
  const candCenterX = (cand.x0 + cand.x1) / 2;
  const inCell = candCenterX >= label.x0 - 0.5 * h && candCenterX < rightLimit;
  const shift = inCell ? 0 : Math.max(cand.x0 - label.x1, label.x0 - cand.x1, 0) / h;
  if (gap >= MIN_GAP_BELOW && gap <= MAX_GAP_BELOW && shift <= MAX_SHIFT_BELOW) {
    const cost = BELOW_PENALTY + Math.max(gap, 0) + 0.5 * shift;
    if (best === null || cost < best) best = cost;
  }
  return best;
}

const CONTINUATION_GAP = 0.8; // vao maximo (em alturas) entre linhas da mesma celula
const MAX_CONTINUATION = 4;

/**
 * Valor que quebra de linha dentro da celula ("Nome: Fulano - Cargo, Departamento de" / "Gestao ..."): so quando o
 * valor esta AO LADO do rotulo, as linhas coladas logo abaixo e alinhadas a ele continuam o mesmo valor.
 * `blocked(k)` diz que a linha `k` ja tem dono (rotulo ou valor de outro rotulo).
 */
export function continuation(
  lines: readonly TextLine[],
  labelIndex: number,
  valueIndex: number,
  blocked: (k: number) => boolean,
): number[] {
  const label = lines[labelIndex];
  const first = lines[valueIndex];
  if (!label?.box || !first?.box) return [];

  const h = Math.max(label.box.y1 - label.box.y0, 1);
  if (Math.abs(centerY(first.box) - centerY(label.box)) > SAME_ROW * h || first.box.x0 < label.box.x1 - 0.5 * h) return [];

  const out: number[] = [];
  let last: Box = first.box;
  while (out.length < MAX_CONTINUATION) {
    const above = last;
    let next = -1;
    let best = Infinity;
    lines.forEach((cand, k) => {
      if (k === labelIndex || k === valueIndex || out.includes(k) || cand.page !== first.page || !cand.box || !cand.text) return;
      if (blocked(k) || Math.abs(cand.box.x0 - first.box!.x0) > 0.8 * h) return;
      const gap = (cand.box.y0 - above.y1) / h;
      if (gap >= -0.3 && gap <= CONTINUATION_GAP && gap < best) {
        best = gap;
        next = k;
      }
    });
    const found = lines[next];
    if (!found?.box) break;
    out.push(next);
    last = found.box;
  }
  return out;
}

/**
 * Para cada rotulo em `needers` (indices de `lines`), o indice da linha que e seu valor.
 * `isLabel(i)` diz se a linha `i` e um rotulo (nunca vale como valor). Rotulo sem vizinho valido fica fora do mapa.
 * Linhas sem `box` (texto puro) usam a proxima linha nao vazia.
 */
export function assignValues(
  lines: readonly TextLine[],
  needers: readonly number[],
  isLabel: (i: number) => boolean,
): Map<number, number> {
  const result = new Map<number, number>();
  const pairs: { label: number; value: number; cost: number }[] = [];

  for (const i of needers) {
    const label = lines[i];
    if (!label) continue;

    if (!label.box) {
      for (let j = i + 1; j < lines.length; j += 1) {
        if (lines[j]?.page !== label.page || !lines[j]?.text) continue;
        if (!isLabel(j)) result.set(i, j);
        break;
      }
      continue;
    }

    const lb = label.box;
    const h = Math.max(lb.y1 - lb.y0, 1);
    let rightLimit = Infinity;
    lines.forEach((other, j) => {
      if (j === i || other.page !== label.page || !other.box || !other.text || !isLabel(j)) return;
      const sameRow = Math.abs(centerY(other.box) - centerY(lb)) <= SAME_ROW * h;
      if (sameRow && other.box.x0 > lb.x1) rightLimit = Math.min(rightLimit, other.box.x0);
    });

    lines.forEach((cand, j) => {
      if (j === i || cand.page !== label.page || !cand.box || !cand.text || isLabel(j)) return;
      const cost = pairCost(lb, cand.box, rightLimit);
      if (cost !== null) pairs.push({ label: i, value: j, cost });
    });
  }

  const usedValues = new Set<number>();
  for (const pair of pairs.sort((a, b) => a.cost - b.cost)) {
    if (result.has(pair.label) || usedValues.has(pair.value)) continue;
    result.set(pair.label, pair.value);
    usedValues.add(pair.value);
  }
  return result;
}
