[◄ Índice da base de conhecimento](../README.md)

---

# Atualização da base de conhecimento

Pasta: `src/frontend/projeto54900/src/markdown/`
Índice: `src/frontend/projeto54900/src/markdown/README.md`

Esta base tem a mesma função da base do backend (`src/app/markdown/`), mas o
conteúdo aqui **alimenta o [`CLAUDE.md`](../../../CLAUDE.md) do frontend**. Toda vez
que um novo markdown for criado em `src/markdown/` (na raiz ou em qualquer
subpasta), o `README.md` do índice **precisa** ser atualizado na mesma alteração.

## Passo a passo

1. **Criar o markdown** na subpasta adequada (ex.: `geral/`, ou uma nova pasta
   por tema). Nome no padrão `README_<assunto>.md` (ou `ROADMAP_<assunto>.md`
   para planos/roteiros).
2. **Primeira e última linha do novo arquivo:** um link para o índice.
   - De um arquivo em subpasta de 1 nível: `[◄ Índice da base de conhecimento](../README.md)`.
   - Ajustar o número de `../` conforme a profundidade.
3. **Editar `src/markdown/README.md`:**
   1. **Índice** — acrescentar uma linha na tabela: palavra-chave curta
      (minúscula, sem acento, em crase) + frase de **exatamente 5 palavras**
      descrevendo o assunto.
   2. **Resumos** — adicionar um bloco `### \`palavra-chave\`` com um resumo de
      2 a 5 linhas, terminando com o link para o conteúdo completo.
   3. **Conteúdo** — adicionar o link para o novo arquivo, dentro do grupo da
      sua pasta (criar o subtítulo `### \`pasta/\`` se ainda não existir).
4. **Conferir os links** (caminhos relativos) antes de finalizar.
5. **Refletir no `CLAUDE.md` do frontend** quando o novo tópico mudar uma
   convenção ou fluxo de trabalho — a seção "Base de conhecimento" do
   `CLAUDE.md` aponta para este índice; tópicos que viram regra entram lá também.

## Regras fixas

- O índice reflete **todos** os markdowns da base — nada fica de fora.
- Uma palavra-chave por arquivo; se um arquivo cobre vários assuntos, escolher
  o principal.
- Ordem do índice e dos resumos: a mesma (facilita a leitura).
- Idioma: português do Brasil, direto e técnico, sem emojis (regra global).
- Não documentar credenciais nem colar segredos em exemplos (regra global).

---

[◄ Índice da base de conhecimento](../README.md)
