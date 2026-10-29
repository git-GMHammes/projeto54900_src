// Home (landing page) da empresa `tryikads`. Estatica: nao consulta API. Construida aos poucos, em rows
// responsivas do Bootstrap; as imagens ficam na public do FRONTEND, em public/img/tryikads/.
//
// Row 1 (arte do cliente, doc/img/tryikads/img_8.jpeg): imagem de fundo na propria row (o Bootstrap nao tem
// utilitario de imagem de fundo, por isso o style) e, por cima, o texto em HTML: logo, chamada, titulo com
// "que geram" em degrade e paragrafo. Sem fundo no card (so o espaco). A imagem nao leva overlay nem filtro.
// A row mantem a proporcao da imagem (aspectRatio 1024 / 572): o fundo so se ajusta a largura da tela.
// De lg para cima (desktop e TV) o texto fica a esquerda, numa coluna de ~42% da row (col-lg-5); no celular
// ocupa a largura toda. A parte de baixo da arte (3 beneficios e "Ideal para") entra em outra row.

import type { CSSProperties } from 'react';

import { env } from '@/config/env';

const assetUrl = (path: string): string => `${env.basePath}/${path}`;

const HERO_STYLE: CSSProperties = {
  backgroundImage: `url(${assetUrl('img/tryikads/interior_carro_002.jpg')})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  aspectRatio: '1024 / 572',
};

/** Letras proporcionais a tela (1,7vw), entre 0,8rem (celular) e 2,2rem (TV); logo, titulo e chamada usam em. */
const TEXT_STYLE: CSSProperties = {
  fontSize: 'clamp(0.8rem, 1.7vw, 2.2rem)',
  textShadow: '0 2px 6px rgb(46 16 101 / 0.9)',
};

/** Degrade nas letras, igual ao logo Tryik: ciano -> azul -> violeta -> magenta -> rosa (o Bootstrap nao tem
 *  texto em degrade). ATENCAO: `textShadow: 'none'` e obrigatorio, porque o text-shadow do card e herdado e,
 *  com o preenchimento transparente, apareceria POR DENTRO das letras (todas ficavam roxas). O brilho vem do
 *  drop-shadow, que acompanha so as letras. Aplicar em um `d-inline-block` para o degrade cobrir so a palavra. */
const GRADIENT_TEXT_STYLE: CSSProperties = {
  backgroundImage: 'linear-gradient(90deg, #00d4ff 0%, #2f6bff 25%, #8b3dff 50%, #e02bff 75%, #ff5ce1 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
  textShadow: 'none',
  filter: 'drop-shadow(0 2px 3px rgb(46 16 101 / 0.55))',
};

interface FeatureCard {
  /** Icone do Bootstrap Icons, sem o prefixo `bi-` (um por card, sem repeticao). */
  icon: string;
  title: string;
  text: string;
}

/** 4 linhas x 3 cards (12 no total), um segmento por linha, na ordem das artes do cliente: Promocoes (img_8),
 *  Servicos (img_7), Institucional (img_9) e Eventos (img_10). Textos e icones nao se repetem entre os cards. */
const FEATURE_ROWS: readonly (readonly FeatureCard[])[] = [
  [
    { icon: 'tag', title: 'Ofertas da semana', text: 'Destaque suas promoções em tempo real.' },
    { icon: 'percent', title: 'Descontos exclusivos', text: 'Aumente o fluxo de clientes para sua loja.' },
    { icon: 'cart', title: 'Ações sazonais', text: 'Divulgue campanhas especiais e datas comemorativas.' },
  ],
  [
    { icon: 'people', title: 'Clínicas e profissionais', text: 'Divulgue seus serviços e facilite o agendamento.' },
    { icon: 'gear', title: 'Prestadores de serviços', text: 'Seja encontrado por novos clientes na sua região.' },
    { icon: 'calendar-check', title: 'Agendamentos e contatos', text: 'Mostre seus canais e aumente suas conversões.' },
  ],
  [
    { icon: 'bullseye', title: 'Posicionamento de marca', text: 'Fortaleça sua presença e aumente o valor da sua empresa.' },
    { icon: 'heart', title: 'Responsabilidade social', text: 'Compartilhe iniciativas e projetos que geram impacto positivo.' },
    { icon: 'bar-chart', title: 'Comunicação institucional', text: 'Mostre sua história, seus diferenciais e seus valores.' },
  ],
  [
    { icon: 'music-note-beamed', title: 'Shows e festivais', text: 'Divulgue datas, atrações e venda de ingressos.' },
    { icon: 'shop', title: 'Inaugurações e feiras', text: 'Leve mais público para seu evento.' },
    { icon: 'megaphone', title: 'Campanhas especiais', text: 'Crie expectativa e aumente o alcance da sua marca.' },
  ],
];

/** Linha de destaque (acima das 4 linhas de segmentos): o 1o card e o pedido de contato via WhatsApp (especial,
 *  ver CONTACT_*), os outros dois sao caracteristicas do servico (arte do cliente, doc/img/tryikads/img_4.jpeg). */
const HIGHLIGHT_CARDS: readonly FeatureCard[] = [
  { icon: 'eye', title: 'Mais visibilidade', text: 'Sua marca vista por milhares de pessoas todos os dias.' },
  { icon: 'person-plus', title: 'Novos clientes', text: 'Alcance quem está a caminho e ainda não conhece você.' },
];

const CONTACT_MESSAGE = 'Olá! Quero anunciar com a Tryik ADS e gostaria de solicitar um orçamento.';

/** Link do WhatsApp (wa.me). Sem numero configurado (VITE_WHATSAPP_NUMBER), abre sem destinatario. */
const CONTACT_URL = `https://wa.me/${env.whatsappNumber}?text=${encodeURIComponent(CONTACT_MESSAGE)}`;

/** Caixa do icone: quadrado arredondado com borda em degrade (ciano/azul -> rosa), como na arte do cliente. */
const ICON_BOX_STYLE: CSSProperties = {
  width: '3.5rem',
  height: '3.5rem',
  border: '2px solid transparent',
  background:
    'linear-gradient(#2a0f55, #2a0f55) padding-box, linear-gradient(135deg, #00d4ff, #8b3dff 50%, #ff2bd6) border-box',
};

export default function TryikadsHome() {
  return (
    <section aria-label="Home" data-home="tryikads">
      {/* Row 1: imagem de fundo inteira + texto. lg+: coluna de 5/12 a esquerda; celular: largura toda */}
      <div className="row g-0" style={HERO_STYLE}>
        <div className="col-12 col-lg-5 d-flex align-items-center p-3 py-lg-4 ps-lg-5 pe-lg-0">
          {/* Sem fundo nem borda: o card so mantem o espaco; letras brancas */}
          <div className="card w-100 bg-transparent border-0 text-white tpl-fade-in" style={TEXT_STYLE}>
            <div className="card-body d-flex flex-column gap-2 gap-lg-3 p-0">
              {/* Logo + "ADS" (o arquivo traz so a marca e a barra; ADS fica a direita, abaixo de "ik") */}
              <div className="position-relative" style={{ width: '10em' }}>
                <img src={assetUrl('img/tryikads/logo.png')} alt="Tryik ADS" className="img-fluid d-block" />
                <span
                  className="position-absolute fw-light"
                  style={{ top: '58%', right: '4%', fontSize: '1.5em', letterSpacing: '0.45em', lineHeight: 1 }}
                >
                  ADS
                </span>
              </div>

              <p className="text-uppercase mb-0" style={{ fontSize: '0.8em', letterSpacing: '0.28em' }}>
                Publicidade digital em movimento
              </p>

              <h2 className="fw-bolder mb-0 tpl-hero-text" style={{ fontSize: '3em', lineHeight: 1.05 }}>
                <span className="d-block">Promoções</span>
                <span className="d-block">
                  <span className="d-inline-block tpl-hero-gradient" style={GRADIENT_TEXT_STYLE}>
                    que geram
                  </span>
                </span>
                <span className="d-block">resultado.</span>
              </h2>

              <p className="mb-0">
                Divulgue ofertas e condições especiais para milhares de pessoas todos os dias, durante todo o trajeto.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: card especial de contato via WhatsApp + 2 caracteristicas. Celular: 1 por linha; md+: 3 lado a lado */}
      <div className="row g-3 mt-0 mt-md-1 mb-1">
        <div className="col-12 col-md-4">
          <div className="card h-100 bg-white bg-opacity-10 border-0 text-white text-center tpl-card-hover">
            <div className="card-body d-flex flex-column align-items-center justify-content-center gap-2 p-3 p-lg-4">
              <span className="d-inline-flex align-items-center justify-content-center rounded-3 fs-3 tpl-card-icon" style={ICON_BOX_STYLE}>
                <i className="bi bi-whatsapp" aria-hidden="true" />
              </span>
              <h3 className="h6 fw-bold text-uppercase mb-0 card-title-hover">Solicite seu anúncio</h3>
              <p className="card-text small mb-0 opacity-75">Fale com a gente pelo WhatsApp e peça o seu orçamento.</p>
              <a
                href={CONTACT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-light btn-sm fw-bold text-uppercase mt-1"
              >
                Chamar no WhatsApp
              </a>
            </div>
          </div>
        </div>
        {HIGHLIGHT_CARDS.map((card) => (
          <div key={card.title} className="col-12 col-md-4">
            <div className="card h-100 bg-white bg-opacity-10 border-0 text-white text-center tpl-card-hover">
              <div className="card-body d-flex flex-column align-items-center justify-content-center gap-2 p-3 p-lg-4">
                <span className="d-inline-flex align-items-center justify-content-center rounded-3 fs-3 tpl-card-icon" style={ICON_BOX_STYLE}>
                  <i className={`bi bi-${card.icon}`} aria-hidden="true" />
                </span>
                <h3 className="h6 fw-bold text-uppercase mb-0 card-title-hover">{card.title}</h3>
                <p className="card-text small mb-0 opacity-75">{card.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rows 3 a 6: 4 linhas de 3 cards (12 no total). Celular: 1 por linha; md+: 3 lado a lado */}
      {FEATURE_ROWS.map((cards, rowIndex) => (
        <div key={rowIndex} className="row g-3 mt-0 mt-md-1 mb-1">
          {cards.map((card) => (
            <div key={card.title} className="col-12 col-md-4">
              <div className="card h-100 bg-white bg-opacity-10 border-0 text-white text-center tpl-card-hover">
                <div className="card-body d-flex flex-column align-items-center gap-2 p-3 p-lg-4">
                  <span className="d-inline-flex align-items-center justify-content-center rounded-3 fs-3 tpl-card-icon" style={ICON_BOX_STYLE}>
                    <i className={`bi bi-${card.icon}`} aria-hidden="true" />
                  </span>
                  <h3 className="h6 fw-bold text-uppercase mb-0 card-title-hover">{card.title}</h3>
                  <p className="card-text small mb-0 opacity-75">{card.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
