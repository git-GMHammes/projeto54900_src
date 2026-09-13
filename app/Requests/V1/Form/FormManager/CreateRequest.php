<?php

namespace App\Requests\V1\Form\FormManager;

/**
 * Regras de validacao para POST /create (tabela form_manager).
 *
 * DDL de referencia:
 *   slug            VARCHAR(255) NOT NULL UNIQUE
 *   table_name      VARCHAR(255) NULL — tabela real do banco (validada contra
 *                   o schema em Processor::validateOnCreate)
 *   title           VARCHAR(255) NULL
 *   description     TEXT         NULL
 *   roles           VARCHAR(255) NULL — lista JSON de slugs de user_roles
 *   react_route     VARCHAR(255) NULL
 *   submit_endpoint VARCHAR(255) NULL
 *   http_method     VARCHAR(10)  NULL DEFAULT 'POST'
 *   status          ENUM('draft','active','inactive') NOT NULL DEFAULT 'draft'
 *   version         INT          NOT NULL DEFAULT 1
 *
 * status NAO entra no create — todo formulario nasce com o DEFAULT da coluna
 * ('draft'); ver Services\V1\Form\FormManager\Processor::prepareData.
 * Unicidade real de slug e verificada no hook validateOnCreate.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'slug'            => 'required|string|max_length[255]|regex_match[/^[a-z0-9]+(?:-[a-z0-9]+)*$/]',
            'table_name'      => 'required|string|max_length[255]|regex_match[/^[a-z][a-z0-9_]*$/]',
            'title'           => 'permit_empty|string|max_length[255]',
            'description'     => 'permit_empty|string',
            'roles'           => 'permit_empty|string|max_length[255]',
            'react_route'     => 'permit_empty|string|max_length[255]',
            'submit_endpoint' => 'permit_empty|string|max_length[255]',
            'http_method'     => 'permit_empty|in_list[GET,POST,PUT,PATCH,DELETE]',
            'version'         => 'permit_empty|is_natural_no_zero',
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
            'table_name' => [
                'required'    => 'O campo table_name e obrigatorio',
                'max_length'  => 'O campo table_name nao pode exceder 255 caracteres',
                'regex_match' => 'O campo table_name deve ser snake_case (a-z, 0-9 e underscore, iniciando com letra)',
            ],
            'http_method' => [
                'in_list' => 'O campo http_method deve ser GET, POST, PUT, PATCH ou DELETE',
            ],
            'version' => [
                'is_natural_no_zero' => 'O campo version deve ser um inteiro maior que zero',
            ],
        ];
    }
}
