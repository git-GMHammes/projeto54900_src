<?php

namespace App\Services\V1\Messages\MessageWarnings;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Messages\MessageWarnings\SqlTableModel;
use App\Models\V1\Messages\MessageWarnings\SqlViewModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Messages/MessageWarnings — advertencia de palavrao.
 *
 * Mesmo desenho de ChatRooms/ChatRoomWarnings: nao ha "autor" de uma advertencia — e registro de moderacao
 * sobre outro usuario (revela ate a palavra proibida usada), por isso o modulo inteiro (tabela 18 + view 9
 * rotas) e adminonly na propria rota, e este Processor reconfere (defesa em profundidade). A advertencia
 * automatica NAO passa por aqui: o filtro de palavrao (App\\Libraries\\ForbiddenWords) a grava direto via
 * SqlTableModel::register() quando recusa uma mensagem (MessagesManager e MessageGroupMessages).
 *
 *  - Create manual (admin): mensagem (404) e autor (404) precisam existir; o grupo vem da propria mensagem.
 *  - Update: so `flagged_word`; mensagem, autor e grupo sao imutaveis.
 *  - Todo write (create/update/delete-*) e so admin (403); as leituras herdam o adminonly da rota.
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
        $messageId = (int) ($data['messages_manager_id'] ?? 0);
        $userId    = (int) ($data['user_manager_id'] ?? 0);

        if ($this->tableModel->findMessage($messageId) === null) {
            return $this->notFound('Mensagem nao encontrada');
        }

        if (!$this->tableModel->userExists($userId)) {
            return $this->notFound('Usuario nao encontrado');
        }

        return null;
    }

    protected function prepareData(array $data): array
    {
        $data['message_groups_manager_id'] = $this->tableModel->groupIdOfMessage((int) $data['messages_manager_id']);

        return $data;
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        return array_intersect_key($data, array_flip(['flagged_word']));
    }

    // -------------------------------------------------------------------------
    // Escrita — so admin
    // -------------------------------------------------------------------------

    public function create(array $data): array
    {
        return $this->adminOnly() ?? parent::create($data);
    }

    public function update(int $id, array $data): array
    {
        return $this->adminOnly() ?? parent::update($id, $data);
    }

    public function deleteSoft(int $id): array
    {
        return $this->adminOnly() ?? parent::deleteSoft($id);
    }

    public function deleteRestore(int $id): array
    {
        return $this->adminOnly() ?? parent::deleteRestore($id);
    }

    public function deleteHard(int $id): array
    {
        return $this->adminOnly() ?? parent::deleteHard($id);
    }

    public function clearDeleted(?int $id = null): array
    {
        return $this->adminOnly() ?? parent::clearDeleted($id);
    }

    // -------------------------------------------------------------------------
    // Privados
    // -------------------------------------------------------------------------

    private function adminOnly(): ?array
    {
        if (!CurrentUser::isAdmin()) {
            return ['success' => false, 'message' => 'Somente admin gerencia advertencias', 'code' => 403];
        }

        return null;
    }

    private function notFound(string $message): array
    {
        return ['success' => false, 'message' => $message, 'code' => 404];
    }
}
