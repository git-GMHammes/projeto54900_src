<?php

namespace App\Models\V1\Timeline\TimelinePosts;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_timeline_posts — o feed (timeline + autor + repost + contadores).
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_timeline_posts';
    protected $primaryKey = 'id';

    protected array $likeFields = [
        'tp_title', 'tp_content',
        'tm_title', 'tm_slug',
        'um_username', 'uc_name',
        'ru_username', 'rc_name',
    ];

    protected array $sortableFields = [
        'id', 'tp_timeline_manager_id', 'tp_user_manager_id', 'tp_repost_of_id',
        'tp_title', 'tp_status', 'tp_published_at', 'tp_edited_at',
        'tm_id', 'tm_slug', 'tm_title', 'tm_status',
        'um_id', 'um_username', 'um_status',
        'uc_id', 'uc_name',
        'rp_id',
        'comments_count', 'likes_count', 'dislikes_count', 'ratings_count', 'ratings_avg',
        'reposts_count', 'attachments_count',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['tp_title', 'tp_content', 'um_username', 'uc_name', 'tm_title'];

    public array $filterFields = ['tp_status', 'tm_status', 'um_status'];

    /** Tamanho do pool de publicados mais recentes sorteado por idsRecent(). */
    private const RECENT_POOL = 20;

    // -------------------------------------------------------------------------
    // Baldes do Home Feed (feed misto) — ver Services/V1/Timeline/TimelinePosts/Processor::homeFeed
    // -------------------------------------------------------------------------

    // Cada metodo devolve a FILA COMPLETA de ids do balde, na ordem do balde
    // (so a coluna id — barato). Processor::homeFeed intercala as filas numa
    // ordem global unica pelo $seed e fatia por pagina; por isso aqui nao ha
    // limit/offset nem exclusao de ids (exceto idsRecent, que e um pool fixo).
    //
    // Todas partem de feedBase(): so publicados e NUNCA um post denunciado
    // (pedido do usuario, 2026-09-28).

    /**
     * Balde 1 — publicacoes de HOJE, ordem aleatoria seedada. $seed vem do
     * cliente (gerado uma vez ao abrir a Home Feed, reenviado a cada pagina):
     * RAND($seed) sobre o mesmo conjunto de linhas da sempre a mesma ordem.
     *
     * @return list<int>
     */
    public function idsToday(int $seed): array
    {
        return $this->idsFrom(
            $this->feedBase()
                ->where('DATE(tp_published_at) = CURDATE()', null, false)
                ->orderBy('RAND(' . $seed . ')', '', false)
        );
    }

    /**
     * Balde 2 — publicacoes de OUTROS usuarios (exclui o autenticado), ordem
     * aleatoria seedada.
     *
     * @return list<int>
     */
    public function idsOtherUsers(int $seed, int $currentUserId): array
    {
        return $this->idsFrom(
            $this->feedBase()
                ->where('tp_user_manager_id !=', $currentUserId)
                ->orderBy('RAND(' . $seed . ')', '', false)
        );
    }

    /**
     * Balde 3 — mais curtidos (ranking estavel por likes_count, desempate id).
     *
     * @return list<int>
     */
    public function idsTopLiked(): array
    {
        return $this->idsFrom(
            $this->feedBase()
                ->orderBy('likes_count', 'DESC')
                ->orderBy('id', 'DESC')
        );
    }

    /**
     * Balde 4 — mais bem avaliados (ratings_avg, desempate ratings_count/id).
     * So entram publicacoes com ao menos uma avaliacao.
     *
     * @return list<int>
     */
    public function idsTopRated(): array
    {
        return $this->idsFrom(
            $this->feedBase()
                ->where('ratings_avg IS NOT NULL', null, false)
                ->orderBy('ratings_avg', 'DESC')
                ->orderBy('ratings_count', 'DESC')
                ->orderBy('id', 'DESC')
        );
    }

    /**
     * Fila "demais" — TODOS os publicados, ordem aleatoria seedada. Completa a
     * vaga de um balde que se esgotou (ex.: sem posts de outros usuarios) e
     * garante que todo post publicado aparece em alguma pagina.
     *
     * @return list<int>
     */
    public function idsAllRandom(int $seed): array
    {
        return $this->idsFrom(
            $this->feedBase()
                ->orderBy('RAND(' . ($seed + 1) . ')', '', false)
        );
    }

    /**
     * Bloco "recentes" da 1a pagina — sorteio seedado entre os RECENT_POOL
     * publicados mais recentes (subconsulta com LIMIT; RAND($seed) so sobre
     * esse pool).
     *
     * @return list<int>
     */
    public function idsRecent(int $seed): array
    {
        $pool = $this->feedBase()
            ->orderBy('tp_published_at', 'DESC')
            ->orderBy('id', 'DESC')
            ->limit(self::RECENT_POOL)
            ->getCompiledSelect();

        $rows = $this->db->query('SELECT id FROM (' . $pool . ') AS recent_pool ORDER BY RAND(' . $seed . ')')
            ->getResultArray();

        return array_map(static fn (array $r): int => (int) $r['id'], $rows);
    }

    /**
     * Mais comentados (ranking estavel por comments_count, desempate id).
     *
     * @return list<int>
     */
    public function idsTopCommented(): array
    {
        return $this->idsFrom(
            $this->feedBase()
                ->orderBy('comments_count', 'DESC')
                ->orderBy('id', 'DESC')
        );
    }

    /**
     * Linhas completas da view para os ids da pagina, NA ORDEM recebida.
     *
     * @param list<int> $ids
     */
    public function findByIdsOrdered(array $ids): array
    {
        if ($ids === []) {
            return [];
        }

        // Refiltra por feedBase(): post denunciado entre o calculo da ordem e a
        // carga da pagina tambem nao aparece.
        $rows = $this->feedBase('*')->whereIn('id', $ids)->get()->getResultArray();

        $byId = [];
        foreach ($rows as $row) {
            $byId[(int) $row['id']] = $row;
        }

        $ordered = [];
        foreach ($ids as $id) {
            if (isset($byId[$id])) {
                $ordered[] = $byId[$id];
            }
        }

        return $ordered;
    }

    /**
     * Base de toda consulta do Home Feed: so publicados e SEM denuncia ativa
     * (timeline_post_reports com deleted_at nulo, qualquer status — inclusive
     * 'rejected'). Posts denunciados NUNCA sao exibidos no feed.
     */
    private function feedBase(string $select = 'id'): \CodeIgniter\Database\BaseBuilder
    {
        $reports = $this->db->prefixTable('timeline_post_reports');
        $view    = $this->db->prefixTable($this->table);

        return $this->db->table($this->table)
            ->select($select)
            ->where('tp_status', 'published')
            ->where(
                'NOT EXISTS (SELECT 1 FROM ' . $reports . ' AS tpr'
                . ' WHERE tpr.timeline_post_id = ' . $view . '.id AND tpr.deleted_at IS NULL)',
                null,
                false
            );
    }

    /**
     * @return list<int>
     */
    private function idsFrom(\CodeIgniter\Database\BaseBuilder $builder): array
    {
        return array_map(static fn (array $r): int => (int) $r['id'], $builder->get()->getResultArray());
    }
}
