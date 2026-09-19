<?php

namespace App\Requests\V1\Calendar\CalendarManager;

/**
 * Regras de validacao para PUT /update/{id} (tabela calendar_manager).
 *
 * Atualizacao parcial: todos os campos permit_empty. Se google_calendar_id
 * vier, a unicidade e reavaliada no hook validateOnUpdate. Diferente do create,
 * status pode ser alterado por update. As 4 colunas de vinculo
 * (user_manager_id/document_manager_id/map_manager_id/networking_manager_id)
 * sao N-para-1, sem unicidade; user_manager_id checa existencia (FK ativa)
 * quando informado.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'google_calendar_id'    => 'permit_empty|string|max_length[255]',
            'summary'               => 'permit_empty|string|max_length[255]',
            'description'           => 'permit_empty|string',
            'time_zone'             => 'permit_empty|string|max_length[50]',
            'location'              => 'permit_empty|string|max_length[255]',
            'background_color'      => 'permit_empty|string|max_length[7]',
            'foreground_color'      => 'permit_empty|string|max_length[7]',
            'access_role'           => 'permit_empty|in_list[freeBusyReader,reader,writer,owner]',
            'is_primary'            => 'permit_empty|in_list[0,1]',
            'status'                => 'permit_empty|in_list[active,inactive]',
            'user_manager_id'       => 'permit_empty|is_natural_no_zero',
            'document_manager_id'   => 'permit_empty|is_natural_no_zero',
            'map_manager_id'        => 'permit_empty|is_natural_no_zero',
            'networking_manager_id' => 'permit_empty|is_natural_no_zero',
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
