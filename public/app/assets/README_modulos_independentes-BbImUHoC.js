const e=`[◄ Índice da base de conhecimento](../README.md)\r
\r
---\r
\r
# Módulos independentes e ligação sob pedido\r
\r
Regra geral do sistema (SaaS multiempresa). Vale para todo módulo novo e para os existentes.\r
\r
## 1. Princípio\r
\r
**Todos os módulos podem estar ligados a todos os módulos, porém todos devem ser independentes.**\r
\r
- Cada módulo funciona sozinho: cadastra, lista, edita e exclui sem que outro módulo exista nem tenha dados.\r
- A ligação entre módulos é sempre **opcional**. Ligar não é pré-requisito de nada.\r
\r
## 2. Como a ligação é feita\r
\r
- Ligação = uma **chave de ligação** (ex.: \`location_id\` no produto), nula por padrão.\r
- **Desligamento = ausência da chave** (\`NULL\`). Nada além disso: sem tabela intermediária obrigatória, sem registro "vazio", sem regra que exija o outro módulo.\r
- Coluna de ligação: \`DEFAULT NULL\`, nunca \`NOT NULL\`, nunca obrigatória em Request, Processor ou tela.\r
- Ligação entre vários módulos ao mesmo tempo usa vínculo genérico (ex.: \`map_links\` do Map), não uma coluna por módulo.\r
\r
## 3. Ligações só mediante pedido\r
\r
- **Nenhuma ligação é criada por iniciativa de quem implementa.** Só se o pedido disser qual módulo liga a qual.\r
- Sem pedido, o módulo nasce sem chave de ligação nenhuma.\r
- A ligação pedida é acrescentada depois, sem alterar o funcionamento solo do módulo.\r
\r
## 4. SaaS: isolamento por empresa\r
\r
- Toda tabela de negócio tem \`company_id\` (FK para \`company_manager\`) e índice próprio.\r
- Um registro de uma empresa **nunca** enxerga nem interfere no de outra: consulta, \`UNIQUE\` (ex.: \`(company_id, code)\`), pai/filho e chaves de ligação respeitam a mesma empresa.\r
- Toda tabela de negócio também tem \`roles\` (json com slugs de \`user_roles\`, ex.: \`["guest","user","admin"]\`; lista vazia = todos): o perfil que enxerga o **registro**. Já existe em \`location_manager\` e \`product_manager\`.\r
- Chave de ligação para outro módulo só aceita registro da **mesma empresa** (validado no \`Processor\`).\r
- Tabelas de rótulo compartilhado são a exceção declarada (escopo \`none\`). Ver [\`README_multiempresa_guia_modulos.md\`](README_multiempresa_guia_modulos.md).\r
\r
## 5. Estado atual das ligações\r
\r
| Ligação | Situação |\r
| ------- | -------- |\r
| Product -> Location (\`product_manager.location_id\`) | Pedida e criada; opcional (\`NULL\` = produto sem local). |\r
| Movement -> Product (\`movement_manager.product_id\`) | Pedida e criada; obrigatória (movimento sem produto não existe). |\r
| Movement -> Location (\`movement_manager.location_id\`) | Criada; opcional. |\r
| Service (todas as tabelas) | Sem ligação com outros módulos (cliente e local do serviço são texto livre). |\r
| Demais módulos | Sem ligação. Criar só sob pedido. |\r
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
`;export{e as default};
