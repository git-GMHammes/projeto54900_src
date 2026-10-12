<?php

namespace App\Exceptions;

/**
 * Gravacao recusada pelo isolamento por empresa: a linha referencia (chave estrangeira) um registro
 * que nao pertence a empresa da sessao, ou a sessao nao tem empresa valida.
 * A mensagem para o cliente e sempre generica (nunca diz se o registro existe em outra empresa).
 */
class CompanyScopeException extends \RuntimeException
{
}
