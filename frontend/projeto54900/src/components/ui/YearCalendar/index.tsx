/**
 * =========================================================================
 * FILE HEADER — components/ui/YearCalendar/index.tsx
 * =========================================================================
 *
 * PROPOSITO: grade responsiva com os 12 meses de um ano, reaproveitando
 * MonthCalendar em tamanho compacto (1 mes por linha no celular, ate 4 por
 * linha no desktop).
 *
 * DEPENDENCIAS: components/ui/MonthCalendar (renderiza cada mes).
 * CONSUMIDORES: qualquer pagina/formulario que precise de uma visao anual
 * (ex.: form renderizado via /v1/form/calendario, link da navbar).
 *
 * COMO REAPROVEITAR: passar so `year` — os 12 meses sao gerados
 * automaticamente.
 * -------------------------------------------------------------------------
 */

import MonthCalendar from '@/components/ui/MonthCalendar';
import type { MonthCalendarEvent } from '@/components/ui/MonthCalendar';

export interface YearCalendarProps {
  year: number;
  className?: string;
  /** Eventos repassados a cada mes (ver MonthCalendar). */
  events?: MonthCalendarEvent[] | undefined;
  /** Repassados a cada mes (ver MonthCalendar). */
  onDayClick?: ((isoDate: string) => void) | undefined;
  selectedDate?: string | undefined;
  markedDate?: string | undefined;
}

const MONTHS = Array.from({ length: 12 }, (_, m) => m);

export default function YearCalendar({ year, className = '', events, onDayClick, selectedDate, markedDate }: YearCalendarProps) {
  return (
    <div className={`row g-4 ${className}`}>
      {MONTHS.map((month) => (
        <div key={month} className="col-12 col-sm-6 col-lg-4 col-xl-3">
          <MonthCalendar
            year={year}
            month={month}
            size="sm"
            className="h-100"
            events={events}
            onDayClick={onDayClick}
            selectedDate={selectedDate}
            markedDate={markedDate}
          />
        </div>
      ))}
    </div>
  );
}
