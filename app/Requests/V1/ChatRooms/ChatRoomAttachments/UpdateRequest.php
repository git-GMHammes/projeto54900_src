<?php

namespace App\Requests\V1\ChatRooms\ChatRoomAttachments;

/**
 * Regras de entrada do PUT /api/v1/chat-room-attachments/update/{id}.
 *
 * Edita apenas categoria e status. `status=blocked` nao e aceito aqui — fica
 * reservado ao futuro modulo ChatRoomAttachmentReports, que grava direto via
 * SqlTableModel::update() quando uma denuncia e confirmada. O arquivo e o
 * vinculo com a mensagem nao mudam por aqui: para outro arquivo, excluir e
 * anexar de novo.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'status'   => 'permit_empty|in_list[active,inactive]',
            'category' => 'permit_empty|in_list[image,video,audio,document,spreadsheet,presentation,pdf,archive,other]',
        ];
    }

    public function messages(): array
    {
        return [
            'status' => [
                'in_list' => 'Status invalido: use active ou inactive',
            ],
            'category' => [
                'in_list' => 'Categoria invalida para o anexo',
            ],
        ];
    }
}
