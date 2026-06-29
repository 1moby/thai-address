import {
  BookOpen,
  Check,
  Copy,
  Database,
  FileText,
  Globe2,
  Home,
  Languages,
  MapPin,
  Package,
  PackageCheck,
  Search,
  ShieldCheck,
  Zap
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ThaiAddressSuggestion } from "../../src";
import { useThaiAddress } from "../../src/react";
import {
  DOC_LANGUAGES,
  SUPPORTED_ADDRESS_INPUT_LANGUAGES,
  THAI_LANDING_COPY,
  getDocBySlug,
  type LocalizedDocPage
} from "./docs";
import { buildParsedAddressJson, buildParsedFieldRows } from "./displayFields";
import type { ParsedFieldRow } from "./displayFields";
import { LANDING_SEO_PAGE, getDocSlugFromPath, getSeoPageForPath, withSiteBasePath } from "./seo";

const DATA_URL = "./data/thai-address-core.json.gz";
const GITHUB_URL = "https://github.com/1moby/thai-address";
const NPM_INSTALL = "npm install @1moby/thai-address";
const CORE_SNIPPET = `import { createThaiAddressIndex, loadThaiAddressData } from "@1moby/thai-address";

const data = await loadThaiAddressData("/data/thai-address-core.json.gz");
const index = createThaiAddressIndex(data);

const result = index.parse(
  "270 ถนนพระรามที่ 6 แขวงทุ่งพญาไท เขตราชเทวี กรุงเทพมหานคร 10400"
);`;

export const SAMPLES = [
  "87/2 อาคาร CRC All Seasons Place ชั้น 40   ถ.วิทยุ แขวงลุมพินี เขตปทุมวัน จังหวัดกรุงเทพมหานคร โทรศัพท์ 0-2626-2300 โทรสาร 0-2626-2306, 0-2626-2301",
  "31    ถนนภูเก็ต ตำบลตลาดใหญ่ อำเภอเมืองภูเก็ต จังหวัดภูเก็ต 83000 โทรศัพท์ 07 621 1501",
  "18/21     ตำบลหอรัตนไชย อำเภอพระนครศรีอยุธยา จังหวัดพระนครศรีอยุธยา 13000 โทรศัพท์ 03 525 2243",
  "73     ตำบลปากเพรียว อำเภอเมืองสระบุรี จังหวัดสระบุรี 18000 โทรศัพท์ 03 621 1351",
  "314     ตำบลหน้าเมือง อำเภอเมืองปราจีนบุรี จังหวัดปราจีนบุรี 25000 โทรศัพท์ 03 721 1005",
  "900    ถนนนวมินทร์ แขวงคลองกุ่ม เขตบึงกุ่ม จังหวัดกรุงเทพมหานคร โทรศัพท์ 02-290-1500 โทรสาร 02-290-1599",
  "6/10 อาคารพิพัฒนสิน ชั้น 16   ถ.นราธิวาสราชนครินทร์ แขวงทุ่งมหาเมฆ เขตสาทร จังหวัดกรุงเทพมหานคร โทรศัพท์ 0 2678 3900 โทรสาร 0 2678 3904",
  "356 อาคารชั้น 1 อาคารดับเบิ้ลยูวัน   ถ.นราธิวาสราชนครินทร์ แขวงช่องนนทรี เขตยานนาวา จังหวัดกรุงเทพมหานคร โทรศัพท์ 02-678-0666 โทรสาร 02-678-0665",
  "35    ถนนสุขุมวิท แขวงคลองเตยน เขตวัฒนา จังหวัดกรุงเทพมหานคร 10110 โทรศัพท์ 0-2208-4232,0-2208-4204,0-2208-4241,0-2208-4246,4219,0-2208-4227",
  "98 อาคารสาทรสแคว์ ออฟฟิส ทาวเวอร์ ชั้น 32-35   ถนนสาทรเหนือ แขวงสีลม เขตบางรัก จังหวัดกรุงเทพมหานคร 10500 โทรศัพท์ 02-163-2999"
];

function FieldRow({ label, value, valueEn }: ParsedFieldRow) {
  return (
    <div className="field-row">
      <span>{label}</span>
      <strong>{value || "..."}</strong>
      {valueEn ? <small>{valueEn}</small> : null}
    </div>
  );
}

function useRouteKey() {
  const [route, setRoute] = useState(() => `${window.location.pathname}${window.location.hash}`);

  useEffect(() => {
    const syncRoute = () => setRoute(`${window.location.pathname}${window.location.hash}`);
    window.addEventListener("hashchange", syncRoute);
    window.addEventListener("popstate", syncRoute);
    return () => {
      window.removeEventListener("hashchange", syncRoute);
      window.removeEventListener("popstate", syncRoute);
    };
  }, []);

  return route;
}

function docSlugFromRoute(): string | undefined {
  return window.location.hash.match(/^#\/docs\/([^/?#]+)/)?.[1] ?? getDocSlugFromPath(window.location.pathname);
}

function SiteNav({ compact = false }: { compact?: boolean }) {
  return (
    <nav className={compact ? "site-nav compact" : "site-nav"} aria-label="เมนูหลัก">
      <a href={withSiteBasePath("/")}>
        <Home aria-hidden="true" />
        หน้าแรก
      </a>
      <a href={withSiteBasePath("/docs/en/")}>
        <BookOpen aria-hidden="true" />
        เอกสาร
      </a>
      <a href={GITHUB_URL}>
        <Package aria-hidden="true" />
        กิตฮับ
      </a>
    </nav>
  );
}

function LanguageLinks({ currentSlug }: { currentSlug?: string }) {
  return (
    <div className="language-grid" aria-label="เอกสารหลายภาษา">
      {DOC_LANGUAGES.map((language) => (
        <a
          key={language.slug}
          href={withSiteBasePath(language.route)}
          className={currentSlug === language.slug ? "language-link active" : "language-link"}
          hrefLang={language.htmlLang}
        >
          <span className="language-title">
            <span className="language-flag" aria-hidden="true">
              {language.flag}
            </span>
            {language.nativeName}
          </span>
          <small>{`Docs · ${language.htmlLang}`}</small>
        </a>
      ))}
    </div>
  );
}

function LandingPage() {
  const { index, loading, error } = useThaiAddress({ dataUrl: DATA_URL });
  const [addressText, setAddressText] = useState(SAMPLES[0]);
  const [searchText, setSearchText] = useState("ทุ่งพญาไท ราชเทวี");
  const [selected, setSelected] = useState<ThaiAddressSuggestion | undefined>();
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => index?.parse(addressText), [addressText, index]);
  const fieldRows = useMemo(() => buildParsedFieldRows(parsed), [parsed]);
  const suggestions = useMemo(
    () => (index && searchText.trim() ? index.search(searchText, { limit: 7 }) : []),
    [index, searchText]
  );
  const json = useMemo(() => buildParsedAddressJson(parsed), [parsed]);

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(json);
    } catch {
      const fallback = document.createElement("textarea");
      fallback.value = json;
      fallback.style.position = "fixed";
      fallback.style.left = "-9999px";
      document.body.append(fallback);
      fallback.focus();
      fallback.select();
      document.execCommand("copy");
      fallback.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  function selectSuggestion(suggestion: ThaiAddressSuggestion) {
    setSelected(suggestion);
    setSearchText(suggestion.label);
    setAddressText((current) => {
      const base = current.replace(/(?:แขวง|ตำบล|เขต|อำเภอ|จังหวัด|จ\.).*$/u, "").trim();
      return `${base} ${suggestion.label}`.trim();
    });
  }

  return (
    <main className="site-shell">
      <header className="hero-band">
        <div className="topline">
          <a className="brand-mark" href={withSiteBasePath("/")}>
            thai-address
          </a>
          <SiteNav />
        </div>

        <div className="hero-grid">
          <section className="hero-copy" aria-labelledby="landing-title">
            <p className="eyebrow">ไลบรารีที่อยู่ไทยฝั่งเบราว์เซอร์</p>
            <h1 id="landing-title">{THAI_LANDING_COPY.title}</h1>
            <p>{THAI_LANDING_COPY.lead}</p>
            <div className="hero-actions">
              <a href="#demo" className="primary-action">
                ทดลองใช้งาน
              </a>
              <a href="#languages" className="secondary-action">
                ดูเอกสารหลายภาษา
              </a>
            </div>
          </section>

          <aside className="signal-board" aria-label="สรุปความสามารถ">
            <div>
              <ShieldCheck aria-hidden="true" />
              <span>ประมวลผลในเครื่องผู้ใช้</span>
            </div>
            <div>
              <Database aria-hidden="true" />
              <span>ข้อมูลบีบอัดประมาณ 121 กิโลไบต์</span>
            </div>
            <div>
              <Zap aria-hidden="true" />
              <span>ค้นหาเขตการปกครองได้ทันที</span>
            </div>
            <div>
              <Languages aria-hidden="true" />
              <span>{THAI_LANDING_COPY.parserScope}</span>
            </div>
          </aside>
        </div>
      </header>

      <section id="languages" className="content-band language-band" aria-labelledby="language-title">
        <div className="section-heading">
          <Globe2 aria-hidden="true" />
          <div>
            <p className="eyebrow">เอกสารแปล</p>
            <h2 id="language-title">{THAI_LANDING_COPY.languageHeading}</h2>
          </div>
        </div>
        <LanguageLinks />
      </section>

      <section id="demo" className="content-band workbench" aria-label="เครื่องมือทดลองแยกที่อยู่">
        <div className="workbench-head">
          <div>
            <p className="eyebrow">ทดลองจริงในเบราว์เซอร์</p>
            <h2>{THAI_LANDING_COPY.demoHeading}</h2>
          </div>
          <div className="status-strip" aria-live="polite">
            <span className={loading ? "dot pending" : error ? "dot danger" : "dot ok"} />
            {loading ? "กำลังโหลดข้อมูล" : error ? "โหลดข้อมูลไม่ได้" : "ข้อมูลกรมการปกครองพร้อมใช้"}
          </div>
        </div>

        <div className="main-grid">
          <section className="entry-panel" aria-label="ช่องกรอกที่อยู่">
            <div className="panel-heading">
              <MapPin aria-hidden="true" />
              <h3>วางที่อยู่</h3>
            </div>
            <textarea
              value={addressText}
              onChange={(event) => setAddressText(event.target.value)}
              spellCheck={false}
              aria-label="วางที่อยู่"
            />
            <div className="sample-row" aria-label="ตัวอย่างที่อยู่">
              {SAMPLES.map((sample) => (
                <button key={sample} type="button" onClick={() => setAddressText(sample)}>
                  {sample}
                </button>
              ))}
            </div>

            <div className="search-block">
              <label htmlFor="admin-search">
                <Search aria-hidden="true" />
                ค้นหาพื้นที่ปกครอง
              </label>
              <input
                id="admin-search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="ตำบล อำเภอ จังหวัด"
                autoComplete="off"
              />
              <div className="suggestion-list" role="listbox">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.code}
                    type="button"
                    role="option"
                    aria-selected={selected?.code === suggestion.code}
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    <span>{suggestion.label}</span>
                    <small>{suggestion.labelEn ?? suggestion.code}</small>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="fields-panel" aria-label="ฟิลด์ที่แยกได้">
            <div className="panel-heading">
              <PackageCheck aria-hidden="true" />
              <h3>ฟิลด์ที่ได้</h3>
              <span className="confidence">
                {parsed ? `${Math.round(parsed.confidence * 100)}%` : "0%"}
              </span>
            </div>
            <div className="field-grid">
              {fieldRows.map((row) => (
                <FieldRow key={row.label} {...row} />
              ))}
            </div>

            <div className="payload-box">
              <div className="payload-head">
                <span>
                  <FileText aria-hidden="true" />
                  ผลลัพธ์แบบเจซัน
                </span>
                <button type="button" onClick={copyJson}>
                  {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                  {copied ? "คัดลอกแล้ว" : "คัดลอก"}
                </button>
              </div>
              <pre>{json}</pre>
            </div>
          </section>
        </div>
      </section>

      <section className="content-band publish-band" aria-labelledby="publish-title">
        <div className="section-heading">
          <PackageCheck aria-hidden="true" />
          <div>
            <p className="eyebrow">พร้อมเผยแพร่</p>
            <h2 id="publish-title">{THAI_LANDING_COPY.dataHeading}</h2>
          </div>
        </div>
        <div className="publish-grid">
          <p>แพ็กเกจมีเอพีไอหลัก ฮุกและคอมโพเนนต์สำหรับรีแอ็กต์ ตัวช่วยสำหรับดีโอเอ็ม และข้อมูลราชการบีบอัดสำหรับโหลดบนเบราว์เซอร์</p>
          <code>{NPM_INSTALL}</code>
          <a href={GITHUB_URL}>เปิดโครงการบนกิตฮับ</a>
        </div>
      </section>
    </main>
  );
}

function DocPage({ doc }: { doc: LocalizedDocPage }) {
  return (
    <main className="site-shell doc-shell" lang={doc.htmlLang} dir={doc.dir}>
      <header className="doc-header">
        <div className="topline">
          <a className="brand-mark" href={withSiteBasePath("/")}>
            thai-address
          </a>
          <SiteNav compact />
        </div>
        <p className="eyebrow">{doc.nativeName}</p>
        <h1>{doc.title}</h1>
        <p>{doc.lead}</p>
        <div className="scope-note">
          <ShieldCheck aria-hidden="true" />
          <span>{doc.supportNote}</span>
        </div>
      </header>

      <article className="doc-layout">
        <aside className="doc-aside" aria-label="Language pages">
          <h2>เอกสาร 10 ภาษา</h2>
          <LanguageLinks currentSlug={doc.slug} />
        </aside>

        <div className="doc-content">
          <section>
            <h2>{doc.installTitle}</h2>
            <p>{doc.installBody}</p>
            <pre className="code-block">{NPM_INSTALL}</pre>
          </section>

          <section>
            <h2>{doc.usageTitle}</h2>
            <p>{doc.usageBody}</p>
            <pre className="code-block">{CORE_SNIPPET}</pre>
          </section>

          <section>
            <h2>{doc.dataTitle}</h2>
            <p>{doc.dataBody}</p>
            <p className="support-line">
              {SUPPORTED_ADDRESS_INPUT_LANGUAGES.join(" + ")} address input only
            </p>
          </section>

          <section>
            <h2>{doc.fieldsTitle}</h2>
            <ul className="field-list">
              {doc.fields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </section>
        </div>
      </article>
    </main>
  );
}

export function App() {
  useRouteKey();
  const doc = getDocBySlug(docSlugFromRoute() ?? "");
  const seoPage = doc ? getSeoPageForPath(doc.route) : LANDING_SEO_PAGE;

  useEffect(() => {
    document.documentElement.lang = doc?.htmlLang ?? "th";
    document.documentElement.dir = doc?.dir ?? "ltr";
    document.title = seoPage.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", seoPage.description);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", seoPage.url);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", seoPage.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", seoPage.description);
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", seoPage.url);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", seoPage.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", seoPage.description);
  }, [doc, seoPage]);

  return doc ? <DocPage doc={doc} /> : <LandingPage />;
}
