<?php

namespace App\Requests\V1\Calendar\CalendarEvents;

/**
 * Regras de validacao para PUT /update/{id} (tabela calendar_events).
 *
 * Atualizacao parcial: todos os campos permit_empty. Se calendar_id,
 * recurring_event_id ou google_event_id vierem, a existencia da FK e a
 * unicidade sao reavaliadas no hook validateOnUpdate. Diferente do create,
 * status pode ser alterado por update.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'calendar_id'                 => 'permit_empty|is_natural_no_zero',
            'google_event_id'             => 'permit_empty|string|max_length[512]',
            'ical_uid'                    => 'permit_empty|string|max_length[255]',
            'status'                      => 'permit_empty|in_list[confirmed,tentative,cancelled]',
            'summary'                     => 'permit_empty|string|max_length[255]',
            'description'                 => 'permit_empty|string',
            'location'                    => 'permit_empty|string|max_length[255]',
            'start_date'                  => 'permit_empty|string|valid_date[Y-m-d]',
            'start_datetime'              => 'permit_empty|string|valid_date[Y-m-d H:i:s]',
            'start_time_zone'             => 'permit_empty|string|max_length[50]',
            'end_date'                    => 'permit_empty|string|valid_date[Y-m-d]',
            'end_datetime'                => 'permit_empty|string|valid_date[Y-m-d H:i:s]',
            'end_time_zone'               => 'permit_empty|string|max_length[50]',
            'recurrence'                  => 'permit_empty|string',
            'recurring_event_id'         => 'permit_empty|is_natural_no_zero',
            'sequence'                    => 'permit_empty|is_natural',
            'transparency'                => 'permit_empty|in_list[opaque,transparent]',
            'visibility'                  => 'permit_empty|in_list[default,public,private,confidential]',
            'color_id'                    => 'permit_empty|string|max_length[10]',
            'event_type'                  => 'permit_empty|in_list[default,outOfOffice,focusTime,workingLocation,birthday]',
            'guests_can_modify'           => 'permit_empty|in_list[0,1]',
            'guests_can_invite_others'    => 'permit_empty|in_list[0,1]',
            'guests_can_see_other_guests' => 'permit_empty|in_list[0,1]',
            'anyone_can_add_self'         => 'permit_empty|in_list[0,1]',
            'html_link'                   => 'permit_empty|string|max_length[500]',
            'google_created_at'           => 'permit_empty|string|valid_date[Y-m-d H:i:s]',
            'google_updated_at'           => 'permit_empty|string|valid_date[Y-m-d H:i:s]',
        ];
    }

    public function messages(): array
    {
        return [
            'calendar_id' => [
                'is_natural_no_zero' => 'O campo calendar_id deve ser um inteiro maior que zero',
            ],
            'status' => [
                'in_list' => 'status deve ser um de: confirmed, tentative, cancelled',
            ],
            'transparency' => [
                'in_list' => 'transparency deve ser opaque ou transparent',
            ],
            'visibility' => [
                'in_list' => 'visibility deve ser um de: default, public, private, confidential',
            ],
            'event_type' => [
                'in_list' => 'event_type deve ser um de: default, outOfOffice, focusTime, workingLocation, birthday',
            ],
        ];
    }
}
