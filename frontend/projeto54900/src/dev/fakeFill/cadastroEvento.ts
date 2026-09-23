/**
 * =========================================================================
 * FILE HEADER — dev/fakeFill/cadastroEvento.ts
 * =========================================================================
 *
 * PROPOSITO: preenche com dados fake VALIDOS o formulario `cadastro-evento`
 * (modal "Criar evento" de pages/v1/calendar/calendar-manager/GetAllPage.tsx,
 * campos do grupo `calendar_events`). DEV-ONLY — acionado por
 * components/global/FakeFillButton.tsx, que só aparece com isDevHost().
 *
 * IDs USADOS (NAO sao field_name — sao field_key, confirmados ao vivo via
 * POST /api/v1/form-manager-view/get-grouped?fm_slug=cadastro-evento; ver
 * services/formSchema.ts, buildField: `set('id', str(row.fc_field_key))`):
 *   fc_principal_status/summary/description/location
 *   fc_data_start_datetime (+ fc_data_start_datetime-time)/start_time_zone/
 *   fc_data_end_datetime (+ fc_data_end_datetime-time)/end_time_zone — os 2
 *   primeiros são tipo 'datahora' (components/ui/FormGrid/datahora, desde
 *   2026-09-22): 2 sub-inputs, data no id do campo e hora em `${id}-time`
 *   fc_recorrencia_recurrence/sequence
 *   fc_visibilidade_transparency/visibility/color_id/event_type
 *   ck_guests_can_modify/ck_guests_can_invite_others/
 *   ck_guests_can_see_other_guests/ck_anyone_can_add_self (id da OPCAO do
 *   checkbox, nao do campo — components/ui/FormGrid/checkbox renderiza
 *   `id={opt.id}` no <input>, nao `field.id`)
 *
 * REGRAS DE NEGOCIO RESPEITADAS (checadas ao vivo pela API + pelo markdown
 * src/app/markdown/geral/form/calendar/calendar_events.md):
 *   - `calendar_id` NAO e tocado aqui de proposito: a pagina ja pre-seleciona
 *     o calendario de origem (withDefaultValues, GetAllPage.tsx) antes do
 *     modal abrir — sobrescrever seria trocar o contexto de quem clicou.
 *   - `summary` e obrigatorio — sempre preenchido.
 *   - `status`/`transparency`/`visibility`/`event_type`: ENUM do banco —
 *     só um dos valores cadastrados em options_json passa, qualquer outra
 *     string quebra a query no MySQL.
 *   - `start_date`/`start_datetime` (e o par `end_*`) sao mutuamente
 *     exclusivos por design do formulario (help_text: "Preencher OU esta,
 *     OU 'Data/hora de início'"): só start_datetime/end_datetime sao
 *     preenchidos aqui, start_date/end_date ficam vazios de proposito.
 *   - `start_time_zone`/`end_time_zone`/`recurrence`/`color_id`: select
 *     (desde 2026-09-23) — só valor presente nas opções passa
 *     (selectComboboxOption). Fusos: options_json IANA; recorrência: RRULE
 *     das opções prontas; cor: hexadecimal de `aux_cor` (select remoto).
 *   - `sequence`: texto livre com significado numérico — gera "0".
 *   - Convidados (4 checkboxes) sao clique real (clickIfUnchecked), nao
 *     setReactValue — sao <input type="checkbox"> nativos.
 *
 * DEPENDENCIAS: dev/fakeFill/domUtils (setReactValue, selectComboboxOption,
 * clickIfUnchecked, geradores aleatorios).
 * CONSUMIDORES: dev/fakeFill/registry.ts (entrada 'cadastro-evento').
 *
 * COMO CRIAR O PROXIMO SCRIPT: copiar este arquivo, trocar os ids pelos do
 * novo formulario (confirme sempre pela API — nunca advinhar) e registrar em
 * dev/fakeFill/registry.ts.
 * -------------------------------------------------------------------------
 */

import { clickIfUnchecked, randomItem, randomSentence, selectComboboxOption, setReactValue } from './domUtils';

// ENUMs do banco (calendar_events) — só estes valores existem na coluna.
const STATUSES = ['confirmed', 'tentative', 'cancelled'] as const;
const TRANSPARENCIES = ['opaque', 'transparent'] as const;
const VISIBILITIES = ['default', 'public', 'private', 'confidential'] as const;
const EVENT_TYPES = ['default', 'outOfOffice', 'focusTime', 'workingLocation', 'birthday'] as const;

const TIME_ZONES = ['America/Sao_Paulo', 'America/Bahia', 'America/Manaus', 'UTC'] as const;

// Subconjunto das opções prontas do campo `recurrence` (form_fields 160).
const RECURRENCES = [
  'RRULE:FREQ=WEEKLY;COUNT=10',
  'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
  'RRULE:FREQ=MONTHLY',
  'RRULE:FREQ=WEEKLY;INTERVAL=2',
] as const;

// Hexadecimais existentes em `aux_cor` (DodgerBlue, SeaGreen, RoyalBlue, SlateBlue, Teal).
const COLORS = ['#1E90FF', '#2E8B57', '#4169E1', '#6A5ACD', '#008080'] as const;

const TOPICOS = [
  'equipe', 'projeto', 'cliente', 'diretoria', 'sprint', 'planejamento',
  'financeiro', 'suporte', 'produto', 'alinhamento', 'revisão', 'kickoff',
];

const CHECKBOX_IDS = [
  'ck_guests_can_modify',
  'ck_guests_can_invite_others',
  'ck_guests_can_see_other_guests',
  'ck_anyone_can_add_self',
];

function setText(id: string, value: string): void {
  const el = document.getElementById(id);
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) setReactValue(el, value);
}

/** "DDMMYYYY" (sem separador) — o campo 'data'/'datahora' do FormGrid extrai só dígitos, então não precisa de barras. */
function randomFutureDateDigits(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getFullYear());
  return `${dd}${mm}${yyyy}`;
}

/** "HHMM" (sem separador) — sub-campo de hora do tipo 'datahora' (components/ui/FormGrid/datahora). */
function randomTimeDigits(): string {
  const hh = String(9 + Math.floor(Math.random() * 9)).padStart(2, '0'); // 09..17
  const mm = randomItem(['00', '15', '30', '45']);
  return `${hh}${mm}`;
}

/** Preenche os campos do modal "Criar evento" com dados fake válidos (calendar_id fica intocado). */
export async function fillCadastroEventoForm(): Promise<void> {
  setText('fc_principal_summary', `Reunião de ${randomSentence(TOPICOS, 2)}`);
  setText('fc_principal_description', randomSentence(TOPICOS, 6 + Math.floor(Math.random() * 6)));
  setText('fc_principal_location', randomItem(['Sala 1', 'Sala 2', 'Auditório', 'Remoto']));

  // Campo tipo 'datahora' (components/ui/FormGrid/datahora): 2 sub-inputs,
  // data no id do campo e hora em `${id}-time` — precisa preencher os dois
  // pra emitir o valor combinado (só data, sem hora, fica vazio/incompleto).
  setText('fc_data_start_datetime', randomFutureDateDigits(3));
  setText('fc_data_start_datetime-time', randomTimeDigits());
  setText('fc_data_end_datetime', randomFutureDateDigits(3));
  setText('fc_data_end_datetime-time', randomTimeDigits());

  setText('fc_recorrencia_sequence', '0');

  for (const id of CHECKBOX_IDS) clickIfUnchecked(id);

  await selectComboboxOption('fc_principal_status', randomItem(STATUSES));
  await selectComboboxOption('fc_visibilidade_transparency', randomItem(TRANSPARENCIES));
  await selectComboboxOption('fc_visibilidade_visibility', randomItem(VISIBILITIES));
  await selectComboboxOption('fc_visibilidade_event_type', randomItem(EVENT_TYPES));
  await selectComboboxOption('fc_data_start_time_zone', randomItem(TIME_ZONES));
  await selectComboboxOption('fc_data_end_time_zone', randomItem(TIME_ZONES));
  await selectComboboxOption('fc_recorrencia_recurrence', randomItem(RECURRENCES));
  await selectComboboxOption('fc_visibilidade_color_id', randomItem(COLORS));
}

export default fillCadastroEventoForm;
