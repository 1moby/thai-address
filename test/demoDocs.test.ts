import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  DOC_LANGUAGES,
  SUPPORTED_ADDRESS_INPUT_LANGUAGES,
  THAI_LANDING_COPY,
  getDocBySlug
} from "../demo/src/docs";

describe("documentation site content", () => {
  it("publishes a Thai landing page with ten localized documentation pages", () => {
    expect(THAI_LANDING_COPY.locale).toBe("th");
    expect(THAI_LANDING_COPY.title).toContain("ที่อยู่ไทย");
    expect(DOC_LANGUAGES.map((language) => language.slug)).toEqual([
      "en",
      "zh",
      "hi",
      "es",
      "fr",
      "ar",
      "bn",
      "pt",
      "ru",
      "ur"
    ]);
  });

  it("marks every localized page as docs-only while keeping parser input support Thai and English only", () => {
    expect(SUPPORTED_ADDRESS_INPUT_LANGUAGES).toEqual(["th", "en"]);

    for (const language of DOC_LANGUAGES) {
      const page = getDocBySlug(language.slug);
      expect(page).toBeDefined();
      expect(page?.route).toBe(`/docs/${language.slug}/`);
      expect(page?.supportedAddressInputLanguages).toEqual(["th", "en"]);
      expect(page?.isDocumentationOnly).toBe(true);
    }
  });

  it("uses native language labels with flags for public language links", () => {
    const appSource = readFileSync(join(process.cwd(), "demo/src/App.tsx"), "utf8");

    expect(DOC_LANGUAGES.map((language) => [language.slug, language.flag, language.nativeName])).toEqual([
      ["en", "🇬🇧", "English"],
      ["zh", "🇨🇳", "中文"],
      ["hi", "🇮🇳", "हिन्दी"],
      ["es", "🇪🇸", "Español"],
      ["fr", "🇫🇷", "Français"],
      ["ar", "🇸🇦", "العربية"],
      ["bn", "🇧🇩", "বাংলা"],
      ["pt", "🇵🇹", "Português"],
      ["ru", "🇷🇺", "Русский"],
      ["ur", "🇵🇰", "اردو"]
    ]);
    expect(appSource).toContain("{language.flag}");
    expect(appSource).toContain("{language.nativeName}");
    expect(appSource).not.toContain("{language.thaiName}");
  });

  it("is prepared for GitHub Pages under the 1moby organization", () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));

    expect(pkg.repository).toEqual({
      type: "git",
      url: "git+https://github.com/1moby/thai-address.git"
    });
    expect(pkg.homepage).toBe("https://1moby.github.io/thai-address/");
    expect(pkg.bugs).toEqual({
      url: "https://github.com/1moby/thai-address/issues"
    });
  });

  it("documents the 1moby npm package name and package page", () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const appSource = readFileSync(join(process.cwd(), "demo/src/App.tsx"), "utf8");

    expect(pkg.name).toBe("@1moby/thai-address");
    expect(pkg.publishConfig).toEqual({ access: "public" });
    expect(readme).toContain("https://www.npmjs.com/package/@1moby/thai-address");
    expect(readme).toContain("npm install @1moby/thai-address");
    expect(readme).toContain('from "@1moby/thai-address"');
    expect(readme).toContain('from "@1moby/thai-address/react"');
    expect(readme).toContain('from "@1moby/thai-address/dom"');
    expect(appSource).toContain("npm install @1moby/thai-address");
    expect(appSource).toContain('from "@1moby/thai-address"');
  });

  it("ships source SEO tags for the Thai landing page", () => {
    const html = readFileSync(join(process.cwd(), "demo/index.html"), "utf8");

    expect(html).toContain('<link rel="canonical" href="https://1moby.github.io/thai-address/" />');
    expect(html).toContain('<meta property="og:url" content="https://1moby.github.io/thai-address/" />');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />');
    expect(html).toContain('<script type="application/ld+json">');
  });

  it("builds static SEO entry points for GitHub Pages", () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));

    expect(pkg.scripts["build:seo"]).toBe("tsx src/build/buildDemoSeo.ts");
    expect(pkg.scripts.build).toContain("npm run build:seo");
    expect(existsSync(join(process.cwd(), "src/build/buildDemoSeo.ts"))).toBe(true);
  });
});
