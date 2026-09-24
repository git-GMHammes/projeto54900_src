<?php

namespace App\Requests\V1\Calendar\CalendarEventReminders;

/**
 * Regras de validacao para POST /create (tabela calendar_event_reminders).
 *
 * DDL de referencia:
 *   calendar_event_id BIGINT NOT NULL  FK -> calendar_events.id
 *   method            ENUM(email,popup) DEFAULT 'popup'
 *   minutes           INT    NOT NULL  (lista fixa MINUTES_OPTIONS desde 2026-09-24:
 *                                     5, 10, 30 min, 1 h, 1 dia, 1 semana — espelho
 *                                     das opcoes do form 'cadastro-lembrete')
 *
 * Existencia de calendar_event_id (FK ativa) e unicidade de
 * (calendar_event_id, method, minutes) sao verificadas no hook validateOnCreate.
 */
class CreateRequest
{
    /** Antecedencias aceitas, em minutos (5 min, 10 min, 30 min, 1 h, 1 dia, 1 semana). */
    public const MINUTES_OPTIONS = '5,10,30,60,1440,10080';

    public function rules(): array
    {
        return [
            'calendar_event_id' => 'required|is_natural_no_zero',
            'method'            => 'permit_empty|in_list[email,popup]',
            'minutes'           => 'required|in_list[' . self::MINUTES_OPTIONS . ']',
        ];
    }

    public function messages(): array
    {
        return [
            'calendar_event_id' => [
                'required'           => 'O campo calendar_event_id e obrigatorio',
                'is_natural_no_zero' => 'O campo calendar_event_id deve ser um inteiro maior que zero',
            ],
            'method' => [
                'in_list' => 'O campo method deve ser email ou popup',
            ],
            'minutes' => [
                'required' => 'O campo minutes e obrigatorio',
                'in_list'  => 'minutes deve ser um de: ' . self::MINUTES_OPTIONS,
            ],
        ];
    }
}
