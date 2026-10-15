const r=`[◄ Índice da base de conhecimento](../README.md)\r
\r
---\r
\r
# PHP Composer / vendor — proibido sem autorização explícita\r
\r
O usuário **nunca** autorizou o uso de PHP Composer neste projeto. Não há\r
exceção registrada para \`projeto54900\` até o momento.\r
\r
- PROIBIDO rodar \`composer install\`, \`composer require\`, \`composer update\`,\r
  \`composer create-project\` ou qualquer variante — mesmo que a tarefa pedida\r
  pareça exigir uma lib PHP externa (ex.: geração de token JWT).\r
- PROIBIDO criar, editar ou recriar a pasta \`vendor/\`.\r
- Se uma tarefa parecer exigir Composer/vendor, PARAR e avisar o usuário\r
  **antes mesmo de propor um plano** — nunca instalar "para funcionar" e\r
  avisar depois.\r
- TEXTO FIXO DO ALERTA — usar literalmente, sem parafrasear:\r
  > ⛔ ALERTA — esta tarefa parece exigir PHP Composer / pasta \`vendor/\`.\r
  > Não vou prosseguir (nem propor plano) sem sua autorização explícita\r
  > para este projeto.\r
- Preferir sempre a alternativa nativa do PHP quando existir. Exemplo real:\r
  \`app/Libraries/Auth/JwtService.php\` gera/valida JWT HS256 só com\r
  \`hash_hmac\` nativo, sem nenhuma biblioteca externa.\r
\r
**Origem**: em 2026-09-14, uma sessão anterior do Claude Code rodou\r
\`composer install\` e commitou/pushou (\`999d563\`) uma feature de JWT completa\r
usando \`firebase/php-jwt\` (vendor incluído) sem autorização. Foi revertido\r
(\`1a81939\`) e o trabalho não-relacionado a Composer restaurado com o JWT\r
reimplementado nativamente (\`f7f2605\`), a pedido do usuário. Regra tratada\r
como crítica e permanente — ver também \`CLAUDE.md\` na raiz de \`src/\` e o\r
\`CLAUDE.md\` global do usuário.\r
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
`;export{r as default};
