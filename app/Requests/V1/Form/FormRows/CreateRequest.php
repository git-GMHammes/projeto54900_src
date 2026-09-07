<?php

namespace App\Requests\V1\Form\FormRows;

/**
 * Regras de validacao para POST /create (tabela form_rows).
 *
 * DDL de referencia:
 *   form_group_id BIGINT       NOT NULL  FK -> form_groups.id
 *   sort_order    INT          NOT NULL DEFAULT 0
 *   gutter        VARCHAR(8)   NULL DEFAULT 'g-3'
 *   note          VARCHAR(255) NULL
 *
 * Existencia de form_group_id e verificada no hook validateOnCreate. A regra
 * "1 a 12 campos por linha" e aplicada quando os campos sao vinculados
 * (modulo FormCampos), nao aqui.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'form_group_id' => 'required|is_natural_no_zero',
            'sort_order'    => 'permit_empty|is_natural',
            'gutter'        => 'permit_empty|string|max_length[8]',
            'note'          => 'permit_empty|string|max_length[255]',
        ];
    }

    public function messages(): array
    {
        return [
            'form_group_id' => [
                'required'           => 'O campo form_group_id e obrigatorio',
                'is_natural_no_zero' => 'O campo form_group_id deve ser um inteiro maior que zero',
            ],
        ];
    }
}
