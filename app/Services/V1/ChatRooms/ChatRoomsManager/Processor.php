<?php

namespace App\Services\V1\ChatRooms\ChatRoomsManager;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\ChatRooms\ChatRoomsManager\SqlTableModel;
use App\Models\V1\ChatRooms\ChatRoomsManager\SqlViewModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo ChatRooms/ChatRoomsManager.
 *
 * Regras aplicadas aqui (README_modulo_chatrooms.md §4):
 *
 *  - Guest nao cria/edita/exclui sala nenhuma (403) — so pode ler.
 *  - Leitura (get/get-all/search/...) e livre para qualquer usuario nao-guest:
 *    a sala e visivel a todos, diferente da timeline pessoal. Por isso o
 *    "dono ou 404" do TimelineManager vira "dono ou 403" aqui — esconder a
 *    existencia da sala nao faz sentido quando ela ja aparece na listagem.
 *  - No create, o dono e sempre o usuario da sessao (owner_user_manager_id do
 *    corpo e ignorado); moderation_accepted so chega aqui com valor 1 (o
 *    Request ja recusa create sem isso) — mesmo assim o Processor reafirma o
 *    valor e carimba moderation_accepted_at com a hora do servidor.
 *  - status/closed_at/closed_reason nunca entram no create: toda sala nasce
 *    'open' (DEFAULT da coluna).
 *  - No update, so o dono (ou admin) altera a sala — e a unica forma de
 *    escrita deste modulo, entao e tambem a forma de "so o dono reabre":
 *    ninguem mais chega no endpoint. Transicao open->closed carimba
 *    closed_at; closed->open limpa closed_at e closed_reason.
 *  - Exclusoes (soft/restore/hard) seguem a mesma regra de dono/admin;
 *    clear-deleted e so admin (defesa em profundidade — a rota ja tem
 *    filtro adminonly).
 *  - Fechar a sala automaticamente ao atingir 3 membros bloqueados e
 *    integracao futura do modulo ChatRoomMembers (ainda nao construido):
 *    quando existir, ele deve chamar SqlTableModel::update() direto, sem
 *    passar pelas regras de dono deste Processor (acao do sistema, nao do
 *    usuario).
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

    protected function prepareData(array $data): array
    {
        $data['owner_user_manager_id'] = (int) CurrentUser::id();
        $data['moderation_accepted']   = 1;
        $data['moderation_accepted_at'] = date('Y-m-d H:i:s');

        unset($data['status'], $data['closed_at'], $data['closed_reason']);

        return $data;
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        unset($data['owner_user_manager_id'], $data['moderation_accepted'], $data['moderation_accepted_at']);

        if (array_key_exists('status', $data)) {
            $current = $this->tableModel->find($id);
            $currentStatus = $current['status'] ?? null;

            if ($data['status'] === 'closed' && $currentStatus !== 'closed') {
                $data['closed_at'] = date('Y-m-d H:i:s');
            } elseif ($data['status'] === 'open' && $currentStatus !== 'open') {
                $data['closed_at']     = null;
                $data['closed_reason'] = null;
            }
        }

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

    private function assertOwner(int $id, bool $includeDeleted = false): ?array
    {
        if (CurrentUser::isAdmin()) {
            return null;
        }

        $existing = $includeDeleted
            ? $this->tableModel->findWithDeleted($id)
            : $this->tableModel->find($id);

        if ($existing === null) {
            return $this->notFound();
        }

        if ((int) ($existing['owner_user_manager_id'] ?? 0) !== (int) CurrentUser::id()) {
            return $this->forbidden('Somente o dono da sala pode alterar ou excluir');
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
}
