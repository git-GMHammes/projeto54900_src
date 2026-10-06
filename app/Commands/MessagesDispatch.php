<?php

namespace App\Commands;

use App\Models\V1\Messages\MessagesManager\SqlTableModel;
use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;

/**
 * Job do modulo Messages: envia as mensagens agendadas cuja hora chegou
 * (messages_manager.status 'scheduled' -> 'sent', carimba sent_at).
 *
 * Agendar no cron a cada minuto: * * * * * php spark messages:dispatch
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
