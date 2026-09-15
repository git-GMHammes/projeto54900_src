<?php

namespace App\Requests\V1\BootstrapIcons;

/**
 * Regras de validacao para POST /create (tabela bootstrap_icons).
 *
 * DDL de referencia:
 *   name         VARCHAR(255) NOT NULL UNIQUE
 *   codepoint    INT          NOT NULL
 *   is_favorite  TINYINT(1)   NOT NULL DEFAULT 0
 *
 * Unicidade real de name e verificada no hook validateOnCreate.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'name'        => 'required|string|max_length[255]',
            'codepoint'   => 'required|is_natural_no_zero',
            'is_favorite' => 'permit_empty|in_list[0,1]',
        ];
    }

    public function messages(): array
    {
        return [
            'name' => [
                'required'   => 'O campo name e obrigatorio',
                'max_length' => 'O campo name nao pode exceder 255 caracteres',
            ],
            'codepoint' => [
                'required'           => 'O campo codepoint e obrigatorio',
                'is_natural_no_zero' => 'O campo codepoint deve ser um inteiro maior que zero',
            ],
        ];
    }
}
