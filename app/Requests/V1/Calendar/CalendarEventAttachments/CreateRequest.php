<?php

namespace App\Requests\V1\Calendar\CalendarEventAttachments;

/**
 * Regras de validacao para POST /create (tabela calendar_event_attachments).
 *
 * DDL de referencia:
 *   calendar_event_id BIGINT       NOT NULL  FK -> calendar_events.id
 *   file_url          VARCHAR(500) NOT NULL
 *   title             VARCHAR(255) NULL
 *   mime_type         VARCHAR(100) NULL
 *   icon_link         VARCHAR(500) NULL
 *   file_id           VARCHAR(255) NULL
 *
 * Existencia de calendar_event_id (FK ativa) e verificada no hook validateOnCreate.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'calendar_event_id' => 'required|is_natural_no_zero',
            'file_url'          => 'required|string|max_length[500]',
            'title'             => 'permit_empty|string|max_length[255]',
            'mime_type'         => 'permit_empty|string|max_length[100]',
            'icon_link'         => 'permit_empty|string|max_length[500]',
            'file_id'           => 'permit_empty|string|max_length[255]',
        ];
    }

    public function messages(): array
    {
        return [
            'calendar_event_id' => [
                'required'           => 'O campo calendar_event_id e obrigatorio',
                'is_natural_no_zero' => 'O campo calendar_event_id deve ser um inteiro maior que zero',
            ],
            'file_url' => [
                'required'   => 'O campo file_url e obrigatorio',
                'max_length' => 'O campo file_url nao pode exceder 500 caracteres',
            ],
        ];
    }
}
