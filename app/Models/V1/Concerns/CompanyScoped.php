<?php

namespace App\Models\V1\Concerns;

use App\Exceptions\CompanyScopeException;
use App\Libraries\Auth\CurrentUser;

/**
 * Isolamento de dados por empresa (multiempresa/SaaS) para os models base.
 *
 * A sessao e amarrada a UMA empresa (claim cid, ver AuthService). Um model que declara
 * $companyScope so enxerga/altera linhas dessa empresa — em TODA consulta feita pelas classes
 * base (listar, buscar, obter por id, excluidos, restaurar, limpar) e pelos metodos nativos do
 * CodeIgniter (find, update, delete), porque o escopo entra em builder().
 *
 * Modos ($companyScope):
 *   'none'       sem escopo (tabelas globais: formularios, menus, papeis...). Padrao.
 *   'column'     a tabela/view tem a coluna $companyColumn (company_id). Na gravacao o valor vem
 *                SEMPRE da sessao; o cliente nao consegue enviar nem trocar a empresa.
 *   'self'       a propria tabela/view de empresas: so a empresa da sessao aparece (id = empresa da sessao).
 *                Nao carimba nem restringe gravacao.
 *   'via_table'  VIEW de uma tabela com company_id: a linha so aparece se o id dela ($companyViaKey)
 *                existir, na tabela $companyViaTable, com company_id = empresa da sessao. Evita
 *                redefinir cada view com a coluna company_id.
 *   'json_slug'  a tabela tem a coluna JSON $companyJsonColumn (company_manager) com a LISTA de slugs das
 *                empresas que enxergam a linha (ex.: ["default","tryikads"]; tabelas temp_*). A linha so aparece
 *                se o slug da empresa da sessao constar na lista. So leitura/escopo: nao carimba na gravacao
 *                (o Processor preenche a lista, ver Services/V1/Template/CompanyManagerColumn).
 *   'membership' tabela/view de usuarios: a linha so aparece se o usuario ($membershipKey) for
 *                membro ativo da empresa da sessao em company_members.
 *
 * Falha fechada: model com escopo e sessao autenticada SEM empresa valida -> nenhuma linha.
 * Unica excecao: requisicao sem sessao nenhuma (CurrentUser::claims() === null), que so existe
 * em rota publica por decisao de produto (ex.: cadastro de usuario). Rota protegida sempre tem
 * sessao com cid (JwtAuthFilter), entao nunca cai nessa excecao.
 */
trait CompanyScoped
{
    /** 'none' | 'column' | 'membership' */
    protected string $companyScope = 'none';

    /** Modo 'column': coluna com o id da empresa. */
    protected string $companyColumn = 'company_id';

    /** Modo 'json_slug': coluna JSON com a lista de slugs das empresas. */
    protected string $companyJsonColumn = 'company_manager';

    /** Modo 'membership': coluna da tabela/view que guarda o id do usuario (user_manager.id). */
    protected string $membershipKey = 'id';

    /**
     * Modo 'membership': status do vinculo (company_members) que tornam o usuario visivel. Padrao: so
     * membros ativos. Os models de administracao de usuarios incluem 'pending' (aguardando aprovacao) e
     * 'blocked' (para o admin aprovar/desbloquear).
     *
     * @var list<string>
     */
    protected array $membershipStatuses = ['active'];

    /** Modo 'via_table': tabela fisica (com company_id) que decide a empresa da linha da view. */
    protected string $companyViaTable = '';

    /** Modo 'via_table': coluna da view que guarda o id (PK) da linha em $companyViaTable. */
    protected string $companyViaKey = 'id';

    /** Builder da tabela do model ja com o escopo de empresa aplicado. */
    protected function scopedTable(): object
    {
        return $this->applyCompanyScope($this->db->table($this->table));
    }

    protected function applyCompanyScope(object $builder): object
    {
        if ($this->companyScope === 'none' || CurrentUser::claims() === null) {
            return $builder;
        }

        $cid = CurrentUser::companyId();

        if ($cid === null || $cid <= 0) {
            return $builder->where('1 = 0', null, false);
        }

        if ($this->companyScope === 'membership') {
            return $builder->where(
                $this->table . '.' . $this->membershipKey . ' IN (SELECT cm.user_manager_id FROM company_members cm'
                . ' WHERE cm.company_id = ' . (int) $cid . ' AND cm.status IN (' . $this->membershipStatusList() . ') AND cm.deleted_at IS NULL)',
                null,
                false
            );
        }

        if ($this->companyScope === 'self') {
            return $builder->where($this->table . '.id', $cid);
        }

        if ($this->companyScope === 'json_slug') {
            $slug = $this->sessionCompanySlug($cid);

            if ($slug === null) {
                return $builder->where('1 = 0', null, false);
            }

            return $builder->where(
                'JSON_CONTAINS(' . $this->table . '.' . $this->companyJsonColumn . ', JSON_QUOTE(' . $this->db->escape($slug) . '))',
                null,
                false
            );
        }

        if ($this->companyScope === 'via_table') {
            return $builder->where(
                $this->table . '.' . $this->companyViaKey . ' IN (SELECT vt.id FROM ' . $this->companyViaTable
                . ' vt WHERE vt.' . $this->companyColumn . ' = ' . (int) $cid . ')',
                null,
                false
            );
        }

        return $builder->where($this->table . '.' . $this->companyColumn, $cid);
    }

    /** Slug da empresa da sessao (cache por requisicao); null se a empresa nao existe ou foi excluida. */
    private function sessionCompanySlug(int $cid): ?string
    {
        static $cache = [];

        if (!array_key_exists($cid, $cache)) {
            $row = $this->db->table('company_manager')->select('slug')->where('id', $cid)->where('deleted_at', null)->get()->getRowArray();
            $cache[$cid] = $row['slug'] ?? null;
        }

        return $cache[$cid];
    }

    /**
     * Builder de OUTRA tabela com company_id (aceita alias: 'messages_manager mm'), ja restrito a
     * empresa da sessao. Para as consultas manuais dos models filhos que leem tabelas irmas:
     * nenhuma delas pode escapar do escopo so por nao passar pelo $this->table.
     * Sem sessao autenticada (rota publica) devolve o builder puro; sessao sem empresa -> nenhuma linha.
     */
    public function companyTable(string $table): object
    {
        $builder = $this->db->table($table);

        if (CurrentUser::claims() === null) {
            return $builder;
        }

        $cid = CurrentUser::companyId();
        if ($cid === null || $cid <= 0) {
            return $builder->where('1 = 0', null, false);
        }

        $parts = preg_split('/\s+/', trim($table));
        $alias = end($parts);

        return $builder->where($alias . '.' . $this->companyColumn, $cid);
    }

    /** Fragmento SQL "<alias>.company_id = <empresa da sessao>" para consultas escritas a mao ('1 = 0' sem empresa). */
    protected function companySql(string $alias): string
    {
        if (CurrentUser::claims() === null) {
            return '1 = 1';
        }

        $cid = CurrentUser::companyId();

        return ($cid === null || $cid <= 0) ? '1 = 0' : $alias . '.' . $this->companyColumn . ' = ' . (int) $cid;
    }

    /**
     * Acrescenta company_id (da sessao) a uma linha de INSERT manual em tabela com company_id.
     * Sem empresa na sessao a gravacao e recusada.
     */
    protected function withCompany(array $row): array
    {
        $cid = CurrentUser::companyId();

        if ($cid === null || $cid <= 0) {
            throw new CompanyScopeException('Gravacao recusada: sessao sem empresa valida.');
        }

        $row[$this->companyColumn] = $cid;

        return $row;
    }

    /**
     * Executa $fn sem o escopo de empresa. Uso restrito a fluxos que gravam e logo em seguida leem
     * a propria linha ANTES de ela existir no escopo (ex.: usuario recem-criado ainda sem vinculo
     * em company_members). Quem chama garante a autorizacao antes.
     */
    public function withoutCompanyScope(callable $fn): mixed
    {
        $previous = $this->companyScope;
        $this->companyScope = 'none';

        try {
            return $fn();
        } finally {
            $this->companyScope = $previous;
        }
    }

    /** Lista SQL ("'active','pending'") dos status de vinculo visiveis; so valores conhecidos, nunca entrada do cliente. */
    private function membershipStatusList(): string
    {
        $allowed = array_intersect($this->membershipStatuses, ['pending', 'active', 'blocked']);

        return "'" . implode("','", $allowed === [] ? ['active'] : $allowed) . "'";
    }

    /** Os metodos nativos do CodeIgniter (find/update/delete/insert) passam por aqui. */
    public function builder(?string $table = null)
    {
        return $this->applyCompanyScope(parent::builder($table));
    }

    /**
     * Callback beforeInsert (modo 'column'): a empresa da linha e a da sessao, sempre.
     * Sem sessao autenticada com empresa, a insercao e recusada.
     */
    protected function stampCompanyOnInsert(array $eventData): array
    {
        if ($this->companyScope !== 'column') {
            return $eventData;
        }

        $cid = CurrentUser::companyId();

        if ($cid === null || $cid <= 0) {
            throw new CompanyScopeException('Gravacao recusada: sessao sem empresa valida.');
        }

        $eventData['data'][$this->companyColumn] = $cid;
        $this->assertReferencesInCompany($eventData['data'], $cid);

        return $eventData;
    }

    /** Callback beforeUpdate (modo 'column'): a empresa de uma linha nunca muda. */
    protected function protectCompanyOnUpdate(array $eventData): array
    {
        if ($this->companyScope === 'column') {
            unset($eventData['data'][$this->companyColumn]);

            $cid = CurrentUser::companyId();
            if ($cid !== null && $cid > 0) {
                $this->assertReferencesInCompany($eventData['data'], $cid);
            }
        }

        return $eventData;
    }

    /**
     * Integridade entre empresas: cada chave estrangeira informada na linha tem de apontar para
     * registro da MESMA empresa (tabela com company_id) ou, no caso de user_manager, para um membro
     * ativo dela. Evita criar, por exemplo, uma mensagem da empresa B dentro do grupo da empresa A.
     * As chaves vem do proprio banco (information_schema), entao tabela nova ja nasce coberta.
     */
    private function assertReferencesInCompany(array $row, int $cid): void
    {
        foreach ($this->foreignKeyTargets() as $column => $referenced) {
            $value = $row[$column] ?? null;

            if ($value === null || $value === '' || !is_scalar($value)) {
                continue;
            }

            if ($referenced === 'user_manager') {
                $ok = $this->db->table('company_members')
                    ->where('company_id', $cid)
                    ->where('user_manager_id', (int) $value)
                    ->where('status', 'active')
                    ->where('deleted_at', null)
                    ->countAllResults() > 0;
            } else {
                $ok = $this->db->table($referenced)
                    ->where('id', (int) $value)
                    ->where($this->companyColumn, $cid)
                    ->countAllResults() > 0;
            }

            if (!$ok) {
                throw new CompanyScopeException('Registro relacionado invalido.');
            }
        }
    }

    /**
     * Colunas desta tabela que sao FK para tabela com company_id (ou para user_manager).
     *
     * @return array<string, string> coluna => tabela referenciada
     */
    private function foreignKeyTargets(): array
    {
        static $cache = [];
        static $scoped = null;

        if ($scoped === null) {
            $rows   = $this->db->query(
                "SELECT TABLE_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND COLUMN_NAME = 'company_id'"
            )->getResultArray();
            $scoped = array_column($rows, 'TABLE_NAME');
        }

        if (!isset($cache[$this->table])) {
            $rows = $this->db->query(
                'SELECT COLUMN_NAME, REFERENCED_TABLE_NAME FROM information_schema.KEY_COLUMN_USAGE'
                . ' WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL',
                [$this->table]
            )->getResultArray();

            $map = [];
            foreach ($rows as $row) {
                $ref = (string) $row['REFERENCED_TABLE_NAME'];
                if ($ref === 'user_manager' || in_array($ref, $scoped, true)) {
                    $map[(string) $row['COLUMN_NAME']] = $ref;
                }
            }
            $cache[$this->table] = $map;
        }

        return $cache[$this->table];
    }

}
