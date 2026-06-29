import { DOC_LANGUAGES, THAI_LANDING_COPY, type LocalizedDocPage } from "./docs";

export const SITE_NAME = "thai-address";
export const SITE_ORIGIN = "https://1moby.github.io";
export const SITE_BASE_PATH = "/thai-address/";
export const SITE_URL = `${SITE_ORIGIN}${SITE_BASE_PATH}`;
export const GITHUB_REPOSITORY_URL = "https://github.com/1moby/thai-address";
export const NPM_PACKAGE_URL = "https://www.npmjs.com/package/@1moby/thai-address";
export const SEO_IMAGE_PATH = "/og-image.svg";
export const SEO_IMAGE_URL = toSiteUrl(SEO_IMAGE_PATH);

const SEO_KEYWORDS = [
  "thai address autocomplete",
  "thai address parser",
  "ที่อยู่ไทย",
  "แยกที่อยู่ไทย",
  "กรอกที่อยู่ไทย",
  "Thailand address JavaScript",
  "@1moby/thai-address"
];

export interface SeoPage {
  key: string;
  path: string;
  url: string;
  lang: string;
  dir: "ltr" | "rtl";
  title: string;
  description: string;
  priority: string;
  changefreq: "weekly" | "monthly";
}

export function normalizePagePath(path: string): string {
  if (!path || path === "/") {
    return "/";
  }

  const clean = `/${path.replace(/^\/+|\/+$/g, "")}/`;
  return clean.replace(/\/+/g, "/");
}

function normalizeResourcePath(path: string): string {
  if (!path || path === "/") {
    return "/";
  }

  const clean = `/${path.replace(/^\/+|\/+$/g, "")}`;
  return /\.[a-z0-9]+$/iu.test(clean) ? clean : normalizePagePath(clean);
}

export function withSiteBasePath(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const clean = normalizePagePath(path);
  return clean === "/" ? SITE_BASE_PATH : `${SITE_BASE_PATH}${clean.slice(1)}`;
}

export function toSiteUrl(path: string): string {
  const clean = normalizeResourcePath(path);
  return clean === "/" ? SITE_URL : new URL(clean.slice(1), SITE_URL).toString();
}

export const LANDING_SEO_PAGE: SeoPage = {
  key: "home",
  path: "/",
  url: SITE_URL,
  lang: "th",
  dir: "ltr",
  title: "thai-address | แยกและเติมที่อยู่ไทยบนเบราว์เซอร์",
  description:
    "ไลบรารี JavaScript สำหรับ autocomplete และแยกที่อยู่ไทยเป็นบ้านเลขที่ ถนน แขวง เขต จังหวัด รหัสไปรษณีย์ ทำงานฝั่งเบราว์เซอร์พร้อมข้อมูล gzip ขนาดเล็ก",
  priority: "1.0",
  changefreq: "weekly"
};

function docTitle(doc: LocalizedDocPage): string {
  return `${doc.title} | thai-address`;
}

function docDescription(doc: LocalizedDocPage): string {
  return `${doc.lead} ${doc.supportNote}`;
}

export const SEO_PAGES: SeoPage[] = [
  LANDING_SEO_PAGE,
  ...DOC_LANGUAGES.map((doc) => ({
    key: `docs-${doc.slug}`,
    path: doc.route,
    url: toSiteUrl(doc.route),
    lang: doc.htmlLang,
    dir: doc.dir,
    title: docTitle(doc),
    description: docDescription(doc),
    priority: "0.8",
    changefreq: "monthly" as const
  }))
];

export function stripSiteBasePath(pathname: string): string {
  const pathnameOnly = pathname.split(/[?#]/u)[0] || "/";

  if (pathnameOnly === SITE_BASE_PATH.slice(0, -1)) {
    return "/";
  }

  if (pathnameOnly.startsWith(SITE_BASE_PATH)) {
    return normalizePagePath(pathnameOnly.slice(SITE_BASE_PATH.length));
  }

  return normalizePagePath(pathnameOnly);
}

export function getDocSlugFromPath(pathname: string): string | undefined {
  return stripSiteBasePath(pathname).match(/^\/docs\/([^/]+)\/$/u)?.[1];
}

export function getSeoPageForPath(pathname: string): SeoPage {
  const path = stripSiteBasePath(pathname);
  return SEO_PAGES.find((page) => page.path === path) ?? LANDING_SEO_PAGE;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeJsonForHtml(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function alternateLinks(): string {
  const links = SEO_PAGES.map(
    (page) => `<link rel="alternate" hreflang="${escapeHtml(page.lang)}" href="${escapeHtml(page.url)}" />`
  );
  links.push(`<link rel="alternate" hreflang="x-default" href="${escapeHtml(SITE_URL)}" />`);
  return links.join("\n");
}

function openGraphLocale(lang: string): string {
  const locales: Record<string, string> = {
    th: "th_TH",
    en: "en_US",
    zh: "zh_CN",
    hi: "hi_IN",
    es: "es_ES",
    fr: "fr_FR",
    ar: "ar_AR",
    bn: "bn_BD",
    pt: "pt_PT",
    ru: "ru_RU",
    ur: "ur_PK"
  };

  return locales[lang] ?? lang;
}

function structuredData(page: SeoPage) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}#website`,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: "th",
        description: LANDING_SEO_PAGE.description,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}#software`,
        name: SITE_NAME,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        runtimePlatform: "Web browser",
        url: SITE_URL,
        downloadUrl: NPM_PACKAGE_URL,
        codeRepository: GITHUB_REPOSITORY_URL,
        programmingLanguage: ["TypeScript", "JavaScript"],
        license: `${GITHUB_REPOSITORY_URL}/blob/main/LICENSE`,
        description: LANDING_SEO_PAGE.description,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD"
        }
      },
      {
        "@type": "WebPage",
        "@id": `${page.url}#webpage`,
        name: page.title,
        url: page.url,
        description: page.description,
        inLanguage: page.lang,
        isPartOf: {
          "@id": `${SITE_URL}#website`
        },
        about: {
          "@id": `${SITE_URL}#software`
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: SEO_IMAGE_URL
        }
      }
    ]
  };
}

export function renderSeoHead(page: SeoPage, assetTags = ""): string {
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const url = escapeHtml(page.url);
  const ogLocale = escapeHtml(openGraphLocale(page.lang));
  const pageType = page.key === "home" ? "website" : "article";
  const assets = assetTags.trim();

  return [
    '<meta charset="UTF-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta name="keywords" content="${escapeHtml(SEO_KEYWORDS.join(", "))}" />`,
    '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />',
    '<meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />',
    '<meta name="author" content="1moby" />',
    `<meta name="application-name" content="${SITE_NAME}" />`,
    '<meta name="theme-color" content="#0e372f" />',
    '<meta name="color-scheme" content="light" />',
    '<meta name="format-detection" content="telephone=no" />',
    `<link rel="canonical" href="${url}" />`,
    alternateLinks(),
    `<link rel="author" href="${GITHUB_REPOSITORY_URL}" />`,
    `<link rel="license" href="${GITHUB_REPOSITORY_URL}/blob/main/LICENSE" />`,
    `<meta property="og:type" content="${pageType}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:locale" content="${ogLocale}" />`,
    `<meta property="og:image" content="${SEO_IMAGE_URL}" />`,
    '<meta property="og:image:type" content="image/svg+xml" />',
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    '<meta property="og:image:alt" content="thai-address browser-only Thai address parser" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${SEO_IMAGE_URL}" />`,
    '<meta name="twitter:image:alt" content="thai-address browser-only Thai address parser" />',
    `<script type="application/ld+json">${escapeJsonForHtml(structuredData(page))}</script>`,
    assets
  ]
    .filter(Boolean)
    .join("\n");
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderSitemapXml(): string {
  const alternates = SEO_PAGES.map(
    (page) => `    <xhtml:link rel="alternate" hreflang="${xmlEscape(page.lang)}" href="${xmlEscape(page.url)}" />`
  ).join("\n");
  const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(SITE_URL)}" />`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${SEO_PAGES.map(
  (page) => `  <url>
    <loc>${xmlEscape(page.url)}</loc>
${alternates}
${xDefault}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
).join("\n")}
</urlset>
`;
}

export function renderRobotsTxt(): string {
  return `User-agent: *
Allow: /
Sitemap: ${SITE_URL}sitemap.xml
`;
}
