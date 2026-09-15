<?php

namespace App\Requests\V1\List\ListActions;

/**
 * Regras de validacao para PUT /update/{id} (tabela list_actions).
 *
 * Atualizacao parcial: todos os campos permit_empty. Se list_manager_id vier,
 * a existencia da FK e reavaliada no hook validateOnUpdate.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'list_manager_id'    => 'permit_empty|is_natural_no_zero',
            'sort_order'         => 'permit_empty|is_natural',
            'label'              => 'permit_empty|string|max_length[255]',
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
                'is_natural_no_zero' => 'O campo list_manager_id deve ser um inteiro maior que zero',
            ],
            'label' => [
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
