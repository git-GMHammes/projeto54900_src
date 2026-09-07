<?php

namespace App\Requests\V1\Form\FormGroups;

/**
 * Regras de validacao para POST /create (tabela form_groups).
 *
 * DDL de referencia:
 *   form_manager_id BIGINT       NOT NULL  FK -> form_manager.id
 *   title           VARCHAR(255) NOT NULL
 *   slug            VARCHAR(255) NULL
 *   description     TEXT         NULL
 *   icon            VARCHAR(64)  NULL
 *   sort_order      INT          NOT NULL DEFAULT 0
 *   collapsed       TINYINT(1)   NOT NULL DEFAULT 0
 *
 * Existencia de form_manager_id e unicidade de (form_manager_id, slug) sao
 * verificadas no hook validateOnCreate.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'form_manager_id' => 'required|is_natural_no_zero',
            'title'           => 'required|string|max_length[255]',
            'slug'            => 'permit_empty|string|max_length[255]|regex_match[/^[a-z0-9]+(?:-[a-z0-9]+)*$/]',
            'description'     => 'permit_empty|string',
            'icon'            => 'permit_empty|string|max_length[64]',
            'sort_order'      => 'permit_empty|is_natural',
            'collapsed'       => 'permit_empty|in_list[0,1]',
        ];
    }

    public function messages(): array
    {
        return [
            'form_manager_id' => [
                'required'           => 'O campo form_manager_id e obrigatorio',
                'is_natural_no_zero' => 'O campo form_manager_id deve ser um inteiro maior que zero',
            ],
            'title' => [
                'required'   => 'O campo title e obrigatorio',
                'max_length' => 'O campo title nao pode exceder 255 caracteres',
            ],
            'slug' => [
                'regex_match' => 'O campo slug deve ser kebab-case (a-z, 0-9 e hifen)',
            ],
        ];
    }
}
