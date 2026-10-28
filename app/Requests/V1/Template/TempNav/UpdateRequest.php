<?php

namespace App\Requests\V1\Template\TempNav;

/**
 * Regras de validacao para PUT /update/{id} (tabela temp_nav).
 *
 * Atualizacao parcial: todos os campos permit_empty. status so pode ser
 * alterado por update (nunca no create).
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'title'          => 'permit_empty|string|max_length[255]',
            'image'          => 'permit_empty|string|max_length[500]',
            'message_icon'   => 'permit_empty|string|max_length[64]',
            'system_version' => 'permit_empty|string|max_length[20]',
            'company_manager' => 'permit_empty',
            'status'         => 'permit_empty|in_list[draft,active,inactive]',
        ];
    }

    public function messages(): array
    {
        return [
            'title' => [
                'max_length' => 'O campo title nao pode exceder 255 caracteres',
            ],
            'image' => [
                'max_length' => 'O campo image nao pode exceder 500 caracteres',
            ],
            'message_icon' => [
                'max_length' => 'O campo message_icon nao pode exceder 64 caracteres',
            ],
            'system_version' => [
                'max_length' => 'O campo system_version nao pode exceder 20 caracteres',
            ],
            'status' => [
                'in_list' => 'O campo status deve ser draft, active ou inactive',
            ],
        ];
    }
}
