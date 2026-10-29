const e=`[◄ Índice da base de conhecimento](../README.md)\r
\r
---\r
\r
# Módulo \`db-schema\` — introspecção do banco (API V1)\r
\r
> NÃO EXISTE ALTERAÇÃO de MIGRATE: apenas no fim de cada ciclo um novo, para a renovação de todo o sistema.\r
\r
Utilitário REST **somente leitura** que lista as tabelas/views do banco da API\r
V1 (\`codeigniter54900_db\`, grupo \`DB_GROUP_001\`) e as colunas de cada uma. Serve\r
para o **construtor de formulários** oferecer, nos \`select\`, apenas nomes de\r
coluna que existem de fato — evitando \`field_name\` apontando para coluna\r
inexistente.\r
\r
## 1. Identidade\r
\r
| Item | Valor |\r
| --- | --- |\r
| Domínio / Módulo | \`Meta\` / \`DbSchema\` |\r
| Namespace | \`App\\...\\V1\\Meta\\DbSchema\` |\r
| Slug | \`db-schema\` → \`api/v1/db-schema/...\` |\r
| Autenticação | **nenhuma** (como o resto da API) |\r
| Tipo | read-only, **sem** tabela / migration / model |\r
\r
**Desvio sancionado do \`ROADMAP_padrao_modulo.md\`:** não são as 18/9 rotas\r
canônicas — são 3 rotas próprias. O \`SchemaController\` estende\r
\`BaseResourceViewController\` apenas para reaproveitar os helpers \`respond*\` e o\r
envelope padrão; as 9 rotas de view **não** são registradas para este grupo.\r
Nenhuma classe \`Base*\` foi alterada.\r
\r
## 2. Rotas\r
\r
| Verbo | Caminho | Retorno |\r
| --- | --- | --- |\r
| GET | \`db-schema/tables\` | \`[{ name, type: table\\|view, engine, rows_estimate, comment }]\` |\r
| GET | \`db-schema/columns/(:segment)\` | \`[{ name, position, data_type, column_type, nullable, default, key, extra, char_max_length, numeric_precision, numeric_scale, enum_values, comment }]\` |\r
| GET | \`db-schema/describe/(:segment)\` | \`{ table, schema, primary_key: [...], foreign_keys: [{ column, references_table, references_column, constraint }], columns: [...] }\` |\r
\r
\`enum_values\` vem preenchido para colunas \`ENUM\`/\`SET\` (parse do \`COLUMN_TYPE\`),\r
\`null\` para as demais.\r
\r
Tabela fora da whitelist → **404** no envelope padrão.\r
\r
Envelope, exemplo (\`GET /api/v1/db-schema/columns/form_rows\`):\r
\r
\`\`\`json\r
{\r
  "method": "GET",\r
  "endpoint": "/index.php/api/v1/db-schema/columns/form_rows",\r
  "statusCode": 200,\r
  "message": "Colunas listadas com sucesso",\r
  "success": true,\r
  "data": [\r
    { "name": "id", "data_type": "bigint", "nullable": false, "key": "PRI", "extra": "auto_increment", "enum_values": null },\r
    { "name": "gutter", "data_type": "varchar", "column_type": "varchar(8)", "nullable": true, "default": "g-3", "char_max_length": 8 }\r
  ]\r
}\r
\`\`\`\r
\r
## 3. Segurança\r
\r
- **Whitelist obrigatória.** \`columnsOf()\` / \`describe()\` validam o nome recebido\r
  contra \`$db->listTables()\` **antes** de qualquer query. Nada é concatenado.\r
- Consultas ao \`INFORMATION_SCHEMA\` sempre com **bind** (\`TABLE_SCHEMA\` e\r
  \`TABLE_NAME\` como parâmetros).\r
- **Exposição de schema sem JWT.** Aceitável em homologação/desenvolvimento\r
  (é o mesmo modelo público do resto da API V1). Se a API for a produção\r
  aberta, colocar este grupo atrás de um filtro de auth antes de publicar.\r
\r
## 4. Arquivos\r
\r
\`\`\`\r
Services/V1/Meta/DbSchema/SchemaInspector.php     tableNames/isKnownTable/tables/columnsOf/describe\r
Controllers/Api/V1/Meta/DbSchema/SchemaController.php   tables/columns/describe (+ try-catch -> respondServerError)\r
Config/Routes/Api/v1/Meta/DbSchema/Endpoint.php   3 rotas GET\r
Config/Routes.php                                 + grupo 'db-schema'\r
\`\`\`\r
\r
Frontend: \`src/services/v1/dbSchema.ts\` (\`tables()\`, \`columns(t)\`, \`describe(t)\`\r
via \`http.get\`) + \`API_GROUPS.dbSchema\` em \`constants/api.ts\`.\r
\r
## 5. Aplicar\r
\r
Sem migration. Basta o deploy dos arquivos:\r
\r
\`\`\`\r
podman compose exec php php spark routes    # confere as 3 rotas db-schema\r
\`\`\`\r
\r
---\r
\r
[◄ Índice da base de conhecimento](../README.md)\r
\r
---\r
\r
### 📌 Metadados do Autor\r
\r
| Campo               | Informação                                                                                                                   |\r
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |\r
| **Nome**            | Gustavo Hammes                                                                                                               |\r
| **Local**           | Rio de Janeiro                                                                                                               |\r
| **LinkedIn**        | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes)                                                 |\r
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |\r
`;export{e as default};
