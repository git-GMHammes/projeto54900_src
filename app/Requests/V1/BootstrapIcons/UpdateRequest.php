<?php

namespace App\Requests\V1\BootstrapIcons;

/**
 * Regras de validacao para PUT /update/{id} (tabela bootstrap_icons).
 *
 * Atualizacao parcial: todos os campos permit_empty. Unicidade de name (com
 * excludeId) e verificada no hook validateOnUpdate.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'name'        => 'permit_empty|string|max_length[255]',
            'codepoint'   => 'permit_empty|is_natural_no_zero',
            'is_favorite' => 'permit_empty|in_list[0,1]',
        ];
    }

    public function messages(): array
    {
        return [
            'name' => [
                'max_length' => 'O campo name nao pode exceder 255 caracteres',
            ],
            'codepoint' => [
                'is_natural_no_zero' => 'O campo codepoint deve ser um inteiro maior que zero',
            ],
        ];
    }
}
