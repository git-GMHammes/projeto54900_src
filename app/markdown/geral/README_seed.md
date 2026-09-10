[◄ Índice da base de conhecimento](../README.md)

---

# Seeds — comandos diretos (CodeIgniter 4)

**Comando principal** — popular uma tabela a partir de uma classe de seed,
digitado no host (PowerShell, na raiz do projeto):

```

cd C:\laragon\www\js\habilidade\projeto54900
podman compose exec php php spark db:seed <NomeDaClasse>
 
```

Item a item:

| Trecho              | O que é                                                                              |
| ------------------- | ----------------------------------------------------------------------------------- |
| `podman compose`    | orquestrador de containers; lê o `docker-compose.yml` da pasta atual                |
| `exec`              | executa um comando **dentro do container que já está rodando**                       |
| `php` (1º)          | nome do **serviço** no `docker-compose.yml`                                          |
| `php` (2º)          | o **binário PHP 8.2** dentro do container (o host é 8.1)                             |
| `spark`             | CLI do CodeIgniter 4 — arquivo `spark` na raiz de `src/`, montado em `/var/www/html` |
| `db:seed`           | ação do `spark`: roda o `run()` da classe de seed informada                         |
| `<NomeDaClasse>`    | classe em `app/Database/Seeds/` (sem `.php`), ex.: `UserRolesSeeder`                 |

Mesmo prefixo do [`README_migrate.md`](README_migrate.md); muda só a ação final.
Todos os seeds atuais rodam na conexão `default` (`codeigniter54900_db`) —
nenhum declara `$DBGroup`.

> **Não existe** `App\Database\Seeds\DatabaseSeeder` neste projeto. Por isso
> `spark db:seed` **sem argumento** falha — sempre informe a classe. Para rodar
> tudo, execute os seeds um a um (ver "Rodar todos os seeds do sistema").

---

## Pré-requisitos (a partir do host)

Ambiente de pé, uma vez:

```
podman compose up -d --build
```

Confirmar que o `spark` responde:

```
podman compose exec php php spark list
```

Notas:

- `docker compose exec ...` é equivalente (troque `podman` por `docker`).
- Sem TTY (scripts/CI): `podman compose exec -T php php spark db:seed <Classe>`.
- Shell interativo no container: `podman compose exec php sh` e, lá dentro,
  `php spark db:seed <Classe>` sem o prefixo.

Nos exemplos abaixo, `SPARK` abrevia `podman compose exec php php spark`
(digitado no host).

---

## Seeds do sistema

Em `app/Database/Seeds/`. Três classes, todas idempotentes:

| Classe                  | Tabela(s) preenchida(s)                                | O que popula                                                                                 | Reexecução                                                                 |
| ----------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `UserRolesSeeder`       | `user_roles`                                          | 3 perfis de acesso: `admin`, `user`, `guest` (coluna `permissions` em JSON, placeholder)   | `INSERT ... ON DUPLICATE KEY UPDATE` pela `slug` (UNIQUE); não troca `id` |
| `BootstrapIconsSeeder`  | `bootstrap_icons`                                     | catálogo do Bootstrap Icons (`name` + `codepoint`); origem: `public/bootstrap-icons.json` versionado, com fallback jsDelivr 1.11.3 | `ON DUPLICATE KEY UPDATE` pela `name` (UNIQUE); **preserva** `is_favorite` |
| `FormConstructorSeeder` | `form_manager`, `form_groups`, `form_rows`, `form_fields` | a árvore do "Construtor de Formulários" (slug `form-constructor`): 4 grupos → linhas → campos, via os Processors do módulo Form | se o slug já existe, faz **delete-hard** (CASCADE) e recria do zero        |

### Rodar individualmente

Cada bloco é autossuficiente (entra na pasta e roda). Colar no host, no
PowerShell:

`UserRolesSeeder` — perfis `admin`, `user`, `guest` em `user_roles`:

```

cd C:\laragon\www\js\habilidade\projeto54900
podman compose exec php php spark db:seed UserRolesSeeder
 
```

`BootstrapIconsSeeder` — catálogo Bootstrap Icons em `bootstrap_icons`:

```
cd C:\laragon\www\js\habilidade\projeto54900
podman compose exec php php spark db:seed BootstrapIconsSeeder
 
```

`FormConstructorSeeder` — árvore do construtor em
`form_manager`/`form_groups`/`form_rows`/`form_fields`:

```
cd C:\laragon\www\js\habilidade\projeto54900
podman compose exec php php spark db:seed FormConstructorSeeder
 
```

---

## Rodar todos os seeds do sistema

Ordem recomendada (perfis → ícones → formulário; sem dependência rígida entre
eles hoje, mas o construtor usa o módulo Form já migrado). Bloco único, colar no
host:

```
cd C:\laragon\www\js\habilidade\projeto54900
podman compose exec php php spark db:seed UserRolesSeeder
podman compose exec php php spark db:seed BootstrapIconsSeeder
podman compose exec php php spark db:seed FormConstructorSeeder
```

Sem TTY (CI):

```
cd C:\laragon\www\js\habilidade\projeto54900
podman compose exec -T php php spark db:seed UserRolesSeeder
podman compose exec -T php php spark db:seed BootstrapIconsSeeder
podman compose exec -T php php spark db:seed FormConstructorSeeder
```

Pré-condição: as migrations já aplicadas (`SPARK migrate` — ver
[`README_migrate.md`](README_migrate.md)). Os três são idempotentes: repetir
não duplica dados.

### Opcional — criar um `DatabaseSeeder` agregador

Se quiser um único comando (`SPARK db:seed DatabaseSeeder`), criar
`app/Database/Seeds/DatabaseSeeder.php`:

```php
<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call('UserRolesSeeder');
        $this->call('BootstrapIconsSeeder');
        $this->call('FormConstructorSeeder');
    }
}
```

Enquanto esse arquivo não existir, use a lista de comandos acima.

---

## Tabelas sem seeder

Não têm dados de partida — nascem vazias e são preenchidas pela aplicação:

- `user_manager`, `user_profiles` — usuários reais do sistema.
- `upload_manager` — anexos, criados pelo endpoint de upload.
- `calendars`, `calendar_events`, `calendar_event_attendees`,
  `calendar_event_reminders`, `calendar_event_attachments`,
  `calendar_event_extended_properties` — dados do módulo agenda.

As views (`view_user_manager`, `view_upload_manager`, `view_form_manager`) são
criadas pelas **migrations**, não por seed.

---

## Criar um novo seed

```
SPARK make:seed NomeDoSeeder
```

Gera `app/Database/Seeds/NomeDoSeeder.php` com o esqueleto `run()`. Convenções
já adotadas nos seeders do projeto:

- Idempotência explícita (`INSERT ... ON DUPLICATE KEY UPDATE` numa coluna
  UNIQUE, ou delete-and-recreate quando há árvore com CASCADE).
- `binds` parametrizados no `$this->db->query($sql, $binds)` — nada concatenado.
- `echo` final com resumo do que foi processado.
- Se o seed for de um módulo com banco próprio, declarar
  `protected $DBGroup = 'agenda';` (ou obter a conexão pelo grupo no `run()`).
  Nenhum seed atual precisa disso — todos usam o `default`.

---

## Conferir o resultado

```
SPARK db:table user_roles          # lista as linhas da tabela
SPARK db:table bootstrap_icons
```

Ou pelo Adminer em `http://localhost:54902` (banco `codeigniter54900_db`).

---

[◄ Índice da base de conhecimento](../README.md)
