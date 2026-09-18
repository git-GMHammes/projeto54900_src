<?php

namespace App\Requests\V1\Calendar\CalendarEventAttachments;

/**
 * Regras de validacao para PUT /update/{id} (tabela calendar_event_attachments).
 *
 * Atualizacao parcial: todos os campos permit_empty. Se calendar_event_id vier,
 * a existencia da FK e reavaliada no hook validateOnUpdate.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'calendar_event_id' => 'permit_empty|is_natural_no_zero',
            'file_url'          => 'permit_empty|string|max_length[500]',
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
                'is_natural_no_zero' => 'O campo calendar_event_id deve ser um inteiro maior que zero',
            ],
            'file_url' => [
                'max_length' => 'O campo file_url nao pode exceder 500 caracteres',
            ],
        ];
    }
}
