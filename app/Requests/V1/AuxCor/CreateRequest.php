<?php

namespace App\Requests\V1\AuxCor;

/**
 * Regras de validacao para POST /create (tabela aux_cor).
 *
 * DDL de referencia:
 *   name         VARCHAR(50) NULL
 *   hexadecimal  VARCHAR(50) NULL  (formato #RRGGBB)
 *   rgb          VARCHAR(50) NULL  (formato (r,g,b))
 *
 * Unicidade real de name e hexadecimal e verificada no hook validateOnCreate.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'name'        => 'required|string|max_length[50]',
            'hexadecimal' => 'required|regex_match[/^#[0-9A-Fa-f]{6}$/]',
            'rgb'         => 'permit_empty|regex_match[/^\(\d{1,3},\d{1,3},\d{1,3}\)$/]',
        ];
    }

    public function messages(): array
    {
        return [
            'name' => [
                'required'   => 'O campo name e obrigatorio',
                'max_length' => 'O campo name nao pode exceder 50 caracteres',
            ],
            'hexadecimal' => [
                'required'    => 'O campo hexadecimal e obrigatorio',
                'regex_match' => 'O campo hexadecimal deve estar no formato #RRGGBB',
            ],
            'rgb' => [
                'regex_match' => 'O campo rgb deve estar no formato (r,g,b)',
            ],
        ];
    }
}
