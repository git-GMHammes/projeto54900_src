<?php

namespace App\Services\V1\Service\ServiceManager;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Service\ServiceManager\SqlTableModel;
use App\Models\V1\Service\ServiceManager\SqlViewModel;
use App\Services\V1\BaseTableService;
use CodeIgniter\Database\Exceptions\DatabaseException;

/**
 * Service de negocio do modulo Service/ServiceManager — servico.
 *
 * parent_id e opcional (pacote, obra, etapa: construcao civil > alvenaria); sem pai o
 * servico fica no topo. A mesma-empresa de parent_id e conferida pelo model (CompanyScoped).
 * Nenhuma ligacao com outros modulos.
 *
 * Regras:
 *  - Guest nao escreve (403).
 *  - Pai precisa existir (na empresa da sessao) e nao pode ser o proprio servico
 *    nem um de seus descendentes (ciclo) — 422 / 409.
 *  - code e unico na empresa (inclusive entre excluidos) — 409.
 *  - Nao exclui (logica ou definitiva) servico que ainda tem filhos — 409.
 *  - Limpeza de excluidos so para admin, folhas primeiro (FK RESTRICT no pai).
 */
class Processor extends BaseTableService
{
    /** Trava contra laco infinito ao subir a arvore (dados corrompidos). */
    private const MAX_DEPTH = 1000;

    protected SqlTableModel $tableModel;
    protected SqlViewModel $viewModel;

    public function __construct()
    {
        $this->tableModel = new SqlTableModel();
        $this->viewModel  = new SqlViewModel();
    }

    // -------------------------------------------------------------------------
    // Hooks
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        $parentId = (int) ($data['parent_id'] ?? 0);

        if ($parentId > 0 && !$this->tableModel->find($parentId)) {
            return $this->fail('Servico pai nao encontrado', 422);
        }

        return $this->codeConflict((string) ($data['code'] ?? ''));
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        $existing = $this->tableModel->find($id) ?? [];
        $parentId = array_key_exists('parent_id', $data)
            ? (int) ($data['parent_id'] ?? 0)
            : (int) ($existing['parent_id'] ?? 0);

        if (array_key_exists('parent_id', $data) && $parentId > 0) {
            if ($parentId === $id) {
                return $this->fail('Um servico nao pode ser pai de si mesmo', 422);
            }

            if (!$this->tableModel->find($parentId)) {
                return $this->fail('Servico pai nao encontrado', 422);
            }

            if ($this->isDescendant($parentId, $id)) {
                return $this->fail('Ciclo na hierarquia: o novo pai e descendente deste servico', 409);
            }
        }

        $code = array_key_exists('code', $data) ? (string) $data['code'] : (string) ($existing['code'] ?? '');

        return $this->codeConflict($code, $id);
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

        if ($this->countChildren($id, false) > 0) {
            return $this->fail('Servico possui filhos ativos: mova ou exclua os filhos primeiro', 409);
        }

        return parent::deleteSoft($id);
    }

    public function deleteRestore(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->fail('Operacao nao permitida para este usuario', 403);
        }

        $row = $this->tableModel->findOnlyDeleted($id);

        // Pai excluido: restaurar o filho deixaria o no fora da arvore visivel.
        if ($row && !empty($row['parent_id']) && !$this->tableModel->find((int) $row['parent_id'])) {
            return $this->fail('Restaure o servico pai antes de restaurar este servico', 409);
        }

        return parent::deleteRestore($id);
    }

    public function deleteHard(int $id): array
    {
        if ($this->countChildren($id, true) > 0) {
            return $this->fail('Servico possui filhos (inclusive excluidos): remova os filhos primeiro', 409);
        }

        return parent::deleteHard($id);
    }

    public function clearDeleted(?int $id = null): array
    {
        if (!CurrentUser::isAdmin()) {
            return $this->fail('Somente admin pode limpar registros excluidos', 403);
        }

        $deleted  = $this->tableModel->onlyDeleted()->findAll();
        $affected = 0;

        foreach ($this->leafFirst($deleted) as $rowId) {
            if ($id !== null && $rowId !== $id) {
                continue;
            }

            try {
                $affected += parent::clearDeleted($rowId)['affected'];
            } catch (DatabaseException $e) {
                // Ainda tem filho ativo (ou de outro excluido nao listado): mantem o registro.
                log_message('warning', '[' . static::class . '::clearDeleted] ' . $e->getMessage());
            }
        }

        return ['affected' => $affected];
    }

    // -------------------------------------------------------------------------
    // Privados
    // -------------------------------------------------------------------------

    /**
     * Sobe a arvore a partir de $startId e informa se encontra $ancestorId.
     * Considera registros excluidos logicamente, que continuam na cadeia de FK.
     */
    private function isDescendant(int $startId, int $ancestorId): bool
    {
        $current = $startId;

        for ($i = 0; $current > 0 && $i < self::MAX_DEPTH; $i++) {
            if ($current === $ancestorId) {
                return true;
            }

            $row     = $this->tableModel->withDeleted()->find($current);
            $current = (int) ($row['parent_id'] ?? 0);
        }

        return false;
    }

    private function countChildren(int $id, bool $withDeleted): int
    {
        $model = $withDeleted ? $this->tableModel->withDeleted() : $this->tableModel;

        return $model->where('parent_id', $id)->countAllResults();
    }

    /**
     * Unicidade de code na empresa. Considera excluidos, porque a UNIQUE do banco
     * (company_id, code) tambem os enxerga. O escopo de empresa vem do model.
     */
    private function codeConflict(string $code, ?int $excludeId = null): ?array
    {
        if ($code === '') {
            return null;
        }

        $model = $this->tableModel->withDeleted()->where('code', $code);

        if ($excludeId !== null) {
            $model->where('id !=', $excludeId);
        }

        return $model->countAllResults() > 0
            ? $this->fail('Ja existe um servico com este code', 409)
            : null;
    }

    /**
     * Ids dos registros excluidos ordenados dos mais profundos para os mais rasos.
     *
     * @param list<array<string, mixed>> $rows
     * @return list<int>
     */
    private function leafFirst(array $rows): array
    {
        $parents = [];
        foreach ($rows as $row) {
            $parents[(int) $row['id']] = (int) ($row['parent_id'] ?? 0);
        }

        $depth = [];
        foreach ($parents as $rowId => $parent) {
            $d = 0;
            for ($cur = $parent; $cur > 0 && isset($parents[$cur]) && $d < self::MAX_DEPTH; $cur = $parents[$cur]) {
                $d++;
            }
            $depth[$rowId] = $d;
        }

        arsort($depth);

        return array_keys($depth);
    }

    private function fail(string $message, int $code): array
    {
        return ['success' => false, 'message' => $message, 'code' => $code];
    }
}
