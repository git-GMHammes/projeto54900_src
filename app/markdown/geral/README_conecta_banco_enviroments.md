[◄ Índice da base de conhecimento](../README.md)

---

# Conexão de bancos de dados — podman + docker-compose.yml

Como o `projeto54900` conecta aos bancos MySQL. Regras fixas:

- **Conexão `default`** → banco `codeigniter54900_db`. Credenciais via `env()`,
  lendo as chaves `DB_*` do `docker-compose.yml`. É o grupo de `spark migrate`
  sem `--group` e de `db_connect()` sem argumento.
- **Um grupo nomeado por módulo** (`mapa`, `agenda`, `chat`, …), cada um
  apontando para um database próprio no mesmo servidor MySQL. Para acessar um
  módulo, sempre nomear o grupo.
- **Sem arquivo `.env`.** `env()` só na conexão `default` (variáveis vindas do
  `environment:` do container). Os grupos de módulo usam credenciais fixas
  (constantes `DB_*` da classe).

## Onde ficam as credenciais

| Arquivo                                | O que define                                                                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `docker-compose.yml` → serviço `mysql` | `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`                                                                          |
| `docker-compose.yml` → serviço `php`   | `DB_HOST` (`mysql`), `DB_PORT` (`3306`), `DB_DATABASE` (`codeigniter54900_db`), `DB_USERNAME`, `DB_PASSWORD` — a conexão `default`, via `env()`  |
| `src/app/Config/Database.php`          | constantes `DB_HOSTNAME`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DRIVER` — os grupos de módulo (usadas por `buildGroup()`)                 |

Ao trocar usuário ou senha do MySQL, atualizar os três pontos acima (mais o
`MYSQL_*` do serviço `mysql`).

## Grupos por módulo

Fonte da verdade: o array `$modules` em `src/app/Config/Database.php`
(`'grupo' => 'nome_do_database'`). Hoje:

| Grupo    | Database              | Domínio                |
| -------- | --------------------- | ---------------------- |
| `mapa`   | `projeto54900_mapa`   | MAPA                   |
| `agenda` | `projeto54900_agenda` | AGENDA de compromissos |
| `chat`   | `projeto54900_chat`   | CHAT                   |

O construtor de `Database` percorre `$modules` e monta cada grupo com
`buildGroup()`; só o `database` muda entre eles. `$defaultGroup = 'default'`
(conexão `codeigniter54900_db`) — para acessar um módulo é obrigatório nomear o
grupo.

## Uso no código

```php
// Model
class CompromissoModel extends Model
{
    protected $DBGroup = 'agenda';
    protected $table   = 'compromissos';
}

// Query Builder avulso
$db = db_connect('chat');

// Migration / Seed  (sem grupo => default = codeigniter54900_db)
protected $DBGroup = 'mapa';   // módulo: + php spark migrate --group=mapa
```

Testes (PHPUnit) usam o grupo `tests` (SQLite em memória) — nunca os bancos de
módulo.

## Subir o ambiente (podman)

```
cd C:\laragon\www\php\habilidade\projeto54900
podman compose up -d --build
```

Serviços e portas no host: `nginx` 54900, `mysql` 54901, `adminer` 54902.
Scripts completos (parar, logs, limpeza, imagens offline) em `doc/podman.txt`.

Conferir a resolução do compose sem subir:

```
podman compose -f docker-compose.yml config
```

## Adicionar um novo módulo/banco

1. `src/app/Config/Database.php` → nova linha em `$modules`:
   `'relatorios' => 'projeto54900_relatorios',`
2. Mesmo arquivo → declarar `public array $relatorios = [];`
3. Criar o database no servidor:
   - **Volume MySQL novo:** acrescentar `CREATE DATABASE IF NOT EXISTS ...` e o
     `GRANT` em `docker/mysql/init.sql` (replicar o bloco dos módulos atuais).
   - **MySQL já inicializado:** o `init.sql` não roda de novo; executar os
     mesmos comandos à mão (Adminer em `:54902` ou `mysql` CLI).

O construtor preenche o grupo automaticamente; nada mais precisa mudar.

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
