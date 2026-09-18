[◄ Índice da base de conhecimento](../README.md)

---

# Módulo `db-schema` — introspecção do banco (API V1)

Utilitário REST **somente leitura** que lista as tabelas/views do banco da API
V1 (`codeigniter54900_db`, grupo `DB_GROUP_001`) e as colunas de cada uma. Serve
para o **construtor de formulários** oferecer, nos `select`, apenas nomes de
coluna que existem de fato — evitando `field_name` apontando para coluna
inexistente.

## 1. Identidade

| Item | Valor |
| --- | --- |
| Domínio / Módulo | `Meta` / `DbSchema` |
| Namespace | `App\...\V1\Meta\DbSchema` |
| Slug | `db-schema` → `api/v1/db-schema/...` |
| Autenticação | **nenhuma** (como o resto da API) |
| Tipo | read-only, **sem** tabela / migration / model |

**Desvio sancionado do `ROADMAP_padrao_modulo.md`:** não são as 18/9 rotas
canônicas — são 3 rotas próprias. O `SchemaController` estende
`BaseResourceViewController` apenas para reaproveitar os helpers `respond*` e o
envelope padrão; as 9 rotas de view **não** são registradas para este grupo.
Nenhuma classe `Base*` foi alterada.

## 2. Rotas

| Verbo | Caminho | Retorno |
| --- | --- | --- |
| GET | `db-schema/tables` | `[{ name, type: table\|view, engine, rows_estimate, comment }]` |
| GET | `db-schema/columns/(:segment)` | `[{ name, position, data_type, column_type, nullable, default, key, extra, char_max_length, numeric_precision, numeric_scale, enum_values, comment }]` |
| GET | `db-schema/describe/(:segment)` | `{ table, schema, primary_key: [...], foreign_keys: [{ column, references_table, references_column, constraint }], columns: [...] }` |

`enum_values` vem preenchido para colunas `ENUM`/`SET` (parse do `COLUMN_TYPE`),
`null` para as demais.

Tabela fora da whitelist → **404** no envelope padrão.

Envelope, exemplo (`GET /api/v1/db-schema/columns/form_rows`):

```json
{
  "method": "GET",
  "endpoint": "/index.php/api/v1/db-schema/columns/form_rows",
  "statusCode": 200,
  "message": "Colunas listadas com sucesso",
  "success": true,
  "data": [
    { "name": "id", "data_type": "bigint", "nullable": false, "key": "PRI", "extra": "auto_increment", "enum_values": null },
    { "name": "gutter", "data_type": "varchar", "column_type": "varchar(8)", "nullable": true, "default": "g-3", "char_max_length": 8 }
  ]
}
```

## 3. Segurança

- **Whitelist obrigatória.** `columnsOf()` / `describe()` validam o nome recebido
  contra `$db->listTables()` **antes** de qualquer query. Nada é concatenado.
- Consultas ao `INFORMATION_SCHEMA` sempre com **bind** (`TABLE_SCHEMA` e
  `TABLE_NAME` como parâmetros).
- **Exposição de schema sem JWT.** Aceitável em homologação/desenvolvimento
  (é o mesmo modelo público do resto da API V1). Se a API for a produção
  aberta, colocar este grupo atrás de um filtro de auth antes de publicar.

## 4. Arquivos

```
Services/V1/Meta/DbSchema/SchemaInspector.php     tableNames/isKnownTable/tables/columnsOf/describe
Controllers/Api/V1/Meta/DbSchema/SchemaController.php   tables/columns/describe (+ try-catch -> respondServerError)
Config/Routes/Api/v1/Meta/DbSchema/Endpoint.php   3 rotas GET
Config/Routes.php                                 + grupo 'db-schema'
```

Frontend: `src/services/v1/dbSchema.ts` (`tables()`, `columns(t)`, `describe(t)`
via `http.get`) + `API_GROUPS.dbSchema` em `constants/api.ts`.

## 5. Aplicar

Sem migration. Basta o deploy dos arquivos:

```
podman compose exec php php spark routes    # confere as 3 rotas db-schema
```

---

[◄ Índice da base de conhecimento](../README.md)

---

### 📌 Metadados do Autor

| Campo | Informação |
| --- | --- |
| **Nome** | Gustavo Hammes |
| **Local** | Rio de Janeiro |
| **LinkedIn** | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes) |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
