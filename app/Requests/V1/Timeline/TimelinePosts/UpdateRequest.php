<?php

namespace App\Requests\V1\Timeline\TimelinePosts;

/**
 * Regras de entrada do PUT /api/v1/timeline-posts/update/{id}.
 *
 * `published_at` e `edited_at` nao entram: quem escreve neles e o Processor
 * (data da publicacao e carimbo de edicao). Dono e timeline tambem nao mudam.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'title'   => 'permit_empty|string|max_length[255]',
            'content' => 'permit_empty|string',
            'status'  => 'permit_empty|in_list[draft,published,hidden,removed]',
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
