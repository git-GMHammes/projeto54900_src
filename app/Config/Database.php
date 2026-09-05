<?php

namespace Config;

use CodeIgniter\Database\Config;

/**
 * Database Configuration
 *
 * ATENCAO: este sistema NAO utiliza a conexao "default".
 * Cada modulo do sistema possui o seu proprio grupo de conexao, dedicado a um
 * database especifico neste servidor MySQL. Todo acesso a banco DEVE nomear o
 * grupo explicitamente (db_connect('mapa'), $model->DBGroup = 'agenda', etc.).
 *
 * Para adicionar um novo modulo/conexao (ver src/app/CLAUDE.md):
 *   1. Acrescente uma linha em $modules: 'novo_modulo' => 'projeto54900_novo'.
 *   2. Declare a propriedade publica: public array $novo_modulo = [];
 *   3. Crie o database no servidor (docker/mysql/init.sql em desenvolvimento).
 * O construtor preenche o grupo automaticamente a partir de $modules.
 */
class Database extends Config
{
    /**
     * The directory that holds the Migrations and Seeds directories.
     */
    public string $filesPath = APPPATH . 'Database' . DIRECTORY_SEPARATOR;

    /**
     * O framework exige um defaultGroup valido. Apontamos para o primeiro
     * modulo apenas por formalidade; nenhum codigo deve conectar sem informar
     * o grupo. Em ambiente de testes o construtor troca para 'tests'.
     */
    public string $defaultGroup = 'mapa';

    /**
     * Mapa dos modulos do sistema => nome do database no servidor MySQL.
     * Todos os grupos compartilham host/porta/usuario/senha (via .env / env());
     * o que muda entre eles e o database.
     *
     * @var array<string, string>
     */
    private array $modules = [
        'mapa'   => 'projeto54900_mapa',
        'agenda' => 'projeto54900_agenda',
        'chat'   => 'projeto54900_chat',
    ];

    // --- Grupos por modulo (preenchidos no construtor a partir de $modules) ---

    /** @var array<string, mixed> */
    public array $mapa = [];

    /** @var array<string, mixed> */
    public array $agenda = [];

    /** @var array<string, mixed> */
    public array $chat = [];

    /**
     * This database connection is used when running PHPUnit database tests.
     *
     * @var array<string, mixed>
     */
    public array $tests = [
        'DSN'         => '',
        'hostname'    => '127.0.0.1',
        'username'    => '',
        'password'    => '',
        'database'    => ':memory:',
        'DBDriver'    => 'SQLite3',
        'DBPrefix'    => 'db_',  // Needed to ensure we're working correctly with prefixes live. DO NOT REMOVE FOR CI DEVS
        'pConnect'    => false,
        'DBDebug'     => true,
        'charset'     => 'utf8',
        'DBCollat'    => '',
        'swapPre'     => '',
        'encrypt'     => false,
        'compress'    => false,
        'strictOn'    => true,
        'failover'    => [],
        'port'        => 3306,
        'foreignKeys' => true,
        'busyTimeout' => 1000,
        'synchronous' => null,
        'dateFormat'  => [
            'date'     => 'Y-m-d',
            'datetime' => 'Y-m-d H:i:s',
            'time'     => 'H:i:s',
        ],
    ];

    public function __construct()
    {
        parent::__construct();

        // Preenche um grupo de conexao para cada modulo registrado.
        foreach ($this->modules as $group => $database) {
            $this->{$group} = $this->buildGroup($database);
        }

        // Ensure that we always set the database group to 'tests' if
        // we are currently running an automated test suite, so that
        // we don't overwrite live data on accident.
        if (ENVIRONMENT === 'testing') {
            $this->defaultGroup = 'tests';
        }
    }

    // --- Credenciais compartilhadas por todos os grupos/modulos ---
    // Explicitas aqui por decisao do projeto. Somente o "database" varia por modulo.
    private const DB_HOSTNAME = 'mysql';
    private const DB_PORT     = 3306;
    private const DB_USERNAME = 'codeigniter54900_user';
    private const DB_PASSWORD = 'codeigniter54900_P@ssw0rd_2024';
    private const DB_DRIVER   = 'MySQLi';

    /**
     * Monta a configuracao de um grupo de conexao. Host/porta/usuario/senha sao
     * os mesmos para todos os modulos; muda apenas o "database".
     *
     * @return array<string, mixed>
     */
    private function buildGroup(string $database): array
    {
        return [
            'DSN'          => '',
            'hostname'     => self::DB_HOSTNAME,
            'username'     => self::DB_USERNAME,
            'password'     => self::DB_PASSWORD,
            'database'     => $database,
            'DBDriver'     => self::DB_DRIVER,
            'DBPrefix'     => '',
            'pConnect'     => false,
            'DBDebug'      => (ENVIRONMENT !== 'production'),
            'charset'      => 'utf8mb4',
            'DBCollat'     => 'utf8mb4_general_ci',
            'swapPre'      => '',
            'encrypt'      => false,
            'compress'     => false,
            'strictOn'     => false,
            'failover'     => [],
            'port'         => self::DB_PORT,
            'numberNative' => false,
            'foundRows'    => false,
            'dateFormat'   => [
                'date'     => 'Y-m-d',
                'datetime' => 'Y-m-d H:i:s',
                'time'     => 'H:i:s',
            ],
        ];
    }
}
