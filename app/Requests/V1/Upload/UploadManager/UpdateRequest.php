<?php

namespace App\Requests\V1\Upload\UploadManager;

/**
 * Regras de validacao para PUT /update/{id} (tabela uploads).
 *
 * So os metadados sao mutaveis. Os campos fisicos (file_key, module,
 * original_name, stored_name, storage_path, file_url, mime_type, extension,
 * file_size, checksum_sha256, category) NAO podem mudar por update — alterar
 * qualquer um deles desalinha o registro do arquivo no disco. O Processor
 * (prepareUpdateData) remove esses campos defensivamente antes de persistir.
 *
 * Trocar o binario de um upload = novo POST /upload + delete-soft do antigo.
 */
class UpdateRequest
{
    public function rules(): array
    {
        return [
            'reference_id' => 'permit_empty|is_natural_no_zero',
            'collection'   => 'permit_empty|string|max_length[64]|regex_match[/^[A-Za-z0-9_]+$/]',
            'title'        => 'permit_empty|string|max_length[255]',
            'description'  => 'permit_empty|string',
            'status'       => 'permit_empty|in_list[active,inactive]',
        ];
    }

    public function messages(): array
    {
        return [
            'reference_id' => [
                'is_natural_no_zero' => 'O campo reference_id deve ser um inteiro maior que zero',
            ],
            'collection' => [
                'regex_match' => 'O campo collection aceita apenas letras, numeros e underline',
            ],
            'status' => [
                'in_list' => 'O campo status deve ser active ou inactive',
            ],
        ];
    }
}
