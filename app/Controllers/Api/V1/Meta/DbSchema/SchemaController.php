<?php

namespace App\Controllers\Api\V1\Meta\DbSchema;

use App\Controllers\Api\V1\BaseResourceViewController;
use App\Services\V1\Meta\DbSchema\SchemaInspector;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Utilitario REST somente leitura para introspeccao do banco (grupo DB_GROUP_001).
 *
 * NAO segue o conjunto padrao de 18/9 rotas — e um desvio sancionado, como o
 * modulo Upload. Expoe apenas:
 *   GET db-schema/tables
 *   GET db-schema/columns/{tabela}
 *   GET db-schema/describe/{tabela}
 *
 * Estende BaseResourceViewController so para reaproveitar os helpers de
 * resposta (respondSuccess / respondNotFound / respondServerError) e o envelope
 * padrao. As 9 rotas de leitura da base NAO sao registradas para este grupo.
 *
 * Publico (sem JWT), como o restante da API. Ver nota de seguranca em
 * app/markdown/geral/README_modulo_db_schema.md.
 */
class SchemaController extends BaseResourceViewController
{
    private SchemaInspector $inspector;

    public function initController(
        RequestInterface $request,
        ResponseInterface $response,
        LoggerInterface $logger
    ): void {
        parent::initController($request, $response, $logger);
        $this->inspector = new SchemaInspector();
    }

    /**
     * GET db-schema/tables — lista tabelas e views do schema.
     */
    public function tables(): ResponseInterface
    {
        try {
            return $this->respondSuccess(
                $this->inspector->tables(),
                'Tabelas listadas com sucesso'
            );
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }

    /**
     * GET db-schema/columns/{tabela} — colunas de uma tabela da whitelist.
     */
    public function columns(string $table = ''): ResponseInterface
    {
        try {
            $columns = $this->inspector->columnsOf($table);

            if ($columns === null) {
                return $this->respondNotFound("Tabela '{$table}' nao encontrada no schema");
            }

            return $this->respondSuccess($columns, 'Colunas listadas com sucesso');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }

    /**
     * GET db-schema/describe/{tabela} — colunas + PK + FKs de uma tabela.
     */
    public function describe(string $table = ''): ResponseInterface
    {
        try {
            $meta = $this->inspector->describe($table);

            if ($meta === null) {
                return $this->respondNotFound("Tabela '{$table}' nao encontrada no schema");
            }

            return $this->respondSuccess($meta, 'Estrutura da tabela obtida com sucesso');
        } catch (\Throwable $e) {
            return $this->respondServerError($e);
        }
    }
}
