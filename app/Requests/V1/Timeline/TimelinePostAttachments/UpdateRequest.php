<?php

namespace App\Requests\V1\Timeline\TimelinePostAttachments;

/**
 * Regras de entrada do PUT /api/v1/timeline-post-attachments/update/{id}.
 *
 * Edita apenas metadados (titulo, descricao, ordem e status). O arquivo e o
 * vinculo com a publicacao nao mudam por aqui: para outro arquivo, excluir e
 * anexar de novo.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'title'       => 'permit_empty|string|max_length[255]',
            'description' => 'permit_empty|string',
            'sort_order'  => 'permit_empty|integer',
            'status'      => 'permit_empty|in_list[active,inactive]',
            'category'    => 'permit_empty|in_list[image,video,audio,document,spreadsheet,presentation,pdf,archive,other]',
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
