/**
 * =========================================================================
 * FILE HEADER — services/calendarSchema.ts
 * =========================================================================
 *
 * PROPOSITO: converte as linhas ACHATADAS da view view_calendar_manager
 * (1 linha por evento, colunas cm_ e ce_, ver services/v1/calendarManager.view.ts)
 * em uma lista agrupada por calendario: `{ calendar, events[] }[]`. Mesma
 * ideia de services/formSchema.ts (acumular em Map por id do pai), so que
 * com 1 nivel de filhos em vez de 3 (form_manager > form_groups > form_rows >
 * form_fields).
 *
 * Um calendario sem eventos ainda aparece (LEFT JOIN da view) com todo ce_*
 * NULL — por isso a linha so vira evento quando `ce_id` existe.
 *
 * DEPENDENCIAS: @/types/api (ApiRow). Nada de HTTP aqui: transformacao pura.
 * CONSUMIDORES: pages/v1/calendar/calendar-manager/GetAllPage.tsx.
 *
 * COMO REPLICAR PARA OUTRA VIEW DE 2 NIVEIS: troque os prefixos cm_/ce_ e os
 * campos lidos em `readCalendar`/`readEvent`, mantendo a ideia de agrupar por
 * id do pai (aqui `cm_id`) num Map, na ordem de chegada das linhas.
 * -------------------------------------------------------------------------
 */

import type { ApiRow } from '@/types/api';

function str(v: unknown): string | undefined {
  if (typeof v === 'string') return v.length > 0 ? v : undefined;
  if (typeof v === 'number') return String(v);
  return undefined;
}

function int(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function bool(v: unknown): boolean {
  return v === 1 || v === '1' || v === true;
}

export interface CalendarManagerRow {
  id: number;
  googleCalendarId?: string;
  summary: string;
  description?: string;
  timeZone?: string;
  location?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  accessRole?: string;
  isPrimary: boolean;
  status?: string;
  userManagerId?: number;
}

export interface CalendarEventRow {
  id: number;
  summary: string;
  description?: string;
  location?: string;
  status?: string;
  startDate?: string;
  startDatetime?: string;
  endDate?: string;
  endDatetime?: string;
}

export interface CalendarGroup {
  calendar: CalendarManagerRow;
  events: CalendarEventRow[];
}

// `exactOptionalPropertyTypes` (tsconfig.app.json) proibe atribuir `undefined`
// direto numa prop `?:` — por isso as props opcionais so entram no objeto
// quando o helper `str`/`int` devolve valor definido (mesmo padrao de
// services/formSchema.ts).
function readCalendar(row: ApiRow, id: number): CalendarManagerRow {
  const draft: CalendarManagerRow = {
    id,
    summary: str(row.cm_summary) ?? '',
    isPrimary: bool(row.cm_is_primary),
  };
  const set = <K extends keyof CalendarManagerRow>(key: K, value: CalendarManagerRow[K] | undefined): void => {
    if (value !== undefined) draft[key] = value;
  };
  set('googleCalendarId', str(row.cm_google_calendar_id));
  set('description', str(row.cm_description));
  set('timeZone', str(row.cm_time_zone));
  set('location', str(row.cm_location));
  set('backgroundColor', str(row.cm_background_color));
  set('foregroundColor', str(row.cm_foreground_color));
  set('accessRole', str(row.cm_access_role));
  set('status', str(row.cm_status));
  set('userManagerId', int(row.cm_user_manager_id));
  return draft;
}

function readEvent(row: ApiRow, id: number): CalendarEventRow {
  const draft: CalendarEventRow = {
    id,
    summary: str(row.ce_summary) ?? '',
  };
  const set = <K extends keyof CalendarEventRow>(key: K, value: CalendarEventRow[K] | undefined): void => {
    if (value !== undefined) draft[key] = value;
  };
  set('description', str(row.ce_description));
  set('location', str(row.ce_location));
  set('status', str(row.ce_status));
  set('startDate', str(row.ce_start_date));
  set('startDatetime', str(row.ce_start_datetime));
  set('endDate', str(row.ce_end_date));
  set('endDatetime', str(row.ce_end_datetime));
  return draft;
}

/** Agrupa as linhas achatadas da view por calendario (cm_id), na ordem de chegada. */
export function groupCalendarView(rows: readonly ApiRow[]): CalendarGroup[] {
  const groups = new Map<number, CalendarGroup>();

  for (const row of rows) {
    const calendarId = int(row.cm_id);
    if (calendarId === undefined) continue;

    let group = groups.get(calendarId);
    if (!group) {
      group = { calendar: readCalendar(row, calendarId), events: [] };
      groups.set(calendarId, group);
    }

    const eventId = int(row.ce_id);
    if (eventId !== undefined) {
      group.events.push(readEvent(row, eventId));
    }
  }

  return [...groups.values()];
}

export default groupCalendarView;
