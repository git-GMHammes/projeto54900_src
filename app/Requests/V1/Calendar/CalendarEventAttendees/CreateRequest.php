<?php

namespace App\Requests\V1\Calendar\CalendarEventAttendees;

/**
 * Regras de validacao para POST /create (tabela calendar_event_attendees).
 *
 * DDL de referencia:
 *   calendar_event_id BIGINT       NOT NULL  FK -> calendar_events.id
 *   user_manager_id   BIGINT       NULL      FK -> user_manager.id (obrigatorio no
 *                                             create desde 2026-09-24: sem convidado
 *                                             externo; NULL so apos excluir o usuario)
 *   email             VARCHAR(255) NOT NULL  sempre sobrescrito pelo Processor com
 *                                             user_profiles.email do usuario
 *   display_name      VARCHAR(255) NULL      sempre sobrescrito pelo Processor com
 *                                             user_profiles.name do usuario
 *   is_organizer      TINYINT(1)   NOT NULL DEFAULT 0
 *   is_self           TINYINT(1)   NOT NULL DEFAULT 0
 *   is_resource       TINYINT(1)   NOT NULL DEFAULT 0
 *   is_optional       TINYINT(1)   NOT NULL DEFAULT 0
 *   response_status   ENUM(needsAction,declined,tentative,accepted) DEFAULT 'needsAction'
 *   comment           TEXT         NULL      (limite 16383 caracteres = 65535 bytes
 *                                             no pior caso utf8mb4)
 *
 * Existencia de calendar_event_id (FK ativa) e unicidade de
 * (calendar_event_id, email) sao verificadas no hook validateOnCreate.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'calendar_event_id' => 'required|is_natural_no_zero',
            'user_manager_id'   => 'required|is_natural_no_zero',
            'email'             => 'permit_empty|valid_email|max_length[255]',
            'display_name'      => 'permit_empty|string|max_length[255]',
            'is_organizer'      => 'permit_empty|in_list[0,1]',
            'is_self'           => 'permit_empty|in_list[0,1]',
            'is_resource'       => 'permit_empty|in_list[0,1]',
            'is_optional'       => 'permit_empty|in_list[0,1]',
            'response_status'   => 'required|in_list[needsAction,declined,tentative,accepted]',
            'comment'           => 'permit_empty|string|max_length[16383]',
        ];
    }

    public function messages(): array
    {
        return [
            'calendar_event_id' => [
                'required'           => 'O campo calendar_event_id e obrigatorio',
                'is_natural_no_zero' => 'O campo calendar_event_id deve ser um inteiro maior que zero',
            ],
            'user_manager_id' => [
                'required'           => 'O campo user_manager_id e obrigatorio',
                'is_natural_no_zero' => 'O campo user_manager_id deve ser um inteiro maior que zero',
            ],
            'email' => [
                'valid_email' => 'O campo email deve ser um endereco valido',
                'max_length'  => 'O campo email nao pode exceder 255 caracteres',
            ],
            'response_status' => [
                'required' => 'O campo response_status e obrigatorio',
                'in_list' => 'response_status deve ser um de: needsAction, declined, tentative, accepted',
            ],
        ];
    }
}
