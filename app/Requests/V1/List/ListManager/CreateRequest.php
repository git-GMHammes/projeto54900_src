<?php

namespace App\Requests\V1\List\ListManager;

/**
 * Regras de validacao para POST /create (tabela list_manager).
 *
 * DDL de referencia:
 *   slug                 VARCHAR(255) NOT NULL UNIQUE
 *   table_name           VARCHAR(255) NULL — validada contra o schema real (Processor)
 *   title                VARCHAR(255) NULL
 *   description          TEXT         NULL
 *   api_get_endpoint     VARCHAR(255) NULL
 *   api_search_endpoint  VARCHAR(255) NULL
 *   roles                VARCHAR(255) NULL — lista JSON de slugs de user_roles
 *   default_sort         VARCHAR(255) NOT NULL DEFAULT 'id'
 *   default_order        ENUM('asc','desc') NOT NULL DEFAULT 'desc'
 *   default_limit        INT          NOT NULL DEFAULT 20
 *   limit_options_json   JSON         NULL
 *   status               ENUM('draft','active','inactive') NOT NULL DEFAULT 'draft'
 *   version              INT          NOT NULL DEFAULT 1
 *
 * status NAO entra no create — toda listagem nasce com o DEFAULT da coluna
 * ('draft'); ver Services\V1\List\ListManager\Processor::prepareData.
 * Unicidade real de slug e verificada no hook validateOnCreate.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'slug'                => 'required|string|max_length[255]|regex_match[/^[a-z0-9]+(?:-[a-z0-9]+)*$/]',
            'table_name'          => 'permit_empty|string|max_length[255]',
            'title'               => 'permit_empty|string|max_length[255]',
            'description'         => 'permit_empty|string',
            'api_get_endpoint'    => 'permit_empty|string|max_length[255]',
            'api_search_endpoint' => 'permit_empty|string|max_length[255]',
            'roles'               => 'permit_empty|string|max_length[255]',
            'default_sort'        => 'permit_empty|string|max_length[255]',
            'default_order'       => 'permit_empty|in_list[asc,desc]',
            'default_limit'       => 'permit_empty|is_natural_no_zero',
            'limit_options_json'  => 'permit_empty',
            'version'             => 'permit_empty|is_natural_no_zero',
        ];
    }

    public function messages(): array
    {
        return [
            'slug' => [
                'required'    => 'O campo slug e obrigatorio',
                'max_length'  => 'O campo slug nao pode exceder 255 caracteres',
                'regex_match' => 'O campo slug deve ser kebab-case (a-z, 0-9 e hifen)',
            ],
            'default_order' => [
                'in_list' => 'O campo default_order deve ser asc ou desc',
            ],
            'default_limit' => [
                'is_natural_no_zero' => 'O campo default_limit deve ser um inteiro maior que zero',
            ],
            'version' => [
                'is_natural_no_zero' => 'O campo version deve ser um inteiro maior que zero',
            ],
        ];
    }
}
