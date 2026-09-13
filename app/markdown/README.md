# Base de conhecimento — projeto54900

Índice geral da base de conhecimento (`src/app/markdown/`). Cada tópico tem uma
palavra-chave e uma frase de 5 palavras. A palavra-chave no índice é âncora para
o resumo correspondente; cada resumo termina com o link para o conteúdo completo.

> Regra: sempre que um novo markdown for criado em `src/app/markdown/` (qualquer
> subpasta), este arquivo deve ser atualizado — nova entrada no índice, novo
> bloco de resumo e novo link. Procedimento em
> [`geral/README_atualiza_readme.md`](geral/README_atualiza_readme.md).

---

## Índice

| Palavra-chave                 | Assunto (5 palavras)                    |
| ----------------------------- | -------------------------------------- |
| [`atualizacao`](#atualizacao) | Registrar novo markdown neste índice    |
| [`compose`](#compose)         | Setup do ambiente Docker e example public |
| [`conexao`](#conexao)         | Conexão de banco por módulo             |
| [`formulario`](#formulario)   | Módulo de formulários dinâmicos no banco |
| [`migracao`](#migracao)       | Rodar e reverter migrations CodeIgniter |
| [`modulo`](#modulo)           | Como criar novos módulos padronizados   |
| [`navmenu`](#navmenu)         | Config do app e árvore de navegação     |
| [`schema`](#schema)           | Introspecção do banco por API            |
| [`seed`](#seed)               | Popular tabelas com dados iniciais      |
| [`upload`](#upload)           | Módulo de anexos para outros módulos     |

---

## Resumos

### `atualizacao`

Como manter esta base viva. Todo markdown novo em `src/app/markdown/` exige
atualizar `README.md`: acrescentar a linha no índice (palavra-chave + frase de
5 palavras), escrever o bloco de resumo e adicionar o link para o conteúdo
completo ao fim do próprio resumo. Todo markdown da base começa e termina com um
link para este `README.md`.

[`geral/README_atualiza_readme.md`](geral/README_atualiza_readme.md) — atualização desta base de conhecimento.

### `compose`

Como levantar o ambiente Docker/Podman do zero: serviços (`mysql`, `adminer`,
`php`, `node` WebSocket, `nginx`), pastas exigidas pelo build (`docker/php`,
`docker/mysql`, `docker/node`, `docker/nginx`) e portas expostas no host
(`54900` app, `54901` mysql, `54902` adminer). `docker-compose.yml` real
contém credenciais e não deve ser exposto publicamente; usar
`docker-compose-example.yml` (versionado, só placeholders) como base,
renomeando e preenchendo credenciais próprias antes de subir a stack.

[`geral/README_docker-compose.md`](geral/README_docker-compose.md) — setup do ambiente Docker/Podman e uso do compose de exemplo.

### `conexao`

Como o sistema conecta aos bancos usando podman e o `docker-compose.yml`. Há a
conexão `default` (banco `codeigniter54900_db`, credenciais `DB_*` via `env()`)
e um grupo nomeado por módulo (`mapa`, `agenda`, `chat`, constantes `DB_*` da
classe). Sem arquivo `.env`. Inclui como subir os containers e como adicionar um
novo módulo/banco.

[`geral/README_conecta_banco_enviroments.md`](geral/README_conecta_banco_enviroments.md) — conexão de bancos com podman e `docker-compose.yml`.

### `formulario`

Domínio `Form` da API V1: guarda no banco a definição estrutural de formulários
dinâmicos (como o `src/public/form_test.html`) e a expõe por APIs REST
**públicas** (sem JWT). Quatro tabelas encadeadas — `form_manager` (o
formulário: slug, título, grupo de perfil, rota React, status),
`form_groups` (subgrupos de contexto), `form_rows` (linhas de 1 a 12 campos) e
`form_fields` (atributos de qualquer componente do `FormGrid`, em colunas
explícitas + flags + colunas JSON) — mais a view `view_form_manager` que
achata os quatro níveis (1 linha por campo) para o front baixar o formulário
inteiro numa consulta. Segue o padrão de módulo; cada tabela tem as 18 rotas
canônicas e a view as 9 de leitura (81 no total). Regras de negócio (unicidade
de slug, FK ativa, teto de 12 do grid, serialização de JSON) nos Processors.

[`geral/README_modulo_form.md`](geral/README_modulo_form.md) — módulo de formulários dinâmicos da API V1.

### `migracao`

Comandos diretos do `spark` para criar, aplicar e reverter migrations, digitados
no host com `podman compose exec php php spark ...` (o container tem PHP 8.2).
`migrate` sem `-g` roda na conexão `default` (`codeigniter54900_db`);
`-g mapa|agenda|chat` para os módulos. Cobre `make:migration`, `migrate:status`,
`rollback`, `migrate:refresh` (destrutivo), seeds e o fluxo de montar o banco do
zero. Alerta: as migrations atuais não declaram `$DBGroup`.

[`geral/README_migrate.md`](geral/README_migrate.md) — comandos de migration do CodeIgniter por módulo.

### `modulo`

Padrão **obrigatório** para todo módulo novo da API V1: Routes + Controller +
Request + Processor/Service + Model + Migration, com classes base e SOLID. Fixa
a árvore de arquivos, o contrato de rotas (18 de tabela + 10 de view), o
envelope de resposta e o mapa tipo-de-coluna → regra de validação. Traz o
checklist para criar um módulo do zero e as pendências em aberto (ex.:
`DB_GROUP_001` aponta para grupo inexistente).

[`geral/ROADMAP_padrao_modulo.md`](geral/ROADMAP_padrao_modulo.md) — padrão obrigatório de módulo da API V1.

### `navmenu`

Dois recursos ligados por FK: `nav_manager` (config/branding do app — nome,
imagem, versão) e `menu_manager` (árvore de itens navegáveis de um nav, FK
`nav_manager_id` + auto-relacionamento `parent_id`). `menu_manager` guarda
**todas** as rotas do site na mesma tabela; a distinção "aparece no navbar" é
feita por faixa de `sort_order` (`<100` = navbar real, `>=1000` = catálogo
extra, `>=2000` = árvore administrativa exibida só na tela de gestão). O
Navbar real (`Navbar.tsx` + `useSiteMenu.ts`) lê só a faixa `<100` com
`parent_id` nulo, com fallback estático se a API falhar. Documenta também um
bug conhecido (charset `utf8` em vez de `utf8mb4` na conexão `default` —
título acentuado causa HTTP 500) e os seeders `NavManagerSeeder`/
`MenuManagerSeeder`.

[`geral/README_modulo_nav_menu.md`](geral/README_modulo_nav_menu.md) — módulo Nav/Menu, convenção de sort_order, bug de charset e seeders.

### `schema`

Utilitário REST **read-only** `api/v1/db-schema` que introspecta o banco da API
V1 via `INFORMATION_SCHEMA`: `GET db-schema/tables` (tabelas + views com engine,
linhas estimadas, comentário), `GET db-schema/columns/{tabela}` (colunas com
tipo, `nullable`, `default`, `key`, `extra`, `enum_values`) e
`GET db-schema/describe/{tabela}` (colunas + PK + FKs). Alimenta os `select` do
construtor de formulários para não referenciar coluna inexistente. Desvio
sancionado (3 rotas próprias, não as 18/9); `SchemaController` estende
`BaseResourceViewController` só pelo envelope. Segurança: nome de tabela sempre
validado contra `$db->listTables()` antes de qualquer query e consultas com
bind; schema exposto sem JWT — ok em homolog/dev.

[`geral/README_modulo_db_schema.md`](geral/README_modulo_db_schema.md) — introspecção do banco pela API (`db-schema`).

### `seed`

Comandos diretos do `spark` para popular tabelas com dados iniciais, digitados
no host com `podman compose exec php php spark db:seed <Classe>` (mesmo prefixo
das migrations). Cinco seeders, todos na conexão `default` (`codeigniter54900_db`)
e idempotentes: `UserRolesSeeder` (perfis `admin`/`user`/`guest` em
`user_roles`), `BootstrapIconsSeeder` (catálogo Bootstrap Icons em
`bootstrap_icons`, preserva favoritos), `FormConstructorSeeder` (árvore do
construtor de formulários em `form_manager`/`form_groups`/`form_rows`/`form_fields`),
`NavManagerSeeder` (nav de referência em `nav_manager`) e `MenuManagerSeeder`
(árvore completa de itens em `menu_manager`, chama `NavManagerSeeder` sozinho —
ver [`navmenu`](#navmenu)). Não há `DatabaseSeeder` agregador — `db:seed` sem
argumento falha; roda-se um a um, ou cria-se o agregador (exemplo no doc).
Cobre também `make:seed`, variante `-T` sem TTY, tabelas sem seeder
(`user_manager`, `user_profiles`, `upload_manager`, `calendars`/`calendar_*`) e
conferência via `spark db:table` ou Adminer.

[`geral/README_seed.md`](geral/README_seed.md) — comandos de seed para popular as tabelas do sistema.

### `upload`

Módulo `Upload/UploadManager` da API V1: recurso REST polimórfico que armazena
e serve arquivos (Office, imagem, áudio, vídeo, PDF, compactados) como anexos
de qualquer outro módulo, identificados por `module` + `reference_id`
(+ `collection`). Tabela `uploads` sem FK; arquivos em
`writable/uploads/<module>/<reference_id>/<file_key><AAAAMMDDHHMMSS>.<ext>`
(sem versão na pasta). Segue o padrão de módulo com dois desvios sancionados:
tabela sem foreign key e 3 rotas extras (`upload` multipart, `serve`,
`download`). Traz o contrato das rotas, a política de `Config/Upload.php` e
como outro módulo anexa/lista/exibe arquivos.

[`geral/README_modulo_upload.md`](geral/README_modulo_upload.md) — módulo de upload/anexos da API V1.
