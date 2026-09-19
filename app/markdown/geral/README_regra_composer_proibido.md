[◄ Índice da base de conhecimento](../README.md)

---

# PHP Composer / vendor — proibido sem autorização explícita

O usuário **nunca** autorizou o uso de PHP Composer neste projeto. Não há
exceção registrada para `projeto54900` até o momento.

- PROIBIDO rodar `composer install`, `composer require`, `composer update`,
  `composer create-project` ou qualquer variante — mesmo que a tarefa pedida
  pareça exigir uma lib PHP externa (ex.: geração de token JWT).
- PROIBIDO criar, editar ou recriar a pasta `vendor/`.
- Se uma tarefa parecer exigir Composer/vendor, PARAR e avisar o usuário
  **antes mesmo de propor um plano** — nunca instalar "para funcionar" e
  avisar depois.
- TEXTO FIXO DO ALERTA — usar literalmente, sem parafrasear:
  > ⛔ ALERTA — esta tarefa parece exigir PHP Composer / pasta `vendor/`.
  > Não vou prosseguir (nem propor plano) sem sua autorização explícita
  > para este projeto.
- Preferir sempre a alternativa nativa do PHP quando existir. Exemplo real:
  `app/Libraries/Auth/JwtService.php` gera/valida JWT HS256 só com
  `hash_hmac` nativo, sem nenhuma biblioteca externa.

**Origem**: em 2026-09-14, uma sessão anterior do Claude Code rodou
`composer install` e commitou/pushou (`999d563`) uma feature de JWT completa
usando `firebase/php-jwt` (vendor incluído) sem autorização. Foi revertido
(`1a81939`) e o trabalho não-relacionado a Composer restaurado com o JWT
reimplementado nativamente (`f7f2605`), a pedido do usuário. Regra tratada
como crítica e permanente — ver também `CLAUDE.md` na raiz de `src/` e o
`CLAUDE.md` global do usuário.

---

[◄ Índice da base de conhecimento](../README.md)

---

### 📌 Metadados do Autor

| Campo | Informação |
| --- | --- |
| **Nome** | Gustavo Hammes |
| **Local** | Rio de Janeiro |
| **LinkedIn** | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes) |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
