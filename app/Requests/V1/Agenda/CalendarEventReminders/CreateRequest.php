<?php

namespace App\Requests\V1\Agenda\CalendarEventReminders;

/**
 * Regras de validacao para POST /create (tabela calendar_event_reminders).
 *
 * DDL de referencia:
 *   calendar_event_id BIGINT NOT NULL  FK -> calendar_events.id
 *   method            ENUM(email,popup) DEFAULT 'popup'
 *   minutes           INT    NOT NULL
 *
 * Existencia de calendar_event_id (FK ativa) e unicidade de
 * (calendar_event_id, method, minutes) sao verificadas no hook validateOnCreate.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'calendar_event_id' => 'required|is_natural_no_zero',
            'method'            => 'permit_empty|in_list[email,popup]',
            'minutes'           => 'required|is_natural',
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
                'required'   => 'O campo minutes e obrigatorio',
                'is_natural' => 'O campo minutes deve ser um inteiro maior ou igual a zero',
            ],
        ];
    }
}
