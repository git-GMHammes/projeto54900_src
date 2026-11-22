[◄ Índice da base de conhecimento](../README.md)

---

# Módulos independentes e ligação sob pedido

Regra geral do sistema (SaaS multiempresa). Vale para todo módulo novo e para os existentes.

## 1. Princípio

**Todos os módulos podem estar ligados a todos os módulos, porém todos devem ser independentes.**

- Cada módulo funciona sozinho: cadastra, lista, edita e exclui sem que outro módulo exista nem tenha dados.
- A ligação entre módulos é sempre **opcional**. Ligar não é pré-requisito de nada.

## 2. Como a ligação é feita

- Ligação = uma **chave de ligação** (ex.: `location_id` no produto), nula por padrão.
- **Desligamento = ausência da chave** (`NULL`). Nada além disso: sem tabela intermediária obrigatória, sem registro "vazio", sem regra que exija o outro módulo.
- Coluna de ligação: `DEFAULT NULL`, nunca `NOT NULL`, nunca obrigatória em Request, Processor ou tela.
- Ligação entre vários módulos ao mesmo tempo usa vínculo genérico (ex.: `map_links` do Map), não uma coluna por módulo.

## 3. Ligações só mediante pedido

- **Nenhuma ligação é criada por iniciativa de quem implementa.** Só se o pedido disser qual módulo liga a qual.
- Sem pedido, o módulo nasce sem chave de ligação nenhuma.
- A ligação pedida é acrescentada depois, sem alterar o funcionamento solo do módulo.

## 4. SaaS: isolamento por empresa

- Toda tabela de negócio tem `company_id` (FK para `company_manager`) e índice próprio.
- Um registro de uma empresa **nunca** enxerga nem interfere no de outra: consulta, `UNIQUE` (ex.: `(company_id, code)`), pai/filho e chaves de ligação respeitam a mesma empresa.
- Toda tabela de negócio também tem `roles` (json com slugs de `user_roles`, ex.: `["guest","user","admin"]`; lista vazia = todos): o perfil que enxerga o **registro**. Já existe em `location_manager` e `product_manager`.
- Chave de ligação para outro módulo só aceita registro da **mesma empresa** (validado no `Processor`).
- Tabelas de rótulo compartilhado são a exceção declarada (escopo `none`). Ver [`README_multiempresa_guia_modulos.md`](README_multiempresa_guia_modulos.md).

## 5. Responsabilidade pela dependência: no código, não no banco

Regra (2026-11-22, pedido do usuário): quem cuida das dependências entre módulos é o **backend e o frontend, por código-fonte**.
O banco não "sofre" essa responsabilidade.

- **Backend:** `Request` (forma) e `Processor` (o vínculo existe, é da mesma empresa, status permitido, unicidade de negócio,
  regra de exclusão) devolvem 422/409 com mensagem. Nada depende de o banco recusar a gravação.
- **Frontend:** formulário e tela tratam o vínculo como **opcional** (campo vazio é válido), carregam as opções por API e mostram
  o erro devolvido; não assumem que uma constraint do banco vai proteger o dado.
- **Banco:** guarda tabelas, índices e views e **pode ter FK, desde que a coluna de vínculo aceite NULL** (a FK não obriga o
  vínculo). O que o banco não pode é carregar a dependência: ID `NOT NULL` de vínculo, ou CHECK que exija o vínculo. Constraint
  não é a barreira de integridade: toda regra de dependência precisa existir no código, mesmo que o banco também a tenha.
- **Colunas de vínculo** aceitam `NULL` (item 2). A única coluna obrigatória é `company_id`, por causa do isolamento por empresa.
- **Nunca** um módulo fica 100% dependente de outro: sem o vínculo, o registro existe e funciona sozinho.

Estado: nas 7 tabelas `health_*` (2026-11-22) todos os IDs de vínculo aceitam NULL, as 16 FKs existem (foram removidas por engano e
recriadas; o problema era a dependência, não a FK) e o CHECK de dependência foi removido; a cascata e o bloqueio de exclusão
definitiva também estão nos Processors. Também em 2026-11-22, "ID de vínculo aceita NULL" foi aplicado às 22 colunas `NOT NULL` que ligavam
módulos entre si: `movement_manager.product_id` e a coluna de usuário de Chat (8), Message (6), Timeline (6) e Company (1). Não entram
na regra `company_id` (isolamento por empresa), os vínculos polimórficos (`map_links.reference_id`, `uploads.reference_id`,
`user_resource_access.resource_id`) e as ligações dentro do mesmo módulo; elas não foram tocadas. Lado do frontend em
[`README_paginas_modulo.md`](../../../frontend/projeto54900/src/markdown/geral/README_paginas_modulo.md).

## 6. Estado atual das ligações

| Ligação | Situação |
| ------- | -------- |
| Product -> Location (`product_manager.location_id`) | Pedida e criada; opcional (`NULL` = produto sem local). |
| Movement -> Product (`movement_manager.product_id`) | Pedida e criada; opcional desde 2026-11-22 (`NULL` = movimento sem produto, sem conferência de saldo). |
| Chat, Message, Timeline, Company -> User (`*user_manager_id`) | Opcionais (`NULL`) desde 2026-11-22; autor, dono e remetente continuam vindo da sessão. |
| Movement -> Location (`movement_manager.location_id`) | Criada; opcional. |
| Service (todas as tabelas) | Sem ligação com outros módulos (cliente e local do serviço são texto livre). |
| Health (`health_*`) | Todos os IDs de vínculo opcionais (`NULL`), validados no `Processor` só quando informados; ver [`README_modulo_health.md`](README_modulo_health.md). |
| Demais módulos | Sem ligação. Criar só sob pedido. |

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
