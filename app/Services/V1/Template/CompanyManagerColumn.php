<?php

namespace App\Services\V1\Template;

use App\Libraries\Auth\CurrentUser;
use Config\Database;

/**
 * Coluna company_manager (JSON, NOT NULL) das tabelas temp_*: lista de SLUGS de
 * company_manager que enxergam o registro (ex.: ["default","tryikads"]), o mesmo
 * slug usado nas rotas e, nos perfis, em roles. Um registro serve varias
 * empresas; nao se copia linha por empresa.
 *
 * Regras:
 *  - chega como array ou JSON string ('["default"]'); vira JSON de slugs unicos
 *    (minusculos, sem espacos nas pontas)
 *  - create sem a chave (ou vazia): assume o slug da empresa da sessao; sem sessao,
 *    o da empresa DEFAULT (config Company)
 *  - update sem a chave: nao e tocada; com a chave vazia: 422 (coluna obrigatoria), salvo se o
 *    Processor sobrescrever companyManagerAllowsEmpty() (ex.: temp_manager)
 *  - todos os slugs precisam existir em company_manager (ativos, nao excluidos)
 *  - sessao autenticada que nao e superuser so pode listar a propria empresa
 *  - o slug da empresa e imutavel (CompanyManager\Processor), porque a lista
 *    nao tem FK para acompanhar uma troca
 */
trait CompanyManagerColumn
{
    /** true = a lista pode ficar vazia (ex.: template sem empresa). Quem usa o trait sobrescreve. */
    protected function companyManagerAllowsEmpty(): bool
    {
        return false;
    }

    /** true = create sem a chave assume a empresa da sessao. Quem usa o trait sobrescreve. */
    protected function companyManagerDefaultsToSession(): bool
    {
        return true;
    }

    /** @return array<int,string>|null  null = chave ausente */
    private function companyManagerSlugs(array $data): ?array
    {
        if (!array_key_exists('company_manager', $data)) {
            return null;
        }

        $raw = $data['company_manager'];
        if (is_string($raw)) {
            $raw = json_decode($raw, true);
        }

        if (!is_array($raw)) {
            return [];
        }

        $slugs = array_map(static fn ($v): string => strtolower(trim((string) $v)), $raw);

        return array_values(array_unique(array_filter($slugs, static fn (string $v): bool => $v !== '')));
    }

    /** Slug da empresa da sessao (ou da DEFAULT, sem sessao). */
    private function companyManagerSlugDaSessao(): ?string
    {
        $cid = CurrentUser::companyId() ?? (int) config('Company')->defaultCompanyId;

        $row = Database::connect(DB_GROUP_001)
            ->table('company_manager')
            ->select('slug')
            ->where('id', $cid)
            ->where('deleted_at', null)
            ->get()
            ->getRowArray();

        return $row['slug'] ?? null;
    }

    /** Erro 4xx/422 da coluna company_manager, ou null quando valida. */
    private function validateCompanyManager(array $data, bool $isCreate): ?array
    {
        $slugs = $this->companyManagerSlugs($data);

        if ($slugs === null || ($isCreate && $slugs === [])) {
            return null; // create sem a chave: prepareData assume a empresa da sessao
        }

        if ($slugs === [] && $this->companyManagerAllowsEmpty()) {
            return null;
        }

        if ($slugs === []) {
            return ['success' => false, 'message' => 'company_manager nao pode ser vazio', 'code' => 422];
        }

        $existentes = Database::connect(DB_GROUP_001)
            ->table('company_manager')
            ->whereIn('slug', $slugs)
            ->where('deleted_at', null)
            ->countAllResults();

        if ($existentes !== count($slugs)) {
            return ['success' => false, 'message' => 'company_manager contem empresa inexistente', 'code' => 422];
        }

        if (CurrentUser::companyId() !== null && !CurrentUser::isSuperuser()) {
            $propria = $this->companyManagerSlugDaSessao();
            if ($propria === null || array_diff($slugs, [$propria]) !== []) {
                return ['success' => false, 'message' => 'company_manager fora da empresa da sessao', 'code' => 403];
            }
        }

        return null;
    }

    /** Normaliza para JSON string; no create, preenche o padrao quando ausente/vazio. */
    private function prepareCompanyManager(array $data, bool $isCreate): array
    {
        $slugs = $this->companyManagerSlugs($data);

        if ($isCreate && ($slugs === null || $slugs === [])) {
            $slugs = $this->companyManagerDefaultsToSession() ? [$this->companyManagerSlugDaSessao() ?? 'default'] : [];
        }

        if ($slugs !== null) {
            $data['company_manager'] = json_encode($slugs);
        }

        return $data;
    }
}
