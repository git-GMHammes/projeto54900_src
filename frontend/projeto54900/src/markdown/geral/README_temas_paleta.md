[◄ Índice da base de conhecimento](../README.md)

---

# Temas de paleta de cores (Template001)

Cada paleta é um JSON em `src/config/themes/`. A ativa é escolhida por
`env.theme` (variável `VITE_THEME`, padrão `Blue_white`) e aplicada pelo
`Template001Page` como variáveis CSS: as globais no elemento raiz e as de cada
região (header, nav, menu, content, footer) no próprio elemento dela.

## Paletas existentes

| Arquivo             | Modo  | Característica                                                 |
| ------------------- | ----- | -------------------------------------------------------------- |
| `Dark.json`         | dark  | neutra, preto e cinza                                          |
| `Green_white.json`  | light | suave e harmoniosa                                             |
| `Green_dark.json`   | dark  | intensa e escura                                               |
| `Blue_white.json`   | light | suave e harmoniosa (padrão)                                    |
| `Blue_dark.json`    | dark  | intensa e escura                                               |
| `Purple_white.json` | light | suave e harmoniosa                                             |
| `Purple_dark.json`  | dark  | intensa e escura                                               |
| `Pink_white.json`   | light | suave e harmoniosa                                             |
| `Pink_dark.json`    | dark  | intensa e escura                                               |
| `CopaDoMundo.json`  | dark  | bandeira do Brasil: verde predominante, amarelo, azul e branco |
| `Natal.json`        | dark  | vermelho, verde, branco e dourado                              |

Sufixo `_white` = suave e harmonioso; `_dark` = intenso e escuro.

## Contrato de chaves (iguais em todos os JSONs, 24 no total)

| Chave                                                  | Uso                                                         |
| ------------------------------------------------------ | ----------------------------------------------------------- |
| `name`                                                 | nome da paleta (igual ao nome do arquivo)                   |
| `mode`                                                 | `light` ou `dark` (vira `data-bs-theme` do Bootstrap)       |
| `background_from`, `background_to`, `background_angle` | degradê de fundo da página                                  |
| `primary`                                              | destaques gerais (ex.: botão Menu no celular)               |
| `border_highlight`, `border_shadow`, `border_depth`    | luz (topo), sombra (base) e profundidade em px do efeito 3D |
| `<região>_background`                                  | fundo da região                                             |
| `<região>_border`                                      | cor da borda da região                                      |
| `<região>_text`                                        | letra da região (títulos, parágrafos e links)               |

Regiões (`<região>`): `header`, `nav`, `menu`, `content`, `footer`. O texto
secundário (ex.: separador `|` do nav) é a própria `<região>_text` com 75% de
opacidade. No cabeçalho, `header_background` forma uma camada translúcida sobre a
imagem de fundo, para a letra ter contraste com qualquer imagem.

Cores no formato `#rrggbb`. Em dev, chave faltante gera aviso no console.

## Critério de cor

Os temas coloridos **não usam fundo branco nem preto** como base: o degradê, os
cards e as bordas são da cor do tema, e cada região pode ter um tom ou uma cor
diferente (ex.: `CopaDoMundo` usa amarelo no cabeçalho, azul no nav e no rodapé,
verde no menu). A letra é preta nos temas claros e branca (ou de alto contraste)
nos escuros. Ao criar uma paleta, conferir contraste mínimo de 4,5 (WCAG) entre
`<região>_text` e `<região>_background` nas 5 regiões. Exceção: `Dark.json`, o
tema neutro, é preto e cinza.

## Adicionar uma paleta

1. Copiar um JSON existente em `src/config/themes/` e trocar nome e valores.
2. Usar o nome do arquivo (sem `.json`) em `VITE_THEME`.

Nenhum código precisa mudar: `config/theme.ts` registra todos os JSONs da pasta.
Nome inexistente em `VITE_THEME` cai em `Blue_white`.

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
