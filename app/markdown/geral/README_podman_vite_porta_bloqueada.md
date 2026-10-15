[◄ Índice](../README.md)

---

# Vite não sobe: "Port 54910 is already in use" (Podman + WSL mirrored)

Pasta: `src/app/markdown/geral/`

## Sintoma

`npm run dev` (Vite, porta fixa `54910`, `strictPort: true`) falha com
`Error: Port 54910 is already in use`, e o navegador em `http://localhost:54910`
dá `ERR_CONNECTION_TIMED_OUT`. Ao mesmo tempo os containers do Podman estão no ar.

## Causa (diagnosticada em 2026-10-14)

Não é outro processo. `netstat` e `Get-NetTCPConnection` não mostram ninguém na
porta, e o container `node` só roda o WebSocket (porta interna `3000`), não o Vite.

O `~/.wslconfig` usa `networkingMode=mirrored`. Com a máquina Podman (WSL) no ar,
o Windows passa a **recusar o bind de qualquer porta** na faixa `52810–56905`
(inclui `54000`, `54910`, `55000`). A reserva é oculta: não aparece em
`netsh int ipv4 show excludedportrange protocol=tcp`. Com o WSL desligado a
mesma porta abre normalmente. Não foi apurado por que a faixa passou a cair em
cima da `54910` (provável: reserva dinâmica do Windows/Hyper-V mudou após
reinício ou atualização do WSL).

Os containers não são afetados (`54900`, `54901`, `54902` são publicados de
dentro do WSL) e **não precisam de rebuild**.

## Como confirmar

```powershell
# bind na porta do Vite (falha = faixa bloqueada)
$l=[Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback,54910); $l.Start(); $l.Stop()
# porta fora da faixa para comparar (deve abrir)
$l=[Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback,60000); $l.Start(); $l.Stop()
```

## Solução (validada)

O Vite precisa pegar a `54910` **antes** de o Podman subir. Ordem exata:

1. `wsl --shutdown` — derruba a máquina Podman e **todos** os containers.
2. `npm run dev` (na raiz do projeto) — o Vite ocupa a `54910`.
3. `podman machine start` e depois `podman compose up -d`.

Com isso o Vite mantém a porta e a stack sobe normalmente.

## Se voltar a acontecer

- Repetir a ordem acima.
- Alternativa só do projeto: `VITE_DEV_PORT` com uma porta fora da faixa
  (ex.: `60910`), exportada no shell (o projeto não usa `.env`), e ajustar
  `APP_FRONTEND_URL` no `docker-compose.yml` (serviço `php`).
- Alternativa global (mexe em todos os projetos com WSL): `networkingMode=nat`
  no `.wslconfig`.
- `net stop winnat; net start winnat` exige PowerShell como administrador; não
  foi testado como correção.

---

[◄ Índice](../README.md)
