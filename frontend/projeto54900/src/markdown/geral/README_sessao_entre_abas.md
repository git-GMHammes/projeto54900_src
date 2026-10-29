[◄ Índice da base de conhecimento](../README.md)

---

# Sessão compartilhada entre abas e janelas

> NÃO EXISTE ALTERAÇÃO de MIGRATE: apenas no fim de cada ciclo um novo, para a renovação de todo o sistema.

O login vale para **todas as abas e janelas do mesmo navegador** (mesma origem): abrir uma janela nova, ou recarregar com F5, não pede login
de novo. Janela anônima, outro perfil do navegador ou outro endereço (`localhost` x `127.0.0.1`, outra porta) são sessões separadas e pedem login.

## Como a sessão é guardada

- `access_token`: só em memória de cada aba (`useRef` do `AuthContext`), nunca persistido.
- `refresh_token`: `localStorage` (`projeto54900.refresh_token`), compartilhado entre as abas.
- O servidor guarda **uma sessão por usuário**: cada refresh troca o par de tokens e invalida o `access_token` anterior.

## O problema que isso causava (corrigido)

Sem coordenação, cada aba nova girava o `refresh_token` e derrubava o `access_token` das outras, que giravam de volta: uma tempestade de
refresh e de respostas 401. Numa corrida ruim (várias janelas abrindo juntas) uma aba lia um token já gasto, o servidor recusava e a aba
**apagava o `refresh_token`** — o que derrubava a sessão de todas as janelas e pedia login.

## Como funciona agora (`context/AuthContext.tsx`)

| Mecanismo | O que faz |
| --------- | --------- |
| Canal entre abas (`BroadcastChannel` `projeto54900.auth`, mensagens só em memória) | `ask` (aba nova pergunta), `session` (quem tem sessão responde e quem renova avisa, com o `access_token` novo) e `logout` |
| Aba nova **adota** a sessão | Pergunta às outras abas; se alguma responde, usa o `access_token` dela e **não gira** o `refresh_token`. Só faz o refresh silencioso se ninguém responder em 400 ms |
| Quem renova **avisa** | Após login ou refresh, publica a sessão; as demais abas adotam em vez de girar de novo |
| Renovação espera a outra aba | Se o `refresh_token` salvo é mais novo que o desta aba (outra já girou), espera o aviso em vez de girar |
| Corrida no refresh | Se o servidor recusar e outra aba tiver gravado um token mais novo, tenta de novo com ele; só apaga o token se não houver outro |
| Logout | Apaga o token, encerra a sessão local e avisa as outras abas, que também encerram |
| Portão de sessão (`setAuthGate` em `services/http.ts`) | Chamadas à API esperam o refresh inicial terminar (teto de 10 s), em vez de sair sem token e levar 401 (menu, contadores) |
| Canal único por página | Não é fechado ao desmontar o Provider: o StrictMode (dev) monta duas vezes e fechar o canal descartava a resposta das outras abas |

## Resposta perdida do refresh (janela de tolerância no servidor)

O `refresh_token` é de uso único: cada troca devolve um par novo. Se a resposta se perde (F5, aba fechada ou navegação no meio da
chamada, queda de rede), o navegador volta com o token já trocado, o servidor o recusava e a sessão caía — **pedia login de novo**. Reproduzido:
recarregar a página ~1,5 s depois do login (quando o refresh pós-login ainda está em voo) derrubava a sessão.

Correção no servidor (`Services/V1/Auth/AuthService.php`, colunas `user_manager.token_prev` e `token_prev_until`, migration
`Database/Migrations/202610190200_user_refresh_grace.sql`): cada troca guarda o token usado como **anterior** por 30 s, e o refresh
aceita o atual **ou** o anterior dentro da janela. Login, logout e troca de senha limpam o anterior (logout continua revogando tudo). Fora da
janela, token já trocado continua sendo recusado (401).

## Conferência

Chrome headless (puppeteer-core), login por tela, depois:

- 6 abas abertas em sequência rápida: **0 chamadas de refresh e 0 respostas 401**; todas continuam logadas (antes: dezenas de 401 e, em
  corrida, perda do `refresh_token`).
- Janela nova, abas simultâneas, F5 na primeira aba: todas logadas.
- Janela anônima: pede login (esperado).
- Logout em uma aba: as outras vão para o login e o token some.
- Recarregar a página no meio do refresh pós-login: continua logado (antes: login pedido de novo). API: token trocado aceito dentro da
  janela (200), recusado depois dela (401), recusado após logout (401).

## Limites conhecidos

- Se **outro usuário** entrar por uma aba, as demais adotam essa sessão (o navegador tem um login só, como já era com o `localStorage`).
- Navegador sem `BroadcastChannel`: volta ao comportamento anterior (refresh por aba, com o bloqueio `navigator.locks`).
- O login faz um refresh logo em seguida (recarga da página): um giro por login.

---

[◄ Índice da base de conhecimento](../README.md)

---

### 📌 Metadados do Autor

| Campo               | Informação                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Nome**            | Gustavo Hammes                                                                                                               |
| **Local**           | Rio de Janeiro                                                                                                               |
| **LinkedIn**        | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes)                                                 |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
