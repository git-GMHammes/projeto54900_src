[◄ Índice da base de conhecimento](../README.md)

---

# Conexão de bancos de dados — podman + docker-compose.yml

Como o `projeto54900` conecta aos bancos MySQL. Regras fixas:

- **Não existe conexão `default`.** Todo acesso nomeia o grupo.
- **Um grupo por módulo**, cada um apontando para um database próprio no mesmo
  servidor MySQL.
- **Sem `.env` / `env()`.** As credenciais são explícitas e ficam em **dois**
  arquivos que precisam bater entre si.

## Onde ficam as credenciais

| Arquivo                                | O que define                                                                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `docker-compose.yml` → serviço `mysql` | `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`                                                                          |
| `docker-compose.yml` → serviço `php`   | `DB_HOST` (`mysql`), `DB_PORT` (`3306`), `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`                                                             |
| `src/app/Config/Database.php`          | constantes `DB_HOSTNAME`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DRIVER` (usadas por `buildGroup()`)                                       |

Ao trocar usuário ou senha do MySQL, atualizar os três pontos acima.

## Grupos por módulo

Fonte da verdade: o array `$modules` em `src/app/Config/Database.php`
(`'grupo' => 'nome_do_database'`). Hoje:

| Grupo    | Database              | Domínio                |
| -------- | --------------------- | ---------------------- |
| `mapa`   | `projeto54900_mapa`   | MAPA                   |
| `agenda` | `projeto54900_agenda` | AGENDA de compromissos |
| `chat`   | `projeto54900_chat`   | CHAT                   |

O construtor de `Database` percorre `$modules` e monta cada grupo com
`buildGroup()`; só o `database` muda entre eles. `$defaultGroup = 'mapa'` existe
apenas por exigência do framework — nenhum código conecta sem informar o grupo.

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

// Migration / Seed
protected $DBGroup = 'mapa';   // + php spark migrate --group=mapa
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
