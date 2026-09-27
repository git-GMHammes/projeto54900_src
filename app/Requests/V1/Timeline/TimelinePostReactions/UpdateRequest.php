<?php

namespace App\Requests\V1\Timeline\TimelinePostReactions;

/**
 * Regras de entrada do PUT /api/v1/timeline-post-reactions/update/{id}.
 *
 * Serve para alternar like <-> dislike na mesma linha (a alternativa e
 * DELETE + POST). O dono e o post da reacao nao mudam.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'reaction_type' => 'permit_empty|in_list[like,dislike]',
        ];
    }

    public function messages(): array
    {
        return [
            'reaction_type' => [
                'in_list' => 'Reacao invalida: use like ou dislike',
            ],
        ];
    }
}
