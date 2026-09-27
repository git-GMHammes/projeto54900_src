<?php

namespace App\Requests\V1\Timeline\TimelineManager;

/**
 * Regras de entrada do POST /api/v1/timeline-manager/create.
 *
 * `slug` e `user_manager_id` sao preenchidos pelo Processor quando nao vem no
 * corpo (slug derivado do username; dono = usuario da sessao).
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'user_manager_id' => 'permit_empty|is_natural_no_zero',
            'slug'            => 'permit_empty|string|max_length[150]',
            'title'           => 'required|string|max_length[255]',
            'description'     => 'permit_empty|string',
            'cover_image_url' => 'permit_empty|string|max_length[500]',
            'status'          => 'permit_empty|in_list[draft,active,inactive]',
            'version'         => 'permit_empty|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'title' => [
                'required'   => 'O titulo da timeline e obrigatorio',
                'max_length' => 'O titulo deve ter no maximo 255 caracteres',
            ],
            'status' => [
                'in_list' => 'Status invalido: use draft, active ou inactive',
            ],
        ];
    }
}
