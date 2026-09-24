<?php

namespace App\Requests\V1\Calendar\CalendarEventAttachments;

/**
 * Regras de validacao para POST /create (tabela calendar_event_attachments).
 *
 * DDL de referencia:
 *   calendar_event_id BIGINT       NOT NULL  FK -> calendar_events.id
 *   file_url          VARCHAR(500) NOT NULL  sempre regravado pelo Processor (serve do upload)
 *   title             VARCHAR(255) NULL      vazio -> nome original do arquivo
 *   mime_type         VARCHAR(100) NULL      sempre regravado pelo Processor (do upload)
 *   icon_link         VARCHAR(500) NULL
 *   file_id           VARCHAR(255) NULL      id em uploads (obrigatorio desde 2026-09-24:
 *                                            upload fisico via /api/v1/upload-manager/upload,
 *                                            module=calendar_events, reference_id=evento)
 *
 * Existencia de calendar_event_id (FK ativa) e do upload de file_id (mesmo
 * evento) sao verificadas no Processor.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'calendar_event_id' => 'required|is_natural_no_zero',
            'file_url'          => 'permit_empty|string|max_length[500]',
            'title'             => 'permit_empty|string|max_length[255]',
            'mime_type'         => 'permit_empty|string|max_length[100]',
            'icon_link'         => 'permit_empty|string|max_length[500]',
            'file_id'           => 'required|is_natural_no_zero',
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
                'max_length' => 'O campo file_url nao pode exceder 500 caracteres',
            ],
            'file_id' => [
                'required'           => 'O campo file_id (id do upload) e obrigatorio',
                'is_natural_no_zero' => 'O campo file_id deve ser o id de um upload',
            ],
        ];
    }
}
