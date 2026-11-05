<?php
// Rota PUBLICA (fora de jwtauth: o grupo 'eleicoes-public' nao esta em Config/Filters.php; o wildcard eleicoes2026-* nao o alcanca).
// Emite o token especial das APIs Eleicoes2026 (typ=eleicoes), valido so nos grupos eleicoes2026-* (somente leitura).
// GET {{www}}/index.php/api/v1/eleicoes-public/token
$routes->get('token', 'Api\V1\Eleicoes2026\EleicoesToken\TokenController::issue');
