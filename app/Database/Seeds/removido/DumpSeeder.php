<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use RuntimeException;

/**
 * Restaura o snapshot de dados de 202609161351_seed.sql (dump completo,
 * copiado para dentro de Database/Seeds/ porque o container PHP so monta
 * ./src — doc/ nao existe dentro do container).
 *
 * O arquivo tem bootstrap_icons tambem, mas essa tabela ja tem seeder
 * proprio (BootstrapIconsSeeder, que le de public/bootstrap-icons.json em
 * vez de SQL cru) — o bloco bootstrap_icons do arquivo e extraido junto com
 * os outros, mas simplesmente nao entra em ORDER, entao nunca e executado.
 *
 * Cada bloco `REPLACE INTO \`tabela\`` do arquivo e extraido pelo inicio de
 * linha (sem depender de contar ';' — colunas de texto livre podem conter
 * ');' sem quebrar o corte) e executado na ordem de dependencia de FK:
 *   form_manager -> form_groups -> form_rows -> form_fields
 *   list_manager -> list_columns -> list_actions
 *   nav_manager -> menu_manager
 *   route_manager
 *   user_roles
 *
 * FOREIGN_KEY_CHECKS fica desligado durante a execucao (mesma protecao que
 * o dump original ja usava), religado no final mesmo se algum bloco falhar.
 *
 * Idempotente: REPLACE INTO com id explicito (substitui a linha existente).
 *
 * Rodar:  podman exec codeigniter54900_php php spark db:seed DumpSeeder
 */
class DumpSeeder extends Seeder
{
    private const DATA_FILE = APPPATH . 'Database/Seeds/202609161351_seed.sql';

    private const ORDER = [
        'form_manager',
        'form_groups',
        'form_rows',
        'form_fields',
        'list_manager',
        'list_columns',
        'list_actions',
        'nav_manager',
        'menu_manager',
        'route_manager',
        'user_roles',
    ];

    public function run(): void
    {
        $blocks = $this->extractBlocks($this->lerArquivo());

        foreach (self::ORDER as $table) {
            if (! isset($blocks[$table])) {
                throw new RuntimeException("Bloco REPLACE INTO nao encontrado para `{$table}` em " . self::DATA_FILE);
            }
        }

        $this->db->query('SET FOREIGN_KEY_CHECKS = 0');

        try {
            foreach (self::ORDER as $table) {
                $this->db->query($blocks[$table]);
                $linhas = $this->db->affectedRows();
                echo sprintf("DumpSeeder: %-15s %d linha(s)\n", $table, $linhas);
            }
        } finally {
            $this->db->query('SET FOREIGN_KEY_CHECKS = 1');
        }
    }

    private function lerArquivo(): string
    {
        if (! is_file(self::DATA_FILE) || ! is_readable(self::DATA_FILE)) {
            throw new RuntimeException('Arquivo de dados nao encontrado: ' . self::DATA_FILE);
        }

        $conteudo = file_get_contents(self::DATA_FILE);
        if ($conteudo === false || $conteudo === '') {
            throw new RuntimeException('Nao foi possivel ler ' . self::DATA_FILE);
        }

        return $conteudo;
    }

    /**
     * Separa o arquivo em blocos por tabela, usando o inicio de linha
     * "REPLACE INTO `tabela`" como delimitador — cada bloco vai desse ponto
     * ate o inicio do proximo (ou o fim do arquivo), incluindo o ';' final.
     *
     * @return array<string, string> tabela => statement REPLACE INTO completo
     */
    private function extractBlocks(string $sql): array
    {
        preg_match_all('/^REPLACE INTO `(\w+)`/m', $sql, $matches, PREG_OFFSET_CAPTURE);

        $tableNames = $matches[1];
        $starts     = $matches[0];
        $total      = count($starts);

        if ($total === 0) {
            throw new RuntimeException('Nenhum bloco REPLACE INTO encontrado em ' . self::DATA_FILE);
        }

        $blocks = [];
        for ($i = 0; $i < $total; $i++) {
            $table = $tableNames[$i][0];
            $begin = $starts[$i][1];
            $end   = $i + 1 < $total ? $starts[$i + 1][1] : strlen($sql);

            $trecho = substr($sql, $begin, $end - $begin);

            // O ultimo bloco do arquivo nao tem outro "REPLACE INTO" depois
            // pra delimitar o fim — vai ate o fim do arquivo, que no dump
            // completo inclui o rodape "/*!...*/;" de restauracao de SET.
            // Corta ali se existir, senao a query vira varios statements
            // colados (mysqli::query() so roda o primeiro e falha os outros).
            if (preg_match('/^\/\*!/m', $trecho, $rodape, PREG_OFFSET_CAPTURE)) {
                $trecho = substr($trecho, 0, $rodape[0][1]);
            }

            $blocks[$table] = rtrim($trecho);
        }

        return $blocks;
    }
}
