<?php

namespace App\Database\Seeds;

use App\Models\V1\Form\FormManager\SqlTableModel as FormManagerModel;
use App\Services\V1\Form\FormCampos\Processor as CamposProcessor;
use App\Services\V1\Form\FormGroups\Processor as GroupsProcessor;
use App\Services\V1\Form\FormManager\Processor as ManagerProcessor;
use App\Services\V1\Form\FormRows\Processor as RowsProcessor;
use CodeIgniter\Database\Seeder;
use RuntimeException;

/**
 * Seed do "Construtor de Formularios".
 *
 * Popula, usando os Processors do modulo Form (mesmo caminho das APIs), um
 * form_manager de slug 'form-constructor' cuja arvore (4 grupos -> linhas ->
 * campos) descreve a propria UI de criar formularios:
 *
 *   grupo 'formulario' -> campos de form_manager  (POST /api/v1/form-manager/create)
 *   grupo 'grupos'     -> campos de form_groups   (POST /api/v1/form-groups/create)
 *   grupo 'linhas'     -> campos de form_rows     (POST /api/v1/form-rows/create)
 *   grupo 'campos'     -> campos de form_fields   (POST /api/v1/form-campos/create)
 *
 * O frontend le a view view_form_manager e renderiza com <FormGrid>, com
 * aparencia equivalente a src/public/form_test.html.
 *
 * Idempotente: se o slug ja existe, faz delete-hard (CASCADE apaga grupos,
 * linhas e campos) e recria do zero.
 *
 * Rodar:  podman compose exec php php spark db:seed FormConstructorSeeder
 */
class FormConstructorSeeder extends Seeder
{
    private ManagerProcessor $managerProc;
    private GroupsProcessor $groupsProc;
    private RowsProcessor $rowsProc;
    private CamposProcessor $camposProc;

    private const API = '/api/v1';

    public function run(): void
    {
        $this->managerProc = new ManagerProcessor();
        $this->groupsProc = new GroupsProcessor();
        $this->rowsProc = new RowsProcessor();
        $this->camposProc = new CamposProcessor();

        $this->limparExistente('form-constructor');

        $managerId = $this->criar($this->managerProc, [
            'slug' => 'form-constructor',
            'title' => 'Construtor de Formularios',
            'description' => 'Meta-formulario: cada grupo abaixo define os campos de uma das quatro tabelas do modulo Form. Preencha de cima para baixo — o formulario alimenta o grupo, o grupo alimenta a linha, a linha alimenta o campo.',
            'roles' => 'admin',
            'react_route' => '/v1/form-constructor',
            'submit_endpoint' => self::API . '/form-manager/create',
            'http_method' => 'POST',
            'version' => 1,
        ], 'form_manager (form-constructor)');

        // status nasce 'draft'; deixa ativo para o front listar.
        (new FormManagerModel())->update($managerId, ['status' => 'active']);

        foreach ($this->blueprint() as $gOrder => $group) {
            $groupId = $this->criar($this->groupsProc, [
                'form_manager_id' => $managerId,
                'title' => $group['title'],
                'slug' => $group['slug'],
                'description' => $group['description'] ?? null,
                'icon' => $group['icon'] ?? null,
                'sort_order' => $gOrder + 1,
                'collapsed' => 0,
            ], "form_groups ({$group['slug']})");

            foreach ($group['rows'] as $rOrder => $row) {
                $rowId = $this->criar($this->rowsProc, [
                    'form_group_id' => $groupId,
                    'sort_order' => $rOrder + 1,
                    'gutter' => $row['gutter'] ?? 'g-3',
                ], "form_rows ({$group['slug']} #" . ($rOrder + 1) . ')');

                foreach ($row['campos'] as $cOrder => $campo) {
                    $this->criar(
                        $this->camposProc,
                        $this->normalizarCampo($campo, $rowId, $cOrder + 1, $group['slug']),
                        "form_fields ({$group['slug']}.{$campo['field_name']})"
                    );
                }
            }
        }

        $this->out("OK — form-constructor recriado (manager #{$managerId}).");
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function limparExistente(string $slug): void
    {
        $row = (new FormManagerModel())
            ->withDeleted()
            ->where('slug', $slug)
            ->first();

        if ($row === null) {
            return;
        }

        $id = (int) $row['id'];
        $res = $this->managerProc->deleteHard($id);

        if (($res['success'] ?? false) !== true) {
            throw new RuntimeException("Falha ao limpar form-constructor #{$id}: " . ($res['message'] ?? 'desconhecida'));
        }

        $this->out("form-constructor anterior removido (#{$id}).");
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

    /**
     * Preenche os defaults de um campo declarado de forma compacta no blueprint.
     *
     * @param array<string, mixed> $campo
     * @return array<string, mixed>
     */
    private function normalizarCampo(array $campo, int $rowId, int $sort, string $groupSlug): array
    {
        $out = [
            'form_row_id' => $rowId,
            'sort_order' => $sort,
            'field_type' => $campo['field_type'] ?? 'text',
            'col' => $campo['col'] ?? 12,
            'label' => $campo['label'] ?? null,
            'field_name' => $campo['field_name'],
            'field_key' => 'fc_' . $groupSlug . '_' . $campo['field_name'],
        ];

        foreach ([
            'placeholder',
            'default_value',
            'help_text',
            'required',
            'disabled',
            'read_only',
            'is_hidden',
            'max_length',
            'min_length',
            'pattern',
            'input_mode',
            'autocomplete',
            'no_numbers',
            'no_letters',
            'no_special_chars',
            'strong_password',
            'double_field',
            'with_seconds',
            'show_counter',
            'inline',
            'rows_qty',
            'min_date',
            'max_date',
            'options_json',
            'datalist_json',
            'allowed_domains_json',
            'select_config_json',
            'style_json',
            'attributes_json',
        ] as $key) {
            if (\array_key_exists($key, $campo)) {
                $out[$key] = $campo[$key];
            }
        }

        return $out;
    }

    private function out(string $msg): void
    {
        if (is_cli()) {
            fwrite(STDOUT, "[FormConstructorSeeder] {$msg}\n");
        }
        log_message('info', "[FormConstructorSeeder] {$msg}");
    }

    // -------------------------------------------------------------------------
    // Blueprint — os 4 grupos, suas linhas e campos
    // -------------------------------------------------------------------------

    /** Opcoes reutilizadas. */
    private function optSelect(string $src, string $labelTemplate): array
    {
        return ['src' => self::API . $src, 'valueKey' => 'id', 'labelTemplate' => $labelTemplate];
    }

    private function opcoes(array $pares): array
    {
        $out = [];
        foreach ($pares as $value => $label) {
            $out[] = ['id' => 'opt_' . $value, 'value' => (string) $value, 'label' => (string) $label];
        }

        return $out;
    }

    private function flag(string $name, string $label, int $col = 3): array
    {
        return [
            'field_type' => 'checkbox',
            'col' => $col,
            'label' => $label,
            'field_name' => $name,
            'inline' => 0,
            'options_json' => [['id' => 'ck_' . $name, 'value' => '1', 'label' => 'Sim']],
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function blueprint(): array
    {
        $tipos = $this->opcoes([
            'text' => 'text',
            'password' => 'password',
            'email' => 'email',
            'textarea' => 'textarea',
            'senha' => 'senha',
            'select' => 'select',
            'radio' => 'radio',
            'checkbox' => 'checkbox',
            'cpf' => 'cpf',
            'cnpj' => 'cnpj',
            'phone' => 'phone',
            'cep' => 'cep',
            'data' => 'data',
            'hora' => 'hora',
            'moeda' => 'moeda',
            'pis' => 'pis',
            'placa' => 'placa',
            'titulo' => 'titulo',
            'cnh' => 'cnh',
            'processo' => 'processo',
            'renavam' => 'renavam',
            'sei' => 'sei',
        ]);

        $cols = $this->opcoes(array_combine(range(1, 12), range(1, 12)));

        $inputModes = $this->opcoes([
            'text' => 'text',
            'numeric' => 'numeric',
            'decimal' => 'decimal',
            'email' => 'email',
            'tel' => 'tel',
            'url' => 'url',
            'search' => 'search',
            'none' => 'none',
        ]);

        return [
            // ================================================================
            // Grupo 1 — Formulario (form_manager)
            // ================================================================
            [
                'slug' => 'formulario',
                'title' => 'Formulario (form_manager)',
                'icon' => 'ui-checks-grid',
                'description' => 'Dados do formulario: slug, rota React, grupo de perfil, status.',
                'rows' => [
                    [
                        'campos' => [
                            ['col' => 6, 'label' => 'Slug', 'field_name' => 'slug', 'required' => 1, 'placeholder' => 'kebab-case', 'pattern' => '^[a-z0-9]+(?:-[a-z0-9]+)*$', 'help_text' => 'Identificador estavel, unico. Ex: cadastro-funcionario.'],
                            ['col' => 6, 'label' => 'Titulo exibido', 'field_name' => 'title', 'placeholder' => 'Cabecalho no topo do formulario'],
                        ]
                    ],
                    [
                        'campos' => [
                            ['field_type' => 'textarea', 'col' => 12, 'label' => 'Descricao', 'field_name' => 'description', 'rows_qty' => 3, 'max_length' => 1000, 'show_counter' => 1],
                        ]
                    ],
                    [
                        'campos' => [
                            ['col' => 4, 'label' => 'Grupo de perfil', 'field_name' => 'roles', 'datalist_json' => ['admin', 'editor', 'viewer', 'rh', 'financeiro'], 'help_text' => 'Grupo de perfil dono do formulario.'],
                            ['col' => 4, 'label' => 'Rota no React', 'field_name' => 'react_route', 'placeholder' => '/v1/meu-form'],
                            ['col' => 4, 'label' => 'Endpoint de envio', 'field_name' => 'submit_endpoint', 'placeholder' => '/api/v1/...'],
                        ]
                    ],
                    [
                        'campos' => [
                            ['field_type' => 'select', 'col' => 4, 'label' => 'Metodo HTTP', 'field_name' => 'http_method', 'options_json' => $this->opcoes(['GET' => 'GET', 'POST' => 'POST', 'PUT' => 'PUT', 'PATCH' => 'PATCH', 'DELETE' => 'DELETE'])],
                            ['field_type' => 'radio', 'col' => 5, 'label' => 'Status', 'field_name' => 'status', 'inline' => 1, 'options_json' => $this->opcoes(['draft' => 'Rascunho', 'active' => 'Ativo', 'inactive' => 'Inativo'])],
                            ['col' => 3, 'label' => 'Versao', 'field_name' => 'version', 'input_mode' => 'numeric', 'placeholder' => '1'],
                        ]
                    ],
                ],
            ],

            // ================================================================
            // Grupo 2 — Grupos (form_groups)
            // ================================================================
            [
                'slug' => 'grupos',
                'title' => 'Grupos (form_groups)',
                'icon' => 'collection',
                'description' => 'Subgrupos de contexto do formulario (viram o titulo de secao no render).',
                'rows' => [
                    [
                        'campos' => [
                            ['field_type' => 'select', 'col' => 6, 'label' => 'Formulario', 'field_name' => 'form_manager_id', 'required' => 1, 'select_config_json' => $this->optSelect('/form-manager/get-no-pagination', '{title} ({slug}) #{id}'), 'help_text' => 'A qual formulario este grupo pertence.'],
                            ['col' => 6, 'label' => 'Titulo da secao', 'field_name' => 'title', 'required' => 1, 'placeholder' => 'Ex: Dados Pessoais'],
                        ]
                    ],
                    [
                        'campos' => [
                            ['col' => 6, 'label' => 'Slug', 'field_name' => 'slug', 'pattern' => '^[a-z0-9]+(?:-[a-z0-9]+)*$', 'placeholder' => 'dados-pessoais'],
                            ['col' => 3, 'label' => 'Icone', 'field_name' => 'icon', 'placeholder' => 'bi-person'],
                            ['col' => 3, 'label' => 'Ordem', 'field_name' => 'sort_order', 'input_mode' => 'numeric', 'placeholder' => '0'],
                        ]
                    ],
                    [
                        'campos' => [
                            ['field_type' => 'textarea', 'col' => 12, 'label' => 'Descricao', 'field_name' => 'description', 'rows_qty' => 2],
                        ]
                    ],
                    [
                        'campos' => [
                            $this->flag('collapsed', 'Iniciar recolhido', 12),
                        ]
                    ],
                ],
            ],

            // ================================================================
            // Grupo 3 — Linhas (form_rows)
            // ================================================================
            [
                'slug' => 'linhas',
                'title' => 'Linhas (form_rows)',
                'icon' => 'distribute-vertical',
                'description' => 'Linhas de um grupo. Cada linha aceita de 1 a 12 campos (soma dos col <= 12).',
                'rows' => [
                    [
                        'campos' => [
                            ['field_type' => 'select', 'col' => 6, 'label' => 'Grupo', 'field_name' => 'form_group_id', 'required' => 1, 'select_config_json' => $this->optSelect('/form-groups/get-no-pagination', '{title} #{id}'), 'help_text' => 'A qual grupo esta linha pertence.'],
                            ['col' => 3, 'label' => 'Ordem', 'field_name' => 'sort_order', 'input_mode' => 'numeric', 'placeholder' => '0'],
                            ['field_type' => 'select', 'col' => 3, 'label' => 'Gutter', 'field_name' => 'gutter', 'options_json' => $this->opcoes(['g-0' => 'g-0', 'g-1' => 'g-1', 'g-2' => 'g-2', 'g-3' => 'g-3', 'g-4' => 'g-4', 'g-5' => 'g-5'])],
                        ]
                    ],
                    [
                        'campos' => [
                            ['col' => 12, 'label' => 'Nota', 'field_name' => 'note'],
                        ]
                    ],
                ],
            ],

            // ================================================================
            // Grupo 4 — Campos (form_fields)
            // ================================================================
            [
                'slug' => 'campos',
                'title' => 'Campos (form_fields)',
                'icon' => 'input-cursor-text',
                'description' => 'Um campo de uma linha. Reproduz os atributos de qualquer componente do FormGrid.',
                'rows' => [
                    [
                        'campos' => [
                            ['field_type' => 'select', 'col' => 4, 'label' => 'Linha', 'field_name' => 'form_row_id', 'required' => 1, 'select_config_json' => $this->optSelect('/form-rows/get-no-pagination', 'linha #{id} (grupo {form_group_id})')],
                            ['field_type' => 'select', 'col' => 4, 'label' => 'Tipo', 'field_name' => 'field_type', 'required' => 1, 'options_json' => $tipos],
                            ['field_type' => 'select', 'col' => 2, 'label' => 'col', 'field_name' => 'col', 'options_json' => $cols],
                            ['col' => 2, 'label' => 'Ordem', 'field_name' => 'sort_order', 'input_mode' => 'numeric'],
                        ]
                    ],
                    [
                        'campos' => [
                            ['col' => 6, 'label' => 'Rotulo', 'field_name' => 'label'],
                            ['col' => 3, 'label' => 'name (atributo)', 'field_name' => 'field_name'],
                            ['col' => 3, 'label' => 'id (atributo)', 'field_name' => 'field_key'],
                        ]
                    ],
                    [
                        'campos' => [
                            ['col' => 6, 'label' => 'Placeholder', 'field_name' => 'placeholder'],
                            ['col' => 6, 'label' => 'Texto de ajuda', 'field_name' => 'help_text'],
                        ]
                    ],
                    [
                        'campos' => [
                            ['field_type' => 'textarea', 'col' => 12, 'label' => 'Valor padrao', 'field_name' => 'default_value', 'rows_qty' => 2],
                        ]
                    ],
                    [
                        'campos' => [
                            $this->flag('required', 'Obrigatorio'),
                            $this->flag('disabled', 'Desabilitado'),
                            $this->flag('read_only', 'Somente leitura'),
                            $this->flag('is_hidden', 'Oculto'),
                        ]
                    ],
                    [
                        'campos' => [
                            ['col' => 3, 'label' => 'max_length', 'field_name' => 'max_length', 'input_mode' => 'numeric'],
                            ['col' => 3, 'label' => 'min_length', 'field_name' => 'min_length', 'input_mode' => 'numeric'],
                            ['col' => 6, 'label' => 'pattern (regex)', 'field_name' => 'pattern'],
                        ]
                    ],
                    [
                        'campos' => [
                            ['field_type' => 'select', 'col' => 4, 'label' => 'input_mode', 'field_name' => 'input_mode', 'options_json' => $inputModes],
                            ['col' => 4, 'label' => 'autocomplete', 'field_name' => 'autocomplete', 'placeholder' => 'name, email, off...'],
                            ['col' => 4, 'label' => 'rows (textarea)', 'field_name' => 'rows_qty', 'input_mode' => 'numeric'],
                        ]
                    ],
                    [
                        'campos' => [
                            $this->flag('no_numbers', 'Sem numeros'),
                            $this->flag('no_letters', 'Sem letras'),
                            $this->flag('no_special_chars', 'Sem especiais'),
                            $this->flag('strong_password', 'Senha forte'),
                        ]
                    ],
                    [
                        'campos' => [
                            $this->flag('double_field', 'Campo duplo'),
                            $this->flag('with_seconds', 'Com segundos'),
                            $this->flag('inline', 'Opcoes inline'),
                        ]
                    ],
                    [
                        'campos' => [
                            $this->flag('show_counter', 'Contador de caracteres', 4),
                            ['field_type' => 'data', 'col' => 4, 'label' => 'Data minima', 'field_name' => 'min_date'],
                            ['field_type' => 'data', 'col' => 4, 'label' => 'Data maxima', 'field_name' => 'max_date'],
                        ]
                    ],
                    [
                        'campos' => [
                            ['field_type' => 'textarea', 'col' => 6, 'label' => 'options_json', 'field_name' => 'options_json', 'rows_qty' => 3, 'placeholder' => '[{"id":"a","value":"a","label":"A"}]', 'help_text' => 'radio / checkbox / select inline.'],
                            ['field_type' => 'textarea', 'col' => 6, 'label' => 'datalist_json', 'field_name' => 'datalist_json', 'rows_qty' => 3, 'placeholder' => '["opcao 1","opcao 2"]'],
                        ]
                    ],
                    [
                        'campos' => [
                            ['field_type' => 'textarea', 'col' => 6, 'label' => 'allowed_domains_json', 'field_name' => 'allowed_domains_json', 'rows_qty' => 2, 'placeholder' => '["gov.br"]'],
                            ['field_type' => 'textarea', 'col' => 6, 'label' => 'select_config_json', 'field_name' => 'select_config_json', 'rows_qty' => 3, 'placeholder' => '{"src":"/api/v1/...","valueKey":"id","labelKey":"nome"}'],
                        ]
                    ],
                    [
                        'campos' => [
                            ['field_type' => 'textarea', 'col' => 6, 'label' => 'style_json', 'field_name' => 'style_json', 'rows_qty' => 2, 'placeholder' => '{"textTransform":"uppercase"}'],
                            ['field_type' => 'textarea', 'col' => 6, 'label' => 'attributes_json', 'field_name' => 'attributes_json', 'rows_qty' => 2, 'placeholder' => '{"size":30,"tabIndex":1}'],
                        ]
                    ],
                ],
            ],
        ];
    }
}
