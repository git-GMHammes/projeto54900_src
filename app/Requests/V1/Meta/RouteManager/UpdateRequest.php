<?php

namespace App\Requests\V1\Meta\RouteManager;

/**
 * Regras de validacao para PUT /update/{id} (tabela route_manager).
 *
 * Todos os campos sao permit_empty (atualizacao parcial). Unicidade de
 * (method, endpoint) com excludeId e verificada no hook validateOnUpdate.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'layer'             => 'permit_empty|in_list[backend,frontend]',
            'object'            => 'permit_empty|string|max_length[100]',
            'action'            => 'permit_empty|string|max_length[100]',
            'method'            => 'permit_empty|in_list[GET,POST,PUT,PATCH,DELETE]',
            'endpoint'          => 'permit_empty|string|max_length[255]',
            'controller_method' => 'permit_empty|string|max_length[255]',
        ];
    }

    public function messages(): array
    {
        return [
            'layer' => [
                'in_list' => 'O campo layer deve ser backend ou frontend',
            ],
            'object' => [
                'max_length' => 'O campo object nao pode exceder 100 caracteres',
            ],
            'action' => [
                'max_length' => 'O campo action nao pode exceder 100 caracteres',
            ],
            'method' => [
                'in_list' => 'O campo method deve ser GET, POST, PUT, PATCH ou DELETE',
            ],
            'endpoint' => [
                'max_length' => 'O campo endpoint nao pode exceder 255 caracteres',
            ],
            'controller_method' => [
                'max_length' => 'O campo controller_method nao pode exceder 255 caracteres',
            ],
        ];
    }
}
