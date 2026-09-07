<?php

namespace App\Requests\V1\Upload\UploadManager;

use Config\Upload as UploadConfig;

/**
 * Regras de validacao para POST /upload (multipart/form-data).
 *
 * Campos do formulario:
 *   file          arquivo enviado (obrigatorio). Lista branca de extensao/MIME
 *                 e teto de tamanho em Config\Upload.
 *   module        modulo dono do anexo — vira subpasta. [A-Za-z0-9_]
 *   reference_id  id do registro dono no modulo — vira subpasta. inteiro > 0
 *   collection    agrupador opcional (avatar, attachment, cover, ...)
 *   title         rotulo opcional
 *   description   descricao opcional
 */
class UploadRequest
{
    public function rules(): array
    {
        /** @var UploadConfig $config */
        $config = config(UploadConfig::class);

        $ext  = implode(',', $config->allowedExt);
        $mime = implode(',', $config->allowedMime);
        $max  = (int) $config->maxSizeKbGlobal;

        return [
            'file'         => "uploaded[file]|max_size[file,{$max}]|ext_in[file,{$ext}]|mime_in[file,{$mime}]",
            'module'       => 'required|string|max_length[64]|regex_match[/^[A-Za-z0-9_]+$/]',
            'reference_id' => 'required|is_natural_no_zero',
            'collection'   => 'permit_empty|string|max_length[64]|regex_match[/^[A-Za-z0-9_]+$/]',
            'title'        => 'permit_empty|string|max_length[255]',
            'description'  => 'permit_empty|string',
        ];
    }

    public function messages(): array
    {
        return [
            'file' => [
                'uploaded' => 'Nenhum arquivo foi enviado no campo file',
                'max_size' => 'O arquivo excede o tamanho maximo permitido',
                'ext_in'   => 'Extensao de arquivo nao permitida',
                'mime_in'  => 'Tipo de arquivo (MIME) nao permitido',
            ],
            'module' => [
                'required'    => 'O campo module e obrigatorio',
                'regex_match' => 'O campo module aceita apenas letras, numeros e underline',
            ],
            'reference_id' => [
                'required'           => 'O campo reference_id e obrigatorio',
                'is_natural_no_zero' => 'O campo reference_id deve ser um inteiro maior que zero',
            ],
            'collection' => [
                'regex_match' => 'O campo collection aceita apenas letras, numeros e underline',
            ],
        ];
    }
}
