import type { CalendarEventRow, CalendarGroup, CalendarManagerRow } from '@/services/calendarSchema';
import type { RenderForm } from '@/services/formSchema';

/** Valores atuais do calendário, por field_name do form_manager — usado para pré-preencher o modal "Editar". */
export function calendarToFieldValues(c: CalendarManagerRow): Record<string, string> {
  return {
    summary: c.summary,
    location: c.location ?? '',
    description: c.description ?? '',
    user_manager_id: c.userManagerId !== undefined ? String(c.userManagerId) : '',
    google_calendar_id: c.googleCalendarId ?? '',
    is_primary: c.isPrimary ? '1' : '',
    access_role: c.accessRole ?? '',
    background_color: c.backgroundColor ?? '',
    foreground_color: c.foregroundColor ?? '',
    time_zone: c.timeZone ?? '',
    status: c.status ?? '',
  };
}

/** Injeta defaultValue por field_name num FormGridSchema já montado — dado que a página já tem em tela, sem nova chamada de API. */
export function withDefaultValues(schema: RenderForm['schema'], values: Record<string, string>): RenderForm['schema'] {
  return {
    rows: schema.rows.map((row) => ({
      ...row,
      fields: row.fields.map((field) => {
        const f = field as unknown as { name?: string; type?: string };
        if (!f.name || !(f.name in values)) return field;
        const raw = values[f.name] ?? '';
        if (f.type === 'checkbox') {
          return { ...field, defaultValue: raw ? [raw] : [] } as unknown as typeof field;
        }
        return { ...field, defaultValue: raw } as unknown as typeof field;
      }),
    })),
  };
}

/** Início/fim do evento como texto ISO — data pura (evento de dia inteiro) ou data+hora. */
export function eventStart(ev: CalendarEventRow): string {
  return ev.startDate ?? ev.startDatetime ?? '';
}
export function eventEnd(ev: CalendarEventRow): string {
  return ev.endDate ?? ev.endDatetime ?? '';
}

/**
 * Eventos com alguma parte dentro de [from, to] (datas ISO 'YYYY-MM-DD'; '' = lado aberto),
 * comparando só a data de início..fim de cada evento; ordenados pela hora de início.
 */
export function eventsInRange(events: CalendarEventRow[], from: string, to: string): CalendarEventRow[] {
  return events
    .filter((ev) => {
      const start = eventStart(ev).slice(0, 10);
      const end = (eventEnd(ev) || start).slice(0, 10);
      return start !== '' && (!to || start <= to) && (!from || end >= from);
    })
    .sort((a, b) => eventStart(a).localeCompare(eventStart(b)));
}

/** "fevereiro de 2028" — nome do mês (0-11) + ano, em pt-BR. */
export function monthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(year, month, 1));
}

/** 'YYYY-MM-DD[ HH:MM:SS]' -> 'DD/MM/AAAA[ HH:MM]' (sem Date, evita deslocamento de fuso). */
export function formatIsoBr(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/.exec(iso);
  if (!m) return iso;
  const [, y, mo, d, h, mi] = m;
  return `${d}/${mo}/${y}${h !== undefined && mi !== undefined ? ` ${h}:${mi}` : ''}`;
}

/** true quando o termo de busca aparece no nome ou no local do calendario (descricao e eventos ficam de fora). */
export function matchesSearch(group: CalendarGroup, term: string): boolean {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;

  const haystacks = [group.calendar.summary, group.calendar.location];
  return haystacks.some((v) => v?.toLowerCase().includes(needle));
}
