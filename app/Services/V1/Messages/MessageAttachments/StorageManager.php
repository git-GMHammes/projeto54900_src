<?php

namespace App\Services\V1\Messages\MessageAttachments;

use CodeIgniter\HTTP\Files\UploadedFile;
use Config\Upload as UploadConfig;

/**
 * Disco do anexo do Messages.
 *
 * Copia adaptada do StorageManager da Timeline (mesma decisao: tabela propria,
 * NAO se mistura com o modulo Upload). Reaproveita apenas o Config\Upload, que
 * e so o mapa de MIME/extensao e os limites de tamanho.
 *
 * Destino: writable/uploads/message_attachments/<messages_manager_id>/<file_key><AAAAMMDDHHMMSS>.<ext>
 */
class StorageManager
{
    /** Pasta do modulo dentro de writable/uploads. */
    public const MODULE = 'message_attachments';

    private UploadConfig $config;
    private string $root;

    public function __construct()
    {
        $this->config = config(UploadConfig::class);
        // UPLOAD_DISK e definido em app/Config/Constants.php (WRITEPATH . 'uploads').
        $this->root = rtrim(UPLOAD_DISK, '/\\') . DIRECTORY_SEPARATOR;
    }

    public function generateKey(): string
    {
        return bin2hex(random_bytes(16));
    }

    public function buildStoredName(string $fileKey, string $extension): string
    {
        $ext   = strtolower((string) preg_replace('/[^A-Za-z0-9]/', '', $extension));
        $stamp = date('YmdHis');

        return $ext !== '' ? $fileKey . $stamp . '.' . $ext : $fileKey . $stamp;
    }

    public function relativePath(int $referenceId, string $storedName): string
    {
        return self::MODULE . '/' . $referenceId . '/' . $storedName;
    }

    public function ensureDir(int $referenceId): string
    {
        $dir = $this->root . self::MODULE . DIRECTORY_SEPARATOR . $referenceId . DIRECTORY_SEPARATOR;

        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }

        return $dir;
    }

    /**
     * Move o arquivo enviado para o destino final e devolve os dados fisicos.
     *
     * @return array{stored_name: string, storage_path: string, size: int, checksum: string}
     */
    public function persist(UploadedFile $file, int $referenceId, string $fileKey, string $extension): array
    {
        $dir        = $this->ensureDir($referenceId);
        $storedName = $this->buildStoredName($fileKey, $extension);

        $file->move($dir, $storedName, true);

        $absPath = $dir . $storedName;

        return [
            'stored_name'  => $storedName,
            'storage_path' => $this->relativePath($referenceId, $storedName),
            'size'         => is_file($absPath) ? (int) filesize($absPath) : 0,
            'checksum'     => is_file($absPath) ? (string) hash_file('sha256', $absPath) : '',
        ];
    }

    public function absoluteFromRelative(string $storagePath): string
    {
        $normalized = str_replace(['\\', '..'], ['/', ''], $storagePath);

        return $this->root . str_replace('/', DIRECTORY_SEPARATOR, ltrim($normalized, '/'));
    }

    /**
     * Apaga o arquivo fisico e, se a pasta da mensagem ficar vazia, remove-a.
     */
    public function remove(string $storagePath): bool
    {
        $abs = $this->absoluteFromRelative($storagePath);

        $ok = true;
        if (is_file($abs)) {
            $ok = @unlink($abs);
        }

        $dir = \dirname($abs);
        if (is_dir($dir) && $this->isDirEmpty($dir)) {
            @rmdir($dir);
        }

        return $ok;
    }

    public function isAllowedExtension(string $extension): bool
    {
        return $extension !== '' && \in_array(strtolower($extension), $this->config->allowedExt, true);
    }

    public function isAllowedMime(string $mime): bool
    {
        return \in_array(strtolower($mime), $this->config->allowedMime, true);
    }

    public function maxSizeKb(string $category): int
    {
        return (int) ($this->config->maxSizeKb[$category] ?? $this->config->maxSizeKb['other']);
    }

    public function categorize(?string $mime, ?string $extension): string
    {
        $mime = strtolower(trim((string) $mime));
        $ext  = strtolower(trim((string) $extension));

        if ($mime !== '' && $mime !== 'application/octet-stream') {
            foreach ($this->config->mimeCategory as $needle => $category) {
                if ($needle === $mime) {
                    return $category;
                }
                if (str_ends_with($needle, '/') && str_starts_with($mime, $needle)) {
                    return $category;
                }
            }
        }

        return $this->config->extCategory[$ext] ?? 'other';
    }

    private function isDirEmpty(string $dir): bool
    {
        $items = @scandir($dir) ?: [];

        return \count(array_diff($items, ['.', '..'])) === 0;
    }
}
