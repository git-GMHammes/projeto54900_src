// Rotulos em PT-BR dos campos e dos valores de enum dos catalogos de atributos (produto e servico).
// O catalogo guarda so os codigos (`massa_liquida`); a tela mostra o rotulo daqui. Codigo sem rotulo cai no
// proprio codigo humanizado (`campo_novo` -> `Campo novo`), entao campo novo no catalogo ja aparece.

const FIELD_LABELS: Readonly<Record<string, string>> = {
  // identificacao
  marca: 'Marca',
  fabricante: 'Fabricante',
  modelo: 'Modelo',
  pais_fabricacao: 'País de fabricação',
  gtin: 'GTIN / código de barras',
  codigo_fabricante: 'Código do fabricante',
  codigo_externo: 'Código externo',
  apelido: 'Apelido (nome popular)',
  // classificacao
  categoria: 'Categoria',
  natureza: 'Natureza',
  estado_materia: 'Estado da matéria',
  ncm: 'NCM',
  gpc: 'GPC (classificação GS1)',
  atc: 'ATC (classificação terapêutica)',
  etiqueta: 'Etiqueta',
  area: 'Área',
  cbo: 'CBO (ocupação)',
  cnae: 'CNAE',
  lc116: 'Item da LC 116 (ISS)',
  // composicao
  material: 'Material',
  substancia: 'Substância',
  fracao: 'Fração (quantidade da substância)',
  // estetica
  cor: 'Cor',
  acabamento: 'Acabamento',
  textura: 'Textura',
  forma: 'Forma',
  odor: 'Odor',
  // fisica
  comprimento: 'Comprimento',
  largura: 'Largura',
  altura: 'Altura',
  diametro: 'Diâmetro',
  massa_liquida: 'Peso líquido (massa)',
  massa_bruta: 'Peso bruto (massa)',
  volume: 'Volume',
  densidade: 'Densidade',
  // tecnica
  especificacao: 'Especificação própria do tipo',
  norma: 'Norma',
  // seguranca
  perigoso: 'Perigoso',
  numero_onu: 'Número ONU',
  classe_risco: 'Classe de risco',
  restricao_uso: 'Restrição de uso',
  nivel_risco: 'Nível de risco',
  licenca: 'Licença',
  // regulatorio e exigencias
  registro: 'Registro (autoridade:número)',
  validade_registro: 'Validade do registro',
  registro_profissional: 'Registro profissional (ex.: COREN:123456)',
  habilitacao: 'Habilitação',
  seguro: 'Possui seguro',
  antecedentes: 'Exige antecedentes',
  epi: 'EPI necessário',
  // armazenagem
  temperatura_min: 'Temperatura mínima',
  temperatura_max: 'Temperatura máxima',
  umidade_max: 'Umidade máxima',
  validade: 'Prazo de validade',
  vida_util: 'Vida útil',
  garantia: 'Garantia',
  rastreio: 'Rastreio',
  lote: 'Lote',
  data_fabricacao: 'Data de fabricação',
  data_validade: 'Data de validade',
  // embalagem
  tipo_embalagem: 'Tipo de embalagem',
  quantidade_embalagem: 'Quantidade por embalagem',
  quantidade_palete: 'Quantidade por palete',
  fragil: 'Frágil',
  empilhavel: 'Empilhável',
  // comercial
  unidade: 'Unidade de comercialização',
  moeda: 'Moeda',
  preco_custo: 'Preço de custo',
  preco_venda: 'Preço de venda',
  // servico: execucao
  modalidade: 'Modalidade',
  local_execucao: 'Local de execução',
  equipe: 'Equipe (profissionais)',
  equipamento: 'Equipamento',
  material_incluso: 'Material incluso',
  deslocamento_incluso: 'Deslocamento incluso',
  raio_atendimento: 'Raio de atendimento',
  quantidade_minima: 'Quantidade mínima',
  // servico: agenda
  dia_atendimento: 'Dia de atendimento',
  horario_inicio: 'Horário de início (HH:MM)',
  horario_fim: 'Horário de fim (HH:MM)',
  antecedencia_minima: 'Antecedência mínima',
  validade_orcamento: 'Validade do orçamento',
  urgencia: 'Atende urgência',
  // servico: preco
  preco_minimo: 'Preço mínimo',
  taxa_visita: 'Taxa de visita',
  taxa_urgencia: 'Taxa de urgência',
  desconto_maximo: 'Desconto máximo',
  forma_pagamento: 'Forma de pagamento',
  parcelamento_maximo: 'Parcelamento máximo',
  // servico: fiscal
  regime_tributario: 'Regime tributário',
  emite_nota: 'Emite nota fiscal',
  iss_aliquota: 'Alíquota de ISS',
  municipio_tributacao: 'Município de tributação',
};

const VALUE_LABELS: Readonly<Record<string, string>> = {
  // natureza e estado
  substancia: 'Substância',
  mistura: 'Mistura',
  artigo: 'Artigo',
  dispositivo: 'Dispositivo',
  maquina: 'Máquina',
  sistema: 'Sistema',
  software: 'Software',
  servico: 'Serviço',
  solido: 'Sólido',
  liquido: 'Líquido',
  gasoso: 'Gasoso',
  po: 'Pó',
  gel: 'Gel',
  // rastreio
  nenhum: 'Nenhum',
  lote: 'Por lote',
  serie: 'Por série',
  // restricoes
  prescricao: 'Prescrição',
  controlado: 'Controlado',
  militar: 'Uso militar',
  dual_use: 'Uso dual',
  exportacao_controlada: 'Exportação controlada',
  menor_idade: 'Proibido para menores',
  registro_profissional: 'Exige registro profissional',
  licenca: 'Exige licença',
  // servico
  presencial: 'Presencial',
  remoto: 'Remoto',
  hibrido: 'Híbrido',
  cliente: 'Na casa do cliente',
  prestador: 'No local do prestador',
  terceiro: 'Em terceiro',
  seg: 'Segunda',
  ter: 'Terça',
  qua: 'Quarta',
  qui: 'Quinta',
  sex: 'Sexta',
  sab: 'Sábado',
  dom: 'Domingo',
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
  boleto: 'Boleto',
  transferencia: 'Transferência',
  autonomo: 'Autônomo (RPA)',
  mei: 'MEI',
  simples: 'Simples Nacional',
  presumido: 'Lucro presumido',
  real: 'Lucro real',
  baixo: 'Baixo',
  medio: 'Médio',
  alto: 'Alto',
  critico: 'Crítico',
};

const humanize = (code: string): string => {
  const text = code.replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/** Rotulo PT-BR do campo do catalogo (cai no codigo humanizado). */
export const fieldLabel = (code: string): string => FIELD_LABELS[code] ?? humanize(code);

/** Rotulo PT-BR do valor de um enum do catalogo (cai no valor humanizado). */
export const valueLabel = (value: string): string => VALUE_LABELS[value] ?? humanize(value);
