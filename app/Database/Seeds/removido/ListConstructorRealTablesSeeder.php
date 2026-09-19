<?php

namespace App\Database\Seeds;

use App\Models\V1\List\ListManager\SqlTableModel as ListManagerModel;
use App\Services\V1\List\ListActions\Processor as ActionsProcessor;
use App\Services\V1\List\ListColumns\Processor as ColumnsProcessor;
use App\Services\V1\List\ListManager\Processor as ManagerProcessor;
use CodeIgniter\Database\Seeder;
use RuntimeException;

/**
 * Seed do "Construtor de Listagens" — 8 exemplos de TABELAS REAIS deste
 * projeto (diferente de ListConstructorSeeder, cujo unico exemplo restante,
 * `user-manager`, ja existia antes deste seeder).
 *
 * Cada `list_manager` aqui aponta para um `api_get_endpoint` que funciona de
 * verdade neste projeto (sem 404, ao contrario dos exemplos removidos
 * `servidor-funcionario`/`calculo-diaria`, que eram inspiracao de outro
 * projeto sem backend aqui):
 *
 *   bootstrap-icons -> api/v1/bootstrap-icons (catalogo de icones)
 *   form-fields     -> api/v1/form-campos (tabela form_fields; rota ainda
 *                      form-campos, renomeacao Escopo B pendente — ver
 *                      README_form_builder.md)
 *   form-groups     -> api/v1/form-groups
 *   form-manager    -> api/v1/form-manager (unico com acao real: Editar ->
 *                      /v1/form-constructor/update/{id})
 *   form-rows       -> api/v1/form-rows
 *   list-actions    -> api/v1/list-actions
 *   list-columns    -> api/v1/list-columns
 *   list-manager    -> api/v1/list-manager (meta: lista a si mesmo)
 *
 * Idempotente: se o slug ja existe, faz delete-hard (CASCADE apaga as
 * colunas/acoes daquele manager) e recria do zero.
 *
 * Rodar:  podman compose exec php php spark db:seed ListConstructorRealTablesSeeder
 */
class ListConstructorRealTablesSeeder extends Seeder
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

            foreach ($item['columns'] as $column) {
                $this->criar(
                    $this->columnsProc,
                    ['list_manager_id' => $managerId] + $column,
                    "list_columns ({$item['manager']['slug']}.{$column['label']})"
                );
            }

            foreach ($item['actions'] as $action) {
                $this->criar(
                    $this->actionsProc,
                    ['list_manager_id' => $managerId] + $action,
                    "list_actions ({$item['manager']['slug']}.{$action['label']})"
                );
            }

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
            fwrite(STDOUT, "[ListConstructorRealTablesSeeder] {$msg}\n");
        }
        log_message('info', "[ListConstructorRealTablesSeeder] {$msg}");
    }

    // -------------------------------------------------------------------------
    // Blueprint — os 8 exemplos (manager + N colunas + 0..N acoes)
    // -------------------------------------------------------------------------

    /**
     * @return list<array<string, mixed>>
     */
    private function blueprint(): array
    {
        return [
            [
                'manager' => [
                    'slug' => 'bootstrap-icons',
                    'title' => 'Icones (Bootstrap Icons)',
                    'description' => 'Catalogo de icones do Bootstrap Icons, usado pelo IconSelect.',
                    'api_get_endpoint' => self::API . '/bootstrap-icons/get-all',
                    'api_search_endpoint' => self::API . '/bootstrap-icons/search',
                    'default_sort' => 'name',
                    'default_order' => 'asc',
                    'default_limit' => 20,
                    'limit_options_json' => [10, 20, 50, 100],
                    'version' => 1,
                ],
                'columns' => [
                    ['sort_order' => 1, 'label' => 'Nome', 'field_key' => 'name', 'sortable' => 1, 'sort_key' => 'name', 'visible' => 1],
                    ['sort_order' => 2, 'label' => 'Codepoint', 'field_key' => 'codepoint', 'format' => 'text', 'cell_class' => 'text-end', 'visible' => 1],
                    ['sort_order' => 3, 'label' => 'Favorito', 'field_key' => 'is_favorite', 'format' => 'text', 'cell_class' => 'text-center', 'visible' => 1],
                ],
                'actions' => [],
            ],

            [
                'manager' => [
                    'slug' => 'form-fields',
                    'title' => 'Campos de Formulario (form_fields)',
                    'description' => 'Um campo de uma linha do construtor de formularios. Rota ainda /api/v1/form-campos (renomeacao Escopo B pendente).',
                    'api_get_endpoint' => self::API . '/form-campos/get-all',
                    'api_search_endpoint' => self::API . '/form-campos/search',
                    'default_sort' => 'id',
                    'default_order' => 'desc',
                    'default_limit' => 20,
                    'limit_options_json' => [10, 20, 50, 100],
                    'version' => 1,
                ],
                'columns' => [
                    ['sort_order' => 1, 'label' => 'Rotulo', 'field_key' => 'label', 'visible' => 1],
                    ['sort_order' => 2, 'label' => 'Tipo', 'field_key' => 'field_type', 'sortable' => 1, 'sort_key' => 'field_type', 'visible' => 1],
                    ['sort_order' => 3, 'label' => 'Linha (form_row_id)', 'field_key' => 'form_row_id', 'cell_class' => 'text-end', 'visible' => 1],
                ],
                'actions' => [],
            ],

            [
                'manager' => [
                    'slug' => 'form-groups',
                    'title' => 'Grupos de Formulario (form_groups)',
                    'description' => 'Subgrupos de contexto de um formulario.',
                    'api_get_endpoint' => self::API . '/form-groups/get-all',
                    'api_search_endpoint' => self::API . '/form-groups/search',
                    'default_sort' => 'id',
                    'default_order' => 'desc',
                    'default_limit' => 20,
                    'limit_options_json' => [10, 20, 50, 100],
                    'version' => 1,
                ],
                'columns' => [
                    ['sort_order' => 1, 'label' => 'Titulo', 'field_key' => 'title', 'sortable' => 1, 'sort_key' => 'title', 'visible' => 1],
                    ['sort_order' => 2, 'label' => 'Slug', 'field_key' => 'slug', 'visible' => 1],
                    ['sort_order' => 3, 'label' => 'Formulario (form_manager_id)', 'field_key' => 'form_manager_id', 'cell_class' => 'text-end', 'visible' => 1],
                ],
                'actions' => [],
            ],

            [
                'manager' => [
                    'slug' => 'form-manager',
                    'title' => 'Formularios (form_manager)',
                    'description' => 'Raiz da arvore do construtor de formularios.',
                    'api_get_endpoint' => self::API . '/form-manager/get-all',
                    'api_search_endpoint' => self::API . '/form-manager/search',
                    'default_sort' => 'id',
                    'default_order' => 'desc',
                    'default_limit' => 20,
                    'limit_options_json' => [10, 20, 50, 100],
                    'version' => 1,
                ],
                'columns' => [
                    ['sort_order' => 1, 'label' => 'Titulo', 'field_key' => 'title', 'visible' => 1],
                    // format 'code'/'status-badge' -> tratamento especial cadastrado em
                    // ListConstructorPage.tsx (CUSTOM_CELL_RENDERERS), so pra este manager.
                    ['sort_order' => 2, 'label' => 'Slug', 'field_key' => 'slug', 'format' => 'code', 'sortable' => 1, 'sort_key' => 'slug', 'visible' => 1],
                    ['sort_order' => 3, 'label' => 'Status', 'field_key' => 'status', 'format' => 'status-badge', 'cell_class' => 'text-center', 'visible' => 1],
                ],
                'actions' => [
                    [
                        'sort_order' => 0,
                        'label' => 'Build',
                        // Nome puro (sem prefixo bi/fi) — contrato do IconSelect.
                        'icon' => 'eye',
                        'action_type' => 'link',
                        'href_template' => '/v1/form/{slug}',
                        'data_action' => 'build',
                        'confirm' => 0,
                    ],
                    [
                        'sort_order' => 1,
                        'label' => 'Editar',
                        'icon' => 'pencil-square',
                        'action_type' => 'link',
                        'href_template' => '/v1/form-constructor/update/{id}',
                        'data_action' => 'editar',
                        'confirm' => 0,
                    ],
                ],
            ],

            [
                'manager' => [
                    'slug' => 'form-rows',
                    'title' => 'Linhas de Formulario (form_rows)',
                    'description' => 'Linhas de um grupo do construtor de formularios.',
                    'api_get_endpoint' => self::API . '/form-rows/get-all',
                    'api_search_endpoint' => self::API . '/form-rows/search',
                    'default_sort' => 'id',
                    'default_order' => 'desc',
                    'default_limit' => 20,
                    'limit_options_json' => [10, 20, 50, 100],
                    'version' => 1,
                ],
                'columns' => [
                    ['sort_order' => 1, 'label' => 'Ordem', 'field_key' => 'sort_order', 'cell_class' => 'text-end', 'visible' => 1],
                    ['sort_order' => 2, 'label' => 'Gutter', 'field_key' => 'gutter', 'visible' => 1],
                    ['sort_order' => 3, 'label' => 'Grupo (form_group_id)', 'field_key' => 'form_group_id', 'cell_class' => 'text-end', 'visible' => 1],
                ],
                'actions' => [],
            ],

            [
                'manager' => [
                    'slug' => 'list-actions',
                    'title' => 'Acoes de Listagem (list_actions)',
                    'description' => 'Meta: as proprias acoes de linha do construtor de listas.',
                    'api_get_endpoint' => self::API . '/list-actions/get-all',
                    'api_search_endpoint' => self::API . '/list-actions/search',
                    'default_sort' => 'id',
                    'default_order' => 'desc',
                    'default_limit' => 20,
                    'limit_options_json' => [10, 20, 50, 100],
                    'version' => 1,
                ],
                'columns' => [
                    ['sort_order' => 1, 'label' => 'Rotulo', 'field_key' => 'label', 'visible' => 1],
                    ['sort_order' => 2, 'label' => 'Tipo', 'field_key' => 'action_type', 'sortable' => 1, 'sort_key' => 'action_type', 'visible' => 1],
                    ['sort_order' => 3, 'label' => 'Listagem (list_manager_id)', 'field_key' => 'list_manager_id', 'cell_class' => 'text-end', 'visible' => 1],
                ],
                'actions' => [],
            ],

            [
                'manager' => [
                    'slug' => 'list-columns',
                    'title' => 'Colunas de Listagem (list_columns)',
                    'description' => 'Meta: as proprias colunas de dados do construtor de listas.',
                    'api_get_endpoint' => self::API . '/list-columns/get-all',
                    'api_search_endpoint' => self::API . '/list-columns/search',
                    'default_sort' => 'id',
                    'default_order' => 'desc',
                    'default_limit' => 20,
                    'limit_options_json' => [10, 20, 50, 100],
                    'version' => 1,
                ],
                'columns' => [
                    ['sort_order' => 1, 'label' => 'Rotulo', 'field_key' => 'label', 'visible' => 1],
                    ['sort_order' => 2, 'label' => 'Campo', 'field_key' => 'field_key', 'visible' => 1],
                    ['sort_order' => 3, 'label' => 'Listagem (list_manager_id)', 'field_key' => 'list_manager_id', 'cell_class' => 'text-end', 'visible' => 1],
                ],
                'actions' => [],
            ],

            [
                'manager' => [
                    'slug' => 'list-manager',
                    'title' => 'Listagens (list_manager)',
                    'description' => 'Meta: a propria tabela raiz do construtor de listas, listando a si mesma.',
                    'api_get_endpoint' => self::API . '/list-manager/get-all',
                    'api_search_endpoint' => self::API . '/list-manager/search',
                    'default_sort' => 'id',
                    'default_order' => 'desc',
                    'default_limit' => 20,
                    'limit_options_json' => [10, 20, 50, 100],
                    'version' => 1,
                ],
                'columns' => [
                    ['sort_order' => 1, 'label' => 'Slug', 'field_key' => 'slug', 'sortable' => 1, 'sort_key' => 'slug', 'visible' => 1],
                    ['sort_order' => 2, 'label' => 'Titulo', 'field_key' => 'title', 'visible' => 1],
                    ['sort_order' => 3, 'label' => 'Status', 'field_key' => 'status', 'cell_class' => 'text-center', 'visible' => 1],
                ],
                'actions' => [],
            ],
        ];
    }
}
