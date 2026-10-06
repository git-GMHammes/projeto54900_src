<?php

namespace App\Requests\V1\Messages\MessageGroupsManager;

/**
 * Regras de entrada do POST /api/v1/message-groups-manager/create.
 *
 * `owner_user_manager_id`: vazio ou igual a sessao = usuario logado; outro valor
 * so para admin (senao 403). `status` (active/inactive) tem padrao `active`. O dono
 * entra sozinho como membro (`role=owner`) na mesma transacao.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'owner_user_manager_id' => 'permit_empty|is_natural_no_zero',
            'name'                  => 'required|string|max_length[150]',
            'status'                => 'permit_empty|in_list[active,inactive]',
            'description'           => 'permit_empty|string',
        ];
    }

    public function messages(): array
    {
        return [
            'name' => [
                'required'   => 'O nome do grupo e obrigatorio',
                'max_length' => 'O nome deve ter no maximo 150 caracteres',
            ],
        ];
    }
}
