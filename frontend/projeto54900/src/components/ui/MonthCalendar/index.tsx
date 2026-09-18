/**
 * =========================================================================
 * FILE HEADER — components/ui/MonthCalendar/index.tsx
 * =========================================================================
 *
 * PROPOSITO: grade de um mes — cabecalho (mes/ano), linha de dias da semana
 * responsiva (1 letra no celular, abreviado no tablet, nome completo no
 * desktop) e os dias em CSS Grid de 7 colunas. Sem lib de calendario — so
 * Date/Intl nativos do browser.
 *
 * DEPENDENCIAS: nenhuma (so Date/Intl nativos).
 * CONSUMIDORES: components/ui/YearCalendar/index.tsx (12 instancias, uma por
 * mes, em tamanho compacto).
 *
 * COMO REAPROVEITAR: passar `year`/`month` (0-11, como Date nativo);
 * `size="sm"` para versao compacta (usada no YearCalendar).
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

export interface MonthCalendarProps {
  year: number;
  month: number; // 0-11
  size?: 'lg' | 'sm';
  className?: string;
}

export default function MonthCalendar({ year, month, size = 'lg', className = '' }: MonthCalendarProps) {
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const cells = buildDays(year, month);
  const titulo = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
    new Date(year, month, 1),
  );

  const cellMinHeight = size === 'lg' ? '3.5rem' : '2rem';
  const dayFontSize = size === 'lg' ? undefined : '0.8rem';

  return (
    <div className={`w-100 ${className}`}>
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
          const isToday = isCurrentMonth && day === today.getDate();
          return (
            <div
              key={idx}
              className="d-flex align-items-center justify-content-center"
              style={{ minHeight: cellMinHeight }}
            >
              {day !== null && (
                <span
                  className={
                    isToday
                      ? 'rounded-circle bg-primary text-white d-flex align-items-center justify-content-center'
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
