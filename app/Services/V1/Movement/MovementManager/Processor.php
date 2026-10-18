<?php

namespace App\Services\V1\Movement\MovementManager;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Movement\MovementManager\SqlTableModel;
use App\Models\V1\Movement\MovementManager\SqlViewModel;
use App\Models\V1\Movement\MovementStock\SqlViewModel as StockModel;
use App\Models\V1\Product\ProductManager\SqlTableModel as ProductModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Movement/MovementManager — movimento de produto.
 *
 * Tipos: entry (entrada), exit (saida), reservation (separacao), waste
 * (desperdicio) e order (encomenda). Saldo, reservado, encomendado e disponivel
 * saem da view_movement_stock.
 *
 * Regras:
 *  - Guest nao escreve (403).
 *  - O produto precisa existir na empresa da sessao (422).
 *  - entry/exit/waste nascem finalizados (done); reservation/order nascem abertos (open).
 *  - user_manager_id vem da sessao; occurred_at e o horario do servidor se nao informado.
 *  - order exige expected_at (422).
 *  - exit e reservation nao passam do disponivel; waste nao passa do saldo (422).
 *  - Movimento aberto aceita ajustes; produto, tipo, usuario, data e origem sao imutaveis.
 *    Movimento finalizado ou cancelado nao muda (409): corrige-se com movimento inverso.
 *  - status done em reservation gera uma exit; em order gera uma entry (origin_id = movimento
 *    de origem). status cancelled so encerra o movimento aberto.
 *  - Excluir movimento finalizado: so admin (403). Nenhum trigger no banco: tudo aqui.
 */
class Processor extends BaseTableService
{
    private const AUTO_DONE = ['entry', 'exit', 'waste'];

    protected SqlTableModel $tableModel;
    protected SqlViewModel $viewModel;

    private StockModel $stockModel;
    private ProductModel $productModel;

    public function __construct()
    {
        $this->tableModel   = new SqlTableModel();
        $this->viewModel    = new SqlViewModel();
        $this->stockModel   = new StockModel();
        $this->productModel = new ProductModel();
    }

    // -------------------------------------------------------------------------
    // Hooks
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        $productId = (int) ($data['product_id'] ?? 0);
        $type      = (string) ($data['type'] ?? '');
        $quantity  = (float) ($data['quantity'] ?? 0);

        if (!$this->productModel->find($productId)) {
            return $this->fail('Produto nao encontrado', 422);
        }

        if ($type === 'order' && empty($data['expected_at'])) {
            return $this->fail('Informe expected_at para encomenda', 422);
        }

        $stock = $this->stock($productId);

        if (in_array($type, ['exit', 'reservation'], true) && $quantity > $stock['available']) {
            return $this->fail('Quantidade acima do disponivel (' . $this->fmt($stock['available']) . ')', 422);
        }

        if ($type === 'waste' && $quantity > $stock['on_hand']) {
            return $this->fail('Quantidade acima do saldo em estoque (' . $this->fmt($stock['on_hand']) . ')', 422);
        }

        return null;
    }

    protected function prepareData(array $data): array
    {
        $type = (string) ($data['type'] ?? '');

        $data['status']          = in_array($type, self::AUTO_DONE, true) ? 'done' : 'open';
        $data['user_manager_id'] = CurrentUser::id();
        $data['occurred_at']     = $data['occurred_at'] ?? date('Y-m-d H:i:s');

        return $data;
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        unset($data['product_id'], $data['type'], $data['user_manager_id'], $data['occurred_at'], $data['origin_id']);

        return $data;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        $existing = $this->tableModel->find($id);

        if ($existing && $existing['status'] !== 'open') {
            return $this->fail('Movimento finalizado ou cancelado nao pode ser alterado', 409);
        }

        if (!$existing) {
            return null;
        }

        $newQuantity = array_key_exists('quantity', $data) ? (float) $data['quantity'] : (float) $existing['quantity'];
        $stock       = $this->stock((int) $existing['product_id']);

        if (($data['status'] ?? null) === 'done' && $existing['type'] === 'reservation' && $newQuantity > $stock['on_hand']) {
            return $this->fail('Quantidade acima do saldo em estoque (' . $this->fmt($stock['on_hand']) . ')', 422);
        }

        if (!isset($data['status']) && $existing['type'] === 'reservation') {
            $delta = $newQuantity - (float) $existing['quantity'];

            if ($delta > $stock['available']) {
                return $this->fail('Quantidade acima do disponivel (' . $this->fmt($stock['available']) . ')', 422);
            }
        }

        return null;
    }

    // -------------------------------------------------------------------------
    // Escrita
    // -------------------------------------------------------------------------

    public function create(array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->fail('Operacao nao permitida para este usuario', 403);
        }

        return parent::create($data);
    }

    public function update(int $id, array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->fail('Operacao nao permitida para este usuario', 403);
        }

        $existing = $this->tableModel->find($id);
        $toDone   = $existing
            && $existing['status'] === 'open'
            && ($data['status'] ?? null) === 'done'
            && in_array($existing['type'], ['reservation', 'order'], true);

        if (!$toDone) {
            return parent::update($id, $data);
        }

        // Confirmar separacao / receber encomenda: encerra o aberto e gera o movimento real, juntos.
        $db = db_connect(DB_GROUP_001);
        $db->transBegin();

        $result = parent::update($id, $data);

        if (empty($result['success'])) {
            $db->transRollback();

            return $result;
        }

        $merged    = array_merge($existing, array_intersect_key($data, array_flip([
            'quantity', 'location_id', 'lot', 'expires_at', 'unit_cost', 'reference', 'notes',
        ])));
        $derivedId = $this->tableModel->insert([
            'product_id'      => $existing['product_id'],
            'type'            => $existing['type'] === 'reservation' ? 'exit' : 'entry',
            'quantity'        => $merged['quantity'],
            'status'          => 'done',
            'occurred_at'     => date('Y-m-d H:i:s'),
            'user_manager_id' => CurrentUser::id(),
            'location_id'     => $merged['location_id'],
            'origin_id'       => $id,
            'lot'             => $merged['lot'],
            'expires_at'      => $merged['expires_at'],
            'unit_cost'       => $merged['unit_cost'],
            'reference'       => $merged['reference'],
            'notes'           => $merged['notes'],
        ]);

        if (!$derivedId || $db->transStatus() === false) {
            $db->transRollback();

            return $this->fail('Erro ao gerar o movimento de ' . ($existing['type'] === 'reservation' ? 'saida' : 'entrada'), 500);
        }

        $db->transCommit();
        $result['data']['generated_id'] = (int) $derivedId;

        return $result;
    }

    public function deleteSoft(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->fail('Operacao nao permitida para este usuario', 403);
        }

        $existing = $this->tableModel->find($id);

        if ($existing && $existing['status'] === 'done' && !CurrentUser::isAdmin()) {
            return $this->fail('Somente admin exclui movimento finalizado', 403);
        }

        return parent::deleteSoft($id);
    }

    public function deleteRestore(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->fail('Operacao nao permitida para este usuario', 403);
        }

        return parent::deleteRestore($id);
    }

    // -------------------------------------------------------------------------
    // Privados
    // -------------------------------------------------------------------------

    /**
     * Saldo fisico (on_hand) e disponivel do produto, direto da view de saldo.
     *
     * @return array{on_hand: float, available: float}
     */
    private function stock(int $productId): array
    {
        $row = $this->stockModel->where('product_id', $productId)->first();

        return [
            'on_hand'   => (float) ($row['on_hand'] ?? 0),
            'available' => (float) ($row['available'] ?? 0),
        ];
    }

    private function fmt(float $value): string
    {
        return rtrim(rtrim(number_format($value, 3, '.', ''), '0'), '.');
    }

    private function fail(string $message, int $code): array
    {
        return ['success' => false, 'message' => $message, 'code' => $code];
    }
}
