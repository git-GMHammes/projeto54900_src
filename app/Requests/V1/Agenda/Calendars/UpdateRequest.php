<?php

namespace App\Requests\V1\Agenda\Calendars;

/**
 * Regras de validacao para PUT /update/{id} (tabela calendars).
 *
 * Atualizacao parcial: todos os campos permit_empty. Se google_calendar_id
 * vier, a unicidade e reavaliada no hook validateOnUpdate. Diferente do create,
 * status pode ser alterado por update.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'google_calendar_id' => 'permit_empty|string|max_length[255]',
            'summary'            => 'permit_empty|string|max_length[255]',
            'description'        => 'permit_empty|string',
            'time_zone'          => 'permit_empty|string|max_length[50]',
            'location'           => 'permit_empty|string|max_length[255]',
            'background_color'   => 'permit_empty|string|max_length[7]',
            'foreground_color'   => 'permit_empty|string|max_length[7]',
            'access_role'        => 'permit_empty|in_list[freeBusyReader,reader,writer,owner]',
            'is_primary'         => 'permit_empty|in_list[0,1]',
            'status'             => 'permit_empty|in_list[active,inactive]',
        ];
    }

    public function messages(): array
    {
        return [
            'access_role' => [
                'in_list' => 'access_role deve ser um de: freeBusyReader, reader, writer, owner',
            ],
            'status' => [
                'in_list' => 'O campo status deve ser active ou inactive',
            ],
            'is_primary' => [
                'in_list' => 'O campo is_primary deve ser 0 ou 1',
            ],
        ];
    }
}
