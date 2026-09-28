<?php

namespace App\Services\V1\Timeline\TimelinePosts;

use App\Libraries\Auth\CurrentUser;
use App\Models\V1\Timeline\TimelineManager\SqlTableModel as TimelineManagerModel;
use App\Models\V1\Timeline\TimelinePostRatings\SqlTableModel as TimelinePostRatingsModel;
use App\Models\V1\Timeline\TimelinePostReactions\SqlTableModel as TimelinePostReactionsModel;
use App\Models\V1\Timeline\TimelinePosts\SqlTableModel;
use App\Models\V1\Timeline\TimelinePosts\SqlViewModel;
use App\Models\V1\User\UserManager\SqlTableModel as UserManagerModel;
use App\Services\V1\BaseTableService;

/**
 * Service de negocio do modulo Timeline/TimelinePosts — a publicacao.
 *
 * Regras da §4 do markdown do modulo que vivem aqui:
 *
 *  1. Timeline automatica: o create garante a timeline do usuario (cria na
 *     mesma transacao se ainda nao existir, com slug derivado do username) e
 *     grava o id em timeline_manager_id.
 *  2. Dono sempre da sessao: user_manager_id vem do token; se o corpo trouxer
 *     timeline_manager_id, o dono daquela timeline tem de ser o usuario atual
 *     (senao 403).
 *  3. published_at = agora quando status = published e o campo vem vazio;
 *     edited_at = agora no update de title/content.
 *  4. Republicacao por repost_of_id: o post original precisa existir, estar
 *     publicado e nao estar excluido. O auto-reposto e recusado no update.
 *  8. Visibilidade (2026-09-28, revisado 2026-09-28 — lista admin
 *     '/v1/timeline-post' precisa ver todo mundo): os 9 endpoints de leitura
 *     da VIEW (timeline-posts-view: get-grouped, find, search, get, get-all,
 *     ...) devolvem so posts do usuario do JWT (tp_user_manager_id) para
 *     quem NAO e admin — ninguem observa o feed de outro. Admin ve todos
 *     (mesmo escape de `assertOwner`, usado na escrita). O Home Feed
 *     (homeFeed, feed social misto) continua mostrando todos os publicados,
 *     independente de role. Escrita so do dono (admin escapa).
 */
class Processor extends BaseTableService
{
    /** Bloco da 1a pagina do Home Feed, na ordem de exibicao (ver homeFeed()). */
    private const FIRST_PAGE_QUOTAS = ['recent' => 5, 'rated' => 3, 'liked' => 3, 'commented' => 3];

    protected SqlTableModel $tableModel;
    protected SqlViewModel $viewModel;

    private TimelineManagerModel $timelineManagerModel;
    private UserManagerModel $userManagerModel;
    private TimelinePostReactionsModel $reactionsModel;
    private TimelinePostRatingsModel $ratingsModel;

    public function __construct()
    {
        $this->tableModel           = new SqlTableModel();
        $this->viewModel            = new SqlViewModel();
        $this->timelineManagerModel = new TimelineManagerModel();
        $this->userManagerModel     = new UserManagerModel();
        $this->reactionsModel       = new TimelinePostReactionsModel();
        $this->ratingsModel         = new TimelinePostRatingsModel();
    }

    // -------------------------------------------------------------------------
    // Hooks
    // -------------------------------------------------------------------------

    protected function validateOnCreate(array $data): ?array
    {
        $temTitulo   = trim((string) ($data['title'] ?? '')) !== '';
        $temConteudo = trim((string) ($data['content'] ?? '')) !== '';

        if (!$temTitulo && !$temConteudo) {
            return $this->invalid('Informe o titulo ou o conteudo da publicacao');
        }

        $repostOf = $data['repost_of_id'] ?? null;
        if ($repostOf !== null && $repostOf !== '') {
            $original = $this->tableModel->find((int) $repostOf);

            if ($original === null) {
                return $this->notFound('Publicacao original nao encontrada');
            }

            if ((string) ($original['status'] ?? '') !== 'published') {
                return $this->conflict('So e possivel republicar uma publicacao publicada');
            }
        }

        return null;
    }

    protected function prepareData(array $data): array
    {
        $data['status'] = $data['status'] ?? 'published';

        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = date('Y-m-d H:i:s');
        }

        return $data;
    }

    protected function prepareUpdateData(int $id, array $data): array
    {
        unset($data['user_manager_id'], $data['timeline_manager_id'], $data['repost_of_id'], $data['published_at']);

        if (array_key_exists('content', $data) || array_key_exists('title', $data)) {
            $data['edited_at'] = date('Y-m-d H:i:s');
        }

        if (($data['status'] ?? null) === 'published') {
            $existing = $this->tableModel->find($id);
            if ($existing !== null && empty($existing['published_at'])) {
                $data['published_at'] = date('Y-m-d H:i:s');
            }
        }

        return $data;
    }

    // -------------------------------------------------------------------------
    // Escrita
    // -------------------------------------------------------------------------

    public function create(array $data): array
    {
        if (CurrentUser::roleSlug() === 'guest') {
            return $this->forbidden();
        }

        $userId = (int) CurrentUser::id();

        $timelineId = $data['timeline_manager_id'] ?? null;

        if ($timelineId !== null && $timelineId !== '') {
            $timeline = $this->timelineManagerModel->find((int) $timelineId);

            if ($timeline === null) {
                return $this->notFound('Timeline nao encontrada');
            }

            if ((int) ($timeline['user_manager_id'] ?? 0) !== $userId) {
                return $this->forbidden('A timeline informada nao pertence a este usuario');
            }
        } else {
            $timeline = $this->timelineFor($userId);

            if ($timeline === null) {
                return ['success' => false, 'message' => 'Nao foi possivel resolver a timeline do usuario', 'code' => 500];
            }

            $data['timeline_manager_id'] = (int) $timeline['id'];
        }

        $data['user_manager_id'] = $userId;

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
    // Leitura — View restrita ao usuario do JWT (regra 8)
    // -------------------------------------------------------------------------
    //
    // Mesmo mecanismo do CalendarManager\Processor: Closure de escopo passada
    // aos metodos de BaseViewModel. O id vem SEMPRE do token (CurrentUser),
    // nunca do corpo/query — filtro tp_user_manager_id enviado pelo cliente e
    // descartado.

    public function findView(array $filters, array $params): array
    {
        unset($filters['tp_user_manager_id']);
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findPaginatedView($this->removeMasks($filters), $p['page'], $p['limit'], $p['sort'], $p['order'], $this->ownerScope());
    }

    public function getGroupedView(array $multiFilters, array $params): array
    {
        unset($multiFilters['tp_user_manager_id']);
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findGroupedView($this->removeMasks($multiFilters), $p['page'], $p['limit'], $p['sort'], $p['order'], $this->ownerScope());
    }

    public function searchView(string $term, array $params, array $filters = []): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->searchByTermView($term, $p['page'], $p['limit'], $p['sort'], $p['order'], $filters, $this->ownerScope());
    }

    public function getView(int $id): ?array
    {
        return $this->ownRowOrNull($this->viewModel->findById($id));
    }

    public function getAllView(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findPaginatedView([], $p['page'], $p['limit'], $p['sort'], $p['order'], $this->ownerScope());
    }

    public function getNoPaginationView(string $sort, string $order, ?int $limit = null): array
    {
        return $this->viewModel->findAllView($sort, $order, $limit, $this->ownerScope());
    }

    public function getDeletedView(int $id): ?array
    {
        return $this->ownRowOrNull($this->viewModel->findDeletedById($id));
    }

    public function getDeletedAllView(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findDeletedPaginatedView($p['page'], $p['limit'], $p['sort'], $p['order'], $this->ownerScope());
    }

    public function getAllWithDeletedView(array $params): array
    {
        $p = $this->buildPaginationParams($params);

        return $this->viewModel->findAllWithDeletedPaginatedView($p['page'], $p['limit'], $p['sort'], $p['order'], $this->ownerScope());
    }

    /** Closure de escopo: so linhas cujo autor e o usuario do JWT — admin nao e escopado (mesmo escape de `assertOwner`). */
    private function ownerScope(): \Closure
    {
        if (CurrentUser::isAdmin()) {
            return static function (object $builder): void {};
        }

        $userId = (int) CurrentUser::id();

        return static function (object $builder) use ($userId): void {
            $builder->where('tp_user_manager_id', $userId);
        };
    }

    /** Linha de outro usuario "nao existe" para quem pediu (404, sem revelar o post) — admin ve qualquer linha. */
    private function ownRowOrNull(?array $record): ?array
    {
        if ($record === null) {
            return null;
        }

        if (!CurrentUser::isAdmin() && (int) ($record['tp_user_manager_id'] ?? 0) !== (int) CurrentUser::id()) {
            return null;
        }

        return $record;
    }

    // -------------------------------------------------------------------------
    // Home Feed (feed misto) — rota extra GET .../home-feed
    // -------------------------------------------------------------------------

    /**
     * Monta uma pagina do feed misto. Algoritmo (2026-09-28 — corrige o scroll
     * que parava quando um balde vinha vazio e a repeticao/buraco entre
     * paginas):
     *
     *  1. Busca a FILA COMPLETA de ids de cada balde, na ordem do balde: hoje
     *     (aleatorio pelo $seed), outros usuarios (aleatorio), mais curtidos,
     *     mais bem avaliados — e a fila "demais" (todos os publicados,
     *     aleatorio), que completa vaga de balde esgotado.
     *  2. Intercala as filas numa ORDEM GLOBAL unica: pagina a pagina, tira as
     *     cotas 3/3/2/2 (escaladas para $limit) de cada balde, pulando id ja
     *     usado; a vaga que um balde nao preencher vai para a fila "demais".
     *     Todo publicado entra exatamente uma vez.
     *  3. Fatia a pagina pedida, carrega as linhas completas e embaralha so a
     *     ordem de exibicao DENTRO da pagina.
     *
     * PRIMEIRA PAGINA (2026-09-28, pedido do usuario — rompe o $limit): antes
     * da intercalacao, a ordem global comeca com o bloco FIRST_PAGE_QUOTAS —
     * 5 recentes aleatorios, 3 mais bem avaliados, 3 mais curtidos, 3 mais
     * comentados (14), sem repeticao (id repetido => o proximo do mesmo balde)
     * e completado pela fila "demais" se algum balde faltar. A pagina 1 devolve
     * esse bloco NA ORDEM dos baldes (sem shuffle); da pagina 2 em diante vale
     * o passo 2, $limit por pagina, sem repetir nada da pagina 1.
     *
     * Posts denunciados nunca entram (filtro no SqlViewModel::feedBase).
     *
     * Decisao 12 mantida: sem estado de sessao no servidor e sem lista de ids
     * vindo do cliente — a ordem global e recalculada so a partir do $seed a
     * cada requisicao (mesmo $seed => mesma ordem => paginas sem repeticao).
     * Custo: 7 consultas so de ids sobre os publicados + 1 das linhas da pagina.
     */
    public function homeFeed(int $seed, int $page, int $limit = 10): array
    {
        $userId = (int) CurrentUser::id();
        $page   = max(1, $page);
        $limit  = max(1, $limit);

        $order = $this->homeFeedOrder($seed, $userId, $this->quotasFor($limit), $limit);
        $total = count($order);

        // Pagina 1 = bloco FIRST_PAGE_QUOTAS; demais = $limit cada, depois dele.
        $firstSize = array_sum(self::FIRST_PAGE_QUOTAS);
        $offset    = $page === 1 ? 0 : $firstSize + ($page - 2) * $limit;
        $length    = $page === 1 ? $firstSize : $limit;

        $pageIds = array_slice($order, $offset, $length);
        $rows    = $this->attachMyState($this->viewModel->findByIdsOrdered($pageIds), $userId);

        // Da pagina 2 em diante a ordem global ja decidiu QUAIS posts entram;
        // embaralhar so a ORDEM DE EXIBICAO evita a pagina parecer "em blocos".
        // A pagina 1 fica na ordem dos baldes (recentes > avaliados > curtidos > comentados).
        if ($page > 1) {
            shuffle($rows);
        }

        return [
            'success' => true,
            'data'    => $rows,
            'meta'    => [
                'page'     => $page,
                'limit'    => $length,
                'seed'     => $seed,
                'count'    => count($rows),
                'total'    => $total,
                'has_more' => $offset + $length < $total,
            ],
        ];
    }

    /**
     * Ordem global do feed para o $seed (lista de ids, cada publicado uma vez)
     * — ver passo 2 de homeFeed().
     *
     * @param array{today: int, others: int, liked: int, rated: int} $quotas
     *
     * @return list<int>
     */
    private function homeFeedOrder(int $seed, int $userId, array $quotas, int $limit): array
    {
        $queues = [
            'today'  => $this->viewModel->idsToday($seed),
            'others' => $this->viewModel->idsOtherUsers($seed, $userId),
            'liked'  => $this->viewModel->idsTopLiked(),
            'rated'  => $this->viewModel->idsTopRated(),
        ];
        $rest = $this->viewModel->idsAllRandom($seed);

        $total = count($rest);
        $used  = [];
        $order = [];

        // Tira ate $n ids ainda nao usados do inicio da fila (consumindo-a).
        $take = static function (array &$queue, int $n) use (&$used): array {
            $picked = [];
            while ($n > 0 && $queue !== []) {
                $id = array_shift($queue);
                if (!isset($used[$id])) {
                    $used[$id] = true;
                    $picked[]  = $id;
                    $n--;
                }
            }

            return $picked;
        };

        // Bloco da 1a pagina (FIRST_PAGE_QUOTAS), na ordem dos baldes; vaga que
        // um balde nao preencher e completada pela fila "demais".
        $firstQueues = [
            'recent'    => $this->viewModel->idsRecent($seed),
            'rated'     => $queues['rated'],
            'liked'     => $queues['liked'],
            'commented' => $this->viewModel->idsTopCommented(),
        ];
        foreach (self::FIRST_PAGE_QUOTAS as $bucket => $quota) {
            $order = [...$order, ...$take($firstQueues[$bucket], $quota)];
        }
        $order = [...$order, ...$take($rest, array_sum(self::FIRST_PAGE_QUOTAS) - count($order))];

        while (count($order) < $total) {
            $pageIds = [];
            foreach ($quotas as $bucket => $quota) {
                $pageIds = [...$pageIds, ...$take($queues[$bucket], $quota)];
            }
            // Vagas que os baldes nao preencheram: completa com a fila "demais".
            $pageIds = [...$pageIds, ...$take($rest, $limit - count($pageIds))];

            if ($pageIds === []) {
                break; // nada mais a distribuir (defensivo)
            }
            $order = [...$order, ...$pageIds];
        }

        return $order;
    }

    /**
     * Anexa a CADA post o estado do usuario atual: `my_reaction_id` +
     * `my_reaction_type` (id/tipo da reacao ainda ativa — 'like' ou
     * 'dislike' — ou null) e `my_rating` (nota 1-5 ja dada, ou null). Sem
     * isso a tela (PostCard.tsx) nao tinha como saber, ao recarregar, que o
     * usuario ja reagiu/avaliou aquele post — o dado ja estava correto no
     * banco, so nunca era devolvido pela listagem (pedido do usuario,
     * 2026-09-27: "o sistema deve se lembrar do que fiz").
     *
     * `my_reaction_type` foi adicionado em 2026-09-28 junto do botao
     * "Descurtir": antes o filtro `reaction_type = 'like'` aqui escondia
     * reacoes 'dislike' do usuario (o post SEMPRE voltava sem marcacao pra
     * quem tinha descurtido) — agora traz a reacao ativa de qualquer tipo.
     *
     * 1 query em lote por tabela (whereIn nos IDs da PAGINA + user_manager_id
     * do usuario logado), nao 1 query por post — useSoftDeletes=true de
     * ambos os models ja filtra deleted_at sozinho.
     */
    private function attachMyState(array $posts, int $userId): array
    {
        if ($userId <= 0 || empty($posts)) {
            foreach ($posts as &$post) {
                $post['my_reaction_id']   = null;
                $post['my_reaction_type'] = null;
                $post['my_rating']        = null;
            }
            unset($post);

            return $posts;
        }

        $postIds = array_map(static fn(array $p): int => (int) $p['id'], $posts);

        $reactionIdByPost   = [];
        $reactionTypeByPost = [];
        foreach (
            $this->reactionsModel->whereIn('timeline_post_id', $postIds)
                ->where('user_manager_id', $userId)
                ->findAll() as $r
        ) {
            $postId                          = (int) $r['timeline_post_id'];
            $reactionIdByPost[$postId]       = (int) $r['id'];
            $reactionTypeByPost[$postId]     = (string) $r['reaction_type'];
        }

        $ratingByPost = [];
        foreach (
            $this->ratingsModel->whereIn('timeline_post_id', $postIds)
                ->where('user_manager_id', $userId)
                ->findAll() as $r
        ) {
            $ratingByPost[(int) $r['timeline_post_id']] = (int) $r['rating'];
        }

        foreach ($posts as &$post) {
            $id                        = (int) $post['id'];
            $post['my_reaction_id']    = $reactionIdByPost[$id] ?? null;
            $post['my_reaction_type']  = $reactionTypeByPost[$id] ?? null;
            $post['my_rating']         = $ratingByPost[$id] ?? null;
        }
        unset($post);

        return $posts;
    }

    /**
     * Proporcao 3/3/2/2 (hoje/outros/curtidos/avaliados) de um total de 10,
     * escalada proporcionalmente para outro $limit; a sobra do arredondamento
     * cai no balde 'rated'.
     */
    private function quotasFor(int $limit): array
    {
        $today  = (int) round($limit * 0.3);
        $others = (int) round($limit * 0.3);
        $liked  = (int) round($limit * 0.2);
        $rated  = max(0, $limit - $today - $others - $liked);

        return ['today' => $today, 'others' => $others, 'liked' => $liked, 'rated' => $rated];
    }

    // -------------------------------------------------------------------------
    // Privados
    // -------------------------------------------------------------------------

    /**
     * Timeline do usuario: reaproveita (restaurando, se estiver excluida) ou
     * cria na hora. E o que materializa "cada usuario, na primeira publicacao,
     * gera sua timeline".
     */
    private function timelineFor(int $userId): ?array
    {
        $existing = $this->timelineManagerModel->findByUserManagerId($userId);
        if ($existing !== null) {
            return $existing;
        }

        $deleted = $this->timelineManagerModel->findByUserManagerIdWithDeleted($userId);
        if ($deleted !== null) {
            $this->timelineManagerModel->restore((int) $deleted['id']);

            return $this->timelineManagerModel->find((int) $deleted['id']);
        }

        $user     = $this->userManagerModel->find($userId);
        $username = is_array($user) ? (string) ($user['username'] ?? '') : '';

        $slug = $this->slugify($username !== '' ? $username : 'timeline-' . $userId);
        if ($this->timelineManagerModel->existsByField('slug', $slug)) {
            $slug .= '-' . $userId;
        }

        $db = $this->timelineManagerModel->db;
        $db->transStart();

        $this->timelineManagerModel->insert([
            'user_manager_id' => $userId,
            'slug'            => $slug,
            'title'           => $username !== '' ? $username : ('Timeline ' . $userId),
            'description'     => null,
            'status'          => 'active',
            'version'         => 1,
        ]);

        $id = (int) $this->timelineManagerModel->getInsertID();

        $db->transComplete();

        if ($id <= 0) {
            return null;
        }

        return $this->timelineManagerModel->find($id);
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

    private function notFound(string $message = 'Registro nao encontrado ou foi excluido'): array
    {
        return ['success' => false, 'message' => $message, 'code' => 404];
    }

    private function conflict(string $message): array
    {
        return ['success' => false, 'message' => $message, 'code' => 409];
    }

    private function invalid(string $message): array
    {
        return ['success' => false, 'message' => $message, 'code' => 422];
    }

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
