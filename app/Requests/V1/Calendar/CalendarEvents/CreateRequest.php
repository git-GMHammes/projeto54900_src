<?php

namespace App\Requests\V1\Calendar\CalendarEvents;

/**
 * Regras de validacao para POST /create (tabela calendar_events).
 *
 * DDL de referencia (resumo):
 *   calendar_id        BIGINT       NOT NULL  FK -> calendar_manager.id
 *   user_manager_id    BIGINT       NULL      FK -> user_manager.id (dono/criador da tarefa)
 *   google_event_id    VARCHAR(512) NULL      (unico)
 *   ical_uid           VARCHAR(255) NULL
 *   status             ENUM(confirmed,tentative,cancelled) DEFAULT 'confirmed' (nasce do DEFAULT)
 *   summary            VARCHAR(255) NOT NULL
 *   description        TEXT         NULL
 *   location           VARCHAR(255) NULL
 *   start_date         DATE         NULL
 *   start_datetime     DATETIME     NULL
 *   start_time_zone    VARCHAR(50)  NULL
 *   end_date           DATE         NULL
 *   end_datetime       DATETIME     NULL
 *   end_time_zone      VARCHAR(50)  NULL
 *   recurrence         TEXT         NULL
 *   recurring_event_id BIGINT       NULL      FK -> calendar_events.id
 *   sequence           INT          NOT NULL DEFAULT 0
 *   transparency       ENUM(opaque,transparent) DEFAULT 'opaque'
 *   visibility         ENUM(default,public,private,confidential) DEFAULT 'default'
 *   color_id           VARCHAR(10)  NULL
 *   event_type         ENUM(default,outOfOffice,focusTime,workingLocation,birthday) DEFAULT 'default'
 *   guests_can_modify / guests_can_invite_others /
 *   guests_can_see_other_guests / anyone_can_add_self  TINYINT(1)
 *   html_link          VARCHAR(500) NULL
 *   google_created_at / google_updated_at  DATETIME NULL
 *
 * Existencia de calendar_id / recurring_event_id (FK ativa) e unicidade de
 * google_event_id sao verificadas no hook validateOnCreate. status nao entra
 * no create (Processor::prepareData faz unset). Datas sao normalizadas em
 * Processor::prepareData (formatDate / formatDatetime).
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'calendar_id'                 => 'required|is_natural_no_zero',
            'user_manager_id'             => 'permit_empty|is_natural_no_zero',
            'google_event_id'             => 'permit_empty|string|max_length[512]',
            'ical_uid'                    => 'permit_empty|string|max_length[255]',
            'summary'                     => 'required|string|max_length[255]',
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
                'required'           => 'O campo calendar_id e obrigatorio',
                'is_natural_no_zero' => 'O campo calendar_id deve ser um inteiro maior que zero',
            ],
            'summary' => [
                'required'   => 'O campo summary e obrigatorio',
                'max_length' => 'O campo summary nao pode exceder 255 caracteres',
            ],
            'start_datetime' => [
                'valid_date' => 'start_datetime deve estar no formato Y-m-d H:i:s',
            ],
            'end_datetime' => [
                'valid_date' => 'end_datetime deve estar no formato Y-m-d H:i:s',
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
