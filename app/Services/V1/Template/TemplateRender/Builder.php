<?php

namespace App\Services\V1\Template\TemplateRender;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Template\TempFooter\SqlTableModel as TempFooterModel;
use App\Models\V1\Template\TempHeader\SqlTableModel as TempHeaderModel;
use App\Models\V1\Template\TempMenu\SqlTableModel as TempMenuModel;
use App\Models\V1\Template\TempNav\SqlTableModel as TempNavModel;
use Config\Database;

/**
 * Monta o template da empresa da sessao no formato dos JSONs template00X.json
 * (header, nav, menu, footer), a partir das tabelas temp_*.
 *
 * Os models usam o escopo 'json_slug': so entram as linhas cuja lista company_manager
 * traz o slug da empresa da sessao. Aqui entram apenas registros ativos e nao excluidos.
 *
 * Saida:
 *  - color_theme  paleta de cores da empresa (company_manager.color_theme) ou null (padrao do sistema)
 *  - template   template efetivo ({ id, code, name }) ou null: a escolha do usuario (user_manager.temp_manager_id)
 *               se ainda for um template ativo da empresa da sessao; senao o de menor id ativo da empresa
 *  - templates  templates ativos da empresa da sessao, em ordem de id (o primeiro e o padrao)
 *  - preferred_id  escolha gravada do usuario (ou null = automatico)
 *  - temp_nav   casca do app (title, image, message_icon, system_version) ou null
 *  - nav[]      itens de topo com placement 'navbar' (com children)
 *  - menu[]     itens de topo com placement 'offcanvas' = menu lateral (com children)
 *  - headers[]  um objeto por linha ativa de temp_header, em sort_order (empilhados):
 *               { id, name, sort_order, background_image[], logo[], company_name[] }
 *  - footers[]  um objeto por linha ativa de temp_footer, em sort_order:
 *               { id, name, sort_order, title, layout, footer_headings[], footer_images[] }
 *               (layout 'columns' ou 'highlight'; footer_headings[].icon = classe Bootstrap Icons)
 *
 * O menu ja sai filtrado por roles: item sem roles e livre; com roles, so para o perfil
 * listado; superuser ve tudo. Item cujo pai esta oculto some junto.
 */
class Builder
{
    private const POSITIONS = ['left', 'center', 'right'];

    /** Raizes de temp_menu com sort_order >= este valor nao entram no nav nem no menu lateral. */
    private const NAV_SORT_ORDER_LIMIT = 100;

    /** @return array<string,mixed> */
    public function build(?int $tempNavId = null): array
    {
        $nav = $this->resolveNav($tempNavId);

        $tree = $nav !== null ? $this->menuTree((int) $nav['id']) : [];

        $available   = $this->templatesOfSessionCompany();
        $preferredId = $this->preferredTemplateId();

        return [
            'color_theme'  => $this->colorThemeOfCompany(CurrentUser::companyId() ?? (int) config('Company')->defaultCompanyId),
            'template'     => $this->effectiveTemplate($available, $preferredId),
            'templates'    => $available,
            'preferred_id' => $preferredId,
            'temp_nav' => $nav === null ? null : [
                'id'             => (int) $nav['id'],
                'title'          => $nav['title'],
                'image'          => $nav['image'],
                'message_icon'   => $nav['message_icon'],
                'system_version' => $nav['system_version'],
            ],
            'nav'     => $this->byPlacement($tree, 'navbar'),
            'menu'    => $this->byPlacement($tree, 'offcanvas'),
            'headers' => array_map(fn (array $row): array => $this->header($row), $this->activeRows(new TempHeaderModel())),
            'footers' => array_map(fn (array $row): array => $this->footer($row), $this->activeRows(new TempFooterModel())),
        ];
    }

    // -------------------------------------------------------------------------
    // Template da empresa (temp_manager) e preferencia do usuario
    // -------------------------------------------------------------------------

    /**
     * Templates ativos da empresa da sessao (a lista company_manager traz o slug dela), em ordem de id.
     * O primeiro e o padrao da empresa.
     *
     * @return list<array{id:int,code:string,name:string}>
     */
    public function templatesOfSessionCompany(): array
    {
        $db  = Database::connect(DB_GROUP_001);
        $cid = CurrentUser::companyId() ?? (int) config('Company')->defaultCompanyId;

        $empresa = $db->table('company_manager')->select('slug')->where('id', $cid)->where('deleted_at', null)->get()->getRowArray();

        return $empresa === null ? [] : $this->templatesOfSlug((string) $empresa['slug']);
    }

    /**
     * Conteudo PUBLICO do template da empresa de um slug (visitante, antes do login): o template padrao
     * (menor id ativo), os cabecalhos e os rodapes ativos que listam o slug. NAO traz nav, menu nem a casca
     * do app. Slug inexistente ou inativo -> tudo vazio. Como a rota nao tem sessao, o filtro por empresa
     * e feito aqui, explicitamente, pelo slug.
     *
     * @return array{color_theme: string|null, template: array{id:int,code:string,name:string}|null, headers: list<array<string,mixed>>, footers: list<array<string,mixed>>}
     */
    public function publicContentOfSlug(string $slug): array
    {
        $db = Database::connect(DB_GROUP_001);

        $empresa = $db->table('company_manager')
            ->select('slug')
            ->where('slug', $slug)
            ->where('status', 'active')
            ->where('deleted_at', null)
            ->get()
            ->getRowArray();

        if ($empresa === null) {
            return ['color_theme' => null, 'template' => null, 'headers' => [], 'footers' => []];
        }

        $slug = (string) $empresa['slug'];

        return [
            'color_theme' => $this->colorThemeOfSlug($slug),
            'template' => $this->templatesOfSlug($slug)[0] ?? null,
            'headers'  => array_map(fn (array $row): array => $this->header($row), $this->activeRowsOfSlug(new TempHeaderModel(), $slug)),
            'footers'  => array_map(fn (array $row): array => $this->footer($row), $this->activeRowsOfSlug(new TempFooterModel(), $slug)),
        ];
    }

    /** Paleta de cores da empresa (company_manager.color_theme) ou null = padrao do sistema. */
    private function colorThemeOfCompany(int $companyId): ?string
    {
        $row = Database::connect(DB_GROUP_001)->table('company_manager')
            ->select('color_theme')
            ->where('id', $companyId)
            ->where('deleted_at', null)
            ->get()
            ->getRowArray();

        $value = $row['color_theme'] ?? null;

        return is_string($value) && $value !== '' ? $value : null;
    }

    private function colorThemeOfSlug(string $slug): ?string
    {
        $row = Database::connect(DB_GROUP_001)->table('company_manager')
            ->select('color_theme')
            ->where('slug', $slug)
            ->where('deleted_at', null)
            ->get()
            ->getRowArray();

        $value = $row['color_theme'] ?? null;

        return is_string($value) && $value !== '' ? $value : null;
    }

    /**
     * Templates ativos cuja lista company_manager traz o slug, em ordem de id.
     *
     * @return list<array{id:int,code:string,name:string}>
     */
    private function templatesOfSlug(string $slug): array
    {
        $db = Database::connect(DB_GROUP_001);

        $rows = $db->table('temp_manager')
            ->select('id, code, name')
            ->where('deleted_at', null)
            ->where('status', 'active')
            ->where('JSON_CONTAINS(company_manager, JSON_QUOTE(' . $db->escape($slug) . '))', null, false)
            ->orderBy('id', 'ASC')
            ->get()
            ->getResultArray();

        return array_map(
            static fn (array $r): array => ['id' => (int) $r['id'], 'code' => $r['code'], 'name' => $r['name']],
            $rows
        );
    }

    /** Template escolhido pelo usuario da sessao (user_manager.temp_manager_id) ou null. */
    private function preferredTemplateId(): ?int
    {
        $userId = CurrentUser::id();
        if ($userId === null) {
            return null;
        }

        $row = Database::connect(DB_GROUP_001)->table('user_manager')
            ->select('temp_manager_id')
            ->where('id', $userId)
            ->where('deleted_at', null)
            ->get()
            ->getRowArray();

        return isset($row['temp_manager_id']) ? (int) $row['temp_manager_id'] : null;
    }

    /**
     * Template efetivo: a escolha do usuario, se ainda for um template ativo da empresa da sessao;
     * senao o padrao (menor id ativo da empresa); senao null.
     *
     * @param list<array{id:int,code:string,name:string}> $available
     * @return array{id:int,code:string,name:string}|null
     */
    private function effectiveTemplate(array $available, ?int $preferredId): ?array
    {
        if ($preferredId !== null) {
            foreach ($available as $t) {
                if ($t['id'] === $preferredId) {
                    return $t;
                }
            }
        }

        return $available[0] ?? null;
    }

    // -------------------------------------------------------------------------
    // Nav e menu
    // -------------------------------------------------------------------------

    /** @return array<string,mixed>|null */
    private function resolveNav(?int $tempNavId): ?array
    {
        $model = new TempNavModel();
        $model->where('status', 'active');

        if ($tempNavId !== null && $tempNavId > 0) {
            $model->where('id', $tempNavId);
        }

        return $model->orderBy('id', 'ASC')->first();
    }

    /** @return list<array<string,mixed>> arvore de itens visiveis, em sort_order */
    private function menuTree(int $tempNavId): array
    {
        $rows = (new TempMenuModel())
            ->where('temp_nav_id', $tempNavId)
            ->where('status', 'active')
            ->orderBy('sort_order', 'ASC')
            ->orderBy('id', 'ASC')
            ->findAll();

        $byParent = [];
        foreach ($rows as $row) {
            if (!$this->visibleForRole($row['roles'] ?? null)) {
                continue;
            }

            // Faixa de sort_order: so as raizes < 100 formam a navegacao real (>= 1000 catalogo, >= 2000 arvore admin).
            // Os filhos de uma raiz fora da faixa ficam sem pai alcancavel e tambem somem.
            if ($row['parent_id'] === null && (int) $row['sort_order'] >= self::NAV_SORT_ORDER_LIMIT) {
                continue;
            }
            $byParent[(int) ($row['parent_id'] ?? 0)][] = $row;
        }

        return $this->branch($byParent, 0);
    }

    /**
     * @param array<int,list<array<string,mixed>>> $byParent
     * @return list<array<string,mixed>>
     */
    private function branch(array $byParent, int $parentId): array
    {
        $out = [];

        foreach ($byParent[$parentId] ?? [] as $row) {
            $out[] = [
                'id'          => (int) $row['id'],
                'order'       => (int) $row['sort_order'],
                'label'       => $row['title'],
                'url'         => $row['react_route'],
                'icon'        => $row['icon'] ?? null,
                'is_bookmark' => (int) ($row['is_bookmark'] ?? 0),
                'type'        => 'link',
                'placement'   => $row['placement'],
                'children'    => $this->branch($byParent, (int) $row['id']),
            ];
        }

        return $out;
    }

    /**
     * @param list<array<string,mixed>> $tree
     * @return list<array<string,mixed>>
     */
    private function byPlacement(array $tree, string $placement): array
    {
        return array_values(array_filter($tree, static fn (array $item): bool => $item['placement'] === $placement));
    }

    /** roles (JSON de slugs): vazio = livre; senao so o perfil listado; superuser ve tudo. */
    private function visibleForRole(mixed $roles): bool
    {
        if (CurrentUser::isSuperuser()) {
            return true;
        }

        $list = is_string($roles) ? json_decode($roles, true) : $roles;
        if (!is_array($list) || $list === []) {
            return true;
        }

        return in_array(CurrentUser::roleSlug(), $list, true);
    }

    // -------------------------------------------------------------------------
    // Cabecalho e rodape
    // -------------------------------------------------------------------------

    /**
     * Linhas ativas cuja lista company_manager traz o slug (filtro explicito, para a rota publica).
     *
     * @return list<array<string,mixed>>
     */
    private function activeRowsOfSlug(object $model, string $slug): array
    {
        $db = Database::connect(DB_GROUP_001);

        return $model
            ->where('status', 'active')
            ->where('JSON_CONTAINS(company_manager, JSON_QUOTE(' . $db->escape($slug) . '))', null, false)
            ->orderBy('sort_order', 'ASC')
            ->orderBy('id', 'ASC')
            ->findAll();
    }

    /** @return list<array<string,mixed>> */
    private function activeRows(object $model): array
    {
        return $model->where('status', 'active')->orderBy('sort_order', 'ASC')->orderBy('id', 'ASC')->findAll();
    }

    /**
     * @param array<string,mixed> $r
     * @return array<string,mixed>
     */
    private function header(array $r): array
    {
        $logos = [];
        foreach (self::POSITIONS as $i => $pos) {
            $text  = (string) ($r["logo_{$pos}_text"] ?? '');
            $image = (string) ($r["logo_{$pos}_image"] ?? '');

            if ($text === '' && $image === '') {
                continue;
            }

            // Com imagem, ela substitui o texto (regra do template, aplicada no frontend).
            $logos[] = [
                'id'        => $i + 1,
                'position'  => $pos,
                'text'      => $text,
                'image_url' => $image,
                'alt'       => (string) ($r["logo_{$pos}_alt"] ?? ''),
            ];
        }

        $background = (string) ($r['background_image'] ?? '');
        $name       = (string) ($r['company_name'] ?? '');

        return [
            'id'               => (int) $r['id'],
            'name'             => $r['name'],
            'sort_order'       => (int) $r['sort_order'],
            'background_image' => $background === '' ? [] : [['id' => 1, 'url' => $background, 'alt' => (string) ($r['background_alt'] ?? '')]],
            'logo'             => $logos,
            'company_name'     => $name === '' ? [] : [['id' => 1, 'text' => $name]],
        ];
    }

    /**
     * @param array<string,mixed> $r
     * @return array<string,mixed>
     */
    private function footer(array $r): array
    {
        $headings = [];
        $images   = [];

        for ($n = 1; $n <= 4; $n++) {
            $image = (string) ($r["col{$n}_image"] ?? '');
            $title = (string) ($r["col{$n}_title"] ?? '');
            $text  = (string) ($r["col{$n}_text"] ?? '');

            // Imagem preenchida vence titulo e texto; coluna sem nada nao aparece.
            if ($image !== '') {
                $images[] = ['id' => $n, 'order' => $n, 'column' => $n, 'url' => $image, 'alt' => (string) ($r["col{$n}_alt"] ?? '')];
            } elseif ($title !== '' || $text !== '') {
                $headings[] = [
                    'id' => $n, 'order' => $n, 'column' => $n, 'title' => $title, 'text' => $text,
                    'icon' => (string) ($r["col{$n}_icon"] ?? ''),
                ];
            }
        }

        // Modelo 'highlight' (titulo + itens com icone); qualquer outro valor mantem as colunas de sempre.
        $layout = (string) ($r['layout'] ?? '');

        return [
            'id'              => (int) $r['id'],
            'name'            => $r['name'],
            'sort_order'      => (int) $r['sort_order'],
            'title'           => (string) ($r['title'] ?? ''),
            'layout'          => $layout === 'highlight' ? 'highlight' : 'columns',
            'footer_headings' => $headings,
            'footer_images'   => $images,
        ];
    }
}
