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

    // -------------------------------------------------------------------------
    // Baldes do Home Feed (feed misto) — ver Services/V1/Timeline/TimelinePosts/Processor::homeFeed
    // -------------------------------------------------------------------------

    /**
     * Balde 1 — publicacoes de HOJE, ordem aleatoria seedada. $seed vem do
     * cliente (gerado uma vez ao abrir a Home Feed, reenviado a cada pagina)
     * para o ORDER BY RAND($seed) dar uma caminhada estavel e sem repeticao
     * conforme o $offset cresce por pagina — mesmo $seed, $offset diferente.
     */
    public function randomToday(int $limit, int $offset, int $seed, array $excludeIds = []): array
    {
        $builder = $this->db->table($this->table)
            ->where('tp_status', 'published')
            ->where('DATE(tp_published_at) = CURDATE()', null, false);

        if (!empty($excludeIds)) {
            $builder->whereNotIn('id', $excludeIds);
        }

        return $builder
            ->orderBy('RAND(' . $seed . ')', '', false)
            ->limit($limit, $offset)
            ->get()
            ->getResultArray();
    }

    /**
     * Balde 2 — publicacoes de OUTROS usuarios (exclui o autenticado), ordem
     * aleatoria seedada. Mesmo $seed do balde 1 (o cliente usa um unico seed
     * por sessao da Home Feed) — cada balde tem seu proprio espaco de
     * offset, entao nao colidem entre si.
     */
    public function randomOtherUsers(int $limit, int $offset, int $seed, int $currentUserId, array $excludeIds = []): array
    {
        $builder = $this->db->table($this->table)
            ->where('tp_status', 'published')
            ->where('tp_user_manager_id !=', $currentUserId);

        if (!empty($excludeIds)) {
            $builder->whereNotIn('id', $excludeIds);
        }

        return $builder
            ->orderBy('RAND(' . $seed . ')', '', false)
            ->limit($limit, $offset)
            ->get()
            ->getResultArray();
    }

    /**
     * Balde 3 — mais curtidos (ranking estavel por likes_count). Paginado por
     * $offset (nao por RAND) — mesma pagina sempre pega a "proxima fatia" do
     * ranking, sem repetir enquanto likes_count nao mudar entre chamadas.
     */
    public function topLiked(int $limit, int $offset, array $excludeIds = []): array
    {
        $builder = $this->db->table($this->table)->where('tp_status', 'published');

        if (!empty($excludeIds)) {
            $builder->whereNotIn('id', $excludeIds);
        }

        return $builder
            ->orderBy('likes_count', 'DESC')
            ->orderBy('id', 'DESC')
            ->limit($limit, $offset)
            ->get()
            ->getResultArray();
    }

    /**
     * Balde 4 — mais bem avaliados (ranking estavel por ratings_avg, desempate
     * por ratings_count). So entram publicacoes com ao menos uma avaliacao.
     */
    public function topRated(int $limit, int $offset, array $excludeIds = []): array
    {
        $builder = $this->db->table($this->table)
            ->where('tp_status', 'published')
            ->where('ratings_avg IS NOT NULL', null, false);

        if (!empty($excludeIds)) {
            $builder->whereNotIn('id', $excludeIds);
        }

        return $builder
            ->orderBy('ratings_avg', 'DESC')
            ->orderBy('ratings_count', 'DESC')
            ->orderBy('id', 'DESC')
            ->limit($limit, $offset)
            ->get()
            ->getResultArray();
    }
}
