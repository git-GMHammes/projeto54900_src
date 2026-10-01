<?php

namespace App\Requests\V1\ChatRooms\ChatRoomAttachments;

/**
 * Regras de entrada do POST /api/v1/chat-room-attachments/create.
 *
 * O create e multipart: `chat_message_id` vem no corpo e os metadados do
 * arquivo (file_key, stored_name, storage_path, file_url, mime_type,
 * extension, file_size, checksum_sha256, category) sao preenchidos pelo
 * Processor a partir do arquivo enviado no campo `file`.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'chat_message_id' => 'required|is_natural_no_zero',
            'status'          => 'permit_empty|in_list[active,inactive]',
            'category'        => 'permit_empty|in_list[image,video,audio,document,spreadsheet,presentation,pdf,archive,other]',
        ];
    }

    public function messages(): array
    {
        return [
            'chat_message_id' => [
                'required'            => 'Informe a mensagem dona do anexo',
                'is_natural_no_zero' => 'Mensagem invalida',
            ],
            'status' => [
                'in_list' => 'Status invalido: use active ou inactive',
            ],
        ];
    }
}
