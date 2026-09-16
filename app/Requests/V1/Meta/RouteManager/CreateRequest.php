<?php

namespace App\Requests\V1\Meta\RouteManager;

/**
 * Regras de validacao para POST /create (tabela route_manager).
 *
 * DDL de referencia:
 *   layer             ENUM('backend','frontend') NOT NULL
 *   object            VARCHAR(100) NOT NULL
 *   action            VARCHAR(100) NOT NULL
 *   method            ENUM('GET','POST','PUT','PATCH','DELETE') NOT NULL
 *   endpoint          VARCHAR(255) NOT NULL UNIQUE (com method)
 *   controller_method VARCHAR(255) NULL
 *
 * Unicidade real de (method, endpoint) e verificada no hook validateOnCreate.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'layer'             => 'required|in_list[backend,frontend]',
            'object'            => 'required|string|max_length[100]',
            'action'            => 'required|string|max_length[100]',
            'method'            => 'required|in_list[GET,POST,PUT,PATCH,DELETE]',
            'endpoint'          => 'required|string|max_length[255]',
            'controller_method' => 'permit_empty|string|max_length[255]',
        ];
    }

    public function messages(): array
    {
        return [
            'layer' => [
                'required' => 'O campo layer e obrigatorio',
                'in_list'  => 'O campo layer deve ser backend ou frontend',
            ],
            'object' => [
                'required'   => 'O campo object e obrigatorio',
                'max_length' => 'O campo object nao pode exceder 100 caracteres',
            ],
            'action' => [
                'required'   => 'O campo action e obrigatorio',
                'max_length' => 'O campo action nao pode exceder 100 caracteres',
            ],
            'method' => [
                'required' => 'O campo method e obrigatorio',
                'in_list'  => 'O campo method deve ser GET, POST, PUT, PATCH ou DELETE',
            ],
            'endpoint' => [
                'required'   => 'O campo endpoint e obrigatorio',
                'max_length' => 'O campo endpoint nao pode exceder 255 caracteres',
            ],
            'controller_method' => [
                'max_length' => 'O campo controller_method nao pode exceder 255 caracteres',
            ],
        ];
    }
}
