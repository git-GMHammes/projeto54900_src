[◄ Índice da base de conhecimento](../README.md)

---

# Atualização da base de conhecimento

Pasta: `src/app/markdown/`
Índice: `src/app/markdown/README.md`

Toda vez que um novo markdown for criado em `src/app/markdown/` (na raiz ou em
qualquer subpasta), o `README.md` do índice **precisa** ser atualizado na mesma
alteração.

## Passo a passo

1. **Criar o markdown** na subpasta adequada (ex.: `geral/`, ou uma nova pasta
   por tema). Nome no padrão `README_<assunto>.md`.
2. **Primeira e última linha do novo arquivo:** um link para o índice.
   - De um arquivo em subpasta de 1 nível: `[◄ Índice](../README.md)`.
   - Ajustar o número de `../` conforme a profundidade.
3. **Editar `src/app/markdown/README.md`:**
   1. **Índice** — acrescentar uma linha na tabela: palavra-chave curta
      (minúscula, sem acento, em crase) + frase de **exatamente 5 palavras**
      descrevendo o assunto.
   2. **Resumos** — adicionar um bloco `### \`palavra-chave\`` com um resumo de
      2 a 5 linhas.
   3. **Conteúdo** — adicionar o link para o novo arquivo, dentro do grupo da
      sua pasta (criar o subtítulo `### \`pasta/\`` se ainda não existir).
4. **Conferir os links** (caminhos relativos) antes de finalizar.

## Regras fixas

- O índice reflete **todos** os markdowns da base — nada fica de fora.
- Uma palavra-chave por arquivo; se um arquivo cobre vários assuntos, escolher
  o principal.
- Ordem do índice e dos resumos: a mesma (facilita a leitura).
- Não usar `.env` em nenhum exemplo desta base — o projeto não usa `.env`.

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
