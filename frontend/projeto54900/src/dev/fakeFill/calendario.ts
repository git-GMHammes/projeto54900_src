/**
 * =========================================================================
 * FILE HEADER — dev/fakeFill/calendario.ts
 * =========================================================================
 *
 * PROPOSITO: preenche com dados fake VALIDOS o formulario de slug
 * `calendario` (modal "Novo Calendário" de
 * pages/v1/calendar/calendar-manager/GetAllPage.tsx e /v1/form/calendario).
 * DEV-ONLY — acionado por components/global/FakeFillButton.tsx, que só
 * aparece com isDevHost() (ver markdown/geral/README_envHost.md, base do
 * backend).
 *
 * IDS DOS CAMPOS: vêm de `fc_field_key` no form_fields, no formato
 * `fc_<grupo>_<coluna>` (ex.: `fc_principal_summary`). Se o formulario for
 * remontado no construtor e as chaves mudarem, este script para de achar os
 * campos SEM erro — reconferir pela API abaixo.
 *
 * REGRAS DE NEGOCIO RESPEITADAS (checadas ao vivo via
 * POST /api/v1/form-manager-view/get-grouped {"fm_slug":["calendario"]} e via
 * app/Models/V1/Calendar/CalendarManager/SqlTableModel.php +
 * app/Services/V1/Calendar/CalendarManager/Processor.php):
 *   - `summary` (texto) e `time_zone` (select): NOT NULL no banco e
 *     `required` no schema — SEMPRE preenchidos;
 *   - `access_role` (select): ENUM do banco
 *     (owner/writer/reader/freeBusyReader) — só um desses 4 valores passa,
 *     qualquer outra string quebra a query no MySQL;
 *   - `google_calendar_id` (texto): UNIQUE globalmente
 *     (Processor::validateOnCreate devolve 409 se repetir) — por isso leva
 *     um token aleatorio a cada chamada, nunca um valor fixo;
 *   - `background_color`/`foreground_color` (select remoto de `aux_cor`,
 *     valueKey `hexadecimal`): só aceita hex que exista na tabela — um hex
 *     aleatorio nao casa com nenhuma opcao;
 *   - `location`/`description`: opcionais, sem regra alem do tamanho
 *     maximo do campo (255 / sem limite).
 *   - `status` (radio, ids das opcoes `opt_active`/`opt_inactive`): marca
 *     sempre 'Ativo' — o Processor descarta o valor no create e a coluna nasce
 *     'active' pelo DEFAULT, entao so preenche o que a tela mostra;
 *   - NAO preenchidos: `is_primary` (opcional; marcar em todo teste teria efeito
 *     colateral) e `user_manager_id` (select remoto que ja vem preenchido).
 *
 * DEPENDENCIAS: dev/fakeFill/domUtils (setReactValue, selectComboboxOption,
 * geradores aleatorios).
 * CONSUMIDORES: dev/fakeFill/registry.ts (entrada 'calendario').
 *
 * COMO CRIAR O PROXIMO SCRIPT (outro formulario): copiar este arquivo,
 * trocar os ids/regras pelos do novo formulario (confirme sempre pela API —
 * `POST /api/v1/form-manager-view/get-grouped` com o `fm_slug` do
 * formulario — e pelo Model/Processor do modulo, nunca advinhar) e
 * registrar em dev/fakeFill/registry.ts.
 * -------------------------------------------------------------------------
 */

import { clickIfUnchecked, randomItem, randomSentence, randomToken, selectComboboxOption, setReactValue } from './domUtils';

// ENUM access_role — só estes 4 valores existem na coluna do banco.
const ACCESS_ROLES = ['owner', 'writer', 'reader', 'freeBusyReader'] as const;

// Nomes IANA reais — o backend não valida formato, mas o dado fake não precisa ser lixo.
const TIME_ZONES = [
  'America/Sao_Paulo',
  'America/Bahia',
  'America/Manaus',
  'America/New_York',
  'Europe/Lisbon',
  'Europe/London',
  'UTC',
] as const;

// Hexadecimais existentes em `aux_cor` (DodgerBlue, SeaGreen, RoyalBlue, SlateBlue, Teal).
const BACKGROUND_COLORS = ['#1E90FF', '#2E8B57', '#4169E1', '#6A5ACD', '#008080'] as const;
// Texto: preto e o unico tom neutro garantido em `aux_cor` (nao ha #FFFFFF).
const FOREGROUND_COLOR = '#000000';

const TOPICOS = [
  'equipe', 'projeto', 'cliente', 'diretoria', 'sprint', 'planejamento',
  'financeiro', 'suporte', 'produto', 'alinhamento', 'revisão', 'kickoff',
];

const LOCAIS = ['Sala 1', 'Sala 2', 'Auditório', 'Remoto', 'Sede', 'Filial Centro'];

function setText(id: string, value: string): void {
  const el = document.getElementById(id);
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) setReactValue(el, value);
}

/** Preenche os campos do modal de cadastro de calendário com dados fake válidos. */
export async function fillCalendarioForm(): Promise<void> {
  setText('fc_principal_summary', `Reunião de ${randomSentence(TOPICOS, 2)}`);
  setText('fc_principal_location', randomItem(LOCAIS));
  setText('fc_principal_description', randomSentence(TOPICOS, randomTextLength()));
  setText('fc_vinculo_google_calendar_id', `teste-${randomToken()}@group.calendar.google.com`);

  await selectComboboxOption('fc_vinculo_access_role', randomItem(ACCESS_ROLES));
  await selectComboboxOption('fc_aparencia_background_color', randomItem(BACKGROUND_COLORS));
  await selectComboboxOption('fc_aparencia_foreground_color', FOREGROUND_COLOR);
  await selectComboboxOption('fc_config_time_zone', randomItem(TIME_ZONES));

  clickIfUnchecked('opt_active');
}

function randomTextLength(): number {
  return 6 + Math.floor(Math.random() * 6);
}

export default fillCalendarioForm;
