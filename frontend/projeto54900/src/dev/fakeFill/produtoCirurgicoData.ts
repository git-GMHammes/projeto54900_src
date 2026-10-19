/**
 * =========================================================================
 * FILE HEADER — dev/fakeFill/produtoCirurgicoData.ts
 * =========================================================================
 *
 * PROPOSITO: DADOS do Fake fill do cadastro de produto (dev-only): materiais para cirurgias, cada um com o
 * nucleo (nome, descricao, faixas de estoque e de preco) e a lista de caracteristicas `[grupo, campo, valor,
 * extras]` do catalogo de produto. Os codigos de grupo/campo/valor de enum vem de src/catalogs/productCatalog.ts
 * (valor de enum fora do catalogo e avisado no console pelo script).
 *
 * CONSUMIDOR: dev/fakeFill/produtoCirurgico.ts (sorteia um item e preenche a tela).
 * -------------------------------------------------------------------------
 */

import type { Attr } from './atributosFill';
import { randomInt, randomToken } from './domUtils';

export interface SurgicalItem {
  name: string;
  description: string;
  stock: [number, number];
  price: [number, number];
  attrs: readonly Attr[];
}

/** Data ISO (AAAA-MM-DD) a `months` meses de hoje (negativo = passado). */
function isoMonths(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

/** Atributos comuns a todo material cirurgico (regulatorio, rastreio, embalagem, datas), por item. */
function common(opts: {
  shelfMonths: number;
  tracking: 'lote' | 'serie';
  packaging: string;
  perBox: number;
  perPallet: number;
  tempMin: number;
  tempMax: number;
  hazardous: boolean;
  hazardClass?: string;
  nature?: string;
  state?: string;
}): Attr[] {
  const attrs: Attr[] = [
    ['classificacao', 'natureza', opts.nature ?? 'dispositivo'],
    ['classificacao', 'estado_materia', opts.state ?? 'solido'],
    ['seguranca', 'perigoso', opts.hazardous ? 'true' : 'false'],
    ['seguranca', 'restricao_uso', 'controlado', { multi: true }],
    ['regulatorio', 'registro', `Anvisa:${String(randomInt(0, 99_999_999)).padStart(8, '8')}${String(randomInt(0, 999)).padStart(3, '0')}`, { multi: true }],
    ['regulatorio', 'validade_registro', isoMonths(randomInt(24, 60)), { multi: true }],
    ['armazenagem', 'temperatura_min', String(opts.tempMin)],
    ['armazenagem', 'temperatura_max', String(opts.tempMax)],
    ['armazenagem', 'umidade_max', '70'],
    ['armazenagem', 'validade', String(opts.shelfMonths)],
    ['armazenagem', 'rastreio', opts.tracking],
    ['armazenagem', 'lote', `L${randomToken(6).toUpperCase()}`],
    ['armazenagem', 'data_fabricacao', isoMonths(-randomInt(1, 4))],
    ['armazenagem', 'data_validade', isoMonths(opts.shelfMonths - randomInt(1, 4))],
    ['embalagem', 'tipo_embalagem', opts.packaging],
    ['embalagem', 'quantidade_embalagem', String(opts.perBox)],
    ['embalagem', 'quantidade_palete', String(opts.perPallet)],
    ['embalagem', 'fragil', 'false'],
    ['embalagem', 'empilhavel', 'true'],
    ['comercial', 'unidade', 'un'],
    ['comercial', 'moeda', 'BRL'],
  ];
  if (opts.hazardClass) attrs.push(['seguranca', 'classe_risco', opts.hazardClass]);
  return attrs;
}

/** Especificacao de um item no formato "de bancada"; `build` monta a lista de caracteristicas do catalogo. */
interface ItemSpec {
  name: string;
  description: string;
  stock: [number, number];
  price: [number, number];
  brand: string;
  maker: string;
  model: string;
  aliases: string[];
  ncm: string;
  atc?: string;
  categories: string[];
  tags: string[];
  materials: string[];
  /** Substancias com quantidade: [nome, valor, unidade]. */
  substances?: [string, string, string][];
  nature?: string;
  state?: string;
  color: string;
  finish?: string;
  texture?: string;
  shape?: string;
  dims: Partial<Record<'comprimento' | 'largura' | 'altura' | 'diametro' | 'volume' | 'massa', [string, string]>>;
  /** Especificacoes proprias do tipo: [nome, valor, unidade?]. */
  specs: [string, string, string?][];
  norms: string[];
  pack: Parameters<typeof common>[0];
}

function build(spec: ItemSpec): SurgicalItem {
  const attrs: Attr[] = [
    ['identificacao', 'marca', spec.brand],
    ['identificacao', 'fabricante', spec.maker],
    ['identificacao', 'modelo', spec.model],
    ['identificacao', 'pais_fabricacao', 'BR'],
    ...spec.aliases.map((a): Attr => ['identificacao', 'apelido', a, { multi: true }]),
    ['classificacao', 'ncm', spec.ncm],
    ...(spec.atc ? ([['classificacao', 'atc', spec.atc]] as Attr[]) : []),
    ...spec.categories.map((c): Attr => ['classificacao', 'categoria', c, { multi: true }]),
    ...spec.tags.map((t): Attr => ['classificacao', 'etiqueta', t, { multi: true }]),
    ...spec.materials.map((m): Attr => ['composicao', 'material', m, { multi: true }]),
    ...(spec.substances ?? []).flatMap(([name, value, unit]): Attr[] => [
      ['composicao', 'substancia', name, { multi: true }],
      ['composicao', 'fracao', value, { unit, multi: true }],
    ]),
    ['estetica', 'cor', spec.color],
    ...(spec.finish ? ([['estetica', 'acabamento', spec.finish]] as Attr[]) : []),
    ...(spec.texture ? ([['estetica', 'textura', spec.texture]] as Attr[]) : []),
    ...(spec.shape ? ([['estetica', 'forma', spec.shape]] as Attr[]) : []),
  ];
  const dimField = { comprimento: 'comprimento', largura: 'largura', altura: 'altura', diametro: 'diametro', volume: 'volume', massa: 'massa_liquida' } as const;
  for (const [key, field] of Object.entries(dimField) as [keyof typeof dimField, string][]) {
    const dim = spec.dims[key];
    if (dim) attrs.push(['fisica', field, dim[0], { unit: dim[1] }]);
  }
  for (const [label, value, unit] of spec.specs) {
    attrs.push(['tecnica', 'especificacao', value, { label, multi: true, ...(unit ? { unit } : {}) }]);
  }
  for (const norm of spec.norms) attrs.push(['tecnica', 'norma', norm, { multi: true }]);
  attrs.push(...common({ ...spec.pack, ...(spec.nature ? { nature: spec.nature } : {}), ...(spec.state ? { state: spec.state } : {}) }));
  return { name: spec.name, description: spec.description, stock: spec.stock, price: spec.price, attrs };
}

export const SURGICAL_ITEMS: readonly SurgicalItem[] = [
  {
    name: 'Fio de sutura nylon monofilamento 3-0, agulha 3/8 círculo 24 mm',
    description: 'Fio de sutura não absorvível, monofilamento, estéril, com agulha triangular cortante. Uso em pele e tecidos superficiais.',
    stock: [60, 600],
    price: [6.5, 14.9],
    attrs: [
      ['identificacao', 'marca', 'Cirúrgica Exemplo'],
      ['identificacao', 'fabricante', 'Suturas Brasil Ltda'],
      ['identificacao', 'modelo', 'NYL-30-24'],
      ['identificacao', 'pais_fabricacao', 'BR'],
      ['identificacao', 'apelido', 'fio nylon', { multi: true }],
      ['identificacao', 'apelido', 'sutura de pele', { multi: true }],
      ['classificacao', 'ncm', '30061010'],
      ['classificacao', 'categoria', 'Suturas', { multi: true }],
      ['classificacao', 'categoria', 'Fios cirúrgicos', { multi: true }],
      ['classificacao', 'etiqueta', 'estéril', { multi: true }],
      ['classificacao', 'etiqueta', 'uso único', { multi: true }],
      ['composicao', 'material', 'Nylon (poliamida 6)', { multi: true }],
      ['composicao', 'material', 'Aço inoxidável (agulha)', { multi: true }],
      ['estetica', 'cor', 'Preto'],
      ['estetica', 'textura', 'Lisa'],
      ['estetica', 'forma', 'Fio com agulha curva'],
      ['fisica', 'comprimento', '75', { unit: 'cm' }],
      ['fisica', 'massa_liquida', '2', { unit: 'g' }],
      ['tecnica', 'especificacao', '3-0', { label: 'Calibre (USP)', multi: true }],
      ['tecnica', 'especificacao', '24', { label: 'Comprimento da agulha', unit: 'mm', multi: true }],
      ['tecnica', 'especificacao', '3/8', { label: 'Curvatura da agulha', multi: true }],
      ['tecnica', 'norma', 'ABNT NBR ISO 10993-1', { multi: true }],
      ['tecnica', 'norma', 'ABNT NBR ISO 11135 (esterilização)', { multi: true }],
      ...common({ shelfMonths: 60, tracking: 'lote', packaging: 'Envelope estéril (caixa com 12)', perBox: 12, perPallet: 4800, tempMin: 15, tempMax: 30, hazardous: false }),
    ],
  },
  {
    name: 'Pinça hemostática Kelly curva 14 cm, aço inoxidável',
    description: 'Instrumental cirúrgico reutilizável para hemostasia, ponta curva serrilhada, autoclavável.',
    stock: [5, 40],
    price: [38, 95],
    attrs: [
      ['identificacao', 'marca', 'Instrumental Exemplo'],
      ['identificacao', 'fabricante', 'Aços Cirúrgicos Ltda'],
      ['identificacao', 'modelo', 'KELLY-C14'],
      ['identificacao', 'pais_fabricacao', 'BR'],
      ['identificacao', 'apelido', 'pinça Kelly', { multi: true }],
      ['identificacao', 'apelido', 'hemostática', { multi: true }],
      ['classificacao', 'ncm', '90189099'],
      ['classificacao', 'categoria', 'Instrumental cirúrgico', { multi: true }],
      ['classificacao', 'categoria', 'Pinças', { multi: true }],
      ['classificacao', 'etiqueta', 'reutilizável', { multi: true }],
      ['classificacao', 'etiqueta', 'autoclavável', { multi: true }],
      ['composicao', 'material', 'Aço inoxidável AISI 420', { multi: true }],
      ['estetica', 'cor', 'Prata'],
      ['estetica', 'acabamento', 'Fosco'],
      ['estetica', 'textura', 'Serrilhada nas pontas'],
      ['estetica', 'forma', 'Curva'],
      ['fisica', 'comprimento', '14', { unit: 'cm' }],
      ['fisica', 'massa_liquida', '65', { unit: 'g' }],
      ['tecnica', 'especificacao', '134', { label: 'Temperatura máxima de autoclave', unit: 'Cel', multi: true }],
      ['tecnica', 'especificacao', '55', { label: 'Dureza (HRC)', multi: true }],
      ['tecnica', 'norma', 'ABNT NBR ISO 13402', { multi: true }],
      ...common({ shelfMonths: 120, tracking: 'serie', packaging: 'Caixa individual', perBox: 1, perPallet: 600, tempMin: 5, tempMax: 40, hazardous: false }),
    ],
  },
  {
    name: 'Lâmina de bisturi nº 15 estéril (caixa com 100)',
    description: 'Lâmina cirúrgica descartável de aço carbono, estéril por radiação gama, para cabo de bisturi nº 3.',
    stock: [10, 120],
    price: [32, 78],
    attrs: [
      ['identificacao', 'marca', 'Cirúrgica Exemplo'],
      ['identificacao', 'fabricante', 'Lâminas Hospitalares S.A.'],
      ['identificacao', 'modelo', 'LB-15'],
      ['identificacao', 'pais_fabricacao', 'BR'],
      ['identificacao', 'apelido', 'bisturi', { multi: true }],
      ['identificacao', 'apelido', 'lâmina 15', { multi: true }],
      ['classificacao', 'ncm', '90183929'],
      ['classificacao', 'categoria', 'Corte e dissecção', { multi: true }],
      ['classificacao', 'etiqueta', 'estéril', { multi: true }],
      ['classificacao', 'etiqueta', 'perfurocortante', { multi: true }],
      ['composicao', 'material', 'Aço carbono', { multi: true }],
      ['estetica', 'cor', 'Prata'],
      ['estetica', 'acabamento', 'Polido'],
      ['estetica', 'forma', 'Lâmina curva pequena'],
      ['fisica', 'comprimento', '40', { unit: 'mm' }],
      ['fisica', 'largura', '9', { unit: 'mm' }],
      ['fisica', 'massa_liquida', '1', { unit: 'g' }],
      ['tecnica', 'especificacao', '15', { label: 'Numeração', multi: true }],
      ['tecnica', 'especificacao', '0.38', { label: 'Espessura', unit: 'mm', multi: true }],
      ['tecnica', 'norma', 'ABNT NBR ISO 7740', { multi: true }],
      ...common({
        shelfMonths: 60,
        tracking: 'lote',
        packaging: 'Caixa com 100 lâminas (blister individual)',
        perBox: 100,
        perPallet: 8000,
        tempMin: 10,
        tempMax: 35,
        hazardous: true,
        hazardClass: 'Perfurocortante (RDC 222)',
      }),
    ],
  },
  {
    name: 'Campo cirúrgico estéril TNT SMS 90 x 90 cm',
    description: 'Campo cirúrgico descartável, tecido não tecido SMS, barreira contra fluidos, esterilizado em óxido de etileno.',
    stock: [100, 1500],
    price: [3.2, 9.8],
    attrs: [
      ['identificacao', 'marca', 'Cirúrgica Exemplo'],
      ['identificacao', 'fabricante', 'Descartáveis Hospitalares Ltda'],
      ['identificacao', 'modelo', 'CC-SMS-9090'],
      ['identificacao', 'pais_fabricacao', 'BR'],
      ['identificacao', 'apelido', 'campo', { multi: true }],
      ['identificacao', 'apelido', 'pano de campo', { multi: true }],
      ['classificacao', 'ncm', '63079090'],
      ['classificacao', 'categoria', 'Barreiras e campos', { multi: true }],
      ['classificacao', 'etiqueta', 'estéril', { multi: true }],
      ['classificacao', 'etiqueta', 'descartável', { multi: true }],
      ['composicao', 'material', 'Polipropileno SMS (não tecido)', { multi: true }],
      ['estetica', 'cor', 'Azul'],
      ['estetica', 'textura', 'Não tecido, impermeável'],
      ['estetica', 'forma', 'Quadrado'],
      ['fisica', 'comprimento', '90', { unit: 'cm' }],
      ['fisica', 'largura', '90', { unit: 'cm' }],
      ['fisica', 'massa_liquida', '60', { unit: 'g' }],
      ['tecnica', 'especificacao', '35', { label: 'Gramatura', unit: 'g/m2', multi: true }],
      ['tecnica', 'especificacao', 'Óxido de etileno', { label: 'Esterilização', multi: true }],
      ['tecnica', 'norma', 'ABNT NBR 15749', { multi: true }],
      ...common({ shelfMonths: 36, tracking: 'lote', packaging: 'Pacote estéril individual', perBox: 20, perPallet: 3000, tempMin: 10, tempMax: 30, hazardous: false }),
    ],
  },
  {
    name: 'Compressa de gaze estéril 7,5 x 7,5 cm, 8 camadas (pacote com 10)',
    description: 'Compressa de gaze hidrófila estéril, 13 fios/cm², para hemostasia, limpeza e curativos cirúrgicos.',
    stock: [200, 3000],
    price: [1.1, 3.4],
    attrs: [
      ['identificacao', 'marca', 'Cirúrgica Exemplo'],
      ['identificacao', 'fabricante', 'Gazes e Curativos Ltda'],
      ['identificacao', 'modelo', 'GZ-75-8C'],
      ['identificacao', 'pais_fabricacao', 'BR'],
      ['identificacao', 'apelido', 'gaze', { multi: true }],
      ['identificacao', 'apelido', 'compressa', { multi: true }],
      ['classificacao', 'ncm', '30059090'],
      ['classificacao', 'categoria', 'Curativos e compressas', { multi: true }],
      ['classificacao', 'etiqueta', 'estéril', { multi: true }],
      ['classificacao', 'etiqueta', 'descartável', { multi: true }],
      ['composicao', 'material', 'Algodão hidrófilo', { multi: true }],
      ['estetica', 'cor', 'Branco'],
      ['estetica', 'textura', 'Macia, absorvente'],
      ['estetica', 'forma', 'Quadrada, 8 camadas'],
      ['fisica', 'comprimento', '7.5', { unit: 'cm' }],
      ['fisica', 'largura', '7.5', { unit: 'cm' }],
      ['fisica', 'massa_liquida', '3', { unit: 'g' }],
      ['tecnica', 'especificacao', '13', { label: 'Densidade do tecido', unit: 'fios/cm2', multi: true }],
      ['tecnica', 'especificacao', '8', { label: 'Camadas', multi: true }],
      ['tecnica', 'norma', 'ABNT NBR 13843', { multi: true }],
      ...common({ shelfMonths: 60, tracking: 'lote', packaging: 'Pacote com 10 unidades', perBox: 10, perPallet: 20000, tempMin: 10, tempMax: 35, hazardous: false }),
    ],
  },
  {
    name: 'Trocarte descartável 10 mm para laparoscopia',
    description: 'Trocarte com lâmina protegida, haste e válvula de vedação, descartável, estéril, para acesso laparoscópico.',
    stock: [4, 60],
    price: [140, 320],
    attrs: [
      ['identificacao', 'marca', 'Videocirurgia Exemplo'],
      ['identificacao', 'fabricante', 'Endoscopia e Laparoscopia Ltda'],
      ['identificacao', 'modelo', 'TRC-10-100'],
      ['identificacao', 'pais_fabricacao', 'BR'],
      ['identificacao', 'apelido', 'trocarte', { multi: true }],
      ['identificacao', 'apelido', 'trocater', { multi: true }],
      ['classificacao', 'ncm', '90189099'],
      ['classificacao', 'categoria', 'Videocirurgia', { multi: true }],
      ['classificacao', 'etiqueta', 'estéril', { multi: true }],
      ['classificacao', 'etiqueta', 'uso único', { multi: true }],
      ['composicao', 'material', 'Policarbonato', { multi: true }],
      ['composicao', 'material', 'Aço inoxidável (lâmina)', { multi: true }],
      ['composicao', 'material', 'Silicone (válvula)', { multi: true }],
      ['estetica', 'cor', 'Transparente'],
      ['estetica', 'forma', 'Cilíndrica com ponta cortante protegida'],
      ['fisica', 'comprimento', '100', { unit: 'mm' }],
      ['fisica', 'diametro', '10', { unit: 'mm' }],
      ['fisica', 'massa_liquida', '45', { unit: 'g' }],
      ['tecnica', 'especificacao', '10', { label: 'Diâmetro de trabalho', unit: 'mm', multi: true }],
      ['tecnica', 'especificacao', 'Lâmina retrátil', { label: 'Proteção da ponta', multi: true }],
      ['tecnica', 'norma', 'ABNT NBR ISO 10993-1', { multi: true }],
      ...common({
        shelfMonths: 36,
        tracking: 'lote',
        packaging: 'Blister estéril individual',
        perBox: 6,
        perPallet: 900,
        tempMin: 10,
        tempMax: 30,
        hazardous: true,
        hazardClass: 'Perfurocortante (RDC 222)',
      }),
    ],
  },
  // --- kit para uma cirurgia (mesma montagem de `build`) -------------------------------------------------
  build({
    name: 'Luva cirúrgica estéril de látex, tamanho 7,5 (par)',
    description: 'Luva cirúrgica de látex natural, estéril, com pó bioabsorvível, par em envelope individual.',
    stock: [100, 1200],
    price: [1.8, 4.2],
    brand: 'Cirúrgica Exemplo',
    maker: 'Luvas Hospitalares Ltda',
    model: 'LC-75',
    aliases: ['luva estéril', 'luva cirúrgica'],
    ncm: '40151100',
    categories: ['Proteção do cirurgião', 'Luvas'],
    tags: ['estéril', 'descartável', 'contém látex'],
    materials: ['Látex de borracha natural'],
    color: 'Bege',
    texture: 'Microtexturizada nos dedos',
    shape: 'Anatômica',
    dims: { comprimento: ['280', 'mm'], largura: ['95', 'mm'], massa: ['11', 'g'] },
    specs: [
      ['Espessura na palma', '0.18', 'mm'],
      ['Tamanho', '7,5'],
      ['Nível de qualidade aceitável (AQL)', '1.5'],
    ],
    norms: ['ABNT NBR 13391', 'ABNT NBR ISO 10282'],
    pack: { shelfMonths: 36, tracking: 'lote', packaging: 'Envelope estéril (caixa com 50 pares)', perBox: 50, perPallet: 9000, tempMin: 10, tempMax: 30, hazardous: false },
  }),
  build({
    name: 'Avental cirúrgico estéril descartável, manga longa, tamanho G',
    description: 'Avental cirúrgico descartável em SMS, manga longa com punho de malha, reforço impermeável, esterilizado em óxido de etileno.',
    stock: [60, 600],
    price: [9.5, 24],
    brand: 'Cirúrgica Exemplo',
    maker: 'Descartáveis Hospitalares Ltda',
    model: 'AV-SMS-G',
    aliases: ['avental estéril', 'capote cirúrgico'],
    ncm: '62101000',
    categories: ['Proteção do cirurgião', 'Aventais e campos'],
    tags: ['estéril', 'descartável', 'impermeável'],
    materials: ['Polipropileno SMS (não tecido)', 'Malha de poliéster (punho)'],
    color: 'Azul',
    texture: 'Não tecido, reforço impermeável',
    shape: 'Manga longa, abertura nas costas',
    dims: { comprimento: ['130', 'cm'], largura: ['70', 'cm'], massa: ['140', 'g'] },
    specs: [
      ['Gramatura', '40', 'g/m2'],
      ['Tamanho', 'G'],
      ['Esterilização', 'Óxido de etileno'],
    ],
    norms: ['ABNT NBR 16064', 'ABNT NBR ISO 11135'],
    pack: { shelfMonths: 36, tracking: 'lote', packaging: 'Pacote estéril individual', perBox: 20, perPallet: 1600, tempMin: 10, tempMax: 30, hazardous: false },
  }),
  build({
    name: 'Máscara cirúrgica descartável tripla camada com elástico (caixa com 50)',
    description: 'Máscara cirúrgica descartável, três camadas, clipe nasal, elástico retroauricular, filtragem bacteriana mínima de 98%.',
    stock: [200, 4000],
    price: [0.35, 1.2],
    brand: 'Cirúrgica Exemplo',
    maker: 'Proteção Respiratória Ltda',
    model: 'MC-3C',
    aliases: ['máscara cirúrgica', 'máscara descartável'],
    ncm: '63079010',
    categories: ['Proteção do cirurgião', 'Máscaras'],
    tags: ['descartável', 'tripla camada'],
    materials: ['Polipropileno (não tecido)', 'Arame de aço revestido (clipe nasal)', 'Elástico de poliéster'],
    color: 'Azul',
    texture: 'Não tecido, pregueada',
    shape: 'Retangular pregueada',
    dims: { comprimento: ['175', 'mm'], largura: ['95', 'mm'], massa: ['3', 'g'] },
    specs: [
      ['Eficiência de filtragem bacteriana (BFE)', '98', '%'],
      ['Camadas', '3'],
    ],
    norms: ['ABNT NBR 15052', 'ABNT NBR 14873'],
    pack: { shelfMonths: 36, tracking: 'lote', packaging: 'Caixa com 50 unidades', perBox: 50, perPallet: 40000, tempMin: 10, tempMax: 35, hazardous: false },
  }),
  build({
    name: 'Gorro cirúrgico descartável com elástico (pacote com 100)',
    description: 'Gorro descartável em TNT com elástico, para cobrir todo o cabelo da equipe cirúrgica.',
    stock: [100, 2000],
    price: [0.2, 0.7],
    brand: 'Cirúrgica Exemplo',
    maker: 'Descartáveis Hospitalares Ltda',
    model: 'GR-TNT',
    aliases: ['gorro', 'touca cirúrgica'],
    ncm: '65050090',
    categories: ['Proteção do cirurgião', 'Gorros'],
    tags: ['descartável'],
    materials: ['Polipropileno (TNT 20 g/m2)', 'Elástico de borracha'],
    color: 'Branco',
    texture: 'Não tecido',
    shape: 'Circular com elástico',
    dims: { diametro: ['53', 'cm'], massa: ['2', 'g'] },
    specs: [['Gramatura', '20', 'g/m2']],
    norms: ['ABNT NBR 15052'],
    pack: { shelfMonths: 60, tracking: 'lote', packaging: 'Pacote com 100 unidades', perBox: 100, perPallet: 60000, tempMin: 5, tempMax: 40, hazardous: false },
  }),
  build({
    name: 'Seringa descartável 10 mL, bico luer lock, sem agulha',
    description: 'Seringa de três corpos, êmbolo com borracha de silicone, graduação em 0,2 mL, estéril, uso único.',
    stock: [50, 800],
    price: [0.9, 2.6],
    brand: 'Cirúrgica Exemplo',
    maker: 'Injetáveis e Seringas S.A.',
    model: 'SR-10-LL',
    aliases: ['seringa 10', 'seringa luer lock'],
    ncm: '90183119',
    categories: ['Aplicação e infusão', 'Seringas'],
    tags: ['estéril', 'uso único', 'luer lock'],
    materials: ['Polipropileno (corpo)', 'Borracha de silicone (êmbolo)'],
    color: 'Transparente',
    texture: 'Lisa, graduação impressa',
    shape: 'Cilíndrica',
    dims: { comprimento: ['125', 'mm'], diametro: ['16', 'mm'], massa: ['9', 'g'] },
    specs: [
      ['Capacidade', '10', 'mL'],
      ['Graduação', '0.2', 'mL'],
      ['Tipo de bico', 'Luer lock'],
    ],
    norms: ['ABNT NBR ISO 7886-1'],
    pack: { shelfMonths: 60, tracking: 'lote', packaging: 'Blister individual (caixa com 100)', perBox: 100, perPallet: 20000, tempMin: 10, tempMax: 35, hazardous: false },
  }),
  build({
    name: 'Agulha hipodérmica 25 x 7 mm (22G), caixa com 100',
    description: 'Agulha hipodérmica descartável, bisel trifacetado, canhão em polipropileno, protetor rígido, estéril.',
    stock: [20, 300],
    price: [14, 36],
    brand: 'Cirúrgica Exemplo',
    maker: 'Injetáveis e Seringas S.A.',
    model: 'AG-2570',
    aliases: ['agulha 25x7', 'agulha hipodérmica'],
    ncm: '90183219',
    categories: ['Aplicação e infusão', 'Agulhas'],
    tags: ['estéril', 'uso único', 'perfurocortante'],
    materials: ['Aço inoxidável (cânula)', 'Polipropileno (canhão e protetor)'],
    color: 'Prata e azul',
    texture: 'Lisa',
    shape: 'Cânula com bisel trifacetado',
    dims: { comprimento: ['25', 'mm'], diametro: ['0.7', 'mm'], massa: ['0.8', 'g'] },
    specs: [
      ['Calibre', '22', 'G'],
      ['Bisel', 'Trifacetado'],
    ],
    norms: ['ABNT NBR ISO 7864'],
    pack: {
      shelfMonths: 60,
      tracking: 'lote',
      packaging: 'Caixa com 100 agulhas (blister individual)',
      perBox: 100,
      perPallet: 50000,
      tempMin: 10,
      tempMax: 35,
      hazardous: true,
      hazardClass: 'Perfurocortante (RDC 222)',
    },
  }),
  build({
    name: 'Cateter venoso periférico 20G com dispositivo de segurança',
    description: 'Cateter intravenoso periférico de poliuretano radiopaco, com asas e câmara de refluxo, agulha com proteção passiva.',
    stock: [20, 400],
    price: [3.4, 9.5],
    brand: 'Cirúrgica Exemplo',
    maker: 'Acesso Venoso Ltda',
    model: 'CVP-20G',
    aliases: ['jelco', 'abocath'],
    ncm: '90183929',
    categories: ['Aplicação e infusão', 'Acessos vasculares'],
    tags: ['estéril', 'uso único', 'radiopaco'],
    materials: ['Poliuretano radiopaco (cateter)', 'Aço inoxidável (agulha)', 'Polipropileno (conector)'],
    color: 'Rosa (código do calibre 20G)',
    texture: 'Lisa',
    shape: 'Cateter sobre agulha com asas',
    dims: { comprimento: ['32', 'mm'], diametro: ['1.1', 'mm'], massa: ['2', 'g'] },
    specs: [
      ['Calibre', '20', 'G'],
      ['Vazão', '60', 'mL/min'],
    ],
    norms: ['ABNT NBR ISO 10555-1', 'ABNT NBR ISO 10555-5'],
    pack: {
      shelfMonths: 36,
      tracking: 'lote',
      packaging: 'Blister estéril individual (caixa com 50)',
      perBox: 50,
      perPallet: 6000,
      tempMin: 10,
      tempMax: 30,
      hazardous: true,
      hazardClass: 'Perfurocortante (RDC 222)',
    },
  }),
  build({
    name: 'Tesoura cirúrgica Metzenbaum curva 18 cm, aço inoxidável',
    description: 'Tesoura de dissecção para tecidos delicados, lâminas curvas e pontas arredondadas, reutilizável e autoclavável.',
    stock: [3, 25],
    price: [85, 210],
    brand: 'Instrumental Exemplo',
    maker: 'Aços Cirúrgicos Ltda',
    model: 'MTZ-C18',
    aliases: ['tesoura Metzenbaum', 'tesoura de dissecção'],
    ncm: '90189099',
    categories: ['Instrumental cirúrgico', 'Tesouras'],
    tags: ['reutilizável', 'autoclavável'],
    materials: ['Aço inoxidável AISI 420', 'Inserto de carbeto de tungstênio'],
    color: 'Prata',
    finish: 'Fosco',
    shape: 'Curva, ponta romba',
    dims: { comprimento: ['18', 'cm'], massa: ['92', 'g'] },
    specs: [
      ['Temperatura máxima de autoclave', '134', 'Cel'],
      ['Dureza (HRC)', '52'],
    ],
    norms: ['ABNT NBR ISO 13402'],
    pack: { shelfMonths: 120, tracking: 'serie', packaging: 'Caixa individual', perBox: 1, perPallet: 400, tempMin: 5, tempMax: 40, hazardous: false },
  }),
  build({
    name: 'Porta-agulha Mayo-Hegar 16 cm, aço inoxidável',
    description: 'Porta-agulha com inserto de carbeto de tungstênio e cremalheira, para sutura de planos profundos, reutilizável.',
    stock: [3, 25],
    price: [110, 260],
    brand: 'Instrumental Exemplo',
    maker: 'Aços Cirúrgicos Ltda',
    model: 'MH-16',
    aliases: ['porta-agulha', 'Mayo-Hegar'],
    ncm: '90189099',
    categories: ['Instrumental cirúrgico', 'Porta-agulhas'],
    tags: ['reutilizável', 'autoclavável'],
    materials: ['Aço inoxidável AISI 420', 'Inserto de carbeto de tungstênio'],
    color: 'Prata e dourado (cabos)',
    finish: 'Fosco',
    shape: 'Reta com cremalheira',
    dims: { comprimento: ['16', 'cm'], massa: ['115', 'g'] },
    specs: [
      ['Temperatura máxima de autoclave', '134', 'Cel'],
      ['Trava', 'Cremalheira de 3 dentes'],
    ],
    norms: ['ABNT NBR ISO 13402'],
    pack: { shelfMonths: 120, tracking: 'serie', packaging: 'Caixa individual', perBox: 1, perPallet: 400, tempMin: 5, tempMax: 40, hazardous: false },
  }),
  build({
    name: 'Solução degermante de clorexidina 2%, frasco de 1 litro',
    description: 'Antisséptico degermante com digluconato de clorexidina 2% e tensoativos, para degermação cirúrgica das mãos e do campo operatório.',
    stock: [6, 80],
    price: [24, 58],
    brand: 'Antissepsia Exemplo',
    maker: 'Laboratório Antisséptico Ltda',
    model: 'CLX-2-1L',
    aliases: ['clorexidina degermante', 'degermante cirúrgico'],
    ncm: '30049099',
    atc: 'D08AC02',
    categories: ['Antissepsia', 'Degermantes'],
    tags: ['uso externo', 'antisséptico'],
    materials: ['Polietileno (frasco)'],
    substances: [
      ['Digluconato de clorexidina', '2', '%'],
      ['Tensoativos não iônicos', '15', '%'],
    ],
    nature: 'mistura',
    state: 'liquido',
    color: 'Vermelho (corante)',
    texture: 'Líquida, forma espuma',
    shape: 'Frasco cilíndrico com tampa dosadora',
    dims: { altura: ['24', 'cm'], volume: ['1', 'L'], massa: ['1.05', 'kg'] },
    specs: [
      ['Concentração de clorexidina', '2', '%'],
      ['pH', '5.5'],
    ],
    norms: ['RDC 59/2010 (Anvisa)'],
    pack: { shelfMonths: 24, tracking: 'lote', packaging: 'Frasco de 1 L (caixa com 12)', perBox: 12, perPallet: 576, tempMin: 15, tempMax: 30, hazardous: false },
  }),
];
