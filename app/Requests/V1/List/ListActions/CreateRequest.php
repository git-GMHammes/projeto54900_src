<?php

namespace App\Requests\V1\List\ListActions;

/**
 * Regras de validacao para POST /create (tabela list_actions).
 *
 * DDL de referencia:
 *   list_manager_id     BIGINT       NOT NULL  FK -> list_manager.id
 *   sort_order          INT          NOT NULL DEFAULT 0
 *   label               VARCHAR(255) NOT NULL
 *   icon                VARCHAR(120) NULL
 *   action_type         ENUM('link','api_call') NOT NULL DEFAULT 'link'
 *   href_template       VARCHAR(255) NULL
 *   api_endpoint        VARCHAR(255) NULL
 *   http_method         VARCHAR(10)  NULL DEFAULT 'GET'
 *   data_action         VARCHAR(60)  NULL
 *   target              VARCHAR(20)  NULL
 *   confirm             TINYINT(1)   NOT NULL DEFAULT 0
 *   confirm_message     VARCHAR(255) NULL
 *   extra_data_json     JSON         NULL
 *   roles               VARCHAR(255) NULL — lista JSON de slugs de user_roles
 *   business_rule_json  JSON         NULL
 *
 * Existencia de list_manager_id e verificada no hook validateOnCreate.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'list_manager_id'    => 'required|is_natural_no_zero',
            'sort_order'         => 'permit_empty|is_natural',
            'label'              => 'required|string|max_length[255]',
            'icon'               => 'permit_empty|string|max_length[120]',
            'action_type'        => 'permit_empty|in_list[link,api_call]',
            'href_template'      => 'permit_empty|string|max_length[255]',
            'api_endpoint'       => 'permit_empty|string|max_length[255]',
            'http_method'        => 'permit_empty|in_list[GET,POST,PUT,PATCH,DELETE]',
            'data_action'        => 'permit_empty|string|max_length[60]',
            'target'             => 'permit_empty|string|max_length[20]',
            'confirm'            => 'permit_empty|in_list[0,1]',
            'confirm_message'    => 'permit_empty|string|max_length[255]',
            'extra_data_json'    => 'permit_empty',
            'roles'              => 'permit_empty|string|max_length[255]',
            'business_rule_json' => 'permit_empty',
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
            'action_type' => [
                'in_list' => 'O campo action_type deve ser link ou api_call',
            ],
            'http_method' => [
                'in_list' => 'O campo http_method deve ser GET, POST, PUT, PATCH ou DELETE',
            ],
        ];
    }
}
