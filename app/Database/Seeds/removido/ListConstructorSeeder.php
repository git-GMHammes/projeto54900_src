<?php

namespace App\Database\Seeds;

use App\Models\V1\List\ListManager\SqlTableModel as ListManagerModel;
use App\Services\V1\List\ListActions\Processor as ActionsProcessor;
use App\Services\V1\List\ListColumns\Processor as ColumnsProcessor;
use App\Services\V1\List\ListManager\Processor as ManagerProcessor;
use CodeIgniter\Database\Seeder;
use RuntimeException;

/**
 * Seed do "Construtor de Listagens".
 *
 * Popula, usando os Processors do modulo List (mesmo caminho das APIs), o
 * list_manager de exemplo `user-manager` — format/fallback simples +
 * extra_data_json (confirm de exclusao) — com 1 list_columns e 1 list_actions.
 *
 * Os exemplos `servidor-funcionario`/`calculo-diaria` (inspiracao de outro
 * projeto, sem API real neste) foram removidos deste blueprint e tiveram seus
 * registros excluidos logicamente (deleteSoft) — ver
 * README_list_constructor.md. Exemplos de tabelas REAIS deste projeto
 * (bootstrap_icons, form_*, list_*) estao em ListConstructorRealTablesSeeder.
 *
 * Idempotente: se o slug ja existe, faz delete-hard (CASCADE apaga a coluna e
 * a acao daquele manager) e recria do zero.
 *
 * Rodar:  podman compose exec php php spark db:seed ListConstructorSeeder
 */
class ListConstructorSeeder extends Seeder
{
    private ManagerProcessor $managerProc;
    private ColumnsProcessor $columnsProc;
    private ActionsProcessor $actionsProc;

    private const API = '/api/v1';

    public function run(): void
    {
        $this->managerProc = new ManagerProcessor();
        $this->columnsProc = new ColumnsProcessor();
        $this->actionsProc = new ActionsProcessor();

        foreach ($this->blueprint() as $item) {
            $this->limparExistente($item['manager']['slug']);

            $managerId = $this->criar($this->managerProc, $item['manager'], "list_manager ({$item['manager']['slug']})");

            // status nasce 'draft'; deixa ativo para o front listar.
            (new ListManagerModel())->update($managerId, ['status' => 'active']);

            $this->criar(
                $this->columnsProc,
                ['list_manager_id' => $managerId] + $item['column'],
                "list_columns ({$item['manager']['slug']})"
            );

            $this->criar(
                $this->actionsProc,
                ['list_manager_id' => $managerId] + $item['action'],
                "list_actions ({$item['manager']['slug']})"
            );

            $this->out("OK — {$item['manager']['slug']} recriado (manager #{$managerId}).");
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function limparExistente(string $slug): void
    {
        $row = (new ListManagerModel())
            ->withDeleted()
            ->where('slug', $slug)
            ->first();

        if ($row === null) {
            return;
        }

        $id = (int) $row['id'];
        $res = $this->managerProc->deleteHard($id);

        if (($res['success'] ?? false) !== true) {
            throw new RuntimeException("Falha ao limpar {$slug} #{$id}: " . ($res['message'] ?? 'desconhecida'));
        }

        $this->out("{$slug} anterior removido (#{$id}).");
    }

    /**
     * @param array<string, mixed> $data
     */
    private function criar(object $processor, array $data, string $ctx): int
    {
        $res = $processor->create($data);

        if (($res['success'] ?? false) !== true) {
            throw new RuntimeException(
                "Seed abortado em {$ctx}: " . ($res['message'] ?? 'erro desconhecido')
                . ' (code ' . ($res['code'] ?? '?') . ')'
            );
        }

        return (int) $res['data']['id'];
    }

    private function out(string $msg): void
    {
        if (is_cli()) {
            fwrite(STDOUT, "[ListConstructorSeeder] {$msg}\n");
        }
        log_message('info', "[ListConstructorSeeder] {$msg}");
    }

    // -------------------------------------------------------------------------
    // Blueprint — os 3 exemplos (manager + 1 coluna + 1 acao cada)
    // -------------------------------------------------------------------------

    /**
     * @return list<array<string, mixed>>
     */
    private function blueprint(): array
    {
        return [
            // ================================================================
            // user-manager — format/fallback simples + extra_data_json
            // ================================================================
            [
                'manager' => [
                    'slug' => 'user-manager',
                    'title' => 'Usuarios',
                    'description' => 'Listagem de usuarios do sistema (modulo User/UserManager).',
                    'api_get_endpoint' => self::API . '/user-manager/get-all',
                    'api_search_endpoint' => self::API . '/user-manager/search',
                    'roles' => '["admin"]',
                    'default_sort' => 'id',
                    'default_order' => 'desc',
                    'default_limit' => 20,
                    'limit_options_json' => [10, 20, 50, 100],
                    'version' => 1,
                ],
                'column' => [
                    'sort_order' => 1,
                    'label' => 'Usuario',
                    'field_key' => 'username',
                    'format' => 'text',
                    'cell_class' => 'text-nowrap',
                    'fallback' => '—',
                    'sortable' => 1,
                    'sort_key' => 'username',
                    'visible' => 1,
                ],
                'action' => [
                    'sort_order' => 1,
                    'label' => 'Editar',
                    // 'pencil-square' — nome puro, sem prefixo bi/fi (contrato
                    // do IconSelect, ver src/components/ui/IconSelect).
                    'icon' => 'pencil-square',
                    'action_type' => 'link',
                    // update/{id}, nao {id}/update — corrigido 2026-09-15 pra
                    // bater com a rota real (routes/v1/user.routes.tsx) e o
                    // padrao ja usado em form-constructor/list-constructor.
                    'href_template' => '/v1/user-manager/update/{id}',
                    'data_action' => 'editar',
                    'confirm' => 0,
                    'extra_data_json' => [
                        ['name' => 'usuario', 'key' => 'username', 'fallback' => ''],
                    ],
                    'roles' => '["admin"]',
                ],
            ],
        ];
    }
}
