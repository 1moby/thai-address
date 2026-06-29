import {
  LANDING_SEO_PAGE,
  SEO_IMAGE_URL,
  SEO_PAGES,
  SITE_URL,
  renderSeoHead,
  renderSitemapXml
} from "../demo/src/seo";

describe("demo SEO metadata", () => {
  it("defines canonical URLs for the landing page and all localized docs", () => {
    expect(SITE_URL).toBe("https://1moby.github.io/thai-address/");
    expect(SEO_IMAGE_URL).toBe("https://1moby.github.io/thai-address/og-image.svg");
    expect(SEO_PAGES.map((page) => page.path)).toEqual([
      "/",
      "/docs/en/",
      "/docs/zh/",
      "/docs/hi/",
      "/docs/es/",
      "/docs/fr/",
      "/docs/ar/",
      "/docs/bn/",
      "/docs/pt/",
      "/docs/ru/",
      "/docs/ur/"
    ]);
  });

  it("renders crawlable head tags with one structured-data block", () => {
    const head = renderSeoHead(
      LANDING_SEO_PAGE,
      '<script type="module" crossorigin src="/thai-address/assets/index.js"></script>'
    );

    expect(head).toContain('<link rel="canonical" href="https://1moby.github.io/thai-address/" />');
    expect(head).toContain('<meta property="og:image" content="https://1moby.github.io/thai-address/og-image.svg" />');
    expect(head).toContain('<meta name="twitter:card" content="summary_large_image" />');
    expect(head.match(/type="application\/ld\+json"/gu)).toHaveLength(1);
  });

  it("renders a sitemap with every static page URL", () => {
    const sitemap = renderSitemapXml();

    for (const page of SEO_PAGES) {
      expect(sitemap).toContain(`<loc>${page.url}</loc>`);
    }
    expect(sitemap).toContain('<xhtml:link rel="alternate" hreflang="x-default" href="https://1moby.github.io/thai-address/" />');
  });
});
