/**
 * =========================================================================
 * FILE HEADER — components/ui/MonthCalendar/index.tsx
 * =========================================================================
 *
 * PROPOSITO: grade de um mes — cabecalho (mes/ano), linha de dias da semana
 * responsiva (1 letra no celular, abreviado no tablet, nome completo no
 * desktop) e os dias em CSS Grid de 7 colunas. Sem lib de calendario — so
 * Date/Intl nativos do browser. O card (`shadow-lg`) que da a borda com
 * sombra "3D" ja vem embutido aqui — quem consome nao precisa envolver em
 * outro card.
 *
 * DEPENDENCIAS: nenhuma (so Date/Intl nativos).
 * CONSUMIDORES: components/ui/YearCalendar/index.tsx (12 instancias, uma por
 * mes, em tamanho compacto).
 *
 * COMO REAPROVEITAR: passar `year`/`month` (0-11, como Date nativo);
 * `size="sm"` para versao compacta (usada no YearCalendar). `events`
 * (opcional) marca os dias cobertos por cada evento (inicio..fim): no 'lg'
 * lista ate 2 titulos + "+N"; no 'sm' destaca o dia e lista os titulos no
 * title (hover). `onDayClick` (opcional) torna clicavel so o dia COM evento
 * (recebe a data ISO 'YYYY-MM-DD'); `selectedDate` ganha borda de destaque;
 * `markedDate` move a bolinha azul de hoje para essa data.
 * -------------------------------------------------------------------------
 */

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

/** Nome do dia da semana em pt-BR no formato pedido, a partir de uma data-base fixa (2024-01-07 = domingo). */
function weekdayLabel(weekday: number, format: 'narrow' | 'short' | 'long'): string {
  // Ano/mes fixos: so serve de base para achar o dia da semana informado.
  const base = new Date(2024, 0, 7 + weekday); // 2024-01-07 = domingo
  return new Intl.DateTimeFormat('pt-BR', { weekday: format }).format(base);
}

/** Monta as celulas do mes (null = dia vazio de preenchimento), completando a ultima semana ate multiplo de 7. */
function buildDays(year: number, month: number): (number | null)[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** Evento a marcar no calendario — datas ISO ('YYYY-MM-DD', hora ignorada); `end` vazio = mesmo dia do inicio. */
export interface MonthCalendarEvent {
  start: string;
  end: string;
  summary: string;
}

/** Agrupa os titulos dos eventos por dia do mes, cobrindo inicio..fim de cada evento (cortado nas bordas do mes). */
function eventsByDay(year: number, month: number, events: MonthCalendarEvent[]): Map<number, string[]> {
  const pad = (n: number) => String(n).padStart(2, '0');
  const monthPrefix = `${year}-${pad(month + 1)}-`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const first = `${monthPrefix}01`;
  const last = `${monthPrefix}${pad(daysInMonth)}`;
  const map = new Map<number, string[]>();

  for (const ev of events) {
    const start = ev.start.slice(0, 10);
    const end = (ev.end || ev.start).slice(0, 10);
    if (!start || end < first || start > last) continue;
    const from = start < first ? 1 : Number(start.slice(8, 10));
    const to = end > last ? daysInMonth : Number(end.slice(8, 10));
    for (let d = from; d <= to; d += 1) {
      const list = map.get(d) ?? [];
      list.push(ev.summary);
      map.set(d, list);
    }
  }
  return map;
}

export interface MonthCalendarProps {
  year: number;
  month: number; // 0-11
  size?: 'lg' | 'sm';
  className?: string;
  events?: MonthCalendarEvent[] | undefined;
  /** Clique em dia que tem evento — recebe a data ISO ('YYYY-MM-DD'). */
  onDayClick?: ((isoDate: string) => void) | undefined;
  /** Data ISO ('YYYY-MM-DD') destacada com borda. */
  selectedDate?: string | undefined;
  /** Data ISO ('YYYY-MM-DD') marcada com a bolinha azul no lugar de hoje; vazia = hoje. */
  markedDate?: string | undefined;
}

export default function MonthCalendar({
  year,
  month,
  size = 'lg',
  className = '',
  events,
  onDayClick,
  selectedDate,
  markedDate,
}: MonthCalendarProps) {
  const isoOf = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate(),
  ).padStart(2, '0')}`;
  const circleDate = markedDate || todayIso; // dia com a bolinha azul
  const cells = buildDays(year, month);
  const byDay = events ? eventsByDay(year, month, events) : new Map<number, string[]>();
  const titulo = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
    new Date(year, month, 1),
  );

  const cellMinHeight = size === 'lg' ? '3.5rem' : '2rem';
  const dayFontSize = size === 'lg' ? undefined : '0.8rem';

  return (
    <div className={`card shadow-lg w-100 ${className}`}>
      <div className={size === 'lg' ? 'card-body p-4' : 'card-body p-2'}>
        <h3 className={`text-capitalize text-center mb-2 ${size === 'lg' ? 'h5' : 'h6'}`}>{titulo}</h3>

        <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
          {WEEKDAYS.map((weekday) => (
            <div key={weekday} className="text-center text-body-secondary fw-semibold small text-uppercase">
              {size === 'sm' ? (
                weekdayLabel(weekday, 'narrow')
              ) : (
                <>
                  <span className="d-inline d-sm-none">{weekdayLabel(weekday, 'narrow')}</span>
                  <span className="d-none d-sm-inline d-lg-none">{weekdayLabel(weekday, 'short')}</span>
                  <span className="d-none d-lg-inline">{weekdayLabel(weekday, 'long')}</span>
                </>
              )}
            </div>
          ))}

          {cells.map((day, idx) => {
            const isToday = day !== null && isoOf(day) === circleDate;
            const dayEvents = day !== null ? (byDay.get(day) ?? []) : [];
            const hasEvents = dayEvents.length > 0;
            const iso = day !== null ? isoOf(day) : '';
            const clickable = hasEvents && !!onDayClick;
            const isSelected = !!selectedDate && iso === selectedDate;
            return (
              <div
                key={idx}
                className={`d-flex flex-column align-items-center justify-content-center${
                  hasEvents ? ' bg-warning-subtle rounded' : ''
                }${isSelected ? ' border border-2 border-primary' : ''}`}
                style={{ minHeight: cellMinHeight, minWidth: 0, cursor: clickable ? 'pointer' : undefined }}
                title={hasEvents ? dayEvents.join('\n') : undefined}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                aria-pressed={clickable ? isSelected : undefined}
                onClick={clickable ? () => onDayClick(iso) : undefined}
                onKeyDown={
                  clickable
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onDayClick(iso);
                        }
                      }
                    : undefined
                }
              >
                {day !== null && (
                  <span
                    className={
                      isToday
                        ? 'rounded-circle bg-primary text-white d-flex align-items-center justify-content-center'
                        : hasEvents
                          ? 'fw-bold'
                          : ''
                    }
                    style={{
                      width: isToday ? (size === 'lg' ? '2.25rem' : '1.5rem') : undefined,
                      height: isToday ? (size === 'lg' ? '2.25rem' : '1.5rem') : undefined,
                      fontSize: dayFontSize,
                    }}
                  >
                    {day}
                  </span>
                )}
                {size === 'lg' && hasEvents && (
                  <div className="w-100 px-1" style={{ fontSize: '0.7rem', lineHeight: 1.2 }}>
                    {dayEvents.slice(0, 2).map((s, i) => (
                      <div key={i} className="text-truncate">{s}</div>
                    ))}
                    {dayEvents.length > 2 && <div className="text-body-secondary">+{dayEvents.length - 2}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
