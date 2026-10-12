<?php

namespace App\Services\V1\Company\CompanyManager;

use App\Models\V1\Company\CompanyManager\SqlTableModel;
use App\Models\V1\Company\CompanyManager\SqlViewModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Company/CompanyManager.
 *
 * Regras:
 *  - slug derivado do name quando nao vem; unico entre empresas ativas (409).
 *  - status nasce 'active' quando nao informado.
 *  - A empresa DEFAULT (id=1) nao pode ser excluida (403).
 *  - Escrita restrita a admin pelo filtro 'adminonly' nas rotas.
 */
class Processor extends BaseTableService
{
    /** Espelha Config\Company::$defaultCompanyId (constante p/ uso em match/comparacao). */
    public const DEFAULT_COMPANY_ID = 1;

    protected SqlTableModel $tableModel;
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
        $this->viewModel  = new SqlViewModel();
    }

    protected function validateOnCreate(array $data): ?array
    {
        return $this->checkSlug((string) ($data['slug'] ?? ''), null, (string) ($data['name'] ?? ''));
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        return $this->checkSlug((string) ($data['slug'] ?? ''), $id, '');
    }

    protected function prepareData(array $data): array
    {
        if (trim((string) ($data['slug'] ?? '')) === '') {
            $data['slug'] = $this->slugify((string) ($data['name'] ?? 'empresa'));
        }

        $data['status'] = $data['status'] ?? 'active';

        return $data;
    }

    /**
     * true quando a requisicao atual vem de um host de desenvolvimento
     * (Config\Company::$devHosts) ou o CI roda com ENVIRONMENT=development.
     */
    public static function isDevHost(): bool
    {
        if (ENVIRONMENT === 'development') {
            return true;
        }

        $host = strtolower((string) service('request')->getUri()->getHost());

        return in_array($host, config('Company')->devHosts, true);
    }

    public function deleteSoft(int $id): array
    {
        return $id === self::DEFAULT_COMPANY_ID ? $this->protectedDefault() : parent::deleteSoft($id);
    }

    public function deleteHard(int $id): array
    {
        return $id === self::DEFAULT_COMPANY_ID ? $this->protectedDefault() : parent::deleteHard($id);
    }

    private function checkSlug(string $slug, ?int $excludeId, string $name): ?array
    {
        $slug = trim($slug);

        if ($slug === '' && $name !== '') {
            $slug = $this->slugify($name);
        }

        if ($slug !== '' && $this->tableModel->existsByField('slug', $slug, $excludeId)) {
            return ['success' => false, 'message' => 'Ja existe uma empresa com este slug', 'code' => 409];
        }

        return null;
    }

    private function protectedDefault(): array
    {
        return ['success' => false, 'message' => 'A empresa DEFAULT nao pode ser excluida', 'code' => 403];
    }

    private function slugify(string $value): string
    {
        $value = trim($value);

        if (function_exists('iconv')) {
            $converted = @iconv('UTF-8', 'ASCII//TRANSLIT', $value);
            if ($converted !== false) {
                $value = $converted;
            }
        }

        $value = trim(strtolower((string) preg_replace('/[^A-Za-z0-9]+/', '-', $value)), '-');

        return $value !== '' ? substr($value, 0, 100) : 'empresa';
    }
}
