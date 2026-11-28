[◄ Índice da base de conhecimento](../README.md)

---

# Pod Podman (Cube Play) — projeto54900

O ambiente sobe como **pod** com `podman play kube`. Arquivo: `projeto54900.yaml` (raiz). Modelo sem dados sensíveis: `projeto54900-example.yml`. O docker-compose foi removido do projeto.

## Conteúdo
- Pod `projeto54900`: mysql, adminer, php (PHP-FPM), node (WebSocket) e nginx. Todos compartilham a rede; `mysql`, `php` e `node` respondem em 127.0.0.1 (`hostAliases`).
- Portas (iguais ao compose): nginx **54900**, MySQL **54901**, adminer **54902**. O node não expõe porta (o nginx faz proxy de `/ws`).
- Banco `codeigniter54900_db`, usuário `codeigniter54900_user`; bancos de módulo `projeto54900_mapa`, `_agenda` e `_chat` criados por `podman/mysql/init/01_modulos.sh` (só com o volume vazio).
- nginx: `podman/nginx/default.conf` (sem o `resolver` do Docker).

## Ambiente sem `.env`
Sem `.env` e sem segredo no código. O initContainer `credenciais` sorteia, só se ainda não existirem, `MYSQL_ROOT_PASSWORD`, `MYSQL_PASSWORD` (= `DB_PASSWORD`) e `JWT_SECRET`, em volumes (`projeto54900-credenciais-mysql` e `-php`). O `command` de mysql e php exporta cada arquivo montado em `/run/projeto54900` como variável de ambiente e inicia o serviço. O `env()` do CodeIgniter lê dessas variáveis (`clear_env = no` no PHP-FPM). Valores não secretos (`DB_HOST`, `DB_DATABASE`, `MAIL_SMTP_*`, `APP_FRONTEND_URL`…) ficam em `env:` no yaml.

Segredos externos — `MAIL_NOREPLY_USER/PASS`, `MAIL_DEFAULT_USER/PASS`, `ORS_API_KEY`, `WHATSAPP_TOKEN` — são criados **vazios** e preenchidos uma vez, direto no volume `projeto54900-credenciais-php` (um arquivo por chave, uma linha). Não copiar valores para o yaml.

## Subir
1. `podman build -t projeto54900-php:latest podman/php`
2. `podman build -t projeto54900-node:latest podman/node`
3. `podman play kube projeto54900.yaml`
4. Derrubar: `podman play kube --down projeto54900.yaml` (os volumes permanecem).

Imagens: Dockerfiles em `podman/php` e `podman/node`.

## Observações
- O volume do MySQL é novo (`projeto54900-mysql-data`): o banco nasce vazio; migrate/seed só com permissão expressa (ver CLAUDE.md do projeto).
- Conexão pelo Windows: host 127.0.0.1, porta 54901, usuário/senha nos arquivos do volume `projeto54900-credenciais-mysql`.
- Código vem de `src/` montado em `/var/www/html`; `writable/` fica dentro de `src/`.
- Não há overrides nem bancos de outros projetos: o pod contém só o que o CodeIgniter 4 do projeto54900 usa.
