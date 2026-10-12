<?php

namespace App\Controllers\Api\V1\Company\CompanyManager;

use CodeIgniter\HTTP\ResponseInterface;

/**
 * Lista PUBLICA de empresas para o select do cadastro de usuario (sem sessao).
 *
 * Expoe somente id e name das empresas ativas — nada de document (CNPJ), slug
 * ou status. A listagem completa continua exigindo jwtauth em /api/v1/company-manager/*.
 */
class PublicOptionsController extends ResourceTableController
{
    /**
     * GET .../company-manager-public/get-no-pagination
     */
    public function getNoPagination(): ResponseInterface
    {
        try {
            $rows = $this->processor->getNoPagination('name', 'asc', null);
            $rows = is_array($rows) && isset($rows['data']) && is_array($rows['data']) ? $rows['data'] : (array) $rows;

            $options = [];
            foreach ($rows as $row) {
                $row = (array) $row;
                if (($row['status'] ?? 'active') !== 'active') {
                    continue;
                }
                $options[] = ['id' => (int) $row['id'], 'name' => (string) $row['name']];
            }

            return $this->respondSuccess($options);
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }
}
