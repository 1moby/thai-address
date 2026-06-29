export { createThaiAddressIndex } from "./addressIndex.js";
export { decodeThaiAddressData, loadThaiAddressData } from "./dataLoader.js";
export {
  compactSearchKey,
  normalizeForSearch,
  stripAddressWords,
  stripAdministrativePrefix,
  toArabicDigits
} from "./normalize.js";
export type {
  ParsedAddressFields,
  ThaiAddressData,
  ThaiAddressIndex,
  ThaiAddressParseResult,
  ThaiAddressSearchOptions,
  ThaiAddressSuggestion
} from "./types.js";
