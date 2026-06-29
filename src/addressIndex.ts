import {
  compactSearchKey,
  normalizeForSearch,
  stripAddressWords,
  toArabicDigits
} from "./normalize.js";
import type {
  ParsedAddressFields,
  ThaiAddressData,
  ThaiAddressIndex,
  ThaiAddressParseResult,
  ThaiAddressPart,
  ThaiAddressSearchOptions,
  ThaiAddressSuggestion
} from "./types.js";

interface IndexedSuggestion extends ThaiAddressSuggestion {
  searchKey: string;
  compactKey: string;
  parts: string[];
}

interface PreparedQuery {
  terms: string[];
  compactQuery: string;
}

interface InputContext {
  normalized: string;
  stripped: string;
  tokens: string[];
  explicitAdmin: ExplicitAdminParts;
}

interface ExplicitAdminParts {
  subdistrict?: string;
  district?: string;
  province?: string;
}

interface PartMatch {
  score: number;
  exact: boolean;
}

interface ParsedCandidate {
  suggestion: IndexedSuggestion;
  score: number;
  province?: PartMatch;
  district?: PartMatch;
  subdistrict?: PartMatch;
}

function isBangkok(province: ThaiAddressPart): boolean {
  return province.code === "10";
}

function formatLabel(subdistrict: ThaiAddressPart, district: ThaiAddressPart, province: ThaiAddressPart): string {
  if (isBangkok(province)) {
    return `แขวง${subdistrict.name} เขต${district.name} ${province.name}`;
  }

  return `ตำบล${subdistrict.name} อำเภอ${district.name} จังหวัด${province.name}`;
}

function formatLabelEn(subdistrict: ThaiAddressPart, district: ThaiAddressPart, province: ThaiAddressPart): string | undefined {
  if (!subdistrict.nameEn || !district.nameEn || !province.nameEn) {
    return undefined;
  }

  return `${subdistrict.nameEn}, ${district.nameEn}, ${province.nameEn}`;
}

function publicPart(part: ThaiAddressPart): ThaiAddressPart {
  return {
    code: part.code,
    name: part.name,
    ...(part.nameEn ? { nameEn: part.nameEn } : {})
  };
}

function publicSuggestion(suggestion: IndexedSuggestion, score = suggestion.score): ThaiAddressSuggestion {
  return {
    code: suggestion.code,
    label: suggestion.label,
    ...(suggestion.labelEn ? { labelEn: suggestion.labelEn } : {}),
    ...(suggestion.postalCode ? { postalCode: suggestion.postalCode } : {}),
    score,
    subdistrict: publicPart(suggestion.subdistrict),
    district: publicPart(suggestion.district),
    province: publicPart(suggestion.province)
  };
}

function buildSuggestion(
  code: string,
  subdistrict: ThaiAddressPart,
  district: ThaiAddressPart,
  province: ThaiAddressPart,
  postalCode?: string
): IndexedSuggestion {
  const label = formatLabel(subdistrict, district, province);
  const labelEn = formatLabelEn(subdistrict, district, province);
  const searchKey = stripAddressWords(
    [
      subdistrict.name,
      district.name,
      province.name,
      subdistrict.nameEn,
      district.nameEn,
      province.nameEn,
      label,
      labelEn
    ]
      .filter(Boolean)
      .join(" ")
  );

  return {
    code,
    label,
    ...(labelEn ? { labelEn } : {}),
    ...(postalCode ? { postalCode } : {}),
    score: 0,
    subdistrict,
    district,
    province,
    searchKey,
    compactKey: searchKey.replace(/\s+/g, ""),
    parts: [
      stripAddressWords(subdistrict.name),
      stripAddressWords(district.name),
      stripAddressWords(province.name),
      subdistrict.nameEn ? stripAddressWords(subdistrict.nameEn) : "",
      district.nameEn ? stripAddressWords(district.nameEn) : "",
      province.nameEn ? stripAddressWords(province.nameEn) : ""
    ].filter(Boolean)
  };
}

function prepareQuery(query: string): PreparedQuery | undefined {
  const normalized = stripAddressWords(query);
  if (!normalized) {
    return undefined;
  }

  return {
    terms: normalized.split(/\s+/).filter(Boolean),
    compactQuery: compactSearchKey(query)
  };
}

function scoreSuggestion(suggestion: IndexedSuggestion, prepared: PreparedQuery): number {
  let score = 0;

  for (const term of prepared.terms) {
    const compactTerm = term.replace(/\s+/g, "");
    const exactPart = suggestion.parts.some((part) => part === term);
    const startsPart = suggestion.parts.some((part) => part.startsWith(term));
    const containsPart = suggestion.parts.some((part) => part.includes(term));
    const containsKey = suggestion.searchKey.includes(term) || suggestion.compactKey.includes(compactTerm);

    if (exactPart) {
      score += 50;
    } else if (startsPart) {
      score += 30;
    } else if (containsPart || containsKey) {
      score += 10;
    } else {
      return 0;
    }
  }

  if (suggestion.compactKey.includes(prepared.compactQuery)) {
    score += 20;
  }

  return score;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeForFieldExtraction(value: string): string {
  return toArabicDigits(value)
    .normalize("NFC")
    .replace(/[‐‑‒–—―−]/g, "-")
    .replace(/[(){}\[\],;:|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeForContactExtraction(value: string): string {
  return toArabicDigits(value)
    .normalize("NFC")
    .replace(/[‐‑‒–—―−]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanExtractedValue(value: string): string | undefined {
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned || undefined;
}

function cleanHouseNumber(value: string): string {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (/^[0-9]+(?:\s+[0-9]+)+$/.test(cleaned)) {
    return cleaned.replace(/\s+/g, "");
  }

  return /\s-\s/.test(cleaned) ? cleaned.replace(/\s*-\s*/g, " - ") : cleaned.replace(/\s*-\s*/g, "-");
}

function cleanContactValue(value: string): string | undefined {
  const cleaned = value
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s*,\s*/g, ", ")
    .replace(/[,\s]+$/g, "")
    .trim();
  return cleaned || undefined;
}

function extractContactField(input: string, labels: string[], stops: string[]): string | undefined {
  const normalized = normalizeForContactExtraction(input);
  const labelPattern = labels.map(escapeRegex).join("|");
  const stopPattern = stops.map(escapeRegex).join("|");
  const pattern = new RegExp(`(?:${labelPattern})\\s*([^\\n]+?)(?=\\s*(?:${stopPattern})\\s*|$)`, "iu");
  const match = normalized.match(pattern);
  return match ? cleanContactValue(match[1]) : undefined;
}

function extractAllAfterLabel(
  input: string,
  labels: string[],
  stops: string[],
  extraStopPatterns: string[] = []
): string[] {
  const labelPattern = labels.map(escapeRegex).join("|");
  const stopPattern = [...stops.map(escapeRegex), ...extraStopPatterns].filter(Boolean).join("|");
  const pattern = new RegExp(`(?:${labelPattern})\\s*([^,\\n]*?)(?=\\s*(?:${stopPattern})\\s*|$)`, "giu");

  return Array.from(input.matchAll(pattern), (match) => cleanExtractedValue(match[1])).filter(
    (value): value is string => Boolean(value)
  );
}

function extractAfterLabel(input: string, labels: string[], stops: string[], extraStopPatterns: string[] = []): string | undefined {
  return extractAllAfterLabel(input, labels, stops, extraStopPatterns)[0];
}

function extractLastAfterLabel(
  input: string,
  labels: string[],
  stops: string[],
  extraStopPatterns: string[] = []
): string | undefined {
  return extractAllAfterLabel(input, labels, stops, extraStopPatterns).at(-1);
}

function removeAllAfterLabel(
  input: string,
  labels: string[],
  stops: string[],
  extraStopPatterns: string[] = []
): string {
  const labelPattern = labels.map(escapeRegex).join("|");
  const stopPattern = [...stops.map(escapeRegex), ...extraStopPatterns].filter(Boolean).join("|");
  const pattern = new RegExp(`(?:${labelPattern})\\s*[^,\\n]*?(?=\\s*(?:${stopPattern})\\s*|$)`, "giu");

  return input.replace(pattern, " ");
}

function extractFloor(input: string): string | undefined {
  const match = input.match(/ชั้น(?:ที่)?\s*([^\s,]+)/u);
  return match ? cleanExtractedValue(match[1]) : undefined;
}

function extractExplicitAdminParts(input: string): ExplicitAdminParts {
  const normalized = normalizeForSearch(input);
  const contactStops = ["โทรศัพท์", "โทรสาร", "โทร", "tel", "telephone", "fax"];
  const provinceStops = [...contactStops];
  const districtStops = ["จังหวัด", "จ.", ...provinceStops];
  const subdistrictStops = ["เขต", "อำเภอ", "อ.", ...districtStops];

  return {
    subdistrict: extractAfterLabel(normalized, ["แขวง", "ตำบล", "ต."], subdistrictStops),
    district: extractAfterLabel(normalized, ["เขต", "อำเภอ", "อ."], districtStops),
    province: extractAfterLabel(normalized, ["จังหวัด", "จ."], provinceStops)
  };
}

function formatRoadValue(value: string): string {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned || /[ก-๙]/.test(cleaned)) {
    return cleaned;
  }

  return cleaned
    .split(" ")
    .map((part) =>
      /^(?:i|ii|iii|iv|v|vi|vii|viii|ix|x)$/i.test(part)
        ? part.toUpperCase()
        : `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`
    )
    .join(" ");
}

function extractFields(input: string): ParsedAddressFields {
  const normalized = normalizeForFieldExtraction(input);
  const fields: ParsedAddressFields = {};
  const houseNumberCorePattern = "[0-9]+(?:[/-][0-9A-Za-zก-ฮ]+)*";
  const houseNumberPattern = `${houseNumberCorePattern}(?:\\s+-\\s+${houseNumberCorePattern})?`;
  const startsWithDetail = /^(?:ห้องเลขที่|ห้อง|ชั้น|อาคาร)/u.test(normalized);
  const houseBeforeRoadMatch = normalized.match(new RegExp(`(?:^|\\s)(${houseNumberPattern})\\s+(?=(?:ถนน|ถ\\.))`, "u"));
  const splitHouseBeforeRoadMatch = normalized.match(/(?:^|\s)([0-9]+(?:\s+[0-9]+)+)\s+(?=(?:ถนน|ถ\.))/u);
  const genericHouseMatch = normalized.match(new RegExp(`(?:บ้านเลขที่\\s*)?(${houseNumberPattern})`, "u"));
  const roadHouseMatch = splitHouseBeforeRoadMatch ?? houseBeforeRoadMatch;
  const houseMatch = startsWithDetail && houseBeforeRoadMatch
    ? houseBeforeRoadMatch
    : splitHouseBeforeRoadMatch ?? genericHouseMatch ?? roadHouseMatch;
  const mooMatch = normalized.match(/(?:หมู่(?:ที่)?|ม\.|moo)\s*([0-9]+)/iu);
  const postalMatch = normalized.match(/(?:^|\s)([0-9]{5})(?:\s|$)/);
  const roadPrefixLabels = ["ถนน", "ถ."];
  const roadStopLabels = [...roadPrefixLabels, "road", "rd."];
  const soiLabels = ["ซอย", "ซ.", "soi"];
  const mooLabels = ["หมู่ที่", "หมู่", "ม.", "moo"];
  const unitLabels = ["ห้องเลขที่", "ห้อง"];
  const floorLabels = ["ชั้น"];
  const buildingLabels = ["อาคาร"];
  const contactStops = ["โทรศัพท์", "โทรสาร", "โทร", "tel", "telephone", "fax"];
  const adminStops = [
    "แขวง",
    "เขต",
    "ตำบล",
    "ต.",
    "อำเภอ",
    "อ.",
    "จังหวัด",
    "จ.",
    "subdistrict",
    "sub-district",
    "district",
    "province",
    "khwaeng",
    "khet",
    "tambon",
    "amphoe"
  ];
  const addressStops = [
    ...roadStopLabels,
    ...soiLabels,
    ...mooLabels,
    ...adminStops,
    ...contactStops
  ];
  const houseBeforeRoadStop = `${houseNumberPattern}\\s*(?:${roadPrefixLabels.map(escapeRegex).join("|")})`;

  if (houseMatch) {
    fields.houseNumber = cleanHouseNumber(houseMatch[1]);
  }
  if (mooMatch) {
    fields.moo = mooMatch[1];
  }
  if (postalMatch) {
    fields.postalCode = postalMatch[1];
  }

  fields.unit = extractAfterLabel(normalized, unitLabels, [
    ...floorLabels,
    ...buildingLabels,
    ...addressStops
  ]);
  fields.floor = extractFloor(normalized);
  fields.building = extractLastAfterLabel(normalized, buildingLabels, [
    ...floorLabels,
    ...unitLabels,
    ...addressStops
  ], [houseBeforeRoadStop]);
  fields.soi = extractAfterLabel(normalized, soiLabels, [
    ...roadStopLabels,
    ...mooLabels,
    ...adminStops
  ]);
  fields.road = extractAfterLabel(normalized, roadPrefixLabels, [
    ...soiLabels,
    ...mooLabels,
    ...adminStops
  ]);
  fields.phone = extractContactField(input, ["โทรศัพท์", "telephone", "tel"], ["โทรสาร", "fax"]);

  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value)) as ParsedAddressFields;
}

function createInputContext(input: string, includeExplicitAdmin = true): InputContext {
  const normalized = normalizeForSearch(input);
  const stripped = stripAddressWords(input);
  return {
    normalized,
    stripped,
    tokens: stripped.split(/\s+/).filter(Boolean),
    explicitAdmin: includeExplicitAdmin ? extractExplicitAdminParts(input) : {}
  };
}

function containsWholePhrase(input: string, phrase: string): boolean {
  if (!phrase) {
    return false;
  }

  return new RegExp(`(^|\\s)${escapeRegex(phrase)}(?=\\s|$)`).test(input);
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function aliasesForPart(part: ThaiAddressPart): string[] {
  const aliases = [part.name, part.nameEn ?? ""];

  if (part.code === "10" && part.name === "กรุงเทพมหานคร") {
    aliases.push("กรุงเทพ", "กรุงเทพฯ", "กทม", "Bangkok", "BKK");
  }

  return unique(aliases.map(stripAddressWords));
}

function levenshteinDistance(a: string, b: string): number {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + substitutionCost
      );
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[b.length];
}

function fuzzyScore(alias: string, value: string): number {
  const maxLength = Math.max(alias.length, value.length);
  if (maxLength < 4) {
    return 0;
  }

  const maxDistance = Math.max(1, Math.floor(maxLength * 0.22));
  if (Math.abs(alias.length - value.length) > maxDistance) {
    return 0;
  }

  const distance = levenshteinDistance(alias, value);
  if (distance > maxDistance) {
    return 0;
  }

  return 1 - distance / maxLength;
}

function fuzzyPartMatch(context: InputContext, alias: string): number {
  const aliasTokens = alias.split(/\s+/).filter(Boolean);
  if (aliasTokens.length === 0 || context.tokens.length < aliasTokens.length) {
    return 0;
  }

  let best = 0;
  for (let index = 0; index <= context.tokens.length - aliasTokens.length; index += 1) {
    const phrase = context.tokens.slice(index, index + aliasTokens.length).join(" ");
    best = Math.max(best, fuzzyScore(alias, phrase));
  }

  return best;
}

function partialPrefixPartMatch(context: InputContext, alias: string): number {
  let best = 0;
  for (const token of context.tokens) {
    if (token.length < 6 || alias.length - token.length > 5) {
      continue;
    }

    const aliasPrefix = alias.slice(0, token.length);
    const distance = levenshteinDistance(aliasPrefix, token);
    if (alias.startsWith(token) || distance <= 2) {
      best = Math.max(best, 0.86);
    }
  }

  return best;
}

function matchPart(context: InputContext, part: ThaiAddressPart): PartMatch | undefined {
  let bestFuzzy = 0;

  for (const alias of aliasesForPart(part)) {
    if (containsWholePhrase(context.stripped, alias)) {
      return { score: 1, exact: true };
    }

    bestFuzzy = Math.max(bestFuzzy, partialPrefixPartMatch(context, alias));
    bestFuzzy = Math.max(bestFuzzy, fuzzyPartMatch(context, alias));
  }

  return bestFuzzy >= 0.78 ? { score: Math.min(0.92, bestFuzzy), exact: false } : undefined;
}

function scoreParsedCandidate(context: InputContext, suggestion: IndexedSuggestion): ParsedCandidate | undefined {
  if (
    (context.explicitAdmin.subdistrict && !matchPart(createInputContext(context.explicitAdmin.subdistrict, false), suggestion.subdistrict)) ||
    (context.explicitAdmin.district && !matchPart(createInputContext(context.explicitAdmin.district, false), suggestion.district)) ||
    (context.explicitAdmin.province && !matchPart(createInputContext(context.explicitAdmin.province, false), suggestion.province))
  ) {
    return undefined;
  }

  const province = matchPart(context, suggestion.province);
  const district = matchPart(context, suggestion.district);
  const subdistrict = matchPart(context, suggestion.subdistrict);

  if (!subdistrict && !(province && district)) {
    return undefined;
  }

  const score = (province?.score ?? 0) * 2 + (district?.score ?? 0) * 3 + (subdistrict?.score ?? 0) * 4;
  if (score < 4) {
    return undefined;
  }

  return {
    suggestion,
    score,
    province,
    district,
    subdistrict
  };
}

function parsedCandidateConfidence(candidate: ParsedCandidate): number {
  const weighted = candidate.score / 9;
  return Math.min(0.95, Math.max(0.55, 0.55 + weighted * 0.4));
}

function findBestParsedCandidate(context: InputContext, suggestions: IndexedSuggestion[]): ParsedCandidate | undefined {
  return suggestions
    .map((suggestion) => scoreParsedCandidate(context, suggestion))
    .filter((candidate): candidate is ParsedCandidate => Boolean(candidate))
    .sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return (
        (b.subdistrict?.score ?? 0) - (a.subdistrict?.score ?? 0) ||
        (b.district?.score ?? 0) - (a.district?.score ?? 0) ||
        (b.province?.score ?? 0) - (a.province?.score ?? 0) ||
        (a.suggestion.label > b.suggestion.label ? 1 : -1)
      );
    })[0];
}

function partMatchesText(input: string, part: ThaiAddressPart): boolean {
  return Boolean(matchPart(createInputContext(input), part));
}

function hasUnknownExplicitProvince(input: string, provinces: ThaiAddressPart[]): boolean {
  const normalized = normalizeForSearch(input);
  const explicit =
    normalized.match(/(?:จังหวัด|จ\.)\s*([^\s,]+)/) ??
    normalized.match(/(?:province|prov\.?)\s+([a-z]+(?:\s+[a-z]+){0,2})/);

  if (!explicit) {
    return false;
  }

  return !provinces.some((province) => partMatchesText(explicit[1], province));
}

function removeWholePhrase(input: string, phrase: string): string {
  return input.replace(new RegExp(`(^|\\s)${escapeRegex(phrase)}(?=\\s|$)`, "g"), " ");
}

function inferRoad(input: string, address: ThaiAddressSuggestion, fields: ParsedAddressFields): string | undefined {
  const houseNumberCorePattern = "[0-9]+(?:[/-][0-9a-zก-ฮ]+)*";
  const houseNumberPattern = `${houseNumberCorePattern}(?:\\s*-\\s*${houseNumberCorePattern})?`;
  const roadPrefixLabels = ["ถนน", "ถ."];
  const roadStopLabels = [...roadPrefixLabels, "road", "rd."];
  const soiLabels = ["ซอย", "ซ.", "soi"];
  const mooLabels = ["หมู่ที่", "หมู่", "ม.", "moo"];
  const unitLabels = ["ห้องเลขที่", "ห้อง"];
  const floorLabels = ["ชั้น"];
  const buildingLabels = ["อาคาร"];
  const contactStops = ["โทรศัพท์", "โทรสาร", "โทร", "tel", "telephone", "fax"];
  const adminStops = [
    "แขวง",
    "เขต",
    "ตำบล",
    "ต.",
    "อำเภอ",
    "อ.",
    "จังหวัด",
    "จ.",
    "subdistrict",
    "sub-district",
    "district",
    "province",
    "khwaeng",
    "khet",
    "tambon",
    "amphoe"
  ];
  const addressStops = [
    ...roadStopLabels,
    ...soiLabels,
    ...mooLabels,
    ...adminStops,
    ...contactStops
  ];
  const houseBeforeRoadStop = `${houseNumberPattern}\\s*(?:${roadPrefixLabels.map(escapeRegex).join("|")})`;
  let text = normalizeForFieldExtraction(input)
    .replace(/[‐‑‒–—―−]/g, "-")
    .replace(/(?:โทรศัพท์|โทรสาร|telephone|tel|fax)\s+.*$/iu, " ");

  text = removeAllAfterLabel(text, unitLabels, [
    ...floorLabels,
    ...buildingLabels,
    ...addressStops
  ]);
  text = removeAllAfterLabel(text, floorLabels, [
    ...buildingLabels,
    ...addressStops
  ]);
  text = removeAllAfterLabel(text, buildingLabels, [
    ...floorLabels,
    ...unitLabels,
    ...addressStops
  ], [houseBeforeRoadStop]);

  text = stripAddressWords(text)
    .replace(/(?:^|\s)[0-9]{5}(?=\s|$)/g, " ")
    .replace(new RegExp(`(?:บ้านเลขที่\\s*)?${houseNumberPattern}`, "iu"), " ")
    .replace(/(?:หมู่(?:ที่)?|ม\.|moo)\s*[0-9]+/g, " ");

  for (const part of [address.subdistrict, address.district, address.province]) {
    for (const alias of aliasesForPart(part)) {
      text = removeWholePhrase(text, alias);
    }
  }

  text = text
    .replace(/(?:ถนน|ถ\.|road|rd\.?)/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text || text === fields.moo || /^\d+$/.test(text)) {
    return undefined;
  }

  return formatRoadValue(text);
}

function finalizeFields(
  input: string,
  fields: ParsedAddressFields,
  address: ThaiAddressSuggestion
): ParsedAddressFields {
  const fieldsWithPostalCode = fields.postalCode || !address.postalCode
    ? fields
    : { ...fields, postalCode: address.postalCode };

  if (fieldsWithPostalCode.road) {
    return fieldsWithPostalCode;
  }

  const road = inferRoad(input, address, fieldsWithPostalCode);
  return road ? { ...fieldsWithPostalCode, road } : fieldsWithPostalCode;
}

export function createThaiAddressIndex(data: ThaiAddressData): ThaiAddressIndex {
  const provinces = new Map<string, ThaiAddressPart>();
  const districts = new Map<string, ThaiAddressPart & { provinceCode: string }>();
  const suggestions: IndexedSuggestion[] = [];
  const byCode = new Map<string, IndexedSuggestion>();

  for (const [code, name, nameEn] of data.provinces) {
    provinces.set(code, { code, name, ...(nameEn ? { nameEn } : {}) });
  }

  for (const [code, provinceCode, name, nameEn] of data.districts) {
    districts.set(code, { code, name, provinceCode, ...(nameEn ? { nameEn } : {}) });
  }

  for (const [index, [code, districtCode, name, nameEn]] of data.subdistricts.entries()) {
    const district = districts.get(districtCode);
    const province = district ? provinces.get(district.provinceCode) : undefined;
    if (!district || !province) {
      continue;
    }

    const postalCode = data.postalCodes?.[index];
    const suggestion = buildSuggestion(
      code,
      { code, name, ...(nameEn ? { nameEn } : {}) },
      district,
      province,
      postalCode && /^[0-9]{5}$/.test(postalCode) ? postalCode : undefined
    );
    suggestions.push(suggestion);
    byCode.set(code, suggestion);
  }

  function search(query: string, options: ThaiAddressSearchOptions = {}): ThaiAddressSuggestion[] {
    const limit = options.limit ?? 8;
    const prepared = prepareQuery(query);
    if (!prepared) {
      return [];
    }

    return suggestions
      .map((suggestion) => ({ suggestion, score: scoreSuggestion(suggestion, prepared) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || (a.suggestion.label > b.suggestion.label ? 1 : -1))
      .slice(0, limit)
      .map(({ suggestion, score }) => publicSuggestion(suggestion, score));
  }

  function parse(input: string): ThaiAddressParseResult {
    const fields = extractFields(input);
    const provinceList = Array.from(provinces.values());
    const warnings: string[] = [];

    if (hasUnknownExplicitProvince(input, provinceList)) {
      warnings.push("No matching province/district/subdistrict combination found.");
      return { input, fields, confidence: 0.25, warnings };
    }

    const parsedCandidate = findBestParsedCandidate(createInputContext(input), suggestions);
    if (parsedCandidate) {
      const address = publicSuggestion(parsedCandidate.suggestion, 100);
      return {
        input,
        fields: finalizeFields(input, fields, address),
        address,
        confidence: parsedCandidateConfidence(parsedCandidate),
        warnings
      };
    }

    const fallback = search(input, { limit: 1 })[0];
    if (!fallback) {
      warnings.push("No matching province/district/subdistrict combination found.");
      return { input, fields, confidence: 0.3, warnings };
    }

    return {
      input,
      fields: finalizeFields(input, fields, fallback),
      address: fallback,
      confidence: Math.min(0.75, Math.max(0.55, fallback.score / 120)),
      warnings
    };
  }

  return {
    data,
    search,
    parse,
    getBySubdistrictCode(code: string) {
      const suggestion = byCode.get(code);
      return suggestion ? publicSuggestion(suggestion) : undefined;
    }
  };
}
