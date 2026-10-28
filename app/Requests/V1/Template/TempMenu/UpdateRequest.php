<?php

namespace App\Requests\V1\Template\TempMenu;

/**
 * Regras de validacao para PUT /update/{id} (tabela temp_menu).
 *
 * Atualizacao parcial: todos os campos permit_empty. Se temp_nav_id ou
 * parent_id vierem, a existencia da FK e o vinculo de parent_id ao mesmo
 * temp_nav_id sao reavaliados no hook validateOnUpdate.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'temp_nav_id' => 'permit_empty|is_natural_no_zero',
            'parent_id'      => 'permit_empty|is_natural_no_zero',
            'title'          => 'permit_empty|string|max_length[255]',
            'react_route'    => 'permit_empty|string|max_length[255]',
            'icon'            => 'permit_empty|string|max_length[64]',
            'is_bookmark'     => 'permit_empty|in_list[0,1]',
            'placement'      => 'permit_empty|in_list[navbar,offcanvas]',
            'roles'          => 'permit_empty',
            'company_manager' => 'permit_empty',
            'sort_order'     => 'permit_empty|is_natural',
            'status'         => 'permit_empty|in_list[active,draft,inactive]',
        ];
    }

    public function messages(): array
    {
        return [
            'temp_nav_id' => [
                'is_natural_no_zero' => 'O campo temp_nav_id deve ser um inteiro maior que zero',
            ],
            'parent_id' => [
                'is_natural_no_zero' => 'O campo parent_id deve ser um inteiro maior que zero',
            ],
            'title' => [
                'max_length' => 'O campo title nao pode exceder 255 caracteres',
            ],
            'react_route' => [
                'max_length' => 'O campo react_route nao pode exceder 255 caracteres',
            ],
            'placement' => [
                'in_list' => 'O campo placement deve ser navbar ou offcanvas',
            ],
            'status' => [
                'in_list' => 'O campo status deve ser active, draft ou inactive',
            ],
        ];
    }
}
