<?php

namespace App\Requests\V1\Messages\MessageAttachments;

/**
 * Regras de entrada do POST /api/v1/message-attachments/create.
 *
 * O create e multipart: `messages_manager_id` vem no corpo e os metadados do arquivo
 * (file_key, stored_name, storage_path, file_url, mime_type, extension, file_size,
 * checksum_sha256, category) sao preenchidos pelo Processor a partir do arquivo enviado
 * no campo `file`. `replace=1` troca o anexo atual da mensagem (o anterior sofre soft delete).
 * Serve mensagem 1 para 1 e de grupo (ambas sao linhas de messages_manager).
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'messages_manager_id' => 'required|is_natural_no_zero',
            'status'              => 'permit_empty|in_list[active,inactive]',
            'category'            => 'permit_empty|in_list[image,video,audio,document,spreadsheet,presentation,pdf,archive,other]',
            'replace'             => 'permit_empty|in_list[0,1]',
        ];
    }

    public function messages(): array
    {
        return [
            'messages_manager_id' => [
                'required'           => 'Informe a mensagem dona do anexo',
                'is_natural_no_zero' => 'Mensagem invalida',
            ],
            'status' => [
                'in_list' => 'Status invalido: use active ou inactive',
            ],
            'replace' => [
                'in_list' => 'O campo replace aceita 0 ou 1',
            ],
        ];
    }
}
