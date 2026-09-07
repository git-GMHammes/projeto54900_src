<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

/**
 * Politica do modulo Upload/UploadManager (API V1).
 *
 * Somente configuracao — sem segredos. A raiz fisica dos arquivos e a
 * constante UPLOAD_DISK (definida em app/Config/Constants.php).
 */
class Upload extends BaseConfig
{
    /**
     * Caminho (relativo a base_url) do endpoint que serve o binario inline.
     * Usado para montar a coluna file_url apos o insert.
     */
    public string $servePath = 'api/v1/upload-manager/serve/';

    /**
     * Caminho (relativo a base_url) do endpoint que forca download.
     */
    public string $downloadPath = 'api/v1/upload-manager/download/';

    /**
     * Quando true, recusa (HTTP 409) um upload cujo conteudo (sha256) ja exista
     * para o mesmo par module + reference_id.
     */
    public bool $dedupe = false;

    /**
     * Teto global de tamanho por upload, em kilobytes. Aplicado na regra
     * max_size do UploadRequest. Ajuste tambem client_max_body_size (nginx) e
     * upload_max_filesize / post_max_size (php-fpm) se aumentar este valor.
     */
    public int $maxSizeKbGlobal = 512000; // 500 MB

    /**
     * Teto sugerido por categoria (kilobytes). Referencia para validacao futura
     * no Processor; nao e aplicado automaticamente pelo UploadRequest.
     */
    public array $maxSizeKb = [
        'image'        => 10240,
        'audio'        => 51200,
        'video'        => 512000,
        'document'     => 25600,
        'spreadsheet'  => 25600,
        'presentation' => 51200,
        'pdf'          => 51200,
        'archive'      => 204800,
        'other'        => 10240,
    ];

    /**
     * Lista branca de extensoes (regra ext_in). SVG fica de fora por padrao
     * (conteudo ativo).
     */
    public array $allowedExt = [
        'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tif', 'tiff',
        'mp3', 'wav', 'ogg', 'oga', 'm4a', 'aac', 'flac',
        'mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v',
        'doc', 'docx', 'odt', 'rtf', 'txt', 'md',
        'xls', 'xlsx', 'ods', 'csv',
        'ppt', 'pptx', 'odp',
        'pdf',
        'zip', 'rar', '7z', 'tar', 'gz',
    ];

    /**
     * Lista branca de MIME types (regra mime_in). application/octet-stream e
     * aceito como fallback de navegadores que nao enviam o tipo real.
     */
    public array $allowedMime = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff',
        'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/mp4', 'audio/aac', 'audio/flac', 'audio/x-flac',
        'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.oasis.opendocument.text',
        'application/rtf', 'text/rtf', 'text/plain', 'text/markdown',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.oasis.opendocument.spreadsheet',
        'text/csv',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.oasis.opendocument.presentation',
        'application/pdf',
        'application/zip', 'application/x-zip-compressed',
        'application/vnd.rar', 'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/x-tar', 'application/gzip',
        'application/octet-stream',
    ];

    /**
     * Mapa MIME -> categoria. Chave terminada em '/' casa por prefixo.
     * O que nao casar cai no mapa por extensao e, por fim, em 'other'.
     */
    public array $mimeCategory = [
        'image/'                                                                    => 'image',
        'audio/'                                                                    => 'audio',
        'video/'                                                                    => 'video',
        'application/pdf'                                                           => 'pdf',
        'application/msword'                                                        => 'document',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'   => 'document',
        'application/vnd.oasis.opendocument.text'                                   => 'document',
        'text/plain'                                                                => 'document',
        'text/markdown'                                                             => 'document',
        'application/rtf'                                                           => 'document',
        'text/rtf'                                                                  => 'document',
        'application/vnd.ms-excel'                                                  => 'spreadsheet',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'         => 'spreadsheet',
        'application/vnd.oasis.opendocument.spreadsheet'                            => 'spreadsheet',
        'text/csv'                                                                  => 'spreadsheet',
        'application/vnd.ms-powerpoint'                                             => 'presentation',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'presentation',
        'application/vnd.oasis.opendocument.presentation'                           => 'presentation',
        'application/zip'                                                           => 'archive',
        'application/x-zip-compressed'                                              => 'archive',
        'application/vnd.rar'                                                       => 'archive',
        'application/x-rar-compressed'                                              => 'archive',
        'application/x-7z-compressed'                                               => 'archive',
        'application/x-tar'                                                         => 'archive',
        'application/gzip'                                                          => 'archive',
    ];

    /**
     * Mapa extensao -> categoria (fallback quando o MIME e generico/ausente).
     */
    public array $extCategory = [
        'jpg' => 'image', 'jpeg' => 'image', 'png' => 'image', 'gif' => 'image',
        'webp' => 'image', 'bmp' => 'image', 'tif' => 'image', 'tiff' => 'image',
        'mp3' => 'audio', 'wav' => 'audio', 'ogg' => 'audio', 'oga' => 'audio',
        'm4a' => 'audio', 'aac' => 'audio', 'flac' => 'audio',
        'mp4' => 'video', 'webm' => 'video', 'mov' => 'video', 'avi' => 'video',
        'mkv' => 'video', 'm4v' => 'video',
        'doc' => 'document', 'docx' => 'document', 'odt' => 'document',
        'rtf' => 'document', 'txt' => 'document', 'md' => 'document',
        'xls' => 'spreadsheet', 'xlsx' => 'spreadsheet', 'ods' => 'spreadsheet', 'csv' => 'spreadsheet',
        'ppt' => 'presentation', 'pptx' => 'presentation', 'odp' => 'presentation',
        'pdf' => 'pdf',
        'zip' => 'archive', 'rar' => 'archive', '7z' => 'archive', 'tar' => 'archive', 'gz' => 'archive',
    ];
}
