const a=`[◄ Índice da base de conhecimento](../README.md)\r
\r
---\r
\r
# Atualização da base de conhecimento\r
\r
Pasta: \`src/frontend/projeto54900/src/markdown/\`\r
Índice: \`src/frontend/projeto54900/src/markdown/README.md\`\r
\r
Esta base tem a mesma função da base do backend (\`src/app/markdown/\`), mas o\r
conteúdo aqui **alimenta o [\`CLAUDE.md\`](../../../CLAUDE.md) do frontend**. Toda vez\r
que um novo markdown for criado em \`src/markdown/\` (na raiz ou em qualquer\r
subpasta), o \`README.md\` do índice **precisa** ser atualizado na mesma alteração.\r
\r
## Passo a passo\r
\r
1. **Criar o markdown** na subpasta adequada (ex.: \`geral/\`, ou uma nova pasta\r
   por tema). Nome no padrão \`README_<assunto>.md\` (ou \`ROADMAP_<assunto>.md\`\r
   para planos/roteiros).\r
2. **Primeira e última linha do novo arquivo:** um link para o índice.\r
   - De um arquivo em subpasta de 1 nível: \`[◄ Índice da base de conhecimento](../README.md)\`.\r
   - Ajustar o número de \`../\` conforme a profundidade.\r
3. **Editar \`src/markdown/README.md\`:**\r
   1. **Índice** — acrescentar uma linha na tabela: palavra-chave curta\r
      (minúscula, sem acento, em crase) + frase de **exatamente 5 palavras**\r
      descrevendo o assunto.\r
   2. **Resumos** — adicionar um bloco \`### \\\`palavra-chave\\\`\` com um resumo de\r
      2 a 5 linhas, terminando com o link para o conteúdo completo.\r
   3. **Conteúdo** — adicionar o link para o novo arquivo, dentro do grupo da\r
      sua pasta (criar o subtítulo \`### \\\`pasta/\\\`\` se ainda não existir).\r
4. **Conferir os links** (caminhos relativos) antes de finalizar.\r
5. **Refletir no \`CLAUDE.md\` do frontend** quando o novo tópico mudar uma\r
   convenção ou fluxo de trabalho — a seção "Base de conhecimento" do\r
   \`CLAUDE.md\` aponta para este índice; tópicos que viram regra entram lá também.\r
\r
## Regras fixas\r
\r
- O índice reflete **todos** os markdowns da base — nada fica de fora.\r
- Uma palavra-chave por arquivo; se um arquivo cobre vários assuntos, escolher\r
  o principal.\r
- Ordem do índice e dos resumos: a mesma (facilita a leitura).\r
- Idioma: português do Brasil, direto e técnico, sem emojis (regra global).\r
- Não documentar credenciais nem colar segredos em exemplos (regra global).\r
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
