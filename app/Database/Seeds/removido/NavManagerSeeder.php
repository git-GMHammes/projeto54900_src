<?php

namespace App\Database\Seeds;

use App\Models\V1\Nav\NavManager\SqlTableModel as NavManagerModel;
use App\Services\V1\Nav\NavManager\Processor as NavManagerProcessor;
use CodeIgniter\Database\Seeder;
use RuntimeException;

/**
 * Seed do Nav (config/branding do app/navbar).
 *
 * Cria (ou recria) o nav_manager de referencia do sistema, title 'Menu Teste',
 * usado por MenuManagerSeeder como pai de toda a arvore de itens de menu.
 *
 * Idempotente: se ja existe um nav com esse title, faz delete-hard (CASCADE
 * apaga todos os itens de menu_manager vinculados a ele) e recria do zero.
 *
 * Rodar:  podman compose exec php php spark db:seed NavManagerSeeder
 */
class NavManagerSeeder extends Seeder
{
    public const TITLE = 'Menu Teste';

    public function run(): void
    {
        $processor = new NavManagerProcessor();

        $this->limparExistente($processor);

        $res = $processor->create([
            'title' => self::TITLE,
            'system_version' => 'v1',
        ]);

        if (($res['success'] ?? false) !== true) {
            throw new RuntimeException('Seed abortado ao criar nav_manager: ' . ($res['message'] ?? 'erro desconhecido'));
        }

        $id = (int) $res['data']['id'];

        // status nasce 'draft' (default da coluna); deixa ativo para o front consumir.
        (new NavManagerModel())->update($id, ['status' => 'active']);

        $this->out("OK - nav_manager recriado (#{$id}, title='" . self::TITLE . "').");
    }

    private function limparExistente(NavManagerProcessor $processor): void
    {
        $row = (new NavManagerModel())
            ->withDeleted()
            ->where('title', self::TITLE)
            ->first();

        if ($row === null) {
            return;
        }

        $id = (int) $row['id'];
        $res = $processor->deleteHard($id);

        if (($res['success'] ?? false) !== true) {
            throw new RuntimeException("Falha ao limpar nav_manager #{$id}: " . ($res['message'] ?? 'desconhecida'));
        }

        $this->out("nav_manager anterior removido (#{$id}) - CASCADE apagou os itens de menu vinculados a ele.");
    }

    private function out(string $msg): void
    {
        if (is_cli()) {
            fwrite(STDOUT, "[NavManagerSeeder] {$msg}\n");
        }
        log_message('info', "[NavManagerSeeder] {$msg}");
    }
}
