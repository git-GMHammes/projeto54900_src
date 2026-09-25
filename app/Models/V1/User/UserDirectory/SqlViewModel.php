<?php

namespace App\Models\V1\User\UserDirectory;

use App\Models\V1\BaseViewModel;

/**
 * Model de leitura para a view view_user_directory.
 *
 * Diretório mínimo de usuários (id, um_username, uc_name, uc_email) — sem
 * senha, status, role, telefone, cpf ou endereço. Existe para alimentar
 * pickers/selects de "convidar usuário" acessíveis a QUALQUER usuário
 * autenticado (grupo api/v1/user-directory-view/* é jwtauth apenas, sem
 * adminonly — ver Config/Filters.php). view_user_manager/user-manager-view
 * continuam admin-only por exporem dados sensíveis de outros usuários.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_user_directory';
    protected $primaryKey = 'id';

    /** Campos de texto que usam LIKE %valor% no findPaginatedView/find. */
    protected array $likeFields = [
        'um_username',
        'uc_name',
        'uc_email',
    ];

    /** Campos válidos para ordenação */
    protected array $sortableFields = [
        'id',
        'um_username',
        'uc_name',
        'uc_email',
    ];

    /** Campos utilizados na busca textual (GET /search) */
    public array $searchFields = [
        'um_username',
        'uc_name',
        'uc_email',
    ];

    /** Sem filtros exatos adicionais — diretório não tem coluna de status/role. */
    public array $filterFields = [];
}
