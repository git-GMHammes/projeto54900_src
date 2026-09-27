<?php

namespace App\Requests\V1\Timeline\TimelinePosts;

/**
 * Regras de entrada do POST /api/v1/timeline-posts/create.
 *
 * Publicar (ou republicar) exige titulo OU conteudo — a checagem dos dois vazios
 * fica no Processor, porque o CI4 nao expressa "um dos dois" em uma regra so.
 * `user_manager_id` nunca vem do cliente: o Processor usa o usuario da sessao.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'timeline_manager_id' => 'permit_empty|is_natural_no_zero',
            'user_manager_id'     => 'permit_empty|is_natural_no_zero',
            'repost_of_id'        => 'permit_empty|is_natural_no_zero',
            'title'               => 'permit_empty|string|max_length[255]',
            'content'             => 'permit_empty|string',
            'status'              => 'permit_empty|in_list[draft,published,hidden,removed]',
            'published_at'        => 'permit_empty|valid_date[Y-m-d H:i:s]',
            'edited_at'           => 'permit_empty|valid_date[Y-m-d H:i:s]',
        ];
    }

    public function messages(): array
    {
        return [
            'status' => [
                'in_list' => 'Status invalido: use draft, published, hidden ou removed',
            ],
        ];
    }
}
