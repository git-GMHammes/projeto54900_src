<?php

namespace App\Commands;

use App\Models\V1\Messages\MessagesManager\SqlTableModel;
use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;

/**
 * Job do modulo Messages: envia as mensagens agendadas cuja hora chegou
 * (messages_manager.status 'scheduled' -> 'sent', carimba sent_at).
 *
 * USO LOCAL (desenvolvimento). Em producao (hospedagem so com FTP) NAO ha como rodar `spark` nem agendar cron: a entrega
 * das agendadas e feita pelo gatilho App\Libraries\MessageDispatcher, chamado pelo JwtAuthFilter a cada requisicao
 * autenticada (no maximo 1x por minuto), e tambem pelas consultas do chat.
 */
class MessagesDispatch extends BaseCommand
{
    protected $group       = 'Messages';
    protected $name        = 'messages:dispatch';
    protected $usage       = 'messages:dispatch';
    protected $description = 'Envia as mensagens agendadas cuja data/hora ja chegou.';

    public function run(array $params)
    {
        $sent = (new SqlTableModel())->dispatchDue();

        CLI::write($sent . ' mensagem(ns) agendada(s) enviada(s).', $sent > 0 ? 'green' : 'yellow');

        return EXIT_SUCCESS;
    }
}
