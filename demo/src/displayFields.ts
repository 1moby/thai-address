import type { ThaiAddressParseResult } from "../../src";

export interface ParsedFieldRow {
  label: string;
  value: string | undefined;
  valueEn?: string;
}

export function resolveDisplayPostalCode(parsed: ThaiAddressParseResult | undefined): string | undefined {
  return parsed?.fields.postalCode ?? parsed?.address?.postalCode;
}

export function buildParsedFieldRows(parsed: ThaiAddressParseResult | undefined): ParsedFieldRow[] {
  return [
    { label: "บ้านเลขที่", value: parsed?.fields.houseNumber },
    { label: "อาคาร", value: parsed?.fields.building },
    { label: "ชั้น", value: parsed?.fields.floor },
    { label: "ห้อง", value: parsed?.fields.unit },
    { label: "หมู่", value: parsed?.fields.moo },
    { label: "ซอย", value: parsed?.fields.soi },
    { label: "ถนน", value: parsed?.fields.road },
    { label: "โทรศัพท์", value: parsed?.fields.phone },
    {
      label: "ตำบล/แขวง",
      value: parsed?.address?.subdistrict.name,
      valueEn: parsed?.address?.subdistrict.nameEn
    },
    {
      label: "อำเภอ/เขต",
      value: parsed?.address?.district.name,
      valueEn: parsed?.address?.district.nameEn
    },
    {
      label: "จังหวัด",
      value: parsed?.address?.province.name,
      valueEn: parsed?.address?.province.nameEn
    },
    { label: "รหัสไปรษณีย์", value: resolveDisplayPostalCode(parsed) }
  ];
}

export function buildParsedAddressJson(parsed: ThaiAddressParseResult | undefined): string {
  return JSON.stringify(
    {
      houseNumber: parsed?.fields.houseNumber,
      building: parsed?.fields.building,
      floor: parsed?.fields.floor,
      unit: parsed?.fields.unit,
      moo: parsed?.fields.moo,
      soi: parsed?.fields.soi,
      road: parsed?.fields.road,
      phone: parsed?.fields.phone,
      subdistrict: parsed?.address?.subdistrict.name,
      subdistrictEn: parsed?.address?.subdistrict.nameEn,
      district: parsed?.address?.district.name,
      districtEn: parsed?.address?.district.nameEn,
      province: parsed?.address?.province.name,
      provinceEn: parsed?.address?.province.nameEn,
      postalCode: resolveDisplayPostalCode(parsed),
      subdistrictCode: parsed?.address?.subdistrict.code,
      districtCode: parsed?.address?.district.code,
      provinceCode: parsed?.address?.province.code,
      confidence: parsed?.confidence
    },
    null,
    2
  );
}
