// Contrato de GET api/v1/template-render/get (template, nav, menu, cabecalhos e rodapes da empresa da
// sessao). Espelha app/Services/V1/Template/TemplateRender/Builder.php e o formato dos JSONs
// template00X.json. `parseTemplateRender` aceita a resposta crua e nunca lanca: campo faltando vira vazio.

export interface TemplateInfo {
  id: number;
  code: string;
  name: string;
}

export interface TemplateNavShell {
  id: number;
  title: string;
  image: string | null;
  message_icon: string | null;
  system_version: string | null;
}

/** Item de menu em arvore (nav = placement navbar; menu = placement offcanvas, o menu lateral). */
export interface TemplateMenuItem {
  id: number;
  order: number;
  label: string;
  url: string | null;
  icon: string | null;
  children: TemplateMenuItem[];
}

export interface TemplateLogo {
  id: number;
  position: 'left' | 'center' | 'right';
  text: string;
  image_url: string;
  alt: string;
}

export interface TemplateHeaderData {
  id: number;
  name: string | null;
  sort_order: number;
  background_image: { id: number; url: string; alt: string }[];
  logo: TemplateLogo[];
  company_name: { id: number; text: string }[];
}

export interface TemplateFooterData {
  id: number;
  name: string | null;
  sort_order: number;
  footer_headings: { id: number; order: number; column: number; title: string; text: string }[];
  footer_images: { id: number; order: number; column: number; url: string; alt: string }[];
}

export interface TemplateRenderData {
  /** Paleta de cores da empresa (company_manager.color_theme); null = padrao do sistema. */
  color_theme: string | null;
  template: TemplateInfo | null;
  templates: TemplateInfo[];
  preferred_id: number | null;
  temp_nav: TemplateNavShell | null;
  nav: TemplateMenuItem[];
  menu: TemplateMenuItem[];
  headers: TemplateHeaderData[];
  footers: TemplateFooterData[];
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const asList = (v: unknown): Record<string, unknown>[] => (Array.isArray(v) ? v.filter(isRecord) : []);
const str = (v: unknown, d = ''): string =>
  typeof v === 'string' ? v : typeof v === 'number' || typeof v === 'boolean' ? String(v) : d;
const num = (v: unknown, d = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};
const strOrNull = (v: unknown): string | null => (typeof v === 'string' && v !== '' ? v : null);

function parseInfo(v: unknown): TemplateInfo | null {
  return isRecord(v) ? { id: num(v.id), code: str(v.code), name: str(v.name) } : null;
}

function parseMenu(list: unknown): TemplateMenuItem[] {
  return asList(list).map((r) => ({
    id: num(r.id),
    order: num(r.order),
    label: str(r.label),
    url: strOrNull(r.url),
    icon: strOrNull(r.icon),
    children: parseMenu(r.children),
  }));
}

export function parseTemplateRender(raw: unknown): TemplateRenderData {
  const r = isRecord(raw) ? raw : {};
  const nav = isRecord(r.temp_nav) ? r.temp_nav : null;

  return {
    color_theme: strOrNull(r.color_theme),
    template: parseInfo(r.template),
    templates: asList(r.templates).map((t) => ({ id: num(t.id), code: str(t.code), name: str(t.name) })),
    preferred_id: r.preferred_id === null || r.preferred_id === undefined ? null : num(r.preferred_id),
    temp_nav: nav
      ? {
          id: num(nav.id),
          title: str(nav.title),
          image: strOrNull(nav.image),
          message_icon: strOrNull(nav.message_icon),
          system_version: strOrNull(nav.system_version),
        }
      : null,
    nav: parseMenu(r.nav),
    menu: parseMenu(r.menu),
    headers: asList(r.headers).map((h) => ({
      id: num(h.id),
      name: strOrNull(h.name),
      sort_order: num(h.sort_order),
      background_image: asList(h.background_image).map((b) => ({ id: num(b.id), url: str(b.url), alt: str(b.alt) })),
      logo: asList(h.logo).map((l) => ({
        id: num(l.id),
        position: l.position === 'left' || l.position === 'right' ? l.position : 'center',
        text: str(l.text),
        image_url: str(l.image_url),
        alt: str(l.alt),
      })),
      company_name: asList(h.company_name).map((c) => ({ id: num(c.id), text: str(c.text) })),
    })),
    footers: asList(r.footers).map((f) => ({
      id: num(f.id),
      name: strOrNull(f.name),
      sort_order: num(f.sort_order),
      footer_headings: asList(f.footer_headings).map((x) => ({
        id: num(x.id),
        order: num(x.order),
        column: num(x.column),
        title: str(x.title),
        text: str(x.text),
      })),
      footer_images: asList(f.footer_images).map((x) => ({
        id: num(x.id),
        order: num(x.order),
        column: num(x.column),
        url: str(x.url),
        alt: str(x.alt),
      })),
    })),
  };
}
