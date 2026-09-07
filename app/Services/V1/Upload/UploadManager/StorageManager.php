<?php

namespace App\Services\V1\Upload\UploadManager;

use CodeIgniter\HTTP\Files\UploadedFile;
use Config\Upload as UploadConfig;

/**
 * Politica de disco do modulo Upload — fonte unica.
 *
 * Responsabilidades:
 *  - montar e sanitizar o caminho fisico (anti path traversal)
 *  - gerar file_key e stored_name (<file_key><AAAAMMDDHHMMSS>.<ext>)
 *  - criar os diretorios <module>/<reference_id>/
 *  - mover e apagar arquivos; remover diretorios vazios
 *  - classificar o arquivo em categoria a partir do MIME/extensao
 *
 * Nenhuma regra de negocio e nenhum acesso a banco aqui.
 */
class StorageManager
{
    private UploadConfig $config;
    private string $root;

    public function __construct()
    {
        $this->config = config(UploadConfig::class);
        // UPLOAD_DISK e definido em app/Config/Constants.php (WRITEPATH . 'uploads').
        $this->root = rtrim(UPLOAD_DISK, '/\\') . DIRECTORY_SEPARATOR;
    }

    /**
     * Reduz um segmento de caminho a [A-Za-z0-9_]. Vazio => '_'.
     */
    public function sanitizeSegment(string $value): string
    {
        $clean = preg_replace('/[^A-Za-z0-9_]/', '', $value) ?? '';

        return $clean !== '' ? $clean : '_';
    }

    /**
     * Gera uma chave hexadecimal de 32 caracteres.
     */
    public function generateKey(): string
    {
        return bin2hex(random_bytes(16));
    }

    /**
     * Monta o nome no disco: <file_key><AAAAMMDDHHMMSS>.<ext>
     */
    public function buildStoredName(string $fileKey, string $extension): string
    {
        $ext   = strtolower(preg_replace('/[^A-Za-z0-9]/', '', $extension) ?? '');
        $stamp = date('YmdHis');

        return $ext !== ''
            ? $fileKey . $stamp . '.' . $ext
            : $fileKey . $stamp;
    }

    /**
     * Caminho relativo (coluna storage_path): <module>/<reference_id>/<stored_name>
     */
    public function relativePath(string $module, int $referenceId, string $storedName): string
    {
        return $this->sanitizeSegment($module) . '/' . $referenceId . '/' . $storedName;
    }

    /**
     * Diretorio absoluto do dono, ja criado: <root>/<module>/<reference_id>/
     */
    public function ensureDir(string $module, int $referenceId): string
    {
        $dir = $this->root
            . $this->sanitizeSegment($module) . DIRECTORY_SEPARATOR
            . $referenceId . DIRECTORY_SEPARATOR;

        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }

        return $dir;
    }

    /**
     * Move o arquivo enviado para o destino final e devolve os dados fisicos.
     *
     * @return array{stored_name: string, storage_path: string, abs_path: string, size: int, checksum: string}
     */
    public function persist(UploadedFile $file, string $module, int $referenceId, string $fileKey, string $extension): array
    {
        $dir        = $this->ensureDir($module, $referenceId);
        $storedName = $this->buildStoredName($fileKey, $extension);

        $file->move($dir, $storedName, true);

        $absPath = $dir . $storedName;

        return [
            'stored_name'  => $storedName,
            'storage_path' => $this->relativePath($module, $referenceId, $storedName),
            'abs_path'     => $absPath,
            'size'         => is_file($absPath) ? (int) filesize($absPath) : 0,
            'checksum'     => is_file($absPath) ? hash_file('sha256', $absPath) : '',
        ];
    }

    /**
     * Caminho absoluto a partir do storage_path relativo gravado no banco.
     * Normaliza separadores e remove qualquer '..'.
     */
    public function absoluteFromRelative(string $storagePath): string
    {
        $normalized = str_replace(['\\', '..'], ['/', ''], $storagePath);

        return $this->root . str_replace('/', DIRECTORY_SEPARATOR, ltrim($normalized, '/'));
    }

    /**
     * Apaga o arquivo fisico e, se o diretorio do dono ficar vazio, remove-o.
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

    private function isDirEmpty(string $dir): bool
    {
        $items = @scandir($dir) ?: [];

        return \count(array_diff($items, ['.', '..'])) === 0;
    }

    /**
     * Classifica em categoria a partir do MIME (prefixo/exato) com fallback
     * pela extensao. O que nao casar retorna 'other'.
     */
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
}
