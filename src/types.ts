export type ProvinceTuple = [code: string, name: string, nameEn?: string];
export type DistrictTuple = [code: string, provinceCode: string, name: string, nameEn?: string];
export type SubdistrictTuple = [code: string, districtCode: string, name: string, nameEn?: string];
export type PostalCodeTuple = string;

export interface ThaiAddressData {
  version: 1;
  generatedAt: string;
  source: {
    name: string;
    url: string;
    files: string[];
    note: string;
  };
  provinces: ProvinceTuple[];
  districts: DistrictTuple[];
  subdistricts: SubdistrictTuple[];
  postalCodes?: PostalCodeTuple[];
}

export interface ThaiAddressPart {
  code: string;
  name: string;
  nameEn?: string;
}

export interface ThaiAddressSuggestion {
  code: string;
  label: string;
  labelEn?: string;
  score: number;
  subdistrict: ThaiAddressPart;
  district: ThaiAddressPart;
  province: ThaiAddressPart;
  postalCode?: string;
}

export interface ThaiAddressSearchOptions {
  limit?: number;
}

export interface ParsedAddressFields {
  houseNumber?: string;
  building?: string;
  floor?: string;
  unit?: string;
  moo?: string;
  soi?: string;
  road?: string;
  phone?: string;
  postalCode?: string;
}

export interface ThaiAddressParseResult {
  input: string;
  fields: ParsedAddressFields;
  address?: ThaiAddressSuggestion;
  confidence: number;
  warnings: string[];
}

export interface ThaiAddressIndex {
  search(query: string, options?: ThaiAddressSearchOptions): ThaiAddressSuggestion[];
  parse(input: string): ThaiAddressParseResult;
  getBySubdistrictCode(code: string): ThaiAddressSuggestion | undefined;
  data: ThaiAddressData;
}
