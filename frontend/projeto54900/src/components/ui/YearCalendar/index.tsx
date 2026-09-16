// Grade responsiva com os 12 meses de um ano, reaproveitando MonthCalendar
// em tamanho compacto (1 mes por linha no celular, ate 4 por linha no desktop).

import MonthCalendar from '@/components/ui/MonthCalendar';

export interface YearCalendarProps {
  year: number;
  className?: string;
}

const MONTHS = Array.from({ length: 12 }, (_, m) => m);

export default function YearCalendar({ year, className = '' }: YearCalendarProps) {
  return (
    <div className={`row g-4 ${className}`}>
      {MONTHS.map((month) => (
        <div key={month} className="col-12 col-sm-6 col-lg-4 col-xl-3">
          <MonthCalendar year={year} month={month} size="sm" />
        </div>
      ))}
    </div>
  );
}
