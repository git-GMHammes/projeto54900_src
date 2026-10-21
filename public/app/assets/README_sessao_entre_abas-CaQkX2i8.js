const a=`[◄ Índice da base de conhecimento](../README.md)\r
\r
---\r
\r
# Sessão compartilhada entre abas e janelas\r
\r
O login vale para **todas as abas e janelas do mesmo navegador** (mesma origem): abrir uma janela nova, ou recarregar com F5, não pede login\r
de novo. Janela anônima, outro perfil do navegador ou outro endereço (\`localhost\` x \`127.0.0.1\`, outra porta) são sessões separadas e pedem login.\r
\r
## Como a sessão é guardada\r
\r
- \`access_token\`: só em memória de cada aba (\`useRef\` do \`AuthContext\`), nunca persistido.\r
- \`refresh_token\`: \`localStorage\` (\`projeto54900.refresh_token\`), compartilhado entre as abas.\r
- O servidor guarda **uma sessão por usuário**: cada refresh troca o par de tokens e invalida o \`access_token\` anterior.\r
\r
## O problema que isso causava (corrigido)\r
\r
Sem coordenação, cada aba nova girava o \`refresh_token\` e derrubava o \`access_token\` das outras, que giravam de volta: uma tempestade de\r
refresh e de respostas 401. Numa corrida ruim (várias janelas abrindo juntas) uma aba lia um token já gasto, o servidor recusava e a aba\r
**apagava o \`refresh_token\`** — o que derrubava a sessão de todas as janelas e pedia login.\r
\r
## Como funciona agora (\`context/AuthContext.tsx\`)\r
\r
| Mecanismo | O que faz |\r
| --------- | --------- |\r
| Canal entre abas (\`BroadcastChannel\` \`projeto54900.auth\`, mensagens só em memória) | \`ask\` (aba nova pergunta), \`session\` (quem tem sessão responde e quem renova avisa, com o \`access_token\` novo) e \`logout\` |\r
| Aba nova **adota** a sessão | Pergunta às outras abas; se alguma responde, usa o \`access_token\` dela e **não gira** o \`refresh_token\`. Só faz o refresh silencioso se ninguém responder em 400 ms |\r
| Quem renova **avisa** | Após login ou refresh, publica a sessão; as demais abas adotam em vez de girar de novo |\r
| Renovação espera a outra aba | Se o \`refresh_token\` salvo é mais novo que o desta aba (outra já girou), espera o aviso em vez de girar |\r
| Corrida no refresh | Se o servidor recusar e outra aba tiver gravado um token mais novo, tenta de novo com ele; só apaga o token se não houver outro |\r
| Logout | Apaga o token, encerra a sessão local e avisa as outras abas, que também encerram |\r
| Portão de sessão (\`setAuthGate\` em \`services/http.ts\`) | Chamadas à API esperam o refresh inicial terminar (teto de 10 s), em vez de sair sem token e levar 401 (menu, contadores) |\r
| Canal único por página | Não é fechado ao desmontar o Provider: o StrictMode (dev) monta duas vezes e fechar o canal descartava a resposta das outras abas |\r
\r
## Resposta perdida do refresh (janela de tolerância no servidor)\r
\r
O \`refresh_token\` é de uso único: cada troca devolve um par novo. Se a resposta se perde (F5, aba fechada ou navegação no meio da\r
chamada, queda de rede), o navegador volta com o token já trocado, o servidor o recusava e a sessão caía — **pedia login de novo**. Reproduzido:\r
recarregar a página ~1,5 s depois do login (quando o refresh pós-login ainda está em voo) derrubava a sessão.\r
\r
Correção no servidor (\`Services/V1/Auth/AuthService.php\`, colunas \`user_manager.token_prev\` e \`token_prev_until\`, migration\r
\`Database/Migrations/202610190200_user_refresh_grace.sql\`): cada troca guarda o token usado como **anterior** por 30 s, e o refresh\r
aceita o atual **ou** o anterior dentro da janela. Login, logout e troca de senha limpam o anterior (logout continua revogando tudo). Fora da\r
janela, token já trocado continua sendo recusado (401).\r
\r
## Conferência\r
\r
Chrome headless (puppeteer-core), login por tela, depois:\r
\r
- 6 abas abertas em sequência rápida: **0 chamadas de refresh e 0 respostas 401**; todas continuam logadas (antes: dezenas de 401 e, em\r
  corrida, perda do \`refresh_token\`).\r
- Janela nova, abas simultâneas, F5 na primeira aba: todas logadas.\r
- Janela anônima: pede login (esperado).\r
- Logout em uma aba: as outras vão para o login e o token some.\r
- Recarregar a página no meio do refresh pós-login: continua logado (antes: login pedido de novo). API: token trocado aceito dentro da\r
  janela (200), recusado depois dela (401), recusado após logout (401).\r
\r
## Limites conhecidos\r
\r
- Se **outro usuário** entrar por uma aba, as demais adotam essa sessão (o navegador tem um login só, como já era com o \`localStorage\`).\r
- Navegador sem \`BroadcastChannel\`: volta ao comportamento anterior (refresh por aba, com o bloqueio \`navigator.locks\`).\r
- O login faz um refresh logo em seguida (recarga da página): um giro por login.\r
\r
---\r
\r
[◄ Índice da base de conhecimento](../README.md)\r
\r
---\r
\r
### 📌 Metadados do Autor\r
\r
| Campo               | Informação                                                                                                                   |\r
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |\r
| **Nome**            | Gustavo Hammes                                                                                                               |\r
| **Local**           | Rio de Janeiro                                                                                                               |\r
| **LinkedIn**        | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes)                                                 |\r
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |\r
`;export{a as default};
