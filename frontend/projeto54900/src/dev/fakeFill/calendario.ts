/**
 * =========================================================================
 * FILE HEADER — dev/fakeFill/calendario.ts
 * =========================================================================
 *
 * PROPOSITO: preenche com dados fake VALIDOS o formulario de
 * `/v1/form/calendario` (modal aberto por FormRendererPage.tsx, campos do
 * grupo `calendar_manager`). DEV-ONLY — acionado por
 * components/global/FakeFillButton.tsx, que só aparece com isDevHost() (ver
 * markdown/geral/README_envHost.md, base do backend).
 *
 * REGRAS DE NEGOCIO RESPEITADAS (checadas ao vivo via
 * POST /api/v1/form-manager-view/get-grouped?fm_slug=calendario e via
 * app/Models/V1/Calendar/CalendarManager/SqlTableModel.php +
 * app/Services/V1/Calendar/CalendarManager/Processor.php):
 *   - `summary` (Titulo) e `time_zone` (Fuso horario): NOT NULL no banco e
 *     `required` no schema — SEMPRE preenchidos;
 *   - `access_role` (Papel de acesso): ENUM do banco
 *     (owner/writer/reader/freeBusyReader) — só um desses 4 valores passa,
 *     qualquer outra string quebra a query no MySQL;
 *   - `google_calendar_id`: UNIQUE globalmente (Processor::validateOnCreate
 *     devolve 409 se repetir) — por isso leva um token aleatorio a cada
 *     chamada, nunca um valor fixo;
 *   - `background_color`/`foreground_color`: VARCHAR(7) — formato
 *     `#RRGGBB`;
 *   - `location`/`description`: opcionais, sem regra alem do tamanho
 *     maximo do campo (255 / sem limite).
 *   - `status` NAO faz parte deste preenchimento: o Processor descarta
 *     qualquer valor enviado no create (nasce sempre 'active' pelo DEFAULT
 *     da coluna).
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

import { randomHexColor, randomItem, randomSentence, randomToken, selectComboboxOption, setReactValue } from './domUtils';

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

const TOPICOS = [
  'equipe', 'projeto', 'cliente', 'diretoria', 'sprint', 'planejamento',
  'financeiro', 'suporte', 'produto', 'alinhamento', 'revisão', 'kickoff',
];

const LOCAIS = ['Sala 1', 'Sala 2', 'Auditório', 'Remoto', 'Sede', 'Filial Centro'];

function setText(id: string, value: string): void {
  const el = document.getElementById(id);
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) setReactValue(el, value);
}

/** Preenche os 8 campos do modal de cadastro de calendário com dados fake válidos. */
export async function fillCalendarioForm(): Promise<void> {
  setText('summary', `Reunião de ${randomSentence(TOPICOS, 2)}`);
  setText('location', randomItem(LOCAIS));
  setText('description', randomSentence(TOPICOS, randomTextLength()));
  setText('google_calendar_id', `teste-${randomToken()}@group.calendar.google.com`);
  setText('background_color', randomHexColor());
  setText('foreground_color', randomHexColor());
  setText('time_zone', randomItem(TIME_ZONES));

  await selectComboboxOption('access_role', randomItem(ACCESS_ROLES));
}

function randomTextLength(): number {
  return 6 + Math.floor(Math.random() * 6);
}

export default fillCalendarioForm;
