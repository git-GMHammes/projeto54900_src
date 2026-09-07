// Ponto unico de entrada do Bootstrap.
// Regra do projeto: a UI e 99,9% Bootstrap. Importe daqui, nao espalhe imports.
//
// - CSS: vem do SCSS em styles/index.scss (que compila o Bootstrap com os
//   overrides de variaveis). NAO importamos o CSS pronto aqui para nao duplicar.
// - JS: bundle com Popper incluido (dropdown, modal, tooltip, offcanvas, collapse).
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Fonte de icones (classes `bi bi-*`), usada pelo componente IconSelect.
import 'bootstrap-icons/font/bootstrap-icons.css';

// SCSS da aplicacao (inclui o Bootstrap compilado + o 0,01% de custom).
import './styles/index.scss';
