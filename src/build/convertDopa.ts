import { stripAdministrativePrefix } from "../normalize.js";
import type { DistrictTuple, ProvinceTuple, SubdistrictTuple, ThaiAddressData } from "../types.js";

export interface ConvertedCcaattData extends Pick<ThaiAddressData, "provinces" | "districts" | "subdistricts"> {
  stats: {
    rawRecords: number;
    activeRecords: number;
    excluded: number;
  };
}

type Cell = string | number | null | undefined;

function cleanCell(value: Cell): string {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value).trim();
  return text.endsWith(".0") && /^\d+\.0$/.test(text) ? text.slice(0, -2) : text;
}

function isDataCode(value: string): boolean {
  return /^\d{8}$/.test(value);
}

function isActiveRow(row: Cell[]): boolean {
  const [rawCode, rawName, , rawDisposedAt] = row;
  const code = cleanCell(rawCode);
  const name = cleanCell(rawName);
  const disposedAt = cleanCell(rawDisposedAt);
  const rowText = row.map(cleanCell).join(" ");

  return (
    isDataCode(code) &&
    name.length > 0 &&
    !rowText.includes("*") &&
    !/(จำหน่าย|ยกเลิก)/.test(rowText) &&
    (disposedAt === "" || disposedAt === "0")
  );
}

function withEnglishName<T extends string[]>(values: T, englishName: string): T | [...T, string] {
  return englishName ? [...values, englishName] : values;
}

export function convertCcaattRows(rows: Cell[][]): ConvertedCcaattData {
  const provinces: ProvinceTuple[] = [];
  const districts: DistrictTuple[] = [];
  const subdistricts: SubdistrictTuple[] = [];
  let rawRecords = 0;
  let excluded = 0;

  for (const row of rows) {
    const code = cleanCell(row[0]);
    if (code.startsWith("* update")) {
      excluded += 1;
      continue;
    }

    if (!isDataCode(code)) {
      continue;
    }

    rawRecords += 1;

    if (!isActiveRow(row)) {
      excluded += 1;
      continue;
    }

    const name = stripAdministrativePrefix(cleanCell(row[1]));
    const englishName = cleanCell(row[2]).replace(/\*+$/g, "").trim();
    const provinceCode = code.slice(0, 2);
    const districtCode = code.slice(0, 4);
    const subdistrictCode = code.slice(0, 6);
    const aa = code.slice(2, 4);
    const tt = code.slice(4, 6);
    const mm = code.slice(6, 8);

    if (aa === "00" && tt === "00" && mm === "00") {
      provinces.push(withEnglishName([provinceCode, name], englishName) as ProvinceTuple);
    } else if (aa !== "00" && tt === "00" && mm === "00") {
      districts.push(withEnglishName([districtCode, provinceCode, name], englishName) as DistrictTuple);
    } else if (aa !== "00" && tt !== "00" && mm === "00") {
      subdistricts.push(withEnglishName([subdistrictCode, districtCode, name], englishName) as SubdistrictTuple);
    }
  }

  return {
    provinces,
    districts,
    subdistricts,
    stats: {
      rawRecords,
      activeRecords: provinces.length + districts.length + subdistricts.length,
      excluded
    }
  };
}
