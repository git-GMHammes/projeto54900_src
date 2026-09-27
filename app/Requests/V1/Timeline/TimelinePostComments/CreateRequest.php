<?php

namespace App\Requests\V1\Timeline\TimelinePostComments;

/**
 * Regras de entrada do POST /api/v1/timeline-post-comments/create.
 *
 * `parent_id` nulo = comentario de topo; preenchido = resposta (o Processor
 * valida que o comentario pai e do mesmo post). `user_manager_id` vem da sessao.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'timeline_post_id' => 'required|is_natural_no_zero',
            'user_manager_id'  => 'permit_empty|is_natural_no_zero',
            'parent_id'        => 'permit_empty|is_natural_no_zero',
            'content'          => 'required|string',
            'status'           => 'permit_empty|in_list[published,hidden,removed]',
            'edited_at'        => 'permit_empty|valid_date[Y-m-d H:i:s]',
        ];
    }

    public function messages(): array
    {
        return [
            'timeline_post_id' => [
                'required'            => 'Informe a publicacao comentada',
                'is_natural_no_zero' => 'Publicacao invalida',
            ],
            'content' => [
                'required' => 'O comentario nao pode ficar vazio',
            ],
            'status' => [
                'in_list' => 'Status invalido: use published, hidden ou removed',
            ],
        ];
    }
}
