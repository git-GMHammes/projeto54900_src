[◄ Índice da base de conhecimento](../../../README.md)

---

# Cadastro de Propriedade Estendida — `cadastro-propriedade-evento`

Mesmo modelo de [`form/modelo_ia/form.md`](../modelo_ia/form.md): árvore revisada
aqui antes do `INSERT` (não migration, não seed).

**O que é:** formulário de `calendar_event_extended_properties` — um par
chave/valor livre anexado a um evento
([`calendar_events.md`](calendar_events.md)), espelhando o recurso
`extendedProperties` do Google Calendar (`private`/`shared`). Desenho novo,
direto do schema real.

## O registro `form_manager` (o formulário em si)

| Coluna | Valor |
| --- | --- |
| `slug` | `cadastro-propriedade-evento` |
| `table_name` | `calendar_event_extended_properties` |
| `title` | Propriedade Estendida |
| `description` | Cadastro de propriedade estendida (chave/valor livre) de um evento de calendário. |
| `roles` | `["guest","user","admin"]` |
| `react_route` | `/v1/calendar-event-extended-properties/create` |
| `submit_endpoint` | `/api/v1/calendar-event-extended-properties/create` |
| `http_method` | `POST` |
| `status` | `active` |
| `version` | `1` |

## Árvore de dados — hierarquia completa, sem detalhe (detalhe vai na tabela)

```
cadastro-propriedade-evento
└─ Propriedade
   ├─ Linha 1
   │  ├─ Evento
   │  └─ Escopo
   └─ Linha 2
      ├─ Chave
      └─ Valor
```

## Grupo 1 — Propriedade

*slug `propriedade` · icon `tags`*

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Tooltip (`help_text`) | Observação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Evento | `calendar_event_id` | select | 8 | sim | Evento ao qual a propriedade pertence. | remoto: `GET /api/v1/calendar-events/get-no-pagination`, `valueKey=id`, `labelTemplate="{summary} #{id}"` |
| 1 | Escopo | `scope` | select | 4 | não | Privado: só na cópia de quem gravou. Compartilhado: visível para todos os convidados. | opções (coluna `enum`): Privado (`private`), Compartilhado (`shared`) |
| 2 | Chave | `property_key` | text | 4 | sim | Nome da propriedade (ex.: pedido_id). Uso interno de integrações. | — |
| 2 | Valor | `property_value` | text | 8 | sim | Valor da propriedade (até 1024 caracteres). | `max_length=1024` |

## Próximo passo

Revisar e então gerar o `INSERT` a partir exatamente desta tabela.

---

[◄ Índice da base de conhecimento](../../../README.md)

---

### 📌 Metadados do Autor

| Campo | Informação |
| --- | --- |
| **Nome** | Gustavo Hammes |
| **Local** | Rio de Janeiro |
| **LinkedIn** | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes) |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
