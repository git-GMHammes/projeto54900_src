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

/*
CODE/REVIEW - Gustavo Hammes - 22-11-2026 - 13:55:55
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\utils\recordLabels.ts
BLOCO ADICIONADO - 45 linhas (60 a 104 neste arquivo editado): comentario "// Health" e os mapas HEALTH_SUBJECT_TYPE, HEALTH_REGISTRATION_STATUS, HEALTH_PATIENT_STATUS, HEALTH_SEX, HEALTH_BLOOD_TYPE, HEALTH_RECORD_STATUS, HEALTH_EXAM_STATUS e HEALTH_SEVERITY
Antes de : };  (fim de TIME_UNIT)
Depois de : (linha em branco, seguida do comentario de documentacao) "Rotulo do valor no mapa; sem correspondencia, o proprio valor. Vazio vira ''."
Motivo: rotular em portugues os valores de enum do modulo Health nas telas de detalhe.
*/
// Health — saude: rotulos dos enums de registro profissional, paciente, prontuario, exame e alergia.
export const HEALTH_SUBJECT_TYPE: LabelMap = {
  user: 'Usuário',
  company: 'Empresa',
};

export const HEALTH_REGISTRATION_STATUS: LabelMap = {
  active: 'Ativo',
  inactive: 'Inativo',
  suspended: 'Suspenso',
};

export const HEALTH_PATIENT_STATUS: LabelMap = {
  active: 'Ativo',
  inactive: 'Inativo',
};

export const HEALTH_SEX: LabelMap = {
  female: 'Feminino',
  male: 'Masculino',
  other: 'Outro',
  undisclosed: 'Não informado',
};

export const HEALTH_BLOOD_TYPE: LabelMap = {
  unknown: 'Não informado',
};

export const HEALTH_RECORD_STATUS: LabelMap = {
  draft: 'Rascunho',
  signed: 'Assinado',
  cancelled: 'Cancelado',
};

export const HEALTH_EXAM_STATUS: LabelMap = {
  requested: 'Solicitado',
  done: 'Concluído',
  cancelled: 'Cancelado',
};

export const HEALTH_SEVERITY: LabelMap = {
  mild: 'Leve',
  moderate: 'Moderada',
  severe: 'Grave',
};

/** Rotulo do valor no mapa; sem correspondencia, o proprio valor. Vazio vira ''. */
export function labelOf(map: LabelMap, value: unknown): string {
  const code = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  return map[code] ?? code;
}
