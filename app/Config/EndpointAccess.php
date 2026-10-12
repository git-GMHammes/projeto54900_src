<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

/**
 * Permissao por endpoint da API V1 (filtro 'endpointaccess').
 *
 * Cada regra: padrao de rota (fnmatch, sem barra inicial, mesmo formato dos
 * wildcards de Config/Filters.php) => perfis (slug de user_roles) autorizados.
 * Rota sem regra = livre (so o jwtauth vale). Primeira regra que casar decide.
 * 'admin' sempre passa: nao precisa constar na lista.
 *
 * Camada de defesa em profundidade: as regras finas de cada modulo continuam
 * nos Processors. Para restringir um grupo novo, acrescente uma linha aqui —
 * nao e preciso mexer em Config/Filters.php.
 */
class EndpointAccess extends BaseConfig
{
    /**
     * @var array<string, list<string>>
     */
    public array $rules = [
        // Messages: mensagens diretas entre usuarios — guest nao participa.
        'api/v1/messages-manager/*'                 => ['user'],
        'api/v1/messages-manager-view/*'            => ['user'],
        'api/v1/messages-users-view/*'              => ['user'],
        'api/v1/message-groups-manager/*'           => ['user'],
        'api/v1/message-groups-manager-view/*'      => ['user'],
        'api/v1/message-contacts-view/*'            => ['user'],
        'api/v1/message-group-reads/*'              => ['user'],
        'api/v1/message-group-reads-view/*'         => ['user'],
        'api/v1/message-group-chat-view/*'          => ['user'],
        'api/v1/message-mentions/*'                 => ['user'],
        'api/v1/message-mentions-view/*'            => ['user'],
        'api/v1/message-warnings/*'                 => ['user'],
        'api/v1/message-warnings-view/*'            => ['user'],
        'api/v1/message-attachments/*'              => ['user'],
        'api/v1/message-attachments-view/*'         => ['user'],
        'api/v1/message-group-messages/*'           => ['user'],
        'api/v1/message-group-messages-view/*'      => ['user'],
        'api/v1/message-group-memberships-view/*'   => ['user'],
        'api/v1/message-users-groups-view/*'        => ['user'],
        'api/v1/message-group-members-view/*'       => ['user'],
        'api/v1/message-group-members/*'            => ['user'],
    ];
}
