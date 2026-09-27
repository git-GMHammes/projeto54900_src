[◄ Índice da base de conhecimento](../README.md)

---

## Prompt padrão — pedir um REMAKE novo à IA

> Copiar o bloco JSON abaixo, preencher `"timestamp"` com o `AAAAMMDDHHMM` do
> momento e colar como prompt. A IA deve **apenas gerar os 6 arquivos** (3
> `.sql` + 3 classes PHP) em `app/Database/Migrations/`, no formato fixo
> descrito no campo `"formato"` do próprio prompt (que é o padrão revisado
> pelo usuário e prevalece sobre a tabela "Modelo ativo: Migrate REMAKE"
> abaixo). **Não roda `spark migrate`.**

```json
{
  "tarefa": "gerar_remake_migrations",
  "projeto": "projeto54900",
  "conexao": "default (codeigniter54900_db)",
  "timestamp": "AAAAMMDDHHMM",
  "instrucoes": "Gerar um REMAKE completo a partir do estado ATUAL do banco DEV: 3 arquivos .sql (dump) + 3 classes PHP (consumo), TODOS OS 6 com o MESMO timestamp, em app/Database/Migrations/. As 3 classes PHP são TÃO OBRIGATÓRIAS quanto os 3 .sql — a tarefa NÃO está completa com só os .sql. O campo 'formato' abaixo é o padrão revisado pelo usuário: ele prevalece sobre 'mais simples', sobre o que o mysqldump escreve e sobre os REMAKEs anteriores.",
  "fonte_de_dados": [
    "Tabelas, colunas, views e DADOS vêm do banco DEV lido nesta execução.",
    "PROIBIDO montar qualquer um dos 3 .sql reaproveitando, copiando ou 'completando' arquivos .sql de REMAKEs anteriores: o conteúdo deles fica velho e o REMAKE sai com dados errados.",
    "Antes de gerar: listar as tabelas base e as views do banco e contar os registros por tabela.",
    "Antes de escrever cada INSERT: consultar DESCRIBE/SHOW CREATE TABLE da tabela real e usar exatamente esse nome de tabela e essa ordem de colunas — NUNCA supor, adivinhar ou copiar de memória.",
    "Depois de gerar: conferir, tabela por tabela, se a quantidade de tuplas geradas bate com a contagem feita no banco."
  ],
  "formato": {
    "cabecalho_e_rodape": "Cada .sql abre com as 8 linhas /*!40101 ... */ usadas nos REMAKEs anteriores (entre elas /*!40101 SET NAMES utf8 */; e /*!50503 SET NAMES utf8mb4 */;) e fecha com as 5 linhas de restauração (TIME_ZONE, SQL_MODE, FOREIGN_KEY_CHECKS, CHARACTER_SET_CLIENT, SQL_NOTES). Blocos separados por linha em branco.",
    "replace_table": "Por tabela: DROP TABLE IF EXISTS `t`; e CREATE TABLE IF NOT EXISTS `t` (...) ENGINE=...; — sempre com IF NOT EXISTS.",
    "replace_view": "Divisória de 77 hífens precedidos de '-- ' (80 colunas, igual aos REMAKEs anteriores); comentários em português, sem palavra-chave SQL e sem '=' na divisória (regra anti-formatador deste README); SET NAMES utf8mb4; em linha própria; por view: DROP VIEW IF EXISTS `v`; e CREATE VIEW `v` AS com o SELECT alinhado.",
    "seed_bloco": "Por tabela: DELETE FROM `t`; e, na linha seguinte, INSERT INTO `t` (`col1`, `col2`, ...) VALUES — sem linha em branco entre o DELETE e o INSERT.",
    "seed_tuplas": "UMA TUPLA POR LINHA, indentada com TAB (\\t, NUNCA espaços — nem 4, nem 2, nenhum) — igual ao dump real do banco — cada uma terminando em vírgula, a última em ponto e vírgula. Tabela sem registros: fica só o DELETE FROM.",
    "seed_valores": "Espaço depois de cada vírgula entre os valores. Texto entre aspas simples, com aspas simples internas escapadas por barra invertida e aspas duplas internas normais (sem barra invertida antes delas). Nulo é NULL, sem aspas.",
    "seed_exemplo": [
      "DELETE FROM `tabela`;",
      "INSERT INTO `tabela` (`id`, `name`, `hexadecimal`, `created_at`) VALUES",
      "\t(1, 'Black', '#000000', '2026-09-23 17:00:07'),",
      "\t(2, 'grey11', '#1C1C1C', '2026-09-23 17:00:07');"
    ],
    "seed_proibido": "Tuplas separadas apenas por vírgula, sem espaço depois dela, todas na mesma linha, assim: ...) VALUES (1,'Black',...),(2,'grey11',...); — formato padrão do mysqldump. Se usar mysqldump, reformatar o arquivo antes de salvar. Também PROIBIDO indentar as tuplas com espaços (ex.: 4 espaços) — o único caractere correto é TAB (\\t)."
  },
  "arquivos": [
    {
      "ordem": 1,
      "sql": "AAAAMMDDHHMM_replace_table.sql",
      "classe_php": "AAAA-MM-DD-HHMM00_ReplaceTable<AAAAMMDD>.php",
      "conteudo": "DROP TABLE IF EXISTS + CREATE TABLE IF NOT EXISTS de TODAS as tabelas base do banco DEV atual, como em formato.replace_table"
    },
    {
      "ordem": 2,
      "sql": "AAAAMMDDHHMM_seed_table.sql",
      "classe_php": "AAAA-MM-DD-HHMM00_SeedTable<AAAAMMDD>.php",
      "conteudo": "DELETE FROM + INSERT com a lista de colunas e UMA TUPLA POR LINHA (indentação com TAB, ver formato.seed_tuplas), como em formato.seed_exemplo, de TODOS os dados atuais do banco DEV"
    },
    {
      "ordem": 3,
      "sql": "AAAAMMDDHHMM_replace_view.sql",
      "classe_php": "AAAA-MM-DD-HHMM00_ReplaceView<AAAAMMDD>.php",
      "conteudo": "DROP VIEW IF EXISTS + CREATE VIEW de TODAS as views atuais do banco DEV"
    }
  ],
  "regras": [
    "Cada classe PHP é cópia da classe do REMAKE anterior: só lê o .sql ao lado e executa statement por statement (executeSqlFile), sem Forge; nome do arquivo e nome da classe levam o sufixo AAAAMMDD para não colidir no namespace",
    "down() do ReplaceTable e SeedTable vazio; ReplaceView faz DROP VIEW IF EXISTS de cada view",
    "NÃO rodar 'spark migrate' nem qualquer comando que aplique o REMAKE no banco",
    "Apenas CRIAR os 6 arquivos; a aplicação (spark migrate) fica por conta do usuário, após revisão prévia",
    "UM SÓ timestamp por execução. PROIBIDO gerar um timestamp novo se o anterior ficou incompleto: complete o mesmo timestamp, ou apague os arquivos incompletos dele antes de tentar de novo. NUNCA deixar dois conjuntos parciais na pasta",
    "A resposta termina com: nº de tabelas base, nº de views e, por arquivo .sql, o total de bytes e de statements (INSERT/DELETE por tabela, CREATE/DROP por tabela ou view)",
    "Repetir ao final da resposta, sem executar, o comando fixo indicado abaixo deste prompt"
  ],
  "checklist_final": [
    "Antes de dar a tarefa como concluída, listar os 6 caminhos esperados com o timestamp usado nesta execução:",
    "app/Database/Migrations/<timestamp>_replace_table.sql",
    "app/Database/Migrations/<AAAA-MM-DD-HHMM00>_ReplaceTable<AAAAMMDD>.php",
    "app/Database/Migrations/<timestamp>_seed_table.sql",
    "app/Database/Migrations/<AAAA-MM-DD-HHMM00>_SeedTable<AAAAMMDD>.php",
    "app/Database/Migrations/<timestamp>_replace_view.sql",
    "app/Database/Migrations/<AAAA-MM-DD-HHMM00>_ReplaceView<AAAAMMDD>.php",
    "Confirmar CADA um dos 6 como criado. Se QUALQUER um estiver faltando, a tarefa NÃO está concluída — não afirmar sucesso; completar o que falta antes de responder, ou avisar explicitamente o que não foi possível gerar e por quê"
  ]
}
```

**Comando de aplicação — SEMPRE por conta do usuário, após revisão. Repetir
esta linha em toda resposta ao prompt acima; NÃO executar automaticamente:**

```
podman compose exec php php spark migrate
```

---

# Migrations — comandos diretos (CodeIgniter 4)

## Modelo ativo: Migrate REMAKE (desde 2026-09-23)

> ⛔ **REGRA DO USUÁRIO (2026-09-24) — NENHUMA MIGRATION NOVA SEM AUTORIZAÇÃO**
>
> - **PROIBIDO** criar migration ou SQL nova por conta própria — nem
>   `alter_table`, nem `seed_table` avulso, nem `create_view`, nem REMAKE.
>   Criar sem autorização **atrapalha** o usuário.
> - **Quem decide quando um novo REMAKE deve ser feito é o usuário — ele
>   avisa.** Até lá, mudanças de schema/dados ficam só no banco DEV e na
>   documentação do módulo, sem arquivo em `app/Database/Migrations/`.
> - **Todo migrate SOBRESCREVE o anterior: DESTRÓI TUDO e REFAZ TUDO.** Não
>   existe migration incremental neste projeto.
> - Contraexemplo (o que **não** fazer): os arquivos criados sem autorização em
>   2026-09-24 — `202609241230_create_view.sql`, `202609241300_alter_table.sql`,
>   `202609241301_seed_table.sql`, `202609241400_alter_table.sql`,
>   `202609241500_seed_table.sql`, `202609241600_seed_table.sql`,
>   `202609241700_alter_table.sql`, `202609241701_seed_table.sql`.

**Decisão do usuário (2026-09-23):** substitui a pausa de 2026-09-22. Não se
escreve migration incremental (Forge, `ALTER TABLE` à mão, `spark
make:migration` por tabela). **Sempre que for preciso rodar os migrates, gera-se
um REMAKE** — um snapshot completo do banco DEV (`codeigniter54900_db`) que
recria tudo do zero.

**Um REMAKE = 3 SQLs + 3 classes PHP**, mesmo timestamp, em
`app/Database/Migrations/`:

| Ordem | SQL (dump do banco DEV)              | Classe PHP                                   | Conteúdo                                            |
| ----- | ------------------------------------ | -------------------------------------------- | --------------------------------------------------- |
| 1     | `AAAAMMDDHHMM_replace_table.sql`     | `AAAA-MM-DD-HHMM00_ReplaceTable<AAAAMMDD>.php` | `DROP TABLE IF EXISTS` + `CREATE TABLE` de todas    |
| 2     | `AAAAMMDDHHMM_seed_table.sql`        | `AAAA-MM-DD-HHMM00_SeedTable<AAAAMMDD>.php`    | `DELETE` + `INSERT` de todos os dados               |
| 3     | `AAAAMMDDHHMM_replace_view.sql`      | `AAAA-MM-DD-HHMM00_ReplaceView<AAAAMMDD>.php`  | `DROP VIEW IF EXISTS` + `CREATE VIEW` de todas      |

> **Mudança de sufixo (2026-09-27):** a 3ª migration passa de
> `create_view.sql`/`CreateView` para **`replace_view.sql`/`ReplaceView`** —
> mesmo padrão semântico de `replace_table` (destrói e recria). REMAKEs
> criados **antes** de 2026-09-27 continuam com o nome antigo
> (`*_create_view.sql` / `CreateView<AAAAMMDD>`); não foram renomeados.

Regras do REMAKE:

- **Classe = sufixo do nome do arquivo.** O CI4 monta o nome da classe a partir
  do trecho após o timestamp; por isso o sufixo `<AAAAMMDD>` vai no arquivo
  **e** na classe (`ReplaceTable20260922` em
  `2026-09-22-214000_ReplaceTable20260922.php`). Sem sufixo, colide com o
  REMAKE anterior no mesmo namespace.
- **A classe só lê o `.sql` ao lado e executa statement por statement**
  (`executeSqlFile()` + `$this->db->query()`), sem Forge. Espelho:
  `2026-09-22-2140*_*20260922.php`.
- **`CREATE DATABASE` / `USE` do dump são ignorados** pelo `executeSqlFile()`
  do ReplaceTable — o banco vem da conexão (`default`), não do nome cravado no
  `.sql`.
- `down()` do ReplaceTable/SeedTable fica vazio (sem inverso genérico);
  ReplaceView (antes de 2026-09-27: CreateView) faz `DROP VIEW IF EXISTS` de
  cada view.
- **Destrutivo:** `spark migrate` com um REMAKE pendente dropa todas as tabelas
  (inclusive `migrations`) e recarrega os dados do dump. Tudo gravado no banco
  depois do dump se perde — tirar backup antes se houver dado novo.
- Em banco vazio, `spark migrate` roda **todos** os REMAKEs pendentes em ordem;
  o último sobrescreve os anteriores (resultado final correto, só mais lento).
- Credenciais do banco DEV nunca gravadas em arquivo versionado (regra global
  de segredos, `CLAUDE.md`).

### Comentários no SQL de view (`*_replace_view.sql`, antes `*_create_view.sql`) — à prova do formatador

**Pedido do usuário (2026-09-24):** ao criar um SQL de view a pedido do
usuário, os comentários `--` devem sobreviver ao formatador de SQL do editor.
O formatador quebrou o `202609241714_create_view.sql` assim:

- **Divisor `-- =====` vira `-- =  =  =  =`** — e o `SET NAMES utf8mb4;` da
  linha seguinte foi colado dentro do comentário (desativado).
- **Palavra-chave SQL dentro de comentário é jogada para uma linha nova, fora
  do `--`** — ex.: `-- Fonte: SHOW CREATE VIEW de cada uma` virou
  `-- Fonte: SHOW` + `CREATE VIEW de cada uma` solto; `-- cm LEFT JOIN ce`
  virou `LEFT JOIN ce` solto. O MySQL tenta executar essas linhas → erro.

Regras:

- **PROIBIDO divisor com `=`** (`-- =====`). Usar só `-- -----`, que o
  formatador preserva.
- **Nenhuma palavra-chave SQL em comentário** (`SELECT`, `JOIN`, `LEFT JOIN`,
  `CREATE`, `SHOW`, `DROP`, `FROM`, `WHERE`, `NULL`, ...). Descrever em
  português: "junção à esquerda", "sem junção", "vazio", "definição real de
  cada view no banco".
- `SET NAMES utf8mb4;` sempre em linha própria, fora de comentário.
- Espelho: `202609241714_create_view.sql`.

As seções "Criar migration", "Seeds" e o `$DBGroup` abaixo continuam válidos
como referência do CI4, mas o caminho ativo para o `codeigniter54900_db` é o
REMAKE.

---

**Comando principal** — aplicar as migrations no banco padrão
(`codeigniter54900_db`), digitado no host (PowerShell, na raiz do projeto):

```
podman compose exec php php spark migrate
 
```

Item a item:

| Trecho           | O que é                                                                                         |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| `podman compose` | orquestrador de containers; lê o `docker-compose.yml` da pasta atual (igual a `docker compose`) |
| `exec`           | executa um comando **dentro de um container que já está rodando**                               |
| `php` (1º)       | nome do **serviço** no `docker-compose.yml` onde o comando vai rodar                            |
| `php` (2º)       | o **binário PHP** dentro do container (é o container que tem PHP 8.2, não o host)               |
| `spark`          | CLI do CodeIgniter 4 — arquivo `spark` na raiz de `src/`, montado em `/var/www/html`            |
| `migrate`        | ação do `spark`: aplica as migrations ainda não executadas                                      |

Sem `--group`, roda na conexão `default` = banco `codeigniter54900_db`
(credenciais `DB_*` do `docker-compose.yml`, serviço `php`). Para um módulo
específico, acrescentar `-g mapa` / `-g agenda` / `-g chat` — ver "Rodar
migrations". O restante deste arquivo é pré-requisito, variações e comandos
auxiliares.

---

Referência rápida para montar e evoluir os bancos do `projeto54900` com o
`spark`. Conexão `default` → banco `codeigniter54900_db` (usada sem `--group`);
além dela, um grupo por módulo: `mapa`, `agenda`, `chat` (bancos
`projeto54900_mapa`, `projeto54900_agenda`, `projeto54900_chat`).

## Onde rodar os comandos (a partir do host)

O PHP do host é 8.1 e o projeto exige 8.2; `vendor/` não fica no host. O `spark`
executa **dentro do container `php`** (`working_dir` = `/var/www/html`), mas
**você não precisa entrar no container** — todos os comandos são digitados no
**host**, no PowerShell, na raiz do projeto.

**1. Digite isto no host, uma vez, para subir o ambiente:**

``` 
cd C:\laragon\www\php\habilidade\projeto54900
podman compose up -d --build
```

**2. Aplicar as migrations — comando real, digitado no host:**

``` 
cd C:\laragon\www\php\habilidade\projeto54900
podman compose exec php php spark migrate
 
```

Roda na conexão `default` (`codeigniter54900_db`). Para um módulo, acrescente
`-g mapa` / `-g agenda` / `-g chat`.

Todos os demais comandos deste documento seguem o mesmo prefixo, mudando só a
parte final (a ação do `spark`):

```
podman compose exec php php spark migrate:status -g mapa
podman compose exec php php spark migrate:rollback -g mapa
podman compose exec php php spark make:migration CreateExampleTable
```

Leitura do prefixo: `podman` roda no host → `compose exec php` executa no
container `php` que já está de pé → `php spark ...` roda lá dentro. Você **não**
entra no container.

Confirme que o spark responde:

```
podman compose exec php php spark list
```

Notas:

- `docker compose exec php php spark ...` é equivalente (troque `podman` por `docker`).
- Sem TTY (scripts/CI): `podman compose exec -T php php spark <comando>`.
- Se preferir um shell interativo no container: `podman compose exec php sh` e,
  lá dentro, rode `php spark <comando>` sem o prefixo.

Nos exemplos abaixo, `SPARK` é abreviação de `podman compose exec php php spark`
(digitado no host).

## Criar migration

```
SPARK make:migration CreateExampleTable
SPARK make:migration Add_status_to_example
```

Gera `app/Database/Migrations/AAAA-MM-DD-His_Nome.php` (formato de timestamp
`Y-m-d-His_`, definido em `app/Config/Migrations.php`).

**Migration de módulo:** logo após gerar, editar a classe e declarar o grupo —
sem `$DBGroup`, a migration roda na conexão `default` (`codeigniter54900_db`),
não no banco do módulo:

```php
class CreateExampleTable extends Migration
{
    protected $DBGroup = 'agenda';   // mapa | agenda | chat
    // ...
}
```

Migration para o próprio `codeigniter54900_db`: não declarar `$DBGroup` (usa o
`default`).

## Rodar migrations

```
SPARK migrate                      # conexão default => codeigniter54900_db
SPARK migrate -g mapa              # aplica as pendentes no grupo mapa
SPARK migrate -g agenda
SPARK migrate -g chat
SPARK migrate --all                # todos os namespaces (App + libs)
```

Sem `-g`, o `spark` usa `$defaultGroup` (`default` => `codeigniter54900_db`)
para as migrations que não fixam `$DBGroup`. Uma tabela de controle `migrations`
é criada **em cada banco** — o `default` e cada banco de módulo têm a sua.

## Ver o estado

```
SPARK migrate:status              # lista migrations, batch e se foram aplicadas
SPARK migrate:status -g agenda
```

## Reverter

```
SPARK migrate:rollback            # desfaz o último batch (conexão default)
SPARK migrate:rollback -g agenda  # desfaz o último batch do grupo agenda
SPARK migrate:rollback -b 0       # desfaz TUDO até o início
SPARK migrate:rollback -b 3       # volta ao batch 3
```

## Recriar do zero (destrutivo)

```
SPARK migrate:refresh -g agenda   # rollback total + migrate no grupo agenda
SPARK migrate:refresh --all
```

**Comando destrutivo:** dropa e recria todas as tabelas do grupo — perde todos
os dados. Só usar em desenvolvimento.

## Seeds

```
SPARK make:seed ExampleSeeder
SPARK db:seed ExampleSeeder
```

Declarar o grupo na seed (`protected $DBGroup = 'agenda';`) ou obter a conexão
pelo grupo dentro do `run()`.

## Montar o banco do zero

1. Subir o ambiente: `podman compose up -d --build`.
   Em volume MySQL novo, o `docker/mysql/init.sql` cria `codeigniter54900_db`,
   os 3 bancos de módulo e os `GRANT`. Em volume já existente, criar bancos
   novos à mão (Adminer `:54902`).
2. Banco `default` (`codeigniter54900_db`) — migrations sem `$DBGroup`:
   ```
   SPARK migrate
   SPARK migrate:status
   ```
3. Bancos de módulo — cada migration do módulo declara `protected $DBGroup` e
   aplica-se por grupo:
   ```
   SPARK migrate -g mapa
   SPARK migrate -g agenda
   SPARK migrate -g chat
   ```
4. Conferir: `SPARK migrate:status` e `SPARK migrate:status -g <grupo>`.

## Observações do projeto

- **Conexão `default`** (`codeigniter54900_db`): credenciais lidas via `env()`
  das chaves `DB_*` do `docker-compose.yml` (serviço `php`). Os grupos de módulo
  usam as constantes `DB_*` de `app/Config/Database.php`. Sem arquivo `.env`.
  Ver [`README_conecta_banco_enviroments.md`](README_conecta_banco_enviroments.md).
- `$defaultGroup = 'default'`. `SPARK migrate` sem `-g` roda no
  `codeigniter54900_db`. Para um módulo, declarar `$DBGroup` na migration e usar
  `-g <grupo>`.
- As migrations REMAKE em `app/Database/Migrations/` **não** declaram
  `$DBGroup`: rodam no `codeigniter54900_db`, inclusive as tabelas do módulo
  `Calendar` (`calendar_manager`, `calendar_events`, ...), que hoje vivem nesse
  banco.
- Testes usam o grupo `tests` (SQLite em memória): `SPARK migrate -g tests` não
  é necessário no fluxo normal.
- `timestampFormat` = `Y-m-d-His_`; tabela de controle = `migrations`;
  `Config\Migrations::$enabled = true`.

---

[◄ Índice da base de conhecimento](../README.md)

---

### 📌 Metadados do Autor

| Campo               | Informação                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Nome**            | Gustavo Hammes                                                                                                               |
| **Local**           | Rio de Janeiro                                                                                                               |
| **LinkedIn**        | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes)                                                 |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
