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

## Status final
- [x] Chave SSH gerada no servidor
- [x] Deploy key cadastrada no GitHub (read-only)
- [x] SSH config apontando host alternativo para a chave certa
- [x] Clone manual concluído em `~/www/projeto54900`
- [ ] Validar se o painel KingHost reconhece a pasta clonada para futuros deploys automáticos (pull via webhook)
- [ ] Testar acesso via `www.habilidade.com/projeto54900`
