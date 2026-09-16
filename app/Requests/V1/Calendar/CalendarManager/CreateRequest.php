<?php

namespace App\Requests\V1\Calendar\CalendarManager;

/**
 * Regras de validacao para POST /create (tabela calendar_manager).
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
 *   user_manager_id        BIGINT NULL FK -> user_manager.id
 *   document_manager_id    BIGINT NULL sem FK ainda (modulo futuro)
 *   map_manager_id         BIGINT NULL sem FK ainda (modulo futuro)
 *   networking_manager_id  BIGINT NULL sem FK ainda (modulo futuro)
 *
 * Unicidade de google_calendar_id e existencia de user_manager_id (FK ativa)
 * sao verificadas no hook validateOnCreate. As 4 colunas de vinculo sao
 * N-para-1 (sem restricao de unicidade). status nao entra no create
 * (Processor::prepareData faz unset).
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'google_calendar_id'    => 'permit_empty|string|max_length[255]',
            'summary'               => 'required|string|max_length[255]',
            'description'           => 'permit_empty|string',
            'time_zone'             => 'required|string|max_length[50]',
            'location'              => 'permit_empty|string|max_length[255]',
            'background_color'      => 'permit_empty|string|max_length[7]',
            'foreground_color'      => 'permit_empty|string|max_length[7]',
            'access_role'           => 'permit_empty|in_list[freeBusyReader,reader,writer,owner]',
            'is_primary'            => 'permit_empty|in_list[0,1]',
            'user_manager_id'       => 'permit_empty|is_natural_no_zero',
            'document_manager_id'   => 'permit_empty|is_natural_no_zero',
            'map_manager_id'        => 'permit_empty|is_natural_no_zero',
            'networking_manager_id' => 'permit_empty|is_natural_no_zero',
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
