[◄ Índice da base de conhecimento](../README.md)

---

# Ambiente Docker — projeto54900

Documentação do ambiente Docker/Podman do projeto: serviços, pastas necessárias e passo a passo para levantar tudo do zero.

## Antes de começar

⚠️ **`docker-compose.yml` (sem sufixo) contém credenciais reais e não deve ser usado como base para exposição pública.**
O arquivo de referência público é `docker-compose-example.yml`, sem nenhuma senha, token ou chave real — apenas placeholders nas posições corretas.

**Passo obrigatório para novo desenvolvedor/ambiente:**

1. Copiar/renomear `docker-compose-example.yml` para `docker-compose.yml` (na raiz do projeto).
2. Substituir todos os placeholders (`SUA_SENHA_ROOT_AQUI`, `SUA_SENHA_USER_AQUI`, etc.) por credenciais próprias, fortes e únicas.
3. **Nunca commitar** o `docker-compose.yml` preenchido com credenciais reais. Se for versionar, adicionar `docker-compose.yml` ao `.gitignore` e manter apenas o `-example.yml` no repositório.

## Serviços definidos no compose

| Serviço   | Container                  | Porta host → container        | Função                                                                   |
| --------- | -------------------------- | ----------------------------- | ------------------------------------------------------------------------ |
| `mysql`   | `codeigniter54900_mysql`   | `54901:3306`                  | Banco de dados MySQL 8.0                                                 |
| `adminer` | `codeigniter54900_adminer` | `54902:8080`                  | UI web de administração do MySQL                                         |
| `php`     | `codeigniter54900_php`     | (interno, `9000` via fastcgi) | PHP-FPM 8.2 rodando o backend CodeIgniter 4                              |
| `node`    | `codeigniter54900_node`    | (interno, `3000`)             | Servidor WebSocket (broadcast interno), exposto via proxy nginx em `/ws` |
| `nginx`   | `codeigniter54900_nginx`   | `54900:80`                    | Reverse proxy: serve `/`, `/api`, `/ws` e roteia para php/node           |

Rede interna: `codeigniter54900_net` (bridge). Volume nomeado: `mysql_data` (persistência do MySQL).

## Pastas necessárias para o build

```
projeto54900/
├── docker-compose.yml            (criado a partir do -example, com credenciais reais — NÃO versionar)
├── docker-compose-example.yml    (versionado, sem credenciais)
├── docker/
│   ├── php/
│   │   └── Dockerfile            (PHP 8.2-fpm + extensões pdo_mysql, mysqli, mbstring, zip, intl)
│   ├── mysql/
│   │   └── init.sql              (cria bancos por módulo: projeto54900_mapa, _agenda, _chat + grants)
│   ├── node/
│   │   ├── Dockerfile            (node:20-alpine)
│   │   ├── server.js             (servidor WebSocket + endpoint /internal/broadcast)
│   │   └── package.json
│   └── nginx/
│       └── default.conf          (proxy /ws → node:3000, /api e .php → php:9000, estáticos e SPA fallback)
└── src/                          (código da aplicação, montado em /var/www/html nos containers php e nginx)
```

Todas essas pastas/arquivos são referenciados diretamente pelo `docker-compose.yml` (contexto de build ou volume) — se algum faltar, o build ou o `up` falha.

## Bancos de dados

- `codeigniter54900_db` — banco padrão (conexão `default` do CI4), criado automaticamente pela imagem MySQL via `MYSQL_DATABASE`, migrations sem `--group`.
- `projeto54900_mapa`, `projeto54900_agenda`, `projeto54900_chat` — bancos por módulo, criados pelo `docker/mysql/init.sql`, com grants para `codeigniter54900_user`.

Para adicionar um novo módulo: replicar `CREATE DATABASE` + `GRANT` no `init.sql` e registrar o módulo em `src/app/Config/Database.php`.

## Passo a passo — subir o ambiente

```bash
# 1. Copiar o example e preencher credenciais
cp docker-compose-example.yml docker-compose.yml
# editar docker-compose.yml e substituir os placeholders

# 2. Subir a stack completa
podman compose up -d --build
# (ou, para não construir o serviço node de WebSocket)
podman compose up -d mysql adminer php nginx

# 3. Acessar
# App:      http://localhost:54900
# Adminer:  http://localhost:54902
# WS:       ws://localhost:54900/ws (via proxy nginx)
```

O projeto **não usa `.env`** — toda configuração de ambiente fica explícita em `docker-compose.yml` e `src/app/Config/*.php` (ver `.gitignore` na raiz, que bloqueia `.env*`).

## Frontend (fora do compose)

O frontend (`src/frontend/projeto54900`) roda separado, localmente, sem container:

```bash
cd src/frontend/projeto54900/
npm run dev
```

O `wsUrl` default do frontend é `/ws` (ver `src/config/env.ts`), compatível com o proxy do nginx quando o backend está de pé via compose.

Detalhes de conexão de banco por módulo, grupos do CodeIgniter e como adicionar um novo módulo/banco: ver [`README_conecta_banco_enviroments.md`](README_conecta_banco_enviroments.md).

---

[◄ Índice da base de conhecimento](../README.md)
