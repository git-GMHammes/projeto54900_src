<?php

namespace App\Requests\V1\Agenda\Calendars;

/**
 * Regras de validacao para POST /create (tabela calendars).
 *
 * DDL de referencia:
 *   google_calendar_id VARCHAR(255) NULL  (unico)
 *   summary            VARCHAR(255) NOT NULL
 *   description        TEXT         NULL
 *   time_zone          VARCHAR(50)  NOT NULL
 *   location           VARCHAR(255) NULL
 *   background_color   VARCHAR(7)   NULL
 *   foreground_color   VARCHAR(7)   NULL
 *   access_role        ENUM(freeBusyReader,reader,writer,owner) DEFAULT 'owner'
 *   is_primary         TINYINT(1)   NOT NULL DEFAULT 0
 *   status             ENUM(active,inactive) DEFAULT 'active'  (nasce do DEFAULT)
 *
 * Unicidade de google_calendar_id e verificada no hook validateOnCreate.
 * status nao entra no create (Processor::prepareData faz unset).
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'google_calendar_id' => 'permit_empty|string|max_length[255]',
            'summary'            => 'required|string|max_length[255]',
            'description'        => 'permit_empty|string',
            'time_zone'          => 'required|string|max_length[50]',
            'location'           => 'permit_empty|string|max_length[255]',
            'background_color'   => 'permit_empty|string|max_length[7]',
            'foreground_color'   => 'permit_empty|string|max_length[7]',
            'access_role'        => 'permit_empty|in_list[freeBusyReader,reader,writer,owner]',
            'is_primary'         => 'permit_empty|in_list[0,1]',
        ];
    }

    public function messages(): array
    {
        return [
            'summary' => [
                'required'   => 'O campo summary e obrigatorio',
                'max_length' => 'O campo summary nao pode exceder 255 caracteres',
            ],
            'time_zone' => [
                'required'   => 'O campo time_zone e obrigatorio',
                'max_length' => 'O campo time_zone nao pode exceder 50 caracteres',
            ],
            'access_role' => [
                'in_list' => 'access_role deve ser um de: freeBusyReader, reader, writer, owner',
            ],
            'is_primary' => [
                'in_list' => 'O campo is_primary deve ser 0 ou 1',
            ],
        ];
    }
}
