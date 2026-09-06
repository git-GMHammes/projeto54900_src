<?php

namespace App\Services\V1;

/**
 * Service base para módulos somente leitura via View na API V1.
 *
 * Fornece:
 *  - Utilitários: sanitização, formatação, remoção de máscaras, paginação
 *  - Leitura genérica sobre views SQL: find, getGrouped, search, get,
 *    getAll, getNoPagination, getDeleted, getDeletedAll
 *
 * Os Processors de módulos com view devem herdar desta classe e declarar
 * $this->viewModel no construtor.
 *
 * Módulos que também possuem tabela física devem herdar de BaseTableService,
 * que estende esta classe com escrita, exclusão e leitura de tabela.
 *
 * @property object $viewModel Model da view (somente leitura)
 */
abstract class BaseViewService
{
    /**
     * Campos que possuem máscara e devem ser armazenados/consultados apenas com dígitos.
     * Cobre tanto a tabela (cpf, whatsapp, phone, zip_code)
     * quanto a view com prefixo uc_ (uc_cpf, uc_whatsapp, uc_phone, uc_zip_code).
     */
    private const MASKED_FIELDS = [
        'cpf',
        'whatsapp',
        'phone',
        'zip_code',
        'uc_cpf',
        'uc_whatsapp',
        'uc_phone',
        'uc_zip_code',
    ];

    // -------------------------------------------------------------------------
    // Sanitização
    // -------------------------------------------------------------------------

    /**
     * Remove tags HTML e espaços em branco extras de uma string.
     */
    protected function sanitizeString(string $value): string
    {
        return trim(strip_tags($value));
    }

    /**
     * Sanitiza um array de dados:
     *  - Remove tags e espaços extras em strings
     *  - Remove chaves cujo valor seja null ou string vazia
     *
     * @param array $data Dados brutos recebidos da requisição
     * @return array Dados limpos, prontos para persistência
     */
    protected function sanitizeData(array $data): array
    {
        $sanitized = [];

        foreach ($data as $key => $value) {
            if ($value === null || $value === '') {
                continue;
            }

            $sanitized[$key] = \is_string($value) ? $this->sanitizeString($value) : $value;
        }

        return $sanitized;
    }

    /**
     * Remove máscaras (parênteses, traços, pontos, espaços) dos campos definidos
     * em MASKED_FIELDS, mantendo apenas dígitos.
     *
     * @param array $data Mapa [campo => valor_escalar] ou [campo => array_de_valores]
     * @return array Dados com máscaras removidas nos campos pertinentes
     */
    protected function removeMasks(array $data): array
    {
        foreach (self::MASKED_FIELDS as $field) {
            if (!isset($data[$field])) {
                continue;
            }

            if (\is_array($data[$field])) {
                $data[$field] = array_map(
                    static fn($v) => \is_string($v) ? preg_replace('/\D/', '', $v) : $v,
                    $data[$field]
                );
            } elseif (\is_string($data[$field])) {
                $data[$field] = preg_replace('/\D/', '', $data[$field]);
            }
        }

        return $data;
    }

    // -------------------------------------------------------------------------
    // Formatação
    // -------------------------------------------------------------------------

    /**
     * Formata uma data para o padrão Y-m-d.
     * Retorna null se o valor estiver vazio ou for inválido.
     */
    protected function formatDate(?string $date): ?string
    {
        if (empty($date)) {
            return null;
        }

        $timestamp = strtotime($date);

        return $timestamp !== false ? date('Y-m-d', $timestamp) : null;
    }

    /**
     * Formata uma data/hora para o padrão Y-m-d H:i:s (MySQL DATETIME).
     * Aceita qualquer formato parseável por strtotime (incluindo datetime-local: Y-m-d\TH:i).
     * Retorna null se o valor estiver vazio ou for inválido.
     */
    protected function formatDatetime(?string $datetime): ?string
    {
        if (empty($datetime)) {
            return null;
        }

        $timestamp = strtotime($datetime);

        return $timestamp !== false ? date('Y-m-d H:i:s', $timestamp) : null;
    }

    // -------------------------------------------------------------------------
    // Normalização de parâmetros
    // -------------------------------------------------------------------------

    /**
     * Extrai e normaliza parâmetros de paginação recebidos via query string.
     *
     * @param array $params Array associativo com page, limit, sort, order
     * @return array Parâmetros normalizados e com limites seguros
     */
    protected function buildPaginationParams(array $params): array
    {
        return [
            'page' => max(1, (int) ($params['page'] ?? 1)),
            'limit' => min(1000, max(1, (int) ($params['limit'] ?? 20))),
            'sort' => trim((string) ($params['sort'] ?? 'id')),
            'order' => trim((string) ($params['order'] ?? 'desc')),
        ];
    }

    // -------------------------------------------------------------------------
    // Leitura — View
    // -------------------------------------------------------------------------

    /**
     * POST /find — Consulta paginada com filtros (view).
     */
    public function findView(array $filters, array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findPaginatedView(
            $this->removeMasks($filters),
            $p['page'],
            $p['limit'],
            $p['sort'],
            $p['order']
        );
    }

    /**
     * POST /get-grouped — Listagem filtrada paginada (view).
     *
     * @param array $multiFilters Mapa [campo => array_de_valores]
     * @param array $params       Parâmetros de paginação
     */
    public function getGroupedView(array $multiFilters, array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findGroupedView(
            $this->removeMasks($multiFilters),
            $p['page'],
            $p['limit'],
            $p['sort'],
            $p['order']
        );
    }

    /**
     * GET /search — Busca textual paginada (view).
     */
    public function searchView(string $term, array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->searchByTermView(
            $term,
            $p['page'],
            $p['limit'],
            $p['sort'],
            $p['order']
        );
    }

    /**
     * GET /get/{id} — Busca registro ativo pelo ID (view).
     */
    public function getView(int $id): ?array
    {
        return $this->viewModel->findById($id);
    }

    /**
     * GET /get-all — Lista paginada de registros ativos (view).
     */
    public function getAllView(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findPaginatedView(
            [],
            $p['page'],
            $p['limit'],
            $p['sort'],
            $p['order']
        );
    }

    /**
     * GET /get-no-pagination — Lista registros ativos sem paginação (view).
     * Se $limit for informado (>= 1), aplica LIMIT no SQL; caso contrário retorna tudo.
     */
    public function getNoPaginationView(string $sort, string $order, ?int $limit = null): array
    {
        return $this->viewModel->findAllView($sort, $order, $limit);
    }

    /**
     * GET /get-deleted/{id} — Busca registro soft-deleted pelo ID (view).
     */
    public function getDeletedView(int $id): ?array
    {
        return $this->viewModel->findDeletedById($id);
    }

    /**
     * GET /get-deleted-all — Lista paginada de registros soft-deleted (view).
     */
    public function getDeletedAllView(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findDeletedPaginatedView(
            $p['page'],
            $p['limit'],
            $p['sort'],
            $p['order']
        );
    }

    /**
     * GET /get-all-with-deleted — Lista paginada de todos os registros (ativos + soft-deleted) na view.
     */
    public function getAllWithDeletedView(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findAllWithDeletedPaginatedView(
            $p['page'],
            $p['limit'],
            $p['sort'],
            $p['order']
        );
    }
}
