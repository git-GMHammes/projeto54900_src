# Base de conhecimento — projeto54900

Índice geral da base de conhecimento (`src/app/markdown/`). Cada tópico tem uma
palavra-chave e uma frase de 5 palavras. A palavra-chave no índice é âncora para
o resumo correspondente; cada resumo termina com o link para o conteúdo completo.

> Regra: sempre que um novo markdown for criado em `src/app/markdown/` (qualquer
> subpasta), este arquivo deve ser atualizado — nova entrada no índice, novo
> bloco de resumo e novo link. Procedimento em
> [`geral/README_atualiza_readme.md`](geral/README_atualiza_readme.md).

---

## Índice

| Palavra-chave                 | Assunto (5 palavras)                    |
| ----------------------------- | -------------------------------------- |
| [`atualizacao`](#atualizacao) | Registrar novo markdown neste índice    |
| [`conexao`](#conexao)         | Conexão de banco por módulo             |
| [`migracao`](#migracao)       | Rodar e reverter migrations CodeIgniter |
| [`modulo`](#modulo)           | Como criar novos módulos padronizados   |

---

## Resumos

### `atualizacao`

Como manter esta base viva. Todo markdown novo em `src/app/markdown/` exige
atualizar `README.md`: acrescentar a linha no índice (palavra-chave + frase de
5 palavras), escrever o bloco de resumo e adicionar o link para o conteúdo
completo ao fim do próprio resumo. Todo markdown da base começa e termina com um
link para este `README.md`.

[`geral/README_atualiza_readme.md`](geral/README_atualiza_readme.md) — atualização desta base de conhecimento.

### `conexao`

Como o sistema conecta aos bancos usando podman e o `docker-compose.yml`. Há a
conexão `default` (banco `codeigniter54900_db`, credenciais `DB_*` via `env()`)
e um grupo nomeado por módulo (`mapa`, `agenda`, `chat`, constantes `DB_*` da
classe). Sem arquivo `.env`. Inclui como subir os containers e como adicionar um
novo módulo/banco.

[`geral/README_conecta_banco_enviroments.md`](geral/README_conecta_banco_enviroments.md) — conexão de bancos com podman e `docker-compose.yml`.

### `migracao`

Comandos diretos do `spark` para criar, aplicar e reverter migrations, digitados
no host com `podman compose exec php php spark ...` (o container tem PHP 8.2).
`migrate` sem `-g` roda na conexão `default` (`codeigniter54900_db`);
`-g mapa|agenda|chat` para os módulos. Cobre `make:migration`, `migrate:status`,
`rollback`, `migrate:refresh` (destrutivo), seeds e o fluxo de montar o banco do
zero. Alerta: as migrations atuais não declaram `$DBGroup`.

[`geral/README_migrate.md`](geral/README_migrate.md) — comandos de migration do CodeIgniter por módulo.

### `modulo`

Padrão **obrigatório** para todo módulo novo da API V1: Routes + Controller +
Request + Processor/Service + Model + Migration, com classes base e SOLID. Fixa
a árvore de arquivos, o contrato de rotas (18 de tabela + 10 de view), o
envelope de resposta e o mapa tipo-de-coluna → regra de validação. Traz o
checklist para criar um módulo do zero e as pendências em aberto (ex.:
`DB_GROUP_001` aponta para grupo inexistente).

[`geral/ROADMAP_padrao_modulo.md`](geral/ROADMAP_padrao_modulo.md) — padrão obrigatório de módulo da API V1.
