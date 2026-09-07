<?php

namespace App\Services\V1\Meta\DbSchema;

use CodeIgniter\Database\BaseConnection;
use Config\Database;

/**
 * Introspeccao do banco da API V1 (grupo DB_GROUP_001).
 *
 * Le INFORMATION_SCHEMA para listar tabelas/views e as colunas de cada uma —
 * usado pelo construtor de formularios para oferecer, nos selects, apenas
 * nomes de coluna que existem de fato.
 *
 * Seguranca: todo nome de tabela recebido de fora e validado contra
 * $db->listTables() (whitelist) ANTES de qualquer query; as consultas ao
 * INFORMATION_SCHEMA sempre usam bind. Nada e concatenado.
 */
class SchemaInspector
{
    private BaseConnection $db;
    private string $schema;

    /** @var list<string>|null cache da whitelist */
    private ?array $tableNames = null;

    public function __construct()
    {
        $this->db     = Database::connect(DB_GROUP_001);
        $this->schema = (string) $this->db->getDatabase();
    }

    /**
     * Nomes de tabela/view existentes — a whitelist.
     *
     * @return list<string>
     */
    public function tableNames(): array
    {
        if ($this->tableNames === null) {
            $this->tableNames = array_values(array_map('strval', $this->db->listTables()));
        }

        return $this->tableNames;
    }

    public function isKnownTable(string $table): bool
    {
        return \in_array($table, $this->tableNames(), true);
    }

    /**
     * Lista tabelas e views do schema com metadados basicos.
     *
     * @return list<array<string, mixed>>
     */
    public function tables(): array
    {
        $rows = $this->db->query(
            'SELECT TABLE_NAME, TABLE_TYPE, ENGINE, TABLE_ROWS, TABLE_COMMENT
               FROM INFORMATION_SCHEMA.TABLES
              WHERE TABLE_SCHEMA = ?
           ORDER BY TABLE_TYPE, TABLE_NAME',
            [$this->schema]
        )->getResultArray();

        return array_map(static function (array $r): array {
            return [
                'name'           => (string) $r['TABLE_NAME'],
                'type'           => ($r['TABLE_TYPE'] ?? '') === 'VIEW' ? 'view' : 'table',
                'engine'         => $r['ENGINE'] !== null ? (string) $r['ENGINE'] : null,
                'rows_estimate'  => $r['TABLE_ROWS'] !== null ? (int) $r['TABLE_ROWS'] : null,
                'comment'        => $r['TABLE_COMMENT'] !== null && $r['TABLE_COMMENT'] !== ''
                    ? (string) $r['TABLE_COMMENT']
                    : null,
            ];
        }, $rows);
    }

    /**
     * Colunas de uma tabela da whitelist. Retorna null se a tabela nao existe.
     *
     * @return list<array<string, mixed>>|null
     */
    public function columnsOf(string $table): ?array
    {
        if (!$this->isKnownTable($table)) {
            return null;
        }

        $rows = $this->db->query(
            'SELECT COLUMN_NAME, ORDINAL_POSITION, COLUMN_DEFAULT, IS_NULLABLE, DATA_TYPE,
                    CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE,
                    COLUMN_TYPE, COLUMN_KEY, EXTRA, COLUMN_COMMENT
               FROM INFORMATION_SCHEMA.COLUMNS
              WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
           ORDER BY ORDINAL_POSITION',
            [$this->schema, $table]
        )->getResultArray();

        return array_map(function (array $r): array {
            $dataType   = strtolower((string) $r['DATA_TYPE']);
            $columnType = (string) $r['COLUMN_TYPE'];

            return [
                'name'              => (string) $r['COLUMN_NAME'],
                'position'          => (int) $r['ORDINAL_POSITION'],
                'data_type'         => $dataType,
                'column_type'       => $columnType,
                'nullable'          => ($r['IS_NULLABLE'] ?? 'NO') === 'YES',
                'default'           => $r['COLUMN_DEFAULT'] !== null ? (string) $r['COLUMN_DEFAULT'] : null,
                'key'               => $r['COLUMN_KEY'] !== null && $r['COLUMN_KEY'] !== ''
                    ? (string) $r['COLUMN_KEY']
                    : null,
                'extra'             => $r['EXTRA'] !== null && $r['EXTRA'] !== '' ? (string) $r['EXTRA'] : null,
                'char_max_length'   => $r['CHARACTER_MAXIMUM_LENGTH'] !== null
                    ? (int) $r['CHARACTER_MAXIMUM_LENGTH']
                    : null,
                'numeric_precision' => $r['NUMERIC_PRECISION'] !== null ? (int) $r['NUMERIC_PRECISION'] : null,
                'numeric_scale'     => $r['NUMERIC_SCALE'] !== null ? (int) $r['NUMERIC_SCALE'] : null,
                'enum_values'       => $this->parseEnumValues($dataType, $columnType),
                'comment'           => $r['COLUMN_COMMENT'] !== null && $r['COLUMN_COMMENT'] !== ''
                    ? (string) $r['COLUMN_COMMENT']
                    : null,
            ];
        }, $rows);
    }

    /**
     * Colunas + chave primaria + chaves estrangeiras de uma tabela da whitelist.
     *
     * @return array<string, mixed>|null
     */
    public function describe(string $table): ?array
    {
        $columns = $this->columnsOf($table);
        if ($columns === null) {
            return null;
        }

        $primaryKey = array_values(array_map(
            static fn (array $c): string => (string) $c['name'],
            array_filter($columns, static fn (array $c): bool => $c['key'] === 'PRI')
        ));

        $fkRows = $this->db->query(
            'SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME, CONSTRAINT_NAME
               FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
              WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL
           ORDER BY CONSTRAINT_NAME, ORDINAL_POSITION',
            [$this->schema, $table]
        )->getResultArray();

        $foreignKeys = array_map(static function (array $r): array {
            return [
                'column'            => (string) $r['COLUMN_NAME'],
                'references_table'  => (string) $r['REFERENCED_TABLE_NAME'],
                'references_column' => (string) $r['REFERENCED_COLUMN_NAME'],
                'constraint'        => (string) $r['CONSTRAINT_NAME'],
            ];
        }, $fkRows);

        return [
            'table'        => $table,
            'schema'       => $this->schema,
            'primary_key'  => $primaryKey,
            'foreign_keys' => $foreignKeys,
            'columns'      => $columns,
        ];
    }

    /**
     * Extrai a lista de valores de um ENUM/SET a partir do COLUMN_TYPE
     * (ex.: "enum('a','b','c')" -> ['a','b','c']).
     *
     * @return list<string>|null
     */
    private function parseEnumValues(string $dataType, string $columnType): ?array
    {
        if ($dataType !== 'enum' && $dataType !== 'set') {
            return null;
        }

        if (preg_match('/^(?:enum|set)\((.*)\)$/i', $columnType, $m) !== 1) {
            return null;
        }

        $parsed = str_getcsv($m[1], ',', "'", '\\');

        return array_values(array_map(static fn ($v): string => (string) $v, $parsed));
    }
}
