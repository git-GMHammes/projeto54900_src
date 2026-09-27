<?php

namespace App\Requests\V1\Timeline\TimelinePostComments;

/**
 * Regras de entrada do PUT /api/v1/timeline-post-comments/update/{id}.
 *
 * Editar o comentario e do dono; `edited_at` e carimbado pelo Processor, nao
 * vem no corpo.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'content' => 'permit_empty|string',
            'status'  => 'permit_empty|in_list[published,hidden,removed]',
        ];
    }

    public function messages(): array
    {
        return [
            'status' => [
                'in_list' => 'Status invalido: use published, hidden ou removed',
            ],
        ];
    }
}
