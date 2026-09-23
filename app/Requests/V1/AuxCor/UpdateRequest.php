<?php

namespace App\Requests\V1\AuxCor;

/**
 * Regras de validacao para PUT /update/{id} (tabela aux_cor).
 *
 * Atualizacao parcial: todos os campos permit_empty. Unicidade de name e
 * hexadecimal (com excludeId) e verificada no hook validateOnUpdate.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'name'        => 'permit_empty|string|max_length[50]',
            'hexadecimal' => 'permit_empty|regex_match[/^#[0-9A-Fa-f]{6}$/]',
            'rgb'         => 'permit_empty|regex_match[/^\(\d{1,3},\d{1,3},\d{1,3}\)$/]',
        ];
    }

    public function messages(): array
    {
        return [
            'name' => [
                'max_length' => 'O campo name nao pode exceder 50 caracteres',
            ],
            'hexadecimal' => [
                'regex_match' => 'O campo hexadecimal deve estar no formato #RRGGBB',
            ],
            'rgb' => [
                'regex_match' => 'O campo rgb deve estar no formato (r,g,b)',
            ],
        ];
    }
}
