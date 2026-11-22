<?php

namespace App\Requests\V1\Sgd\DocumentTypes;

/**
 * Regras de validacao para POST /create (tabela sgd_document_types).
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'slug'       => 'required|string|max_length[50]',
            'name'       => 'required|string|max_length[150]',
            'sort_order' => 'permit_empty|integer',
            'status'     => 'permit_empty|in_list[active,inactive]',
        ];
    }

    public function messages(): array
    {
        return [];
    }
}
