# Base de conhecimento — projeto54900

Índice geral da base de conhecimento (`src/app/markdown/`). Cada tópico tem uma
palavra-chave e uma frase de 5 palavras. Os resumos e os links para o conteúdo
completo estão logo abaixo.

> Regra: sempre que um novo markdown for criado em `src/app/markdown/` (qualquer
> subpasta), este arquivo deve ser atualizado — nova entrada no índice, novo
> bloco de resumo e novo link. Procedimento em
> [`geral/README_atualiza_readme.md`](geral/README_atualiza_readme.md).

---

## Índice

| Palavra-chave | Assunto (5 palavras)                 |
| ------------- | ------------------------------------ |
| `atualizacao` | Registrar novo markdown neste índice |
| `conexao`     | Conexão de banco por módulo          |

---

## Resumos

### `atualizacao`

Como manter esta base viva. Todo markdown novo em `src/app/markdown/` exige
atualizar `README.md`: acrescentar a linha no índice (palavra-chave + frase de
5 palavras), escrever o bloco de resumo e adicionar o link na seção "Conteúdo".
Todo markdown da base começa e termina com um link para este `README.md`.

### `conexao`

Como o sistema conecta aos bancos usando podman e o `docker-compose.yml`. O
projeto não usa a conexão `default`: há um grupo por módulo (`mapa`, `agenda`,
`chat`), com credenciais explícitas em `docker-compose.yml` (serviço `php`) e em
`app/Config/Database.php` (constantes `DB_*`). Nunca `.env`. Inclui como subir
os containers e como adicionar um novo módulo/banco.

---

## Conteúdo

### `geral/`

- [`README_atualiza_readme.md`](geral/README_atualiza_readme.md) — atualização desta base de conhecimento.
- [`README_conecta_banco_enviroments.md`](geral/README_conecta_banco_enviroments.md) — conexão de bancos com podman e `docker-compose.yml`.
