<?php

namespace App\Database\Seeds;

use App\Models\V1\Menu\MenuManager\SqlTableModel as MenuManagerModel;
use App\Models\V1\Nav\NavManager\SqlTableModel as NavManagerModel;
use App\Services\V1\Menu\MenuManager\Processor as MenuManagerProcessor;
use CodeIgniter\Database\Seeder;
use RuntimeException;

/**
 * Seed do Menu (arvore de itens navegaveis de UM nav_manager).
 *
 * Roda NavManagerSeeder primeiro (garante o nav pai; o CASCADE de
 * nav_manager_id ja limpou os itens de menu do nav anterior) e recria toda a
 * arvore de menu_manager vinculada a ele:
 *
 *   - 7 itens de topo (parent_id nulo, sort_order 10..70) = o Navbar real do
 *     site (components/layout/Navbar.tsx via hooks/useSiteMenu.ts, que so le
 *     sort_order < 100 com parent_id nulo).
 *   - 1 arvore administrativa "Menu" (sort_order >= 2000, fora do alcance do
 *     Navbar) com os grupos Inicio/Usuario/Perfil/Buld Form/Nav/Google
 *     Calendar/Extra - usada hoje so na tela /v1/menu-manager?nav_manager_id=
 *     (renderizacao em arvore em pages/v1/menu/GetAllPage.tsx).
 *
 * ATENCAO - bug conhecido: a conexao 'default' usa charset 'utf8' (3 bytes,
 * Config/Database.php:99) em vez de 'utf8mb4' (usado pelos grupos mapa/agenda);
 * titulo com acento causa HTTP 500 no create/update de menu_manager. Por isso
 * os titulos abaixo sao todos ASCII, mesmo onde o nome "correto" teria acento
 * (Inicio, Usuarios, Formularios...). Ver README_modulo_nav_menu.md, secao
 * "Problema conhecido", para o detalhe e a correcao proposta (nao aplicada).
 *
 * Idempotente: reroda NavManagerSeeder (delete-hard-and-recreate do nav; o
 * CASCADE em nav_manager_id apaga os itens de menu do nav anterior).
 *
 * Rodar:  podman compose exec php php spark db:seed MenuManagerSeeder
 */
class MenuManagerSeeder extends Seeder
{
    private MenuManagerProcessor $processor;
    private int $navId;

    public function run(): void
    {
        $this->call(NavManagerSeeder::class);

        $nav = (new NavManagerModel())->where('title', NavManagerSeeder::TITLE)->first();
        if ($nav === null) {
            throw new RuntimeException('MenuManagerSeeder abortado: nav_manager nao encontrado apos NavManagerSeeder.');
        }
        $this->navId = (int) $nav['id'];
        $this->processor = new MenuManagerProcessor();

        // Navbar real (flat, parent_id nulo, sort_order < 100)
        $this->criar(null, 'Inicio', '/', 10);
        $this->criar(null, 'Usuarios', '/v1/user-manager', 20);
        $this->criar(null, 'Uploads', '/v1/upload-manager', 30);
        $this->criar(null, 'Formularios', '/v1/form-constructor', 40);
        $this->criar(null, 'Nav', '/v1/nav-manager', 50);
        $this->criar(null, 'Menus', '/v1/menu-manager', 60);
        $this->criar(null, 'Google Calendars', '/v1/form/calendario', 70);

        // Arvore administrativa "Menu" (sort_order >= 2000)
        $menuId = $this->criar(null, 'Menu', null, 2000);
        $this->criar($menuId, 'Inicio', '/', 1);

        $usuarioId = $this->criar($menuId, 'Usuario', null, 2);
        $this->criar($usuarioId, 'Listar', '/v1/user-manager', 1);

        $perfilId = $this->criar($menuId, 'Perfil', null, 3);
        $this->criar($perfilId, 'Cadastrar Perfil', '/v1/register', 1);

        $buldFormId = $this->criar($menuId, 'Buld Form', null, 4);
        $this->criar($buldFormId, 'Listar', '/v1/form-constructor', 1);
        $this->criar($buldFormId, 'Registrar', '/v1/form-constructor/create', 2);

        $navInnerId = $this->criar($menuId, 'Nav', null, 5);
        $this->criar($navInnerId, 'Listar', '/v1/nav-manager', 1);
        $menuInnerId = $this->criar($navInnerId, 'Menu', null, 2);
        $this->criar($menuInnerId, 'Listar', '/v1/menu-manager', 1);

        $this->criar($menuId, 'Google Calendar', '/v1/form/calendario', 6);

        $extraId = $this->criar($menuId, 'Extra', null, 7);
        $this->criar($extraId, 'V1 (Redirecionamento)', '/v1', 1);
        $this->criar($extraId, 'Criar Usuario', '/v1/user-manager/create', 2);
        $this->criar($extraId, 'Detalhe do Usuario', '/v1/user-manager/:id', 3);
        $this->criar($extraId, 'Editar Usuario', '/v1/user-manager/:id/update', 4);
        $this->criar($extraId, 'Detalhe do Upload', '/v1/upload-manager/:id', 5);
        $this->criar($extraId, 'Editar Formulario', '/v1/form-constructor/update/:id', 6);
        $this->criar($extraId, 'Construtor Legado', '/v1/form-constructor-claude', 7);
        $this->criar($extraId, 'Renderizar Formulario', '/v1/form/:slug', 8);
        $this->criar($extraId, 'V1A (Placeholder)', '/v1a', 9);
        $this->criar($extraId, 'Pagina Nao Encontrada (404)', '*', 10);

        $this->out("OK - arvore de menu recriada para nav #{$this->navId}.");
    }

    private function criar(?int $parentId, string $title, ?string $route, int $sortOrder): int
    {
        $data = [
            'nav_manager_id' => $this->navId,
            'parent_id' => $parentId,
            'title' => $title,
            'sort_order' => $sortOrder,
        ];
        if ($route !== null) {
            $data['react_route'] = $route;
        }

        $res = $this->processor->create($data);
        if (($res['success'] ?? false) !== true) {
            throw new RuntimeException("Seed abortado em '{$title}': " . ($res['message'] ?? 'erro desconhecido'));
        }

        $id = (int) $res['data']['id'];
        // status nasce 'draft' (default da coluna); ativa para o front listar.
        (new MenuManagerModel())->update($id, ['status' => 'active']);

        return $id;
    }

    private function out(string $msg): void
    {
        if (is_cli()) {
            fwrite(STDOUT, "[MenuManagerSeeder] {$msg}\n");
        }
        log_message('info', "[MenuManagerSeeder] {$msg}");
    }
}
