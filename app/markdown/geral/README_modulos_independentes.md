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

## 5. Estado atual das ligações

| Ligação | Situação |
| ------- | -------- |
| Product -> Location (`product_manager.location_id`) | Pedida e criada; opcional (`NULL` = produto sem local). |
| Movement -> Product (`movement_manager.product_id`) | Pedida e criada; obrigatória (movimento sem produto não existe). |
| Movement -> Location (`movement_manager.location_id`) | Criada; opcional. |
| Service (todas as tabelas) | Sem ligação com outros módulos (cliente e local do serviço são texto livre). |
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
