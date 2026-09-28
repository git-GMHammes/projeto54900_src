<?php

namespace App\Requests\V1\ChatRooms\ChatRoomsManager;

/**
 * Regras de entrada do PUT /api/v1/chat-rooms-manager/update/{id}.
 *
 * Tudo opcional (update parcial). `owner_user_manager_id` e
 * `moderation_accepted`/`moderation_accepted_at` nao entram — dono e aceite
 * de moderacao sao imutaveis depois do create. `status` alterna open/closed;
 * so o dono (ou admin) pode chamar este endpoint (ver Processor) — e a forma
 * de "so o dono reabre" do README do modulo. `closed_at` nao e aceito do
 * cliente: o Processor preenche/limpa sozinho a partir da transicao de status.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'name'           => 'permit_empty|string|max_length[150]',
            'description'    => 'permit_empty|string',
            'status'         => 'permit_empty|in_list[open,closed]',
            'closed_reason'  => 'permit_empty|string|max_length[255]',
        ];
    }

    public function messages(): array
    {
        return [
            'status' => [
                'in_list' => 'Status invalido: use open ou closed',
            ],
        ];
    }
}
