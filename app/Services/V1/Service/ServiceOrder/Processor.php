<?php

namespace App\Services\V1\Service\ServiceOrder;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Service\ServiceManager\SqlTableModel as ServiceModel;
use App\Models\V1\Service\ServiceOrder\SqlTableModel;
use App\Models\V1\Service\ServiceOrder\SqlViewModel;
use App\Services\V1\BaseTableService;
use App\Services\V1\Concerns\NormalizesRoles;

/**
 * Service de negocio do modulo Service/ServiceOrder — pedido, orcamento e execucao.
 *
 * Fluxo de status:
 *   requested -> quoted -> accepted -> scheduled -> in_progress -> done
 *   cancelled (de qualquer estado aberto) e rejected (orcamento recusado, a partir de quoted).
 *
 * Regras:
 *  - Guest nao escreve (403).
 *  - O servico precisa existir na empresa da sessao (422); pedido pai (etapas de uma obra) idem.
 *  - O pedido nasce requested; created_by e requested_at vem da sessao/servidor. billing_unit e
 *    currency herdam do servico quando nao informados. Status, andamento e avaliacao nao se impoem no create.
 *  - code e unico na empresa (inclusive excluidos) — 409.
 *  - Servico, pedido pai, code, created_by e requested_at sao imutaveis no update.
 *  - Transicao fora do fluxo — 409. quoted exige quoted_price; scheduled exige scheduled_at;
 *    done exige final_price ou quoted_price; cancelled/rejected exigem cancel_reason — 422.
 *  - in_progress grava started_at; done grava finished_at e final_price (= quoted_price se omitido).
 *  - Pedido done aceita apenas rating (1 a 5), feedback, paid_at e notes. cancelled/rejected nao mudam (409).
 *  - rating e paid_at so em pedido done (422).
 *  - Excluir pedido done: so admin (403); com pedidos filhos: 409 (excluir os filhos antes).
 *  - Nenhum trigger no banco: tudo aqui.
 */
class Processor extends BaseTableService
{
    use NormalizesRoles;

    private const OPEN = ['requested', 'quoted', 'accepted', 'scheduled', 'in_progress'];

    /** Transicoes permitidas a partir de cada estado aberto. */
    private const FLOW = [
        'requested'   => ['quoted', 'cancelled'],
        'quoted'      => ['quoted', 'accepted', 'rejected', 'cancelled'],
        'accepted'    => ['scheduled', 'in_progress', 'cancelled'],
        'scheduled'   => ['scheduled', 'in_progress', 'cancelled'],
        'in_progress' => ['done', 'cancelled'],
    ];

    /** Campos que um pedido concluido ainda aceita. */
    private const DONE_EDITABLE = ['rating', 'feedback', 'paid_at', 'notes'];

    protected SqlTableModel $tableModel;
    protected SqlViewModel $viewModel;

    private ServiceModel $serviceModel;

    public function __construct()
    {
        $this->tableModel   = new SqlTableModel();
        $this->viewModel    = new SqlViewModel();
        $this->serviceModel = new ServiceModel();
    }

    // -------------------------------------------------------------------------
    // Hooks
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        if (!$this->serviceModel->find((int) ($data['service_id'] ?? 0))) {
            return $this->fail('Servico nao encontrado', 422);
        }

        $parentId = (int) ($data['parent_id'] ?? 0);

        if ($parentId > 0 && !$this->tableModel->find($parentId)) {
            return $this->fail('Pedido pai nao encontrado', 422);
        }

        return $this->codeConflict((string) ($data['code'] ?? ''));
    }

    protected function prepareData(array $data): array
    {
        unset(
            $data['status'], $data['started_at'], $data['finished_at'], $data['paid_at'],
            $data['rating'], $data['feedback'], $data['cancel_reason'], $data['final_price']
        );

        $service = $this->serviceModel->find((int) $data['service_id']) ?? [];

        $data['status']       = 'requested';
        $data['created_by']   = CurrentUser::id();
        $data['requested_at'] = $data['requested_at'] ?? date('Y-m-d H:i:s');
        $data['billing_unit'] = $data['billing_unit'] ?? ($service['billing_unit'] ?? '1');
        $data['currency']     = $data['currency'] ?? ($service['currency'] ?? 'BRL');

        return $this->normalizeRoles($data);
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        unset($data['service_id'], $data['parent_id'], $data['code'], $data['created_by'], $data['requested_at']);

        $data     = $this->normalizeRoles($data);
        $existing = $this->tableModel->find($id);
        $next     = $data['status'] ?? null;

        if (!$existing || $next === null || $next === $existing['status']) {
            return $data;
        }

        if ($next === 'in_progress' && empty($existing['started_at']) && empty($data['started_at'])) {
            $data['started_at'] = date('Y-m-d H:i:s');
        }

        if ($next === 'done') {
            if (empty($existing['finished_at']) && empty($data['finished_at'])) {
                $data['finished_at'] = date('Y-m-d H:i:s');
            }

            if (!isset($data['final_price']) && $existing['final_price'] === null) {
                $data['final_price'] = $data['quoted_price'] ?? $existing['quoted_price'];
            }
        }

        return $data;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        $existing = $this->tableModel->find($id);

        if (!$existing) {
            return null;
        }

        $current = (string) $existing['status'];
        $next    = (string) ($data['status'] ?? $current);

        if ($current === 'done') {
            if ($next !== 'done' || array_diff(array_keys($data), self::DONE_EDITABLE + ['status'])) {
                return $this->fail('Pedido concluido so aceita rating, feedback, paid_at e notes', 409);
            }
        } elseif (in_array($current, ['cancelled', 'rejected'], true)) {
            return $this->fail('Pedido encerrado nao pode ser alterado', 409);
        } elseif ($next !== $current || isset($data['status'])) {
            if (!in_array($next, self::FLOW[$current] ?? [], true)) {
                return $this->fail("Transicao invalida de status: $current -> $next", 409);
            }
        }

        $merged = array_merge($existing, $data);

        if ($next === 'quoted' && $merged['quoted_price'] === null) {
            return $this->fail('Informe quoted_price para orcar', 422);
        }

        if ($next === 'scheduled' && empty($merged['scheduled_at'])) {
            return $this->fail('Informe scheduled_at para agendar', 422);
        }

        if ($next === 'done' && $merged['final_price'] === null) {
            return $this->fail('Informe final_price (ou quoted_price) para concluir', 422);
        }

        if (in_array($next, ['cancelled', 'rejected'], true) && empty($merged['cancel_reason'])) {
            return $this->fail('Informe cancel_reason', 422);
        }

        if ($next !== 'done' && (isset($data['rating']) || isset($data['paid_at']))) {
            return $this->fail('Somente pedido concluido recebe rating e paid_at', 422);
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

        return parent::update($id, $data);
    }

    public function deleteSoft(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->fail('Operacao nao permitida para este usuario', 403);
        }

        $existing = $this->tableModel->find($id);

        if ($existing && $existing['status'] === 'done' && !CurrentUser::isAdmin()) {
            return $this->fail('Somente admin exclui pedido concluido', 403);
        }

        if ($this->countChildren($id, false) > 0) {
            return $this->fail('Pedido possui etapas ativas: exclua as etapas primeiro', 409);
        }

        return parent::deleteSoft($id);
    }

    public function deleteRestore(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->fail('Operacao nao permitida para este usuario', 403);
        }

        $row = $this->tableModel->findOnlyDeleted($id);

        if ($row && !empty($row['parent_id']) && !$this->tableModel->find((int) $row['parent_id'])) {
            return $this->fail('Restaure o pedido pai antes de restaurar este pedido', 409);
        }

        return parent::deleteRestore($id);
    }

    public function deleteHard(int $id): array
    {
        if ($this->countChildren($id, true) > 0) {
            return $this->fail('Pedido possui etapas (inclusive excluidas): remova as etapas primeiro', 409);
        }

        return parent::deleteHard($id);
    }

    // -------------------------------------------------------------------------
    // Privados
    // -------------------------------------------------------------------------

    private function countChildren(int $id, bool $withDeleted): int
    {
        $model = $withDeleted ? $this->tableModel->withDeleted() : $this->tableModel;

        return $model->where('parent_id', $id)->countAllResults();
    }

    /** Unicidade de code na empresa (inclusive excluidos: a UNIQUE do banco os enxerga). */
    private function codeConflict(string $code): ?array
    {
        if ($code === '') {
            return null;
        }

        return $this->tableModel->withDeleted()->where('code', $code)->countAllResults() > 0
            ? $this->fail('Ja existe um pedido com este code', 409)
            : null;
    }

    private function fail(string $message, int $code): array
    {
        return ['success' => false, 'message' => $message, 'code' => $code];
    }
}
