<?php

namespace App\Requests\V1\Template\TempMenu;

/**
 * Regras de validacao para POST /create (tabela temp_menu).
 *
 * DDL de referencia:
 *   temp_nav_id BIGINT       NOT NULL  FK -> temp_nav.id
 *   parent_id      BIGINT       NULL      FK -> temp_menu.id (self)
 *   title          VARCHAR(255) NOT NULL
 *   react_route    VARCHAR(255) NULL
 *   placement      ENUM('navbar','offcanvas') NOT NULL DEFAULT 'navbar'
 *   roles          JSON         NULL      lista de slugs de user_roles com acesso
 *   sort_order     INT          NOT NULL DEFAULT 0
 *   status         ENUM('active','draft','inactive') NOT NULL DEFAULT 'draft'
 *
 * Existencia de temp_nav_id e parent_id (e o vinculo de parent_id ao mesmo
 * temp_nav_id) sao verificadas no hook validateOnCreate. status nao entra no
 * create - nasce com o DEFAULT da coluna.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'temp_nav_id' => 'required|is_natural_no_zero',
            'parent_id'      => 'permit_empty|is_natural_no_zero',
            'title'          => 'required|string|max_length[255]',
            'react_route'    => 'permit_empty|string|max_length[255]',
            'icon'            => 'permit_empty|string|max_length[64]',
            'is_bookmark'     => 'permit_empty|in_list[0,1]',
            'placement'      => 'permit_empty|in_list[navbar,offcanvas]',
            'roles'          => 'permit_empty',
            'company_manager' => 'permit_empty',
            'sort_order'     => 'permit_empty|is_natural',
        ];
    }

    public function messages(): array
    {
        return [
            'temp_nav_id' => [
                'required'           => 'O campo temp_nav_id e obrigatorio',
                'is_natural_no_zero' => 'O campo temp_nav_id deve ser um inteiro maior que zero',
            ],
            'parent_id' => [
                'is_natural_no_zero' => 'O campo parent_id deve ser um inteiro maior que zero',
            ],
            'title' => [
                'required'   => 'O campo title e obrigatorio',
                'max_length' => 'O campo title nao pode exceder 255 caracteres',
            ],
            'react_route' => [
                'max_length' => 'O campo react_route nao pode exceder 255 caracteres',
            ],
            'placement' => [
                'in_list' => 'O campo placement deve ser navbar ou offcanvas',
            ],
        ];
    }
}
