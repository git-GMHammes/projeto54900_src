<?php

namespace App\Libraries\Mail;

/**
 * Envio de e-mail via servico nativo do CodeIgniter (Config\Email), que le
 * host/porta/credenciais SMTP do ambiente do container (chaves MAIL_SMTP_* /
 * MAIL_NOREPLY_* no docker-compose.yml, servico php) — ver
 * Config/Email.php::__construct(). Sem biblioteca externa/Composer, mesmo
 * espirito do JwtService (Libraries/Auth).
 */
class MailerService
{
    /**
     * Envia um e-mail HTML simples. Retorna true/false; nao lanca excecao —
     * quem chama decide se uma falha de envio deve bloquear o fluxo.
     */
    public function sendHtml(string $to, string $subject, string $htmlBody): bool
    {
        $email = \Config\Services::email();

        $email->setTo($to);
        $email->setSubject($subject);
        $email->setMessage($htmlBody);

        return $email->send();
    }
}
