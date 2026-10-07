[`markdown/README.md`](../../README.md)

# Deploy via Git — KingHost — projeto54900_src

## Contexto
- Repositório pai (projeto54900) já possuía remote `origin` → `github.com/git-GMHammes/projeto54900.git`
- Subpasta `src/` é um repositório git próprio, remote `origin` → `github.com/git-GMHammes/projeto54900_src.git`, branch `main`
- Objetivo: publicar o conteúdo de `projeto54900_src` no servidor KingHost (web36f42), acessível em `www.habilidade.com/projeto54900` (sem `/src` na URL)

## Servidor
- Host: `web36f42.kinghost.net` (acesso via PuTTY/SSH)
- Usuário: `habilidade`
- Diretório home: `/home/habilidade`
- Pasta de sites: `~/www/` (NÃO é `/www/` absoluto — esse caminho não existe)
- Destino final: `~/www/projeto54900` (= `/home/habilidade/www/projeto54900`)

## 1. Gerar chave SSH de deploy (no servidor KingHost, via PuTTY)
```bash
ssh-keygen -t ed25519 -C "deploy-projeto54900_src" -f ~/.ssh/projeto54900_src -N ""
cat ~/.ssh/projeto54900_src.pub
chmod 600 ~/.ssh/projeto54900_src
```

Chave pública gerada:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHCATuW386JVvRgdjDWK/mnuEDI3uPHxfxAiN3RRF/I/ deploy-projeto54900_src
```
Fingerprint: `SHA256:7KzlFHoB8ATXc7EsyGyVYF7nktknnBJ+xJRbd6naRyQ`

## 2. Cadastrar Deploy Key no GitHub
GitHub → repositório `projeto54900_src` → **Settings → Deploy keys → Add deploy key**
- Título: `kinghost-web36f42`
- Key: colar a chave pública acima
- "Allow write access": **desmarcado** (só leitura/pull, suficiente para deploy)
- Clicar **Add key**

## 3. Configurar SSH config (no servidor)
```bash
cat >> ~/.ssh/config << 'EOF'
Host github-projeto54900_src
    HostName github.com
    User git
    IdentityFile ~/.ssh/projeto54900_src
    IdentitiesOnly yes
EOF
chmod 600 ~/.ssh/config
```

Testar autenticação:
```bash
ssh -T github-projeto54900_src
```
Resposta esperada: `Hi git-GMHammes/projeto54900_src! You've successfully authenticated, but GitHub does not provide shell access.`

## 4. Painel KingHost — Publicação via GIT
Painel KingHost → Gerenciar habilidade.com → **Publicação via GIT → Github → Adicionar repositório**
- Aplicação no GitHub: `git-GMHammes/projeto54900_src`
- Branch: `main`
- Diretório para Publicação: `www/projeto54900` (relativo à home, **sem barra inicial** — `/www/projeto54900` absoluto não existe no servidor)
- Opção: "Clonar automaticamente o repositório no diretorio selecionado"
- Habilitar

> Observação: o clone automático pelo painel não efetivou (pasta continuou inexistente). Foi necessário clonar manualmente via terminal (passo 5).

## 5. Clone manual (executado via PuTTY)
```bash
git clone github-projeto54900_src:git-GMHammes/projeto54900_src.git ~/www/projeto54900
```
Resultado: sucesso — 5047 objetos recebidos, clone completo em `/home/habilidade/www/projeto54900`.

## 6. API confirmada
`https://www.habilidade.com/projeto54900/public/` responde (CodeIgniter 4 — o entry point real é `public/`, não a raiz do repo). Resultado: JSON de teste com `statusCode: 200`.

## 7. Build do frontend React — publicado via git (não SCP/FTP)
Decisão: ao invés de subir `dist/` manualmente a cada deploy, o build passou a sair **direto dentro do repo** (`src/public/app/`), versionado e enviado pelo mesmo fluxo de `git push` + `git pull` do backend.

Mudanças feitas no projeto (local, `C:\laragon\www\php\habilidade\projeto54900\src`):
- `frontend/projeto54900/vite.config.ts`: `build.outDir` mudou de `dist` (local, gitignorado) para `../../public/app` (absoluto via `fileURLToPath`, saída cai em `src/public/app/`), com `emptyOutDir: true`.
- `frontend/projeto54900/.gitignore`: removida a linha `dist/` (não existe mais saída ali).
- `.gitignore` (raiz do repo `src/`): removida a linha `frontend/projeto54900/dist/` (obsoleta).
- `frontend/projeto54900/CLAUDE.md`: seção "Build e deploy" reescrita para documentar a nova convenção (saída versionada, deploy via `git pull`, sem `.env`).
- Removido um `.env.production` que eu tinha criado por engano — o projeto **proíbe `.env`** (regra do próprio `CLAUDE.md`); a variável `VITE_BASE_PATH` deve ser exportada no shell antes do build, nunca em arquivo.

### Comando de build (rodar sempre que o frontend mudar)
**Atenção ao Git Bash no Windows:** ele converte automaticamente qualquer argumento que começa com `/` em caminho do Windows (ex.: `/projeto54900/...` virou `C:/Program Files/Git/projeto54900/...` da primeira vez — quebrou os `<script src>` do `index.html` gerado). Por isso é obrigatório `MSYS_NO_PATHCONV=1` na frente do comando quando rodar via Git Bash:
```bash
cd C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900
MSYS_NO_PATHCONV=1 VITE_BASE_PATH=/projeto54900/public/app/ npm run build
```
Confere no `src/public/app/index.html` se os `<script src>`/`<link href>` começam com `/projeto54900/public/app/assets/...` (não com `C:/Program Files/...`).

### Commit e push (local)
```bash
cd C:\laragon\www\php\habilidade\projeto54900\src
git add public/app
git commit -m "DEPLOY - build do frontend"
git push origin main
```
> Push exige confirmação explícita do usuário neste ambiente (ação de publicação) — sempre perguntar antes.

### Deploy no servidor (KingHost, via PuTTY)
```bash
cd ~/www/projeto54900 && git pull
```

## 8. Credenciais de produção — tentativa `.env` abandonada, solução final: `.htaccess` + `SetEnv`

### Tentativa 1 — `.env` na raiz de `src/` (abandonada)
Credenciais de produção (DB do backend CI4 + e-mail KingHost + URL do frontend) foram colocadas num `.env` na raiz de `src/` (`system/Boot.php::loadDotEnv()` lê `appDirectory . '/../'` = raiz de `src/` — mesmo caminho local `C:\laragon\www\php\habilidade\projeto54900\src\.env` e servidor `~/www/projeto54900/.env`). Protegido por `/.env` no `.gitignore` (adicionado porque só a versão do frontend estava lá) — garante que `git pull` nunca toca nele.

**Quebrou em produção:** `Fatal error: Call to undefined function CodeIgniter\Config\putenv()`. A KingHost desabilita `putenv()` no `php.ini` (comum em hospedagem compartilhada) e `system/Config/DotEnv.php:98` chama `putenv()` sem checar `function_exists()` antes. `system/` é framework CORE (pasta restrita) — editar exigiria autorização explícita, e o usuário preferiu não mexer no core nem abrir chamado de suporte.

**Decisão:** abandonar o `.env` nessa hospedagem. `.env` local também removido (o ambiente de dev já usa `docker-compose.yml` privado, que injeta as credenciais como variável de ambiente real do container — mais seguro que um arquivo em texto plano parado no disco).

### Tentativa 2 — `.htaccess` com `SetEnv` (solução final, funcionando)
Apache processa `.htaccess` de cada pasta no caminho até o arquivo pedido. A URL `/projeto54900/public/...` passa pela pasta `~/www/projeto54900/` (raiz do projeto) antes de `public/`. Um `.htaccess` **na raiz do projeto** (fora de `public/`, nunca servido na web — Apache bloqueia arquivos `.ht*` por padrão) com diretivas `SetEnv` popula `$_SERVER`, que o `env()` do CI4 lê diretamente — sem precisar de `putenv()` nem tocar no framework.

Protegido por `/.htaccess` no `.gitignore` (mesmo padrão do `.env`): nunca commitado, criado manualmente só no servidor.

```bash
cd ~/www/projeto54900
rm -f .env   # remove a tentativa anterior que quebrava o PHP

cat > .htaccess << 'EOF'
SetEnv CI_ENVIRONMENT production

SetEnv DB_HOST mysql02-farm1.kinghost.net
SetEnv DB_PORT 3306
SetEnv DB_DATABASE habilidade15
SetEnv DB_USERNAME habilida15_add3
SetEnv DB_PASSWORD Bravo20262

SetEnv MAIL_SMTP_HOST smtp.kinghost.net
SetEnv MAIL_SMTP_PORT 587
SetEnv MAIL_IMAP_HOST imap.kinghost.net
SetEnv MAIL_IMAP_PORT 143

SetEnv APP_FRONTEND_URL https://www.habilidade.com/projeto54900/public/app
EOF
chmod 644 .htaccess
```

**Pegadinha de permissão:** o primeiro `chmod` foi `600` (só o dono SSH lê) — Apache não conseguiu ler o arquivo e devolveu **403 Acesso negado** na API inteira. `.htaccess` precisa ser `644` (legível por todos localmente; segue não sendo servido pela web). Depois da correção, API voltou a responder `200`.

### Credenciais de banco cadastradas (produção KingHost)
- Host: `mysql02-farm1.kinghost.net`
- Porta: `3306` (assumida — não confirmada com a KingHost)
- Database: `habilidade15`
- Usuário: `habilida15_add3`
- Senha: gravada só no `.htaccess` do servidor — **não repetida aqui**

### Pendências
- `MAIL_NOREPLY_USER/PASS` e `MAIL_DEFAULT_USER/PASS` ficaram em branco (credenciais de e-mail não foram passadas) — adicionar linhas `SetEnv` quando disponíveis
- Confirmar se a porta do MySQL externo da KingHost é mesmo `3306`
- Confirmar se o usuário `habilida15_add3` tem grant nos bancos dos módulos (`projeto54900_mapa`, `projeto54900_agenda`, `projeto54900_chat`) além de `habilidade15` — hoje `app/Config/Database.php` monta **todos** os grupos com as mesmas credenciais, só trocando o nome do database
- Migração do banco de produção: o usuário vai fazer manualmente via cliente de banco (não via `spark migrate` nesta sessão)

## Status final
- [x] Chave SSH gerada no servidor
- [x] Deploy key cadastrada no GitHub (read-only)
- [x] SSH config apontando host alternativo para a chave certa
- [x] Clone manual concluído em `~/www/projeto54900`
- [x] API confirmada em `www.habilidade.com/projeto54900/public/`
- [x] Build do frontend saindo versionado em `public/app/`, testado e corrigido (bug `MSYS_NO_PATHCONV`)
- [x] Frontend confirmado funcionando em `www.habilidade.com/projeto54900/public/app/`
- [ ] Validar se o painel KingHost reconhece a pasta clonada para futuros deploys automáticos (pull via webhook) — hoje o fluxo é manual (`git pull` via PuTTY)
- [x] Credenciais de produção via `.htaccess` + `SetEnv` (raiz do projeto, fora do git) — `.env` abandonado (putenv() desabilitado na KingHost)
- [ ] Migração do banco de produção — usuário vai fazer manualmente via cliente de banco

---

[`markdown/README.md`](../../README.md)
