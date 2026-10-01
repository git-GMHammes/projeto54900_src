<?php

namespace App\Requests\V1\ChatRooms\ChatRoomAttachmentReports;

/**
 * Regras de entrada do POST /api/v1/chat-room-attachment-reports/create.
 *
 * Denunciar e de qualquer usuario logado nao-guest (o Processor confere
 * autoria/duplicidade). Os campos de moderacao (status, reviewed_by,
 * reviewed_at, review_note) nao entram aqui — o Processor sempre grava
 * status='resolved' porque a acao e imediata (README §4.6).
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'chat_room_attachment_id' => 'required|is_natural_no_zero',
            'reporter_user_manager_id' => 'permit_empty|is_natural_no_zero',
            'reason'                   => 'required|in_list[nudity,violence,hate,harassment,spam,other]',
            'description'              => 'permit_empty|string',
        ];
    }

    public function messages(): array
    {
        return [
            'chat_room_attachment_id' => [
                'required'            => 'Informe o anexo denunciado',
                'is_natural_no_zero' => 'Anexo invalido',
            ],
            'reason' => [
                'required' => 'Informe o motivo da denuncia',
                'in_list'  => 'Motivo invalido: use nudity, violence, hate, harassment, spam ou other',
            ],
        ];
    }
}
