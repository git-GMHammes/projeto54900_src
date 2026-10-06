<?php

namespace App\Requests\V1\Messages\MessageAttachments;

/**
 * Regras de entrada do PUT /api/v1/message-attachments/update/{id}.
 *
 * Edita apenas categoria e status (`blocked` fica reservado a moderacao futura). O arquivo
 * e o vinculo com a mensagem nao mudam por aqui: para outro arquivo, enviar de novo com
 * `replace=1` no create.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'status'   => 'permit_empty|in_list[active,inactive]',
            'category' => 'permit_empty|in_list[image,video,audio,document,spreadsheet,presentation,pdf,archive,other]',
        ];
    }

    public function messages(): array
    {
        return [
            'status' => [
                'in_list' => 'Status invalido: use active ou inactive',
            ],
            'category' => [
                'in_list' => 'Categoria invalida para o anexo',
            ],
        ];
    }
}
