<?php

namespace App\Requests\V1\Menu\MenuManager;

/**
 * Regras de validacao para POST /create (tabela menu_manager).
 *
 * DDL de referencia:
 *   nav_manager_id BIGINT       NOT NULL  FK -> nav_manager.id
 *   parent_id      BIGINT       NULL      FK -> menu_manager.id (self)
 *   title          VARCHAR(255) NOT NULL
 *   react_route    VARCHAR(255) NULL
 *   roles          JSON         NULL      lista de slugs de user_roles com acesso
 *   sort_order     INT          NOT NULL DEFAULT 0
 *   status         ENUM('active','draft','inactive') NOT NULL DEFAULT 'draft'
 *
 * Existencia de nav_manager_id e parent_id (e o vinculo de parent_id ao mesmo
 * nav_manager_id) sao verificadas no hook validateOnCreate. status nao entra no
 * create - nasce com o DEFAULT da coluna.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'nav_manager_id' => 'required|is_natural_no_zero',
            'parent_id'      => 'permit_empty|is_natural_no_zero',
            'title'          => 'required|string|max_length[255]',
            'react_route'    => 'permit_empty|string|max_length[255]',
            'roles'          => 'permit_empty',
            'sort_order'     => 'permit_empty|is_natural',
        ];
    }

    public function messages(): array
    {
        return [
            'nav_manager_id' => [
                'required'           => 'O campo nav_manager_id e obrigatorio',
                'is_natural_no_zero' => 'O campo nav_manager_id deve ser um inteiro maior que zero',
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
        ];
    }
}
