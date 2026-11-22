<?php

namespace App\Requests\V1\Sgd\DocumentTypes;

/**
 * Regras de validacao para PUT /update/{id} (tabela sgd_document_types). Atualizacao parcial.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'slug'       => 'permit_empty|string|max_length[50]',
            'name'       => 'permit_empty|string|max_length[150]',
            'sort_order' => 'permit_empty|integer',
            'status'     => 'permit_empty|in_list[active,inactive]',
        ];
    }

    public function messages(): array
    {
        return [];
    }
}
