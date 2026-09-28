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
 *  8. Visibilidade: leitura liberada a qualquer usuario logado (o feed e
 *     "publico para quem estiver logado"); escrita so do dono (admin escapa).
 */
class Processor extends BaseTableService
{
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
    // Home Feed (feed misto) — rota extra GET .../home-feed
    // -------------------------------------------------------------------------

    /**
     * Monta uma pagina do feed misto: cotas fixas (proporcao 3/3/2/2 de um
     * total de 10) de publicacoes de hoje (aleatorio), de outros usuarios
     * (aleatorio), mais curtidas e mais bem avaliadas — nessa ordem, cada
     * balde excluindo os IDs ja escolhidos pelos baldes anteriores (evita
     * duplicata DENTRO da mesma pagina). $seed vem do cliente (gerado uma vez
     * ao abrir a Home Feed) e mantem os baldes aleatorios estaveis conforme
     * $page cresce — ver SqlViewModel::randomToday/randomOtherUsers.
     *
     * Sem exclusao global entre paginas diferentes (decisao do usuario,
     * 2026-09-27): risco cosmetico de um post reaparecer depois de varias
     * paginas, aceito para nao exigir estado de sessao no servidor nem o
     * cliente reenviar uma lista crescente de IDs vistos.
     */
    public function homeFeed(int $seed, int $page, int $limit = 10): array
    {
        $userId = (int) CurrentUser::id();
        $page   = max(1, $page);
        $quotas = $this->quotasFor(max(1, $limit));

        $today = $this->viewModel->randomToday($quotas['today'], ($page - 1) * $quotas['today'], $seed);
        $excluded = array_map(static fn (array $r): int => (int) $r['id'], $today);

        $others = $this->viewModel->randomOtherUsers(
            $quotas['others'],
            ($page - 1) * $quotas['others'],
            $seed,
            $userId,
            $excluded,
        );
        $excluded = [...$excluded, ...array_map(static fn (array $r): int => (int) $r['id'], $others)];

        $liked = $this->viewModel->topLiked($quotas['liked'], ($page - 1) * $quotas['liked'], $excluded);
        $excluded = [...$excluded, ...array_map(static fn (array $r): int => (int) $r['id'], $liked)];

        $rated = $this->viewModel->topRated($quotas['rated'], ($page - 1) * $quotas['rated'], $excluded);

        $merged = [...$today, ...$others, ...$liked, ...$rated];
        $merged = $this->attachMyState($merged, $userId);

        // Os baldes ja decidiram QUAIS posts entram; embaralhar so a ORDEM DE
        // EXIBICAO evita a pagina parecer "em blocos" (todo hoje, depois todo
        // curtido, ...).
        shuffle($merged);

        return [
            'success' => true,
            'data'    => $merged,
            'meta'    => [
                'page'    => $page,
                'limit'   => $limit,
                'seed'    => $seed,
                'count'   => count($merged),
                'buckets' => [
                    'today'  => count($today),
                    'others' => count($others),
                    'liked'  => count($liked),
                    'rated'  => count($rated),
                ],
            ],
        ];
    }

    /**
     * Anexa a CADA post o estado do usuario atual: `my_reaction_id` (id da
     * curtida ainda ativa, ou null) e `my_rating` (nota 1-5 ja dada, ou null).
     * Sem isso a tela (PostCard.tsx) nao tinha como saber, ao recarregar, que
     * o usuario ja curtiu/avaliou aquele post — o dado ja estava correto no
     * banco, so nunca era devolvido pela listagem (pedido do usuario,
     * 2026-09-27: "o sistema deve se lembrar do que fiz").
     *
     * 1 query em lote por tabela (whereIn nos IDs da PAGINA + user_manager_id
     * do usuario logado), nao 1 query por post — useSoftDeletes=true de
     * ambos os models ja filtra deleted_at sozinho.
     */
    private function attachMyState(array $posts, int $userId): array
    {
        if ($userId <= 0 || empty($posts)) {
            foreach ($posts as &$post) {
                $post['my_reaction_id'] = null;
                $post['my_rating']      = null;
            }
            unset($post);

            return $posts;
        }

        $postIds = array_map(static fn (array $p): int => (int) $p['id'], $posts);

        $reactionByPost = [];
        foreach ($this->reactionsModel->whereIn('timeline_post_id', $postIds)
            ->where('user_manager_id', $userId)
            ->where('reaction_type', 'like')
            ->findAll() as $r) {
            $reactionByPost[(int) $r['timeline_post_id']] = (int) $r['id'];
        }

        $ratingByPost = [];
        foreach ($this->ratingsModel->whereIn('timeline_post_id', $postIds)
            ->where('user_manager_id', $userId)
            ->findAll() as $r) {
            $ratingByPost[(int) $r['timeline_post_id']] = (int) $r['rating'];
        }

        foreach ($posts as &$post) {
            $id                      = (int) $post['id'];
            $post['my_reaction_id']  = $reactionByPost[$id] ?? null;
            $post['my_rating']       = $ratingByPost[$id] ?? null;
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
