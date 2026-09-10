<?php

namespace App\Requests\V1\Agenda\CalendarEventAttendees;

/**
 * Regras de validacao para PUT /update/{id} (tabela calendar_event_attendees).
 *
 * Atualizacao parcial: todos os campos permit_empty. Se calendar_event_id ou
 * email vierem, a existencia da FK e a unicidade de (calendar_event_id, email)
 * sao reavaliadas no hook validateOnUpdate.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'calendar_event_id' => 'permit_empty|is_natural_no_zero',
            'email'             => 'permit_empty|valid_email|max_length[255]',
            'display_name'      => 'permit_empty|string|max_length[255]',
            'is_organizer'      => 'permit_empty|in_list[0,1]',
            'is_self'           => 'permit_empty|in_list[0,1]',
            'is_resource'       => 'permit_empty|in_list[0,1]',
            'is_optional'       => 'permit_empty|in_list[0,1]',
            'response_status'   => 'permit_empty|in_list[needsAction,declined,tentative,accepted]',
            'comment'           => 'permit_empty|string|max_length[500]',
        ];
    }

    public function messages(): array
    {
        return [
            'calendar_event_id' => [
                'is_natural_no_zero' => 'O campo calendar_event_id deve ser um inteiro maior que zero',
            ],
            'email' => [
                'valid_email' => 'O campo email deve ser um endereco valido',
            ],
            'response_status' => [
                'in_list' => 'response_status deve ser um de: needsAction, declined, tentative, accepted',
            ],
        ];
    }
}
