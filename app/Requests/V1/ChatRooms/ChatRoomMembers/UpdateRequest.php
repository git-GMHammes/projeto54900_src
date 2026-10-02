<?php

namespace App\Requests\V1\ChatRooms\ChatRoomMembers;

/**
 * Regras de entrada do PUT /api/v1/chat-room-members/update/{id}.
 *
 * Tudo opcional (update parcial). Sala e usuario sao imutaveis depois do
 * create (o Processor descarta se enviados). `blocked_at` nao e aceito do
 * cliente: o Processor preenche/limpa a partir da transicao de status.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'role'           => 'permit_empty|in_list[owner,member]',
            'status'         => 'permit_empty|in_list[active,blocked,left]',
            'blocked_reason' => 'permit_empty|in_list[profanity_3x,attachment_report,manual]',
        ];
    }

    public function messages(): array
    {
        return [
            'role' => [
                'in_list' => 'Papel invalido: use owner ou member',
            ],
            'status' => [
                'in_list' => 'Status invalido: use active, blocked ou left',
            ],
            'blocked_reason' => [
                'in_list' => 'Motivo invalido: use profanity_3x, attachment_report ou manual',
            ],
        ];
    }
}
