<?php

namespace App\Requests\V1\Messages\MessageGroupsManager;

/**
 * Regras de entrada do PUT /api/v1/message-groups-manager/update/{id}.
 *
 * Tudo opcional (update parcial). O formulario envia `owner_user_manager_id`
 * junto, mas o dono e imutavel depois do create: igual ao gravado e ignorado,
 * diferente e recusado (403). `status` alterna active/inactive. So o dono (ou
 * admin) chama este endpoint (ver Processor).
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'owner_user_manager_id' => 'permit_empty|is_natural_no_zero',
            'name'        => 'permit_empty|string|max_length[150]',
            'description' => 'permit_empty|string',
            'status'      => 'permit_empty|in_list[active,inactive]',
        ];
    }

    public function messages(): array
    {
        return [
            'name' => [
                'max_length' => 'O nome deve ter no maximo 150 caracteres',
            ],
            'status' => [
                'in_list' => 'Status invalido: use active ou inactive',
            ],
        ];
    }
}
