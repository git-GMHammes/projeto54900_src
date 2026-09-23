[◄ Índice da base de conhecimento](../README.md)

---

# Migrations — comandos diretos (CodeIgniter 4)

## ⚠️ A partir de 2026-09-22 — migrations CI4 pausadas, schema muda direto no banco DEV

**Decisão do usuário (2026-09-22), vale até segunda ordem:** o fluxo abaixo
(`spark make:migration` / `spark migrate`) **não é o caminho ativo agora**.
Mudança de schema (`ALTER TABLE`, `CREATE TABLE`) é aplicada **direto no banco
DEV** (`codeigniter54900_db`), via SQL, **só depois de autorização expressa do
usuário para aquele comando específico** — nunca por conta própria. Nenhuma
migration nova é criada em `app/Database/Migrations/` enquanto esta nota
estiver valendo.

- **Por quê:** o usuário vai tirar `dump` do banco DEV periodicamente; a ideia
  é que esse dump (e não uma migration escrita à mão) seja o que documenta o
  schema real, pelo menos por enquanto. Ainda não está definido *como* o dump
  vai virar migration de novo — está marcado como "vemos depois".
- **O que isso NÃO muda:** dado (linha de tabela) continua entrando pelo
  caminho já estabelecido do projeto — API/Processor para `form_manager`/
  `list_manager`/`menu_manager`/etc. (nunca `INSERT` cru, ver
  [`README_form.md`](README_form.md) e `README_list_constructor.md` no
  frontend) — essa regra é sobre **integridade/charset dos dados**, não sobre
  migration, e continua valendo. A pausa é só no mecanismo de **schema**
  (`spark migrate`) — o resto deste documento (comandos, `$DBGroup`, etc.)
  continua sendo a referência de como o projeto funciona quando as migrations
  voltarem a ser o caminho ativo.
- **O que "MIGRATE" passa a significar nesse meio-tempo — regra 1:1, sem
  ambiguidade:** enquanto essa pausa durar, "rodar um MIGRATE" (nas conversas,
  nos planos `_plano.json`/`_no_plano.json`) significa **executar um SQL
  direto no banco DEV** — não o comando `spark migrate`. E a granularidade é
  **um conjunto de MIGRATE = um conjunto de SQL**: cada mudança de schema
  (cada `ALTER TABLE`, cada `CREATE TABLE`) é o SEU PRÓPRIO passo, com o SEU
  PRÓPRIO comando SQL registrado — nunca várias mudanças de schema diferentes
  agrupadas num único passo/registro. Isso vale tanto pra execução quanto pro
  registro em `src/writable/claude/*_no_plano.json`: 1 SQL executado = 1
  `_no_plano.json` com o `comando_ou_input` sendo exatamente aquele SQL (texto
  completo, não resumo) — nada de "rodei 3 ALTER TABLE" num passo só.
- **Credenciais do banco DEV** para rodar o SQL direto: pedidas ao usuário no
  momento da execução, nunca gravadas em arquivo versionado (regra global de
  segredos, `CLAUDE.md`).
- **Se você (humano ou IA) reabrir este projeto depois:** confirme com o
  usuário se essa pausa ainda vale antes de assumir que `spark migrate` é o
  caminho ativo — esta nota fica até ele dizer o contrário.

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
- **Alerta:** as 9 migrations já presentes em `app/Database/Migrations/` **não**
  declaram `$DBGroup`. Como estão, um `SPARK migrate` sem `-g` aplica todas no
  `codeigniter54900_db`, inclusive tabelas que são do módulo `Calendar`
  (`calendar_manager`, `calendar_events`, ...). Definir o `$DBGroup` de cada arquivo
  antes de montar o banco.
- Testes usam o grupo `tests` (SQLite em memória): `SPARK migrate -g tests` não
  é necessário no fluxo normal.
- `timestampFormat` = `Y-m-d-His_`; tabela de controle = `migrations`;
  `Config\Migrations::$enabled = true`.

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
