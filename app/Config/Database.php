<?php

namespace Config;

use CodeIgniter\Database\Config;

/**
 * Database Configuration
 *
 * Conexao "default": banco compartilhado do projeto (codeigniter54900_db).
 * Credenciais vindas do ambiente do container (chaves DB_* no docker-compose.yml,
 * servico php), lidas via env(). E o grupo usado por 'spark migrate' sem
 * --group e por qualquer acesso que nao nomeie o grupo.
 *
 * Alem dela, cada modulo tem o seu proprio grupo de conexao, dedicado a um
 * database especifico neste mesmo servidor MySQL (db_connect('mapa'),
 * $model->DBGroup = 'agenda', etc.). Esses grupos compartilham host/usuario/
 * senha com a conexao "default" (mesmas chaves DB_* do ambiente, via env()
 * em buildGroup()); muda apenas o nome do database.
 *
 * Para adicionar um novo modulo/conexao (ver src/app/CLAUDE.md):
 *   1. Acrescente uma linha em $modules: 'novo_modulo' => 'projeto54900_novo'.
 *   2. Declare a propriedade publica: public array $novo_modulo = [];
 *   3. Crie o database no servidor (docker/mysql/init.sql em desenvolvimento).
 * O construtor preenche os grupos de modulo automaticamente a partir de $modules.
 */
class Database extends Config
{
    /**
     * The directory that holds the Migrations and Seeds directories.
     */
    public string $filesPath = APPPATH . 'Database' . DIRECTORY_SEPARATOR;

    /**
     * Grupo usado quando nenhum outro e informado, inclusive por
     * 'spark migrate' sem --group. Aponta para 'default' => codeigniter54900_db.
     * Em ambiente de testes o construtor troca para 'tests'.
     */
    public string $defaultGroup = 'default';

    /**
     * Conexao "default" => banco codeigniter54900_db. Preenchida no construtor
     * por buildGroup(), a partir das chaves DB_* do ambiente.
     *
     * @var array<string, mixed>
     */
    public array $default = [];

    /**
     * Grupo nomeado da API V1 (constante DB_GROUP_001). Aponta hoje para o
     * mesmo banco compartilhado codeigniter54900_db da conexao "default",
     * lendo as chaves DB_* do ambiente do container (via buildGroup()).
     * Os models da API V1 declaram `protected $DBGroup = DB_GROUP_001;` e nao
     * precisam saber de onde vem a credencial. Bancos futuros ganham
     * DB_GROUP_002... com o seu proprio array publico.
     *
     * @var array<string, mixed>
     */
    public array $codeigniter54900_mysql = [];

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

        // Conexao "default": banco compartilhado codeigniter54900_db, com
        // credenciais vindas do ambiente do container (DB_* no docker-compose.yml).
        $this->default = $this->buildGroup((string) env('DB_DATABASE', ''));

        // Grupo nomeado da API V1 (DB_GROUP_001). Hoje = mesmo banco da
        // conexao "default"; quando houver bancos dedicados, trocar por
        // $this->buildGroup('projeto54900_xxx').
        $this->codeigniter54900_mysql = $this->buildGroup((string) env('DB_DATABASE', ''));

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

    /**
     * Monta a configuracao de um grupo de conexao. Host/porta/usuario/senha vem
     * sempre do ambiente do container (DB_* no docker-compose.yml, servico php),
     * sem fallback com valor real — nunca hardcoded no codigo-fonte versionado.
     * Muda apenas o "database" entre os grupos.
     *
     * @return array<string, mixed>
     */
    private function buildGroup(string $database): array
    {
        return [
            'DSN'          => '',
            'hostname'     => (string) env('DB_HOST', ''),
            'username'     => (string) env('DB_USERNAME', ''),
            'password'     => (string) env('DB_PASSWORD', ''),
            'database'     => $database,
            'DBDriver'     => 'MySQLi',
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
            'port'         => (int) env('DB_PORT', 3306),
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
