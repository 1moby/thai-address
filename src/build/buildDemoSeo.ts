import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  LANDING_SEO_PAGE,
  SEO_PAGES,
  renderRobotsTxt,
  renderSeoHead,
  renderSitemapXml
} from "../../demo/src/seo.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DIST = path.join(ROOT, "demo-dist");

function extractBody(html: string): string {
  const match = html.match(/<body[\s\S]*<\/body>/iu);
  if (!match) {
    throw new Error("Unable to find body in built demo HTML.");
  }

  return match[0];
}

function extractAssetTags(html: string): string {
  const head = html.match(/<head>([\s\S]*?)<\/head>/iu)?.[1];
  if (!head) {
    throw new Error("Unable to find head in built demo HTML.");
  }

  return head
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) =>
        /<script\b[^>]*\bsrc=/iu.test(line) ||
        /<link\b[^>]*\brel=["'](?:stylesheet|modulepreload|preload|icon|apple-touch-icon)["']/iu.test(line)
    )
    .join("\n");
}

function indent(text: string, spaces: number): string {
  const prefix = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => (line ? `${prefix}${line}` : line))
    .join("\n");
}

function renderPageHtml(body: string, assetTags: string, page = LANDING_SEO_PAGE): string {
  return `<!doctype html>
<html lang="${page.lang}" dir="${page.dir}">
  <head>
${indent(renderSeoHead(page, assetTags), 4)}
  </head>
  ${body}
</html>
`;
}

async function writePage(relativePath: string, html: string): Promise<void> {
  const filePath = path.join(DIST, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, html);
}

async function main(): Promise<void> {
  const builtIndex = await readFile(path.join(DIST, "index.html"), "utf8");
  const body = extractBody(builtIndex);
  const assetTags = extractAssetTags(builtIndex);

  for (const page of SEO_PAGES) {
    const relativePath = page.path === "/" ? "index.html" : path.join(page.path.slice(1), "index.html");
    await writePage(relativePath, renderPageHtml(body, assetTags, page));
  }

  await writePage("404.html", renderPageHtml(body, assetTags, LANDING_SEO_PAGE));
  await writePage("sitemap.xml", renderSitemapXml());
  await writePage("robots.txt", renderRobotsTxt());

  console.log(
    JSON.stringify(
      {
        htmlPages: SEO_PAGES.length,
        sitemap: "demo-dist/sitemap.xml",
        robots: "demo-dist/robots.txt"
      },
      null,
      2
    )
  );
}

await main();
