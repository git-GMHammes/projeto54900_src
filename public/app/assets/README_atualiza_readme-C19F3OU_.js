const a=`[◄ Índice da base de conhecimento](../README.md)\r
\r
---\r
\r
# Atualização da base de conhecimento\r
\r
Pasta: \`src/app/markdown/\`\r
Índice: \`src/app/markdown/README.md\`\r
\r
Toda vez que um novo markdown for criado em \`src/app/markdown/\` (na raiz ou em\r
qualquer subpasta), o \`README.md\` do índice **precisa** ser atualizado na mesma\r
alteração.\r
\r
## Passo a passo\r
\r
1. **Criar o markdown** na subpasta adequada (ex.: \`geral/\`, ou uma nova pasta\r
   por tema). Nome no padrão \`README_<assunto>.md\`.\r
2. **Primeira e última linha do novo arquivo:** um link para o índice.\r
   - De um arquivo em subpasta de 1 nível: \`[◄ Índice](../README.md)\`.\r
   - Ajustar o número de \`../\` conforme a profundidade.\r
3. **Editar \`src/app/markdown/README.md\`:**\r
   1. **Índice** — acrescentar uma linha na tabela: palavra-chave curta\r
      (minúscula, sem acento, em crase) + frase de **exatamente 5 palavras**\r
      descrevendo o assunto.\r
   2. **Resumos** — adicionar um bloco \`### \\\`palavra-chave\\\`\` com um resumo de\r
      2 a 5 linhas.\r
   3. **Conteúdo** — adicionar o link para o novo arquivo, dentro do grupo da\r
      sua pasta (criar o subtítulo \`### \\\`pasta/\\\`\` se ainda não existir).\r
4. **Conferir os links** (caminhos relativos) antes de finalizar.\r
\r
## Regras fixas\r
\r
- O índice reflete **todos** os markdowns da base — nada fica de fora.\r
- Uma palavra-chave por arquivo; se um arquivo cobre vários assuntos, escolher\r
  o principal.\r
- Ordem do índice e dos resumos: a mesma (facilita a leitura).\r
- Não usar \`.env\` em nenhum exemplo desta base — o projeto não usa \`.env\`.\r
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
