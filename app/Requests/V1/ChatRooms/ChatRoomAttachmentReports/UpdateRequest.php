<?php

namespace App\Requests\V1\ChatRooms\ChatRoomAttachmentReports;

/**
 * Regras de entrada do PUT /api/v1/chat-room-attachment-reports/update/{id}.
 *
 * Rota de moderacao (adminonly): aqui o admin reclassifica a denuncia
 * (status/review_note) para fins de auditoria. Reverter os bloqueios
 * automaticos do anexo/matricula NAO acontece por aqui — e acao manual em
 * cada endpoint proprio (fora de escopo deste modulo).
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'status'      => 'permit_empty|in_list[pending,reviewing,resolved,rejected]',
            'review_note' => 'permit_empty|string',
        ];
    }

    public function messages(): array
    {
        return [
            'status' => [
                'in_list' => 'Status invalido: use pending, reviewing, resolved ou rejected',
            ],
        ];
    }
}
