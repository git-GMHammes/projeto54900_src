[◄ Índice da base de conhecimento](../../../README.md)

---

# Edição de Metadados de Upload — `atualizar-upload`

Mesmo modelo de [`form/modelo_ia/form.md`](../modelo_ia/form.md): árvore revisada
aqui antes do `INSERT` (não migration, não seed — ver aviso em
[`README_modulo_form.md`](../../README_modulo_form.md)).

## ⚠️ Não é formulário de criação — leia antes

`uploads` **não é candidata a um formulário de criação** como os anteriores.
Dois motivos, confirmados no schema real e em `README_modulo_upload.md`:

1. `form_fields.field_type` tem 22 tipos (`text`, `password`, `email`,
   `textarea`, `senha`, `select`, `radio`, `checkbox`, `cpf`, `cnpj`, `phone`,
   `cep`, `data`, `hora`, `moeda`, `pis`, `placa`, `titulo`, `cnh`,
   `processo`, `renavam`, `sei`) — **nenhum é arquivo**. O `FormGrid` não tem
   como anexar um binário.
2. A maioria das colunas de `uploads` (`file_key`, `original_name`,
   `stored_name`, `storage_path`, `file_url`, `mime_type`, `extension`,
   `file_size`, `checksum_sha256`, `module`, `reference_id`) é **gerada pelo
   próprio serviço de upload** no envio multipart (`EndpointUpload.php`) —
   não é digitada por ninguém, então não faz sentido como campo de form.

**Escopo deste doc:** só a edição dos metadados **depois** que o arquivo já
foi enviado por outro caminho (upload multipart, fora do módulo Form) —
`title`, `description`, `category`, `status`. Mesmo padrão de
`atualizar-usuario` (edita só o que é mutável, não recria o registro
inteiro).

## O registro `form_manager` (o formulário em si)

| Coluna            | Valor                                                                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `slug`            | `atualizar-upload`                                                                                                                                                    |
| `table_name`      | `uploads`                                                                                                                                                             |
| `title`           | Upload (Metadados)                                                                                                                                                    |
| `description`     | Edição dos metadados de um arquivo já enviado — título, descrição, categoria e status. Não cria upload novo (isso é feito pelo envio multipart, fora do módulo Form). |
| `roles`           | `["admin"]`                                                                                                                                                           |
| `react_route`     | `/v1/upload-manager/update`                                                                                                                                           |
| `submit_endpoint` | `/api/v1/upload-manager/update`                                                                                                                                       |
| `http_method`     | `PUT`                                                                                                                                                                 |
| `status`          | `active`                                                                                                                                                              |
| `version`         | `1`                                                                                                                                                                   |

## Árvore de dados — hierarquia completa, sem detalhe (detalhe vai na tabela)

```
atualizar-upload
└─ Metadados (uploads)
   ├─ Linha 1
   │  ├─ Título
   │  └─ Categoria
   ├─ Linha 2
   │  └─ Descrição
   └─ Linha 3
      └─ Status
```

## Grupo 1 — Metadados (`uploads`)

_slug `metadados` · icon `file-earmark-text`_

| Linha | Rótulo    | `field_name`  | Tipo     | col | Obrig. | Observação                                                                                                                                                                                                        |
| ----- | --------- | ------------- | -------- | --- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Título    | `title`       | text     | 8   | não    | placeholder "Nome amigável exibido na listagem"                                                                                                                                                                   |
| 1     | Categoria | `category`    | select   | 4   | não    | opções (coluna `enum`): Imagem (`image`), Vídeo (`video`), Áudio (`audio`), Documento (`document`), Planilha (`spreadsheet`), Apresentação (`presentation`), PDF (`pdf`), Compactado (`archive`), Outro (`other`) |
| 2     | Descrição | `description` | textarea | 12  | não    | `rows_qty=3`                                                                                                                                                                                                      |
| 3     | Status    | `status`      | radio    | 12  | não    | `inline=1`; opções (coluna `enum`, só 2 valores): Ativo (`active`), Inativo (`inactive`)                                                                                                                          |

## Próximo passo

Revisar e então gerar o `INSERT` a partir exatamente desta tabela — mesmo
fluxo dos anteriores, aplicado só aos metadados editáveis de `uploads`.

---

[◄ Índice da base de conhecimento](../../../README.md)

---

### 📌 Metadados do Autor

| Campo               | Informação                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Nome**            | Gustavo Hammes                                                                                                               |
| **Local**           | Rio de Janeiro                                                                                                               |
| **LinkedIn**        | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes)                                                 |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
