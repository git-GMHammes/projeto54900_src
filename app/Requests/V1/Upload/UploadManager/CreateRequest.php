<?php

namespace App\Requests\V1\Upload\UploadManager;

/**
 * Regras de validacao para POST /create (tabela uploads).
 *
 * Este endpoint registra o METADADO de um arquivo que ja existe no disco ou
 * e externo. O caminho normal de envio de binario e POST /upload (multipart)
 * — ver UploadRequest e Services\V1\Upload\UploadManager\Processor::store().
 *
 * DDL de referencia:
 *   module          VARCHAR(64)  NOT NULL
 *   reference_id    BIGINT       NOT NULL
 *   collection      VARCHAR(64)  NULL
 *   file_key        CHAR(32)     NOT NULL UNIQUE
 *   original_name   VARCHAR(255) NOT NULL
 *   stored_name     VARCHAR(255) NOT NULL
 *   storage_path    VARCHAR(500) NOT NULL
 *   file_url        VARCHAR(500) NOT NULL
 *   mime_type       VARCHAR(150) NULL
 *   extension       VARCHAR(20)  NULL
 *   file_size       BIGINT       NULL
 *   checksum_sha256 CHAR(64)     NULL
 *   category        ENUM(image,video,audio,document,spreadsheet,presentation,pdf,archive,other) DEFAULT 'other'
 *   title           VARCHAR(255) NULL
 *   description     TEXT         NULL
 *
 * status NAO entra no create — todo registro nasce com o DEFAULT da coluna
 * ('active'); ver Processor::prepareData.
 */
class CreateRequest
{
    public function rules(): array
    {
        return [
            'module'          => 'required|string|max_length[64]|regex_match[/^[A-Za-z0-9_]+$/]',
            'reference_id'    => 'required|is_natural_no_zero',
            'collection'      => 'permit_empty|string|max_length[64]|regex_match[/^[A-Za-z0-9_]+$/]',
            'file_key'        => 'permit_empty|string|exact_length[32]|regex_match[/^[a-f0-9]{32}$/]',
            'original_name'   => 'required|string|max_length[255]',
            'stored_name'     => 'required|string|max_length[255]',
            'storage_path'    => 'required|string|max_length[500]',
            'file_url'        => 'required|string|max_length[500]',
            'mime_type'       => 'permit_empty|string|max_length[150]',
            'extension'       => 'permit_empty|string|max_length[20]',
            'file_size'       => 'permit_empty|is_natural',
            'checksum_sha256' => 'permit_empty|string|exact_length[64]|regex_match[/^[a-f0-9]{64}$/]',
            'category'        => 'permit_empty|in_list[image,video,audio,document,spreadsheet,presentation,pdf,archive,other]',
            'title'           => 'permit_empty|string|max_length[255]',
            'description'     => 'permit_empty|string',
        ];
    }

    public function messages(): array
    {
        return [
            'module' => [
                'required'    => 'O campo module e obrigatorio',
                'max_length'  => 'O campo module nao pode exceder 64 caracteres',
                'regex_match' => 'O campo module aceita apenas letras, numeros e underline',
            ],
            'reference_id' => [
                'required'           => 'O campo reference_id e obrigatorio',
                'is_natural_no_zero' => 'O campo reference_id deve ser um inteiro maior que zero',
            ],
            'original_name' => [
                'required' => 'O campo original_name e obrigatorio',
            ],
            'file_url' => [
                'required' => 'O campo file_url e obrigatorio',
            ],
        ];
    }
}
