<?php

namespace App\Services\V1\Concerns;

/**
 * Grava um registro junto com a lista COMPLETA das suas caracteristicas (`attributes`) na mesma transacao.
 *
 * Usado por Product/ProductManager e Service/ServiceManager. A classe que usa a trait e filha de BaseTableService
 * (a trait chama `parent::create`/`parent::update`) e informa a tabela de caracteristicas e a coluna do dono:
 *
 *   - `attributesModel()`   model (SqlTableModel) da tabela de caracteristicas;
 *   - `attributesOwnerKey()` coluna do dono nessa tabela (ex.: `product_id`, `service_id`);
 *   - `fail()`              resposta de erro `['success' => false, 'message' => ..., 'code' => ...]`.
 *
 * Contrato do corpo: `attributes` = lista de `{group_code, field_code, value, unit?, label?}`.
 *   - Sem a chave, as caracteristicas nao mudam.
 *   - No update a lista SUBSTITUI as caracteristicas do dono (`[]` apaga todas); no create apenas grava.
 *   - Item sem `value` e ignorado; booleano vira 'true'/'false'.
 *   - Formato invalido — 422 e nada e gravado (a transacao desfaz tudo, inclusive o registro).
 */
trait ReplacesAttributes
{
    /** Limite de itens em `attributes` por envio. */
    protected int $maxAttributes = 500;

    /** Model da tabela de caracteristicas (a empresa e carimbada pelo proprio model). */
    abstract protected function attributesModel(): object;

    /** Coluna do dono na tabela de caracteristicas. */
    abstract protected function attributesOwnerKey(): string;

    /**
     * create() do registro + caracteristicas, na mesma transacao.
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    protected function createWithAttributes(array $data): array
    {
        [$attributes, $error] = $this->takeAttributes($data);

        if ($error !== null) {
            return $error;
        }

        if ($attributes === null) {
            return parent::create($data);
        }

        $db = db_connect(DB_GROUP_001);
        $db->transBegin();

        $result = parent::create($data);

        if (empty($result['success'])) {
            $db->transRollback();

            return $result;
        }

        if (!$this->replaceAttributes((int) $result['data']['id'], $attributes)) {
            $db->transRollback();

            return $this->fail('Erro ao gravar as caracteristicas', 500);
        }

        $db->transCommit();

        return $result;
    }

    /**
     * update() do registro + substituicao das caracteristicas, na mesma transacao.
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    protected function updateWithAttributes(int $id, array $data): array
    {
        [$attributes, $error] = $this->takeAttributes($data);

        if ($error !== null) {
            return $error;
        }

        if ($attributes === null) {
            return parent::update($id, $data);
        }

        if (!$this->tableModel->find($id)) {
            return $this->fail('Registro nao encontrado', 404);
        }

        $db = db_connect(DB_GROUP_001);
        $db->transBegin();

        // So caracteristicas no corpo: nao ha coluna para atualizar no registro.
        $result = $data === [] ? ['success' => true, 'data' => $this->tableModel->find($id)] : parent::update($id, $data);

        if (empty($result['success'])) {
            $db->transRollback();

            return $result;
        }

        if (!$this->replaceAttributes($id, $attributes)) {
            $db->transRollback();

            return $this->fail('Erro ao gravar as caracteristicas', 500);
        }

        $db->transCommit();

        return $result;
    }

    /**
     * Tira `attributes` do corpo e valida o formato. Devolve [lista|null, erro|null]:
     * lista null = a chave nao veio (nada a fazer nas caracteristicas).
     *
     * @param array<string, mixed> $data
     * @return array{0: list<array<string, mixed>>|null, 1: array<string, mixed>|null}
     */
    private function takeAttributes(array &$data): array
    {
        if (!array_key_exists('attributes', $data)) {
            return [null, null];
        }

        $raw = $data['attributes'];
        unset($data['attributes']);

        if (!is_array($raw)) {
            return [null, $this->fail('attributes deve ser uma lista', 422)];
        }

        if (count($raw) > $this->maxAttributes) {
            return [null, $this->fail('attributes aceita no maximo ' . $this->maxAttributes . ' itens', 422)];
        }

        $out = [];

        foreach (array_values($raw) as $i => $item) {
            if (!is_array($item)) {
                return [null, $this->fail("attributes[$i] invalido", 422)];
            }

            $group = trim((string) ($item['group_code'] ?? ''));
            $field = trim((string) ($item['field_code'] ?? ''));

            if (!preg_match('/^[a-z0-9_]{1,50}$/', $group) || !preg_match('/^[a-z0-9_]{1,50}$/', $field)) {
                return [null, $this->fail("attributes[$i]: group_code e field_code devem ser minusculos, de 1 a 50 caracteres", 422)];
            }

            $value = $item['value'] ?? '';

            if (is_bool($value)) {
                $value = $value ? 'true' : 'false';
            }

            if (!is_scalar($value)) {
                return [null, $this->fail("attributes[$i]: value invalido", 422)];
            }

            $value = trim((string) $value);

            if ($value === '') {
                continue;
            }

            $unit  = isset($item['unit']) && is_scalar($item['unit']) ? trim((string) $item['unit']) : '';
            $label = isset($item['label']) && is_scalar($item['label']) ? trim((string) $item['label']) : '';

            if (mb_strlen($value) > 500 || mb_strlen($unit) > 30 || mb_strlen($label) > 100) {
                return [null, $this->fail("attributes[$i]: value (500), unit (30) ou label (100) acima do limite", 422)];
            }

            $out[] = [
                'group_code' => $group,
                'field_code' => $field,
                'label'      => $label !== '' ? $label : null,
                'value'      => $value,
                'unit'       => $unit !== '' ? $unit : null,
            ];
        }

        return [$out, null];
    }

    /**
     * Substitui todas as caracteristicas do dono pela lista informada (exclusao definitiva das antigas, para nao
     * acumular linhas excluidas). Empresa e sort_order ficam por conta do model/ordem.
     *
     * @param list<array<string, mixed>> $attributes
     */
    private function replaceAttributes(int $ownerId, array $attributes): bool
    {
        $model = $this->attributesModel();
        $model->builder()->where($this->attributesOwnerKey(), $ownerId)->delete();

        foreach ($attributes as $index => $row) {
            $id = $model->insert($row + [$this->attributesOwnerKey() => $ownerId, 'sort_order' => ($index + 1) * 10]);

            if (!$id) {
                return false;
            }
        }

        return true;
    }
}
