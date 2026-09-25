import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';

import MonthCalendar from '@/components/ui/MonthCalendar';
import type { MonthCalendarEvent } from '@/components/ui/MonthCalendar';
import YearCalendar from '@/components/ui/YearCalendar';
import FormGrid from '@/components/ui/FormGrid/Input';
import type { CalendarEventRow, CalendarGroup } from '@/services/calendarSchema';

import { CALENDAR_FIND_SRC, CALENDAR_SELECT_SRC } from './constants';
import { eventEnd, eventStart, eventsInRange, formatIsoBr, monthLabel } from './helpers';

/**
 * Seletor de agenda + collapse "Mês atual"/"Ano" + cards de eventos da agenda
 * escolhida (filtro opcional por período/dia). Bloco autocontido: só depende
 * de `groups` (a listagem já carregada, sem nova chamada) e de como renderizar
 * as ações de cada evento (Aceitar/Recusar ou as ações tradicionais).
 */
export default function AgendaViewer({
  groups,
  renderEventActions,
  onOpenEventModal,
}: {
  groups: CalendarGroup[] | null;
  renderEventActions: (ev: CalendarEventRow, onOpenModal: (slug: string) => void) => ReactNode;
  onOpenEventModal: (slug: string, event: CalendarEventRow) => void;
}) {
  // Agenda escolhida no select abaixo da lista + collapses "Mês atual" / "Ano".
  const [selectedCalendarId, setSelectedCalendarId] = useState('');
  const [showMonth, setShowMonth] = useState(false);
  const [showYear, setShowYear] = useState(false);
  // Dia clicado no calendário (ISO 'YYYY-MM-DD') — lista os eventos dele em cards.
  const [selectedDay, setSelectedDay] = useState('');
  // Período dos campos Início/Fim (ISO 'YYYY-MM-DD'; '' = aberto/incompleto) — lista os eventos em cards.
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  // Âncora do bloco de cards: o clique num dia rola a página até ele.
  const cardsRef = useRef<HTMLDivElement>(null);

  // Eventos da agenda escolhida — saem de `groups` (view inteira, sem paginação), sem nova chamada.
  const selectedGroupEvents = useMemo(
    () => groups?.find((g) => String(g.calendar.id) === selectedCalendarId)?.events ?? [],
    [groups, selectedCalendarId],
  );
  const selectedEvents = useMemo<MonthCalendarEvent[]>(
    () =>
      selectedGroupEvents.map((ev) => {
        const start = eventStart(ev);
        return { start, end: eventEnd(ev) || start, summary: ev.summary };
      }),
    [selectedGroupEvents],
  );
  // Cards — a agenda é a busca; datas e dia só restringem (ambos opcionais):
  //   1) agenda escolhida -> todos os eventos dela (qualquer ano);
  //   2) + Início/Fim     -> só os do período;
  //   3) + dia clicado    -> só os do dia (prioridade; o X volta ao nível 2/1).
  const dayMode = !!selectedDay && (showMonth || showYear);
  const rangeMode = !dayMode && !!(rangeStart || rangeEnd);
  const cardEvents = useMemo(() => {
    if (dayMode) return eventsInRange(selectedGroupEvents, selectedDay, selectedDay);
    if (rangeMode) return eventsInRange(selectedGroupEvents, rangeStart, rangeEnd);
    return eventsInRange(selectedGroupEvents, '', '');
  }, [dayMode, rangeMode, selectedGroupEvents, selectedDay, rangeStart, rangeEnd]);
  const cardsTitle = dayMode
    ? `Eventos de ${formatIsoBr(selectedDay)}`
    : !rangeMode
      ? 'Eventos da agenda'
      : rangeStart && rangeEnd
        ? `Eventos de ${formatIsoBr(rangeStart)} a ${formatIsoBr(rangeEnd)}`
        : rangeStart
          ? `Eventos a partir de ${formatIsoBr(rangeStart)}`
          : `Eventos até ${formatIsoBr(rangeEnd)}`;
  const cardsEmptyText = rangeMode ? 'Nenhum compromisso no período.' : 'Esta agenda não tem eventos.';

  // Âncora: clique num dia leva o navegador até o início dos cards.
  useEffect(() => {
    if (selectedDay) cardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectedDay]);

  /** onChange dos campos de data: só guarda a data completa (ISO); digitando, fica '' (período aberto). */
  const onRangeChange = (setFn: (v: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setFn(/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '');
    setSelectedDay('');
  };
  const now = new Date();
  // Mês/ano de referência dos calendários: o do Início quando preenchido (lido do texto ISO, sem
  // Date, evita fuso); senão, hoje. Apagar o Início volta ao mês/ano atuais.
  const refYear = rangeStart ? Number(rangeStart.slice(0, 4)) : now.getFullYear();
  const refMonth = rangeStart ? Number(rangeStart.slice(5, 7)) - 1 : now.getMonth();

  // Mês exibido sem eventos da agenda: aviso + atalho para o próximo evento (ou o anterior,
  // se não houver próximo) — evita confundir evento de outro ano com o mês exibido.
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const monthFirst = `${refYear}-${pad2(refMonth + 1)}-01`;
  const monthLast = `${refYear}-${pad2(refMonth + 1)}-${pad2(new Date(refYear, refMonth + 1, 0).getDate())}`;
  const monthHasEvents = eventsInRange(selectedGroupEvents, monthFirst, monthLast).length > 0;
  const allSorted = eventsInRange(selectedGroupEvents, '', '');
  // Último evento que termina antes do mês e primeiro que começa depois — datas de início (ISO).
  const prevEvent = [...allSorted].reverse().find((ev) => (eventEnd(ev) || eventStart(ev)).slice(0, 10) < monthFirst);
  const nextEvent = allSorted.find((ev) => eventStart(ev).slice(0, 10) > monthLast);
  const prevDate = !monthHasEvents && prevEvent ? eventStart(prevEvent).slice(0, 10) : '';
  const nextDate = !monthHasEvents && nextEvent ? eventStart(nextEvent).slice(0, 10) : '';
  /** Atalho do aviso: leva o Início (e, com ele, Mês/Ano/cards) até a data do evento. */
  const jumpTo = (iso: string) => {
    setRangeStart(iso);
    setSelectedDay('');
  };
  const isoMonthLabel = (iso: string) => monthLabel(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1);

  return (
    <>
      {/* Row de layout 6|6; os campos seguem via <FormGrid>. Na esquerda o select
          divide o espaço com os 2 botões; na direita as datas em col 6 (= 3/12 cada). */}
      <div className="row g-3 mt-3">
        <div className="col-md-6">
          <div className="d-flex align-items-start gap-2">
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <FormGrid
                schema={{
                  rows: [
                    {
                      fields: [
                        {
                          type: 'select',
                          col: 12,
                          label: 'Agenda',
                          name: 'calendar_id',
                          src: CALENDAR_SELECT_SRC,
                          findSrc: CALENDAR_FIND_SRC,
                          findColumn: 'summary',
                          valueKey: 'id',
                          labelKey: 'summary',
                          value: selectedCalendarId,
                          onChange: (value) => {
                            setSelectedCalendarId(value);
                            setSelectedDay('');
                          },
                        },
                      ],
                    },
                  ],
                }}
              />
            </div>
            {/* mt-4 pt-2 (2rem) = altura do label do campo, alinha os botões com o input. */}
            <span className="icon-action-tooltip mt-4 pt-2">
              <button
                type="button"
                className={`btn ${showMonth ? 'btn-primary' : 'btn-outline-primary'}`}
                aria-label="Mês atual"
                aria-expanded={showMonth}
                aria-controls="calendar-month-collapse"
                onClick={() => setShowMonth((v) => !v)}
              >
                <i className="bi bi-calendar3" />
              </button>
              <span className="icon-action-tooltip-bubble" role="tooltip">
                Mês atual
              </span>
            </span>
            <span className="icon-action-tooltip mt-4 pt-2">
              <button
                type="button"
                className={`btn ${showYear ? 'btn-primary' : 'btn-outline-primary'}`}
                aria-label="Ano"
                aria-expanded={showYear}
                aria-controls="calendar-year-collapse"
                onClick={() => setShowYear((v) => !v)}
              >
                <i className="bi bi-calendar-range" />
              </button>
              <span className="icon-action-tooltip-bubble" role="tooltip">
                Ano
              </span>
            </span>
          </div>
        </div>
        <div className="col-md-6">
          <FormGrid
            schema={{
              rows: [
                {
                  fields: [
                    {
                      type: 'data',
                      col: 6,
                      label: 'Início',
                      name: 'start_date',
                      // Controlado: o atalho "Ir para o próximo evento" ajusta o Início.
                      value: rangeStart,
                      onChange: onRangeChange(setRangeStart),
                    },
                    { type: 'data', col: 6, label: 'Fim', name: 'end_date', onChange: onRangeChange(setRangeEnd) },
                  ],
                },
              ],
            }}
          />
        </div>
      </div>

      {/* Botões/datas sem agenda escolhida: aviso em vez de clique/digitação muda. */}
      {(showMonth || showYear || rangeStart || rangeEnd) && !selectedCalendarId && (
        <div className="alert alert-warning py-2 mt-3" role="alert">
          Selecione uma agenda para ver os eventos.
        </div>
      )}

      {/* Cards da agenda escolhida (filtro opcional por período/dia) — acima dos calendários; âncora do clique no dia. */}
      {selectedCalendarId && (
        <div ref={cardsRef} className="mt-3 mb-4" style={{ scrollMarginTop: '1rem' }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h2 className="h6 mb-0">
              {cardsTitle}{' '}
              <span className="text-body-secondary fw-normal">({cardEvents.length})</span>
            </h2>
            {dayMode && (
              <button type="button" className="btn-close" aria-label="Fechar" onClick={() => setSelectedDay('')} />
            )}
          </div>
          {cardEvents.length === 0 && (
            <div className="text-body-secondary small">{cardsEmptyText}</div>
          )}
          <div className="row g-3">
            {cardEvents.map((ev) => (
              <div className="col-md-6 col-lg-4" key={ev.id}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                      <h3 className="h6 card-title mb-0">{ev.summary}</h3>
                      {ev.status && (
                        <span
                          className={`badge ${ev.status === 'confirmed'
                              ? 'text-bg-success'
                              : ev.status === 'tentative'
                                ? 'text-bg-warning'
                                : 'text-bg-secondary'
                            }`}
                        >
                          {ev.status}
                        </span>
                      )}
                    </div>
                    <div className="small text-body-secondary mb-2">
                      <i className="bi bi-clock me-1" />
                      {formatIsoBr(eventStart(ev))}
                      {eventEnd(ev) && ` → ${formatIsoBr(eventEnd(ev))}`}
                      {ev.location && (
                        <>
                          <br />
                          <i className="bi bi-geo-alt me-1" />
                          {ev.location}
                        </>
                      )}
                    </div>
                    {ev.description && <p className="card-text small mb-0">{ev.description}</p>}
                  </div>
                  {/* Aceitar/Recusar o próprio convite; depois de aceitar, mostra
                      as mesmas ações tradicionais do "Ver eventos" (renderEventActions). */}
                  <div className="card-footer bg-transparent d-flex justify-content-end gap-1 py-2">
                    {renderEventActions(ev, (slug) => onOpenEventModal(slug, ev))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div id="calendar-month-collapse" className={`collapse${showMonth ? ' show' : ''}`}>
        <MonthCalendar
          year={refYear}
          month={refMonth}
          size="lg"
          className="mb-4"
          events={selectedEvents}
          onDayClick={setSelectedDay}
          selectedDate={selectedDay}
          markedDate={rangeStart}
        />
        {selectedCalendarId && !monthHasEvents && (
          <div className="alert alert-light border d-flex flex-wrap align-items-center gap-2 mb-4 py-2">
            <span>
              Nenhum evento em <span className="text-capitalize">{monthLabel(refYear, refMonth)}</span>.
            </span>
            {prevDate && (
              <button type="button" className="btn btn-link btn-sm p-0" onClick={() => jumpTo(prevDate)}>
                <i className="bi bi-chevron-left" /> Evento anterior ({isoMonthLabel(prevDate)})
              </button>
            )}
            {nextDate && (
              <button type="button" className="btn btn-link btn-sm p-0" onClick={() => jumpTo(nextDate)}>
                Próximo evento ({isoMonthLabel(nextDate)}) <i className="bi bi-chevron-right" />
              </button>
            )}
          </div>
        )}
      </div>

      <div id="calendar-year-collapse" className={`collapse${showYear ? ' show' : ''}`}>
        <h2 className="h5 mb-3">Ano {refYear} — janeiro a dezembro</h2>
        <YearCalendar
          year={refYear}
          className="mb-4"
          events={selectedEvents}
          onDayClick={setSelectedDay}
          selectedDate={selectedDay}
          markedDate={rangeStart}
        />
      </div>
    </>
  );
}
