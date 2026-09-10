# CLAUDE.md — src/ (backend CodeIgniter 4)

## Papel deste diretório
`src/` é o backend do projeto54900. CodeIgniter 4 atua **apenas como backend
e APIs REST** (JSON). Não renderiza telas, não serve HTML de aplicação, não
tem camada de view de usuário final.

- Frontend: **React/JS**, em `src/frontend/projeto54900/` (build e lint
  próprios; ver `package.json` da raiz do monorepo).
- Contrato entre as camadas: HTTP/JSON sob `api/v1/*`.
- `src/app/Views/` serve só a páginas utilitárias do framework (erros,
  debug), nunca UI do produto.

## Padrão de módulo da API V1
Obrigatório: `src/app/markdown/geral/ROADMAP_padrao_modulo.md`
(6 camadas: Routes > Controller > Request > Processor/Service > Model >
Migration; contrato de 18 rotas por tabela, 10 por view; envelope de
resposta único).

## Base de conhecimento
Índice: `src/app/markdown/README.md`.

## Regras herdadas
Valem as regras do `C:\Users\Dev\.claude\CLAUDE.md` (idioma, fluxo de
planejamento, pastas de núcleo/sistema, bancos, segredos nunca em texto puro).
