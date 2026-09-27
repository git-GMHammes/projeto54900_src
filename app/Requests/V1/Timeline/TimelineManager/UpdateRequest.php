<?php

namespace App\Requests\V1\Timeline\TimelineManager;

/**
 * Regras de entrada do PUT /api/v1/timeline-manager/update/{id}.
 *
 * Tudo opcional: o update e parcial por natureza (o FormGrid envia so o que
 * mudou). `user_manager_id` nao entra — o dono e imutavel.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'slug'            => 'permit_empty|string|max_length[150]',
            'title'           => 'permit_empty|string|max_length[255]',
            'description'     => 'permit_empty|string',
            'cover_image_url' => 'permit_empty|string|max_length[500]',
            'status'          => 'permit_empty|in_list[draft,active,inactive]',
            'version'         => 'permit_empty|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'status' => [
                'in_list' => 'Status invalido: use draft, active ou inactive',
            ],
        ];
    }
}
