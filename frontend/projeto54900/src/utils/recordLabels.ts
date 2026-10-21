// Rotulos em PT-BR dos valores de enum dos modulos Product, Movement e Service (a API devolve o codigo
// em ingles). Mapas somente leitura + `labelOf`, que devolve o proprio codigo quando nao conhece o valor.

type LabelMap = Readonly<Record<string, string>>;

export const PRODUCT_STATUS: LabelMap = {
  draft: 'Rascunho',
  active: 'Ativo',
  inactive: 'Inativo',
  discontinued: 'Descontinuado',
};

export const MOVEMENT_TYPE: LabelMap = {
  entry: 'Entrada',
  exit: 'Saída',
  reservation: 'Separação',
  waste: 'Desperdício',
  order: 'Encomenda',
};

export const MOVEMENT_STATUS: LabelMap = {
  open: 'Aberto',
  done: 'Finalizado',
  cancelled: 'Cancelado',
};

export const ORDER_STATUS: LabelMap = {
  requested: 'Solicitado',
  quoted: 'Orçado',
  accepted: 'Aceito',
  scheduled: 'Agendado',
  in_progress: 'Em andamento',
  done: 'Concluído',
  cancelled: 'Cancelado',
  rejected: 'Recusado',
};

export const PROVIDER_TYPE: LabelMap = {
  biscate: 'Biscate (autônomo informal)',
  mei: 'MEI',
  company: 'Empresa (CNPJ)',
};

export const TIME_UNIT: LabelMap = {
  min: 'min',
  h: 'h',
  d: 'dias',
  wk: 'semanas',
  mo: 'meses',
};

/** Rotulo do valor no mapa; sem correspondencia, o proprio valor. Vazio vira ''. */
export function labelOf(map: LabelMap, value: unknown): string {
  const code = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  return map[code] ?? code;
}
