<?php

namespace App\Requests\V1\Form\FormGroups;

/**
 * Regras de validacao para PUT /update/{id} (tabela form_groups).
 *
 * Atualizacao parcial: todos os campos permit_empty. Se form_manager_id ou
 * slug vierem, a existencia da FK e a unicidade de (form_manager_id, slug)
 * sao reavaliadas no hook validateOnUpdate.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'form_manager_id' => 'permit_empty|is_natural_no_zero',
            'title'           => 'permit_empty|string|max_length[255]',
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
                'is_natural_no_zero' => 'O campo form_manager_id deve ser um inteiro maior que zero',
            ],
            'slug' => [
                'regex_match' => 'O campo slug deve ser kebab-case (a-z, 0-9 e hifen)',
            ],
        ];
    }
}
