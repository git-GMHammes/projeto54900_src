<?php

namespace App\Services\V1\Timeline\TimelineManager;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Timeline\TimelineManager\SqlTableModel;
use App\Models\V1\Timeline\TimelineManager\SqlViewModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Timeline/TimelineManager.
 *
 * A timeline e 1:1 com o usuario (UNIQUE user_manager_id) e nasce sozinha na
 * primeira publicacao (ver TimelinePosts\Processor). Este Processor cuida do
 * CRUD generico e das regras de dono:
 *
 *  - Guest nao escreve nada (403).
 *  - Quem nao e admin so le/edita a propria timeline; id de outro dono responde
 *    404 (e nao 403, para nao revelar a existencia do registro).
 *  - No create o dono e sempre o usuario da sessao (user_manager_id do corpo e
 *    ignorado) e o slug e derivado do titulo quando nao vem.
 *  - Uma timeline por usuario -> 409 se ja existir.
 *  - Unicidade de slug conferida na mao -> 409 (a UNIQUE do banco e a rede de
 *    seguranca).
 *  - As exclusoes definitivas dependem do filtro adminonly das rotas.
 */
class Processor extends BaseTableService
{
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
        if ($this->slugEmUso((string) ($data['slug'] ?? ''))) {
            return $this->conflict('Ja existe uma timeline com este slug');
        }

        return null;
    }

    protected function validateOnUpdate(int $id, array $data): ?array
    {
        if ($this->slugEmUso((string) ($data['slug'] ?? ''), $id)) {
            return $this->conflict('Ja existe uma timeline com este slug');
        }

        return null;
    }

    protected function prepareData(array $data): array
    {
        $data['user_manager_id'] = (int) CurrentUser::id();

        if (trim((string) ($data['slug'] ?? '')) === '') {
            $data['slug'] = $this->slugify((string) ($data['title'] ?? 'timeline')) . '-' . $data['user_manager_id'];
        }

        $data['status']  = $data['status'] ?? 'active';
        $data['version'] = $data['version'] ?? 1;

        return $data;
    }

    // -------------------------------------------------------------------------
    // Escrita — sempre do dono (ou admin)
    // -------------------------------------------------------------------------

    public function create(array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        if ($this->tableModel->findByUserManagerId((int) CurrentUser::id()) !== null) {
            return $this->conflict('Este usuario ja tem timeline');
        }

        return parent::create($data);
    }

    public function update(int $id, array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertOwner($id);
        if ($guarded !== null) {
            return $guarded;
        }

        unset($data['user_manager_id']);

        return parent::update($id, $data);
    }

    public function deleteSoft(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertOwner($id);
        if ($guarded !== null) {
            return $guarded;
        }

        return parent::deleteSoft($id);
    }

    public function deleteRestore(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertOwner($id, true);
        if ($guarded !== null) {
            return $guarded;
        }

        return parent::deleteRestore($id);
    }

    public function deleteHard(int $id): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $guarded = $this->assertOwner($id, true);
        if ($guarded !== null) {
            return $guarded;
        }

        return parent::deleteHard($id);
    }

    public function clearDeleted(?int $id = null): array
    {
        if (!CurrentUser::isAdmin()) {
            return $this->forbidden('Somente admin pode limpar registros excluidos');
        }

        return parent::clearDeleted($id);
    }

    // -------------------------------------------------------------------------
    // Privados
    // -------------------------------------------------------------------------

    private function slugEmUso(string $slug, ?int $excludeId = null): bool
    {
        $slug = trim($slug);

        return $slug !== '' && $this->tableModel->existsByField('slug', $slug, $excludeId);
    }

    private function assertOwner(int $id, bool $includeDeleted = false): ?array
    {
        if (CurrentUser::isAdmin()) {
            return null;
        }

        $existing = $includeDeleted
            ? $this->tableModel->findWithDeleted($id)
            : $this->tableModel->find($id);

        if ($existing === null || (int) ($existing['user_manager_id'] ?? 0) !== (int) CurrentUser::id()) {
            return $this->notFound();
        }

        return null;
    }

    private function forbidden(string $message = 'Operacao nao permitida para este usuario'): array
    {
        return ['success' => false, 'message' => $message, 'code' => 403];
    }

    private function notFound(): array
    {
        return ['success' => false, 'message' => 'Registro nao encontrado ou foi excluido', 'code' => 404];
    }

    private function conflict(string $message): array
    {
        return ['success' => false, 'message' => $message, 'code' => 409];
    }

    /**
     * Slug ASCII a partir de um texto livre (mesma ideia do slug do frontend).
     */
    private function slugify(string $value): string
    {
        $value = trim($value);

        if ($value === '') {
            return 'timeline';
        }

        if (function_exists('iconv')) {
            $converted = @iconv('UTF-8', 'ASCII//TRANSLIT', $value);
            if ($converted !== false) {
                $value = $converted;
            }
        }

        $value = strtolower((string) preg_replace('/[^A-Za-z0-9]+/', '-', $value));
        $value = trim($value, '-');

        return $value !== '' ? substr($value, 0, 100) : 'timeline';
    }
}
