const THAI_DIGITS = new Map([
  ["๐", "0"],
  ["๑", "1"],
  ["๒", "2"],
  ["๓", "3"],
  ["๔", "4"],
  ["๕", "5"],
  ["๖", "6"],
  ["๗", "7"],
  ["๘", "8"],
  ["๙", "9"]
]);

const BANGKOK_ALIASES = /(?:กรุงเทพมหานคร|กรุงเทพฯ|กทม\.?|กรุงเทพ|bangkok|bkk\.?)/g;
const ADMIN_WORDS = /(^|\s)(?:จังหวัด|จ\.?|อำเภอ|อ\.?|ตำบล|ต\.?|แขวง|เขต)\s*/g;
const ENGLISH_ADMIN_WORDS =
  /(^|\s)(?:province|prov\.?|district|dist\.?|subdistrict|sub-district|sub district|tambon|amphoe|amphur|khet|khwaeng)\s*/g;

export function toArabicDigits(value: string): string {
  return Array.from(value, (char) => THAI_DIGITS.get(char) ?? char).join("");
}

export function normalizeForSearch(value: string): string {
  return toArabicDigits(value)
    .normalize("NFC")
    .replace(/[(){}\[\],;:|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("th-TH");
}

export function stripAddressWords(value: string): string {
  return normalizeForSearch(value)
    .replace(BANGKOK_ALIASES, "กรุงเทพมหานคร")
    .replace(ADMIN_WORDS, "$1")
    .replace(ENGLISH_ADMIN_WORDS, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function compactSearchKey(value: string): string {
  return stripAddressWords(value).replace(/\s+/g, "");
}

export function stripAdministrativePrefix(value: string): string {
  return normalizeForSearch(value)
    .replace(/^(?:จังหวัด|อำเภอ|ตำบล|แขวง|เขต)\s*/, "")
    .replace(/\*+$/g, "")
    .trim();
}
