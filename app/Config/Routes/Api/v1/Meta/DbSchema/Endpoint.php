<?php
// Rotas do utilitario de introspeccao do banco (somente leitura).
// Grupo: api/v1/db-schema  ->  Api\V1\Meta\DbSchema\SchemaController
//
// GET {{www}}/index.php/api/v1/db-schema/tables
$routes->get('tables', 'Api\V1\Meta\DbSchema\SchemaController::tables');
// GET {{www}}/index.php/api/v1/db-schema/columns/{tabela}
$routes->get('columns/(:segment)', 'Api\V1\Meta\DbSchema\SchemaController::columns/$1');
// GET {{www}}/index.php/api/v1/db-schema/describe/{tabela}
$routes->get('describe/(:segment)', 'Api\V1\Meta\DbSchema\SchemaController::describe/$1');
