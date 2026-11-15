[◄ Índice](../README.md)

---

# Containers não sobem: "rootlessport listen tcp4 0.0.0.0:54901: bind: address already in use"

Pasta: `src/app/markdown/geral/`

## Sintoma

No Podman Desktop (ou `podman start`), os containers do `projeto54900` ficam em
`ERROR`/`STARTING` com:

- `rootlessport listen tcp4 0.0.0.0:54901: bind: address already in use` (mysql, adminer, nginx), e
- `starting some containers: internal libpod error` (demais containers do grupo).

Reiniciar a VM (`podman machine stop/start`, `wsl --shutdown`) não resolve.
Rebuild das imagens e reinstalação **não** são necessários.

## Causa (diagnosticada em 2026-11-15)

Não há processo usando a porta: `Get-NetTCPConnection`, `netstat` e `ss` dentro
da VM não mostram listener. O Windows **reservou** a faixa (exclusão dinâmica do
Hyper-V/WinNAT, recriada após reinício ou atualização), cobrindo as portas do
projeto:

```
netsh interface ipv4 show excludedportrange protocol=tcp
    54877   54976     <- inclui 54900, 54901, 54902
    54977   55076
```

Portas fora da faixa (ex.: `55100`) continuam funcionando.

Diferente de [`README_podman_vite_porta_bloqueada.md`](README_podman_vite_porta_bloqueada.md):
lá a faixa é oculta (WSL mirrored) e não aparece no `netsh`; aqui ela **aparece**
no `netsh` e a correção é reservá-la de forma administrada.

## Como confirmar

```powershell
netsh interface ipv4 show excludedportrange protocol=tcp
```

Se alguma faixa sem `*` cobrir `54900–54902`, é este caso.

## Solução (validada em 2026-11-15)

PowerShell **como Administrador**, colando só os comandos (sem o prefixo
`PS C:\...>`):

```powershell
net stop winnat
netsh int ipv4 add excludedportrange protocol=tcp startport=54900 numberofports=3
net start winnat
```

O 2º comando cria uma exclusão **administrada** (marcada com `*`), que
sobrevive a reinícios e impede o Windows de reservar essas portas dinamicamente.
Depois:

```powershell
podman machine stop
podman machine start
podman start codeigniter54900_mysql codeigniter54900_adminer codeigniter54900_php codeigniter54900_node codeigniter54900_nginx
```

(ou Start no grupo `projeto54900` no Podman Desktop). Resultado esperado: os 5
containers em `Up`.

Estado final validado:

```
50000  50059  *
54900  54902  *      <- projeto54900 (nginx 54900, mysql 54901, adminer 54902)
55100  55102  *      <- projeto55100
```

## Observações

- Sem acesso de administrador: `net stop winnat` falha com "Acesso negado"
  (erro de sistema 5). Abrir o PowerShell com "Executar como administrador".
- Se `net stop winnat` for executado antes da reserva e a faixa voltar a ser
  tomada por outro intervalo dinâmico, repetir os três comandos.
- Para outro projeto com porta bloqueada, reservar a faixa dele da mesma forma
  (`startport` = primeira porta, `numberofports` = quantidade).
- Reiniciar o Windows também limpa as faixas dinâmicas, mas elas podem voltar;
  a reserva administrada é a correção definitiva.
- "Exited ... 292 years ago" no `podman ps` é só relógio inconsistente da VM; some
  após reiniciar a VM e não indica erro do projeto.
