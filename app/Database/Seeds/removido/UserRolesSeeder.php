<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

/**
 * Seed da tabela user_roles — perfis de acesso (1 perfil por usuário via
 * user_manager.user_role_id).
 *
 * Perfis:
 *   admin  — Acesso total ao sistema.            permissions ["*"]
 *   user   — Usuário autenticado padrão.         permissions ["forms.read","forms.submit","profile.read","profile.update"]
 *   guest  — Acesso público, somente leitura.    permissions ["forms.read"]
 *
 * As permissions são placeholders: ainda não há mecanismo de autorização no
 * projeto que as consuma. status = 1 (ativo) nos três.
 *
 * Idempotente: INSERT ... ON DUPLICATE KEY UPDATE (slug é UNIQUE). Reexecutar
 * atualiza name/description/permissions/status sem trocar id nem created_at.
 *
 * Conexão: default (banco codeigniter54900_db, onde user_roles vive).
 *
 * Rodar:  php spark db:seed UserRolesSeeder
 */
class UserRolesSeeder extends Seeder
{
    private const TABLE = 'user_roles';

    public function run(): void
    {
        $roles = [
            [
                'name'        => 'Admin',
                'slug'        => 'admin',
                'description' => 'Acesso total ao sistema.',
                'permissions' => ['*'],
                'status'      => 1,
            ],
            [
                'name'        => 'User',
                'slug'        => 'user',
                'description' => 'Usuario autenticado padrao.',
                'permissions' => ['forms.read', 'forms.submit', 'profile.read', 'profile.update'],
                'status'      => 1,
            ],
            [
                'name'        => 'Guest',
                'slug'        => 'guest',
                'description' => 'Acesso publico, somente leitura.',
                'permissions' => ['forms.read'],
                'status'      => 1,
            ],
        ];

        $placeholders = [];
        $binds        = [];

        foreach ($roles as $role) {
            $placeholders[] = '(?, ?, ?, ?, ?)';
            $binds[]        = $role['name'];
            $binds[]        = $role['slug'];
            $binds[]        = $role['description'];
            $binds[]        = json_encode(
                $role['permissions'],
                JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
            );
            $binds[]        = $role['status'];
        }

        $sql = 'INSERT INTO `' . self::TABLE . '` (`name`, `slug`, `description`, `permissions`, `status`) VALUES '
            . implode(', ', $placeholders)
            . ' ON DUPLICATE KEY UPDATE '
            . '`name` = VALUES(`name`), '
            . '`description` = VALUES(`description`), '
            . '`permissions` = VALUES(`permissions`), '
            . '`status` = VALUES(`status`)';

        $this->db->query($sql, $binds);

        echo sprintf("UserRolesSeeder: %d perfis processados (admin, user, guest).\n", count($roles));
    }
}
