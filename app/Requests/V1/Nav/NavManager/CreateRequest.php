<?php

namespace App\Requests\V1\Nav\NavManager;

/**
 * Regras de validacao para POST /create (tabela nav_manager).
 *
 * DDL de referencia:
 *   title          VARCHAR(255) NOT NULL
 *   image          VARCHAR(500) NULL
 *   message_icon   VARCHAR(64)  NULL
 *   system_version VARCHAR(20)  NULL DEFAULT '1.0.0'
 *   status         ENUM('draft','active','inactive') NOT NULL DEFAULT 'draft'
 *
 * status nao entra no create - nasce com o DEFAULT da coluna (Processor::prepareData faz unset).
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'title'          => 'required|string|max_length[255]',
            'image'          => 'permit_empty|string|max_length[500]',
            'message_icon'   => 'permit_empty|string|max_length[64]',
            'system_version' => 'permit_empty|string|max_length[20]',
        ];
    }

    public function messages(): array
    {
        return [
            'title' => [
                'required'   => 'O campo title e obrigatorio',
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
        ];
    }
}
