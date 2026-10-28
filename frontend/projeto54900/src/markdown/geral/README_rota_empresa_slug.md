[◄ Índice da base de conhecimento](../README.md)

---

# Rota com slug da empresa — `/<slug-empresa>/v1/...` (multiempresa)

Cada empresa tem um endereço próprio. O slug é o **primeiro segmento** da URL e vira parte do `basename` do router,
então nenhuma rota escrita no código (`paths.ts`, menu vindo do banco, `navigate`, `Link`) precisa conhecer o slug.
Regras da API em `README_multiempresa_isolamento.md` e `README_multiempresa_guia_modulos.md` (backend).

## 1. Endereços

| URL | Efeito |
| --- | ------ |
| `/v1/login`, `/v1/...` público (home, cadastro) | sem slug: empresa DEFAULT no login |
| `/<slug>/v1/login` | login na empresa do slug (só entra quem tem vínculo ativo) |
| `/<slug>/v1/...` | rotas autenticadas; o slug tem de ser o da sessão |
| `/acesso-negado` | página fixa da raiz, nunca é slug |

## 2. Peças do código

| Arquivo | Papel |
| ------- | ----- |
| `config/env.ts` (BLOCO 5) | `companySlug` lido **uma vez** da URL de carga; `companyBasePath(slug)` = `<basePath>/<slug>`; `routerBasename` já inclui o slug |
| `routes/RequireAuth.tsx` | compara `user.company_slug` com `companySlug`; diferente ou ausente: `window.location.replace` para a empresa da sessão, preservando caminho, query e hash |
| `pages/v1/auth/LoginPage.tsx` | após o login, `window.location.assign(companyBasePath(slug) + '/')` (navegação completa para fixar o basename) |
| `services/v1/auth.service.ts` | `POST auth/login` envia `company_slug` quando a URL tem slug |
| `context/AuthContext.tsx` | `login()` devolve o `company_slug`; a sessão é restaurada pelo refresh token |
| `components/template/TemplateNavRegion.tsx` (antes `components/layout/Navbar.tsx`) | sair com slug volta para a raiz sem slug (`env.basePath/`) por navegação completa |
| `types/auth.ts` | `AuthCompany {id, name, slug}`, `AuthUser.companies`, `AuthUser.company_slug`, `LoginPayload.company_slug` |

## 3. Regra de leitura do slug (`readCompanySlug`)

1. Remove o `env.basePath` do `pathname` e pega o primeiro segmento.
2. **Não é slug:** vazio, `acesso-negado` (`RESERVED_ROOT_SEGMENTS`) e grupos de versão (`/^v\d+[a-z]*$/`: `v1`, `v1a`...).
3. É slug se casar com `/^[a-z0-9-]+$/`; senão, `null`.

Slug de empresa não pode, portanto, ser `acesso-negado` nem parecer versão (`v2`).

## 4. Fluxo

1. Usuário abre `/acme/v1/login`. `companySlug = 'acme'`, `routerBasename = '/acme'`.
2. Login envia `company_slug: 'acme'`. A API devolve `company_slug` e `user.companies`.
3. `LoginPage` faz navegação completa para `/acme/`; o app recarrega com o basename correto.
4. Em toda rota protegida, `RequireAuth` confere o slug da URL contra o da sessão.
5. Logout vai para a raiz sem slug. Trocar de empresa = sair e entrar pelo endereço da outra empresa.

## 5. Regras para quem mantém

- **Nunca** montar link com o slug manualmente nem recalcular o basename: use `paths`, `Link`/`navigate` e, para redirect completo, `companyBasePath()`.
- Mudar de empresa exige **navegação completa** (o basename é fixado na carga).
- O slug da URL não dá acesso: a autorização é da sessão (`cid` no JWT). Slug adulterado só gera redirect para a empresa da sessão.
- Deploy: o servidor precisa devolver o `index.html` para qualquer caminho (`try_files $uri $uri/ /index.html` em `docker/nginx/default.conf`), inclusive `/<slug>/v1/...`. Em subpasta, `VITE_BASE_PATH` vem antes do slug.
- Telas de empresas, membros e usuários por empresa: ver [`README_rotas_frontend.md`](README_rotas_frontend.md) (seção company-manager) e [`modulos/company-manager/README_plano.md`](modulos/company-manager/README_plano.md).

## 6. Como validar

1. `/<slug>/v1/login` com usuário da empresa: entra e a URL fica `/<slug>/...`.
2. Mesmo usuário em `/<outro-slug>/v1/...` com sessão aberta: redireciona para o slug da sessão.
3. Usuário sem vínculo ativo na empresa: mensagem genérica de usuário ou senha inválidos.
4. Sair: volta para a raiz sem slug.
5. Recarregar (F5) em `/<slug>/v1/<qualquer-rota>`: abre a mesma tela.

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
