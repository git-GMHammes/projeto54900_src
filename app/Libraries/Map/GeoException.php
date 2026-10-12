<?php

namespace App\Libraries\Map;

/**
 * Erro previsivel dos provedores de mapa (config ausente, limite, indisponivel,
 * entrada sem resultado). O codigo e o status HTTP que o Controller devolve.
 */
class GeoException extends \RuntimeException
{
    public function __construct(string $message, private int $httpStatus = 502)
    {
        parent::__construct($message, $httpStatus);
    }

    public function httpStatus(): int
    {
        return $this->httpStatus;
    }
}
