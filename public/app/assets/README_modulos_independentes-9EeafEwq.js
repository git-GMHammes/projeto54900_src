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
## 5. Responsabilidade pela dependência: no código, não no banco\r
\r
Regra (2026-11-22, pedido do usuário): quem cuida das dependências entre módulos é o **backend e o frontend, por código-fonte**.\r
O banco não "sofre" essa responsabilidade.\r
\r
- **Backend:** \`Request\` (forma) e \`Processor\` (o vínculo existe, é da mesma empresa, status permitido, unicidade de negócio,\r
  regra de exclusão) devolvem 422/409 com mensagem. Nada depende de o banco recusar a gravação.\r
- **Frontend:** formulário e tela tratam o vínculo como **opcional** (campo vazio é válido), carregam as opções por API e mostram\r
  o erro devolvido; não assumem que uma constraint do banco vai proteger o dado.\r
- **Banco:** guarda tabelas, índices e views e **pode ter FK, desde que a coluna de vínculo aceite NULL** (a FK não obriga o\r
  vínculo). O que o banco não pode é carregar a dependência: ID \`NOT NULL\` de vínculo, ou CHECK que exija o vínculo. Constraint\r
  não é a barreira de integridade: toda regra de dependência precisa existir no código, mesmo que o banco também a tenha.\r
- **Colunas de vínculo** aceitam \`NULL\` (item 2). A única coluna obrigatória é \`company_id\`, por causa do isolamento por empresa.\r
- **Nunca** um módulo fica 100% dependente de outro: sem o vínculo, o registro existe e funciona sozinho.\r
\r
Estado: nas 7 tabelas \`health_*\` (2026-11-22) todos os IDs de vínculo aceitam NULL, as 16 FKs existem (foram removidas por engano e\r
recriadas; o problema era a dependência, não a FK) e o CHECK de dependência foi removido; a cascata e o bloqueio de exclusão\r
definitiva também estão nos Processors. Também em 2026-11-22, "ID de vínculo aceita NULL" foi aplicado às 22 colunas \`NOT NULL\` que ligavam\r
módulos entre si: \`movement_manager.product_id\` e a coluna de usuário de Chat (8), Message (6), Timeline (6) e Company (1). Não entram\r
na regra \`company_id\` (isolamento por empresa), os vínculos polimórficos (\`map_links.reference_id\`, \`uploads.reference_id\`,\r
\`user_resource_access.resource_id\`) e as ligações dentro do mesmo módulo; elas não foram tocadas. Lado do frontend em\r
[\`README_paginas_modulo.md\`](../../../frontend/projeto54900/src/markdown/geral/README_paginas_modulo.md).\r
\r
## 6. Estado atual das ligações\r
\r
| Ligação | Situação |\r
| ------- | -------- |\r
| Product -> Location (\`product_manager.location_id\`) | Pedida e criada; opcional (\`NULL\` = produto sem local). |\r
| Movement -> Product (\`movement_manager.product_id\`) | Pedida e criada; opcional desde 2026-11-22 (\`NULL\` = movimento sem produto, sem conferência de saldo). |\r
| Chat, Message, Timeline, Company -> User (\`*user_manager_id\`) | Opcionais (\`NULL\`) desde 2026-11-22; autor, dono e remetente continuam vindo da sessão. |\r
| Movement -> Location (\`movement_manager.location_id\`) | Criada; opcional. |\r
| Service (todas as tabelas) | Sem ligação com outros módulos (cliente e local do serviço são texto livre). |\r
| Health (\`health_*\`) | Todos os IDs de vínculo opcionais (\`NULL\`), validados no \`Processor\` só quando informados; ver [\`README_modulo_health.md\`](README_modulo_health.md). |\r
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
