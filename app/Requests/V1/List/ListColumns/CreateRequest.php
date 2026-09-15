<?php

namespace App\Requests\V1\List\ListColumns;

/**
 * Regras de validacao para POST /create (tabela list_columns).
 *
 * DDL de referencia:
 *   list_manager_id   BIGINT       NOT NULL  FK -> list_manager.id
 *   sort_order        INT          NOT NULL DEFAULT 0
 *   label             VARCHAR(255) NOT NULL
 *   field_key         VARCHAR(255) NULL
 *   concat_json       JSON         NULL
 *   format            VARCHAR(30)  NOT NULL DEFAULT 'text'
 *   cell_class        VARCHAR(120) NULL
 *   fallback          VARCHAR(50)  NULL DEFAULT '—'
 *   sortable          TINYINT(1)   NOT NULL DEFAULT 0
 *   sort_key          VARCHAR(255) NULL
 *   sort_concat_json  JSON         NULL
 *   visible           TINYINT(1)   NOT NULL DEFAULT 1
 *
 * Existencia de list_manager_id e verificada no hook validateOnCreate.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'list_manager_id'  => 'required|is_natural_no_zero',
            'sort_order'       => 'permit_empty|is_natural',
            'label'            => 'required|string|max_length[255]',
            'field_key'        => 'permit_empty|string|max_length[255]',
            'concat_json'      => 'permit_empty',
            'format'           => 'permit_empty|string|max_length[30]',
            'cell_class'       => 'permit_empty|string|max_length[120]',
            'fallback'         => 'permit_empty|string|max_length[50]',
            'sortable'         => 'permit_empty|in_list[0,1]',
            'sort_key'         => 'permit_empty|string|max_length[255]',
            'sort_concat_json' => 'permit_empty',
            'visible'          => 'permit_empty|in_list[0,1]',
        ];
    }

    public function messages(): array
    {
        return [
            'list_manager_id' => [
                'required'           => 'O campo list_manager_id e obrigatorio',
                'is_natural_no_zero' => 'O campo list_manager_id deve ser um inteiro maior que zero',
            ],
            'label' => [
                'required'   => 'O campo label e obrigatorio',
                'max_length' => 'O campo label nao pode exceder 255 caracteres',
            ],
        ];
    }
}
