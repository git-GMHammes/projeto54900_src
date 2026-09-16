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
 * nav_manager_id ja limpou os itens de menu do nav anterior) e recria a
 * arvore de menu_manager vinculada a ele - essa arvore E o Navbar real do
 * site (components/layout/Navbar.tsx via hooks/useSiteMenu.ts), espelhando
 * 1:1 os grupos de modulo do backend (Config/Routes.php: /User, /Upload,
 * /Form, /Nav, /Menu - Agenda e Meta ficam fora por nao terem pagina no
 * frontend ainda):
 *
 *   Inicio                 -> /
 *   User (sem link)
 *     |- Usuarios          -> /v1/user-manager
 *     `- Cadastro          -> /v1/register
 *   Upload                 -> /v1/upload-manager
 *   Form (sem link)
 *     |- Formularios       -> /v1/form-constructor
 *     `- Google Calendars  -> /v1/form/calendario
 *   Nav                    -> /v1/nav-manager
 *   Menu                   -> /v1/menu-manager
 *   Entrar                 -> /v1/login
 *
 * Regra: grupo com filho nunca tem react_route (fica so como agrupador do
 * dropdown); modulo com uma pagina so vira link direto, sem filho.
 * Nao ha mais catalogo de rotas extras nem arvore administrativa separada -
 * menu_manager guarda so o que aparece no Navbar.
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

        // Navbar real - espelha 1:1 os grupos de modulo do backend. Grupo com
        // filho nao tem react_route (so agrupa o dropdown); modulo com 1
        // pagina so vira link direto.
        $this->criar(null, 'Inicio', '/', 10);

        $userId = $this->criar(null, 'User', null, 20);
        $this->criar($userId, 'Usuarios', '/v1/user-manager', 1);
        $this->criar($userId, 'Cadastro', '/v1/register', 2);

        $this->criar(null, 'Upload', '/v1/upload-manager', 30);

        $formId = $this->criar(null, 'Form', null, 40);
        $this->criar($formId, 'Formularios', '/v1/form-constructor', 1);
        $this->criar($formId, 'Google Calendars', '/v1/form/calendario', 2);

        $this->criar(null, 'Nav', '/v1/nav-manager', 50);
        $this->criar(null, 'Menu', '/v1/menu-manager', 60);

        $this->criar(null, 'Entrar', '/v1/login', 70);

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
