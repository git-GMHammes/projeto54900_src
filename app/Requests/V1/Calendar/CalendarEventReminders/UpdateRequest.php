<?php

namespace App\Requests\V1\Calendar\CalendarEventReminders;

/**
 * Regras de validacao para PUT /update/{id} (tabela calendar_event_reminders).
 *
 * Atualizacao parcial: todos os campos permit_empty. Se calendar_event_id,
 * method ou minutes vierem, a existencia da FK e a unicidade de
 * (calendar_event_id, method, minutes) sao reavaliadas no hook validateOnUpdate.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'calendar_event_id' => 'permit_empty|is_natural_no_zero',
            'method'            => 'permit_empty|in_list[email,popup]',
            'minutes'           => 'permit_empty|in_list[' . CreateRequest::MINUTES_OPTIONS . ']',
        ];
    }

    public function messages(): array
    {
        return [
            'calendar_event_id' => [
                'is_natural_no_zero' => 'O campo calendar_event_id deve ser um inteiro maior que zero',
            ],
            'method' => [
                'in_list' => 'O campo method deve ser email ou popup',
            ],
            'minutes' => [
                'in_list' => 'minutes deve ser um de: ' . CreateRequest::MINUTES_OPTIONS,
            ],
        ];
    }
}
