<?php

namespace App\Libraries;

use App\Models\V1\Messages\MessagesManager\SqlTableModel;

/**
 * Entrega das mensagens agendadas SEM cron (hospedagem compartilhada: so FTP, sem `spark`, sem agendador).
 *
 * Quem chama e o filtro de autenticacao (JwtAuthFilter): TODA requisicao autenticada de qualquer usuario tenta
 * disparar a entrega das agendadas vencidas (messages_manager `scheduled` com `scheduled_at` <= agora) — mesmo que
 * a mensagem nao seja para quem fez a requisicao. Assim, a mensagem agendada para o dia 9 chega quando o primeiro
 * usuario logar no dia 10, e num grupo o primeiro membro que entrar a entrega para todos.
 *
 * Para nao rodar o UPDATE em cada clique, ha um intervalo minimo de INTERVAL segundos no servidor inteiro, controlado
 * por um arquivo em writable/cache (funciona so com FTP; nao cria tabela). O arquivo guarda o instante da ultima
 * execucao e e protegido por flock: duas requisicoes simultaneas nao disparam duas vezes. O UPDATE em si e condicionado
 * ao status (SqlTableModel::dispatchDue), entao rodar em paralelo nunca entrega a mesma mensagem duas vezes.
 *
 * Qualquer erro vai para o log e NUNCA quebra a requisicao do usuario. O comando `spark messages:dispatch` continua
 * existindo, mas so para uso local (no servidor nao ha como roda-lo).
 */
class MessageDispatcher
{
    /** Intervalo minimo entre duas entregas, em segundos (servidor inteiro). */
    public const INTERVAL = 60;

    /** Arquivo de controle (dentro de writable/cache). */
    private const STAMP = 'messages_dispatch.stamp';

    /**
     * Entrega as agendadas vencidas se ja passou o intervalo desde a ultima vez. Devolve quantas foram entregues
     * (0 tambem quando o intervalo ainda nao passou ou outra requisicao esta executando).
     */
    public static function tick(): int
    {
        $handle = null;

        try {
            $handle = @fopen(WRITEPATH . 'cache/' . self::STAMP, 'c+');
            if ($handle === false) {
                log_message('error', '[MessageDispatcher] nao foi possivel abrir o arquivo de controle em writable/cache');

                return 0;
            }

            // Outra requisicao ja esta entregando: nao espera.
            if (!flock($handle, LOCK_EX | LOCK_NB)) {
                return 0;
            }

            $last = (int) trim((string) stream_get_contents($handle));
            if ($last > 0 && (time() - $last) < self::INTERVAL) {
                return 0;
            }

            $delivered = (new SqlTableModel())->dispatchDue();

            ftruncate($handle, 0);
            rewind($handle);
            fwrite($handle, (string) time());
            fflush($handle);

            return $delivered;
        } catch (\Throwable $e) {
            log_message('error', '[MessageDispatcher] ' . $e->getMessage());

            return 0;
        } finally {
            if (is_resource($handle)) {
                flock($handle, LOCK_UN);
                fclose($handle);
            }
        }
    }
}
