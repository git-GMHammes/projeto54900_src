<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

/**
 * Seed da tabela route_manager — catalogo inicial das rotas backend da API,
 * extraido de app/markdown/geral/README_rotas_swagger.md.
 *
 * Todas as linhas nascem com layer = 'backend'. Rotas do frontend React
 * (src/frontend/projeto54900/src/routes) ainda nao foram levantadas e podem
 * ser adicionadas depois com layer = 'frontend'.
 *
 * Idempotente: INSERT ... ON DUPLICATE KEY UPDATE (method+endpoint e UNIQUE).
 * Reexecutar atualiza object/action/controller_method sem duplicar linhas.
 *
 * Rodar:  php spark db:seed RouteManagerSeeder
 */
class RouteManagerSeeder extends Seeder
{
    private const TABLE = 'route_manager';

    public function run(): void
    {
        $rows = $this->buildRows();

        $placeholders = [];
        $binds        = [];

        foreach ($rows as $row) {
            $placeholders[] = '(?, ?, ?, ?, ?, ?)';
            $binds[]        = $row['layer'];
            $binds[]        = $row['object'];
            $binds[]        = $row['action'];
            $binds[]        = $row['method'];
            $binds[]        = $row['endpoint'];
            $binds[]        = $row['controller_method'];
        }

        $sql = 'INSERT INTO `' . self::TABLE . '` (`layer`, `object`, `action`, `method`, `endpoint`, `controller_method`) VALUES '
            . implode(', ', $placeholders)
            . ' ON DUPLICATE KEY UPDATE '
            . '`object` = VALUES(`object`), '
            . '`action` = VALUES(`action`), '
            . '`controller_method` = VALUES(`controller_method`)';

        $this->db->query($sql, $binds);

        echo sprintf("RouteManagerSeeder: %d rotas processadas.\n", count($rows));
    }

    /**
     * Monta todas as linhas do catalogo, modulo a modulo, na mesma ordem do
     * README_rotas_swagger.md.
     */
    private function buildRows(): array
    {
        return array_merge(
            $this->canonicalManager('Api\V1\User\UserManager', 'user-manager'),
            $this->canonicalView('Api\V1\User\UserManager', 'user-manager-view'),
            $this->readOnly('Api\V1\User\UserRoles', 'user-roles'),
            $this->canonicalManager('Api\V1\User\UserProfiles', 'user-profiles'),

            $this->canonicalManager('Api\V1\Upload\UploadManager', 'upload-manager'),
            $this->uploadManagerExtra(),
            $this->canonicalView('Api\V1\Upload\UploadManager', 'upload-manager-view'),

            $this->canonicalManager('Api\V1\Form\FormManager', 'form-manager'),
            $this->canonicalView('Api\V1\Form\FormManager', 'form-manager-view'),
            $this->canonicalManager('Api\V1\Form\FormGroups', 'form-groups'),
            $this->canonicalManager('Api\V1\Form\FormRows', 'form-rows'),
            $this->canonicalManager('Api\V1\Form\FormCampos', 'form-campos'),

            $this->canonicalManager('Api\V1\Agenda\Calendars', 'calendars'),
            $this->canonicalManager('Api\V1\Agenda\CalendarEvents', 'calendar-events'),
            $this->canonicalManager('Api\V1\Agenda\CalendarEventAttendees', 'calendar-event-attendees'),
            $this->canonicalManager('Api\V1\Agenda\CalendarEventReminders', 'calendar-event-reminders'),
            $this->canonicalManager('Api\V1\Agenda\CalendarEventAttachments', 'calendar-event-attachments'),
            $this->canonicalManager('Api\V1\Agenda\CalendarEventExtendedProperties', 'calendar-event-extended-properties'),

            $this->canonicalManager('Api\V1\Nav\NavManager', 'nav-manager'),
            $this->canonicalManager('Api\V1\Menu\MenuManager', 'menu-manager'),

            $this->dbSchema(),
            $this->canonicalManager('Api\V1\Meta\RouteManager', 'route-manager'),
        );
    }

    /**
     * As 18 rotas canonicas de um modulo "Manager" com tabela fisica.
     */
    private function canonicalManager(string $namespace, string $object, string $controller = 'ResourceTableController'): array
    {
        $base = $namespace . '\\' . $controller;

        return [
            $this->row($object, 'find', 'POST', "/api/v1/{$object}/find", "{$base}::find"),
            $this->row($object, 'get-grouped', 'POST', "/api/v1/{$object}/get-grouped", "{$base}::getGrouped"),
            $this->row($object, 'search', 'GET', "/api/v1/{$object}/search", "{$base}::search"),
            $this->row($object, 'get', 'GET', "/api/v1/{$object}/get/{id}", "{$base}::get/\$1"),
            $this->row($object, 'get-all', 'GET', "/api/v1/{$object}/get-all", "{$base}::getAll"),
            $this->row($object, 'get-no-pagination', 'GET', "/api/v1/{$object}/get-no-pagination", "{$base}::getNoPagination"),
            $this->row($object, 'get-deleted', 'GET', "/api/v1/{$object}/get-deleted/{id}", "{$base}::getDeleted/\$1"),
            $this->row($object, 'get-with-deleted', 'GET', "/api/v1/{$object}/get-with-deleted/{id}", "{$base}::getWithDeleted/\$1"),
            $this->row($object, 'get-deleted-all', 'GET', "/api/v1/{$object}/get-deleted-all", "{$base}::getDeletedAll"),
            $this->row($object, 'get-all-with-deleted', 'GET', "/api/v1/{$object}/get-all-with-deleted/{id}", "{$base}::getAllWithDeleted/\$1"),
            $this->row($object, 'get-all-with-deleted', 'GET', "/api/v1/{$object}/get-all-with-deleted", "{$base}::getAllWithDeleted"),
            $this->row($object, 'create', 'POST', "/api/v1/{$object}/create", "{$base}::create"),
            $this->row($object, 'update', 'PUT', "/api/v1/{$object}/update/{id}", "{$base}::update/\$1"),
            $this->row($object, 'delete-soft', 'DELETE', "/api/v1/{$object}/delete-soft/{id}", "{$base}::deleteSoft/\$1"),
            $this->row($object, 'delete-restore', 'PATCH', "/api/v1/{$object}/delete-restore/{id}", "{$base}::deleteRestore/\$1"),
            $this->row($object, 'delete-hard', 'DELETE', "/api/v1/{$object}/delete-hard/{id}", "{$base}::deleteHard/\$1"),
            $this->row($object, 'clear-deleted', 'DELETE', "/api/v1/{$object}/clear-deleted", "{$base}::clearDeleted"),
            $this->row($object, 'clear-deleted', 'DELETE', "/api/v1/{$object}/clear-deleted/{id}", "{$base}::clearDeleted/\$1"),
        ];
    }

    /**
     * As 9 rotas somente-leitura de uma view (ResourceViewController).
     */
    private function canonicalView(string $namespace, string $object): array
    {
        $base = $namespace . '\ResourceViewController';

        return [
            $this->row($object, 'find', 'POST', "/api/v1/{$object}/find", "{$base}::find"),
            $this->row($object, 'get-grouped', 'POST', "/api/v1/{$object}/get-grouped", "{$base}::getGrouped"),
            $this->row($object, 'search', 'GET', "/api/v1/{$object}/search", "{$base}::search"),
            $this->row($object, 'get', 'GET', "/api/v1/{$object}/get/{id}", "{$base}::get/\$1"),
            $this->row($object, 'get-all', 'GET', "/api/v1/{$object}/get-all", "{$base}::getAll"),
            $this->row($object, 'get-no-pagination', 'GET', "/api/v1/{$object}/get-no-pagination", "{$base}::getNoPagination"),
            $this->row($object, 'get-deleted', 'GET', "/api/v1/{$object}/get-deleted/{id}", "{$base}::getDeleted/\$1"),
            $this->row($object, 'get-all-with-deleted', 'GET', "/api/v1/{$object}/get-all-with-deleted", "{$base}::getAllWithDeleted"),
            $this->row($object, 'get-deleted-all', 'GET', "/api/v1/{$object}/get-deleted-all", "{$base}::getDeletedAll"),
        ];
    }

    /**
     * As 6 rotas somente-leitura de um modulo sem create/update/delete (ex.: user-roles).
     */
    private function readOnly(string $namespace, string $object): array
    {
        $base = $namespace . '\ResourceTableController';

        return [
            $this->row($object, 'find', 'POST', "/api/v1/{$object}/find", "{$base}::find"),
            $this->row($object, 'get-grouped', 'POST', "/api/v1/{$object}/get-grouped", "{$base}::getGrouped"),
            $this->row($object, 'search', 'GET', "/api/v1/{$object}/search", "{$base}::search"),
            $this->row($object, 'get', 'GET', "/api/v1/{$object}/get/{id}", "{$base}::get/\$1"),
            $this->row($object, 'get-all', 'GET', "/api/v1/{$object}/get-all", "{$base}::getAll"),
            $this->row($object, 'get-no-pagination', 'GET', "/api/v1/{$object}/get-no-pagination", "{$base}::getNoPagination"),
        ];
    }

    /**
     * Rotas proprias de upload-manager fora do contrato canonico (multipart + binario).
     */
    private function uploadManagerExtra(): array
    {
        $base   = 'Api\V1\Upload\UploadManager\ResourceTableController';
        $object = 'upload-manager';

        return [
            $this->row($object, 'upload', 'POST', "/api/v1/{$object}/upload", "{$base}::upload"),
            $this->row($object, 'serve', 'GET', "/api/v1/{$object}/serve/{id}", "{$base}::serve/\$1"),
            $this->row($object, 'download', 'GET', "/api/v1/{$object}/download/{id}", "{$base}::download/\$1"),
        ];
    }

    /**
     * As 3 rotas de introspeccao do banco (Meta/DbSchema, somente leitura).
     */
    private function dbSchema(): array
    {
        $base   = 'Api\V1\Meta\DbSchema\SchemaController';
        $object = 'db-schema';

        return [
            $this->row($object, 'tables', 'GET', "/api/v1/{$object}/tables", "{$base}::tables"),
            $this->row($object, 'columns', 'GET', "/api/v1/{$object}/columns/{tabela}", "{$base}::columns/\$1"),
            $this->row($object, 'describe', 'GET', "/api/v1/{$object}/describe/{tabela}", "{$base}::describe/\$1"),
        ];
    }

    private function row(string $object, string $action, string $method, string $endpoint, string $controllerMethod): array
    {
        return [
            'layer'             => 'backend',
            'object'            => $object,
            'action'            => $action,
            'method'            => $method,
            'endpoint'          => $endpoint,
            'controller_method' => $controllerMethod,
        ];
    }
}
