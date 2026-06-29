import { gzipSync } from "node:zlib";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";
import { convertCcaattRows } from "./convertDopa.js";
import type { ThaiAddressData } from "../types.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const RAW_CCAATT = path.join(ROOT, "raw", "ccaatt.xlsx");
const RAW_POSTAL_CODES = path.join(ROOT, "raw", "thailand-geography-subdistricts.json");
const SOURCE_URL = "https://stat.bora.dopa.go.th/stat/statnew/statMenu/newStat/ccaa.php";
const POSTAL_SOURCE_URL = "https://github.com/thailand-geography-data/thailand-geography-json";

interface PostalCodeRecord {
  subdistrictCode: number | string;
  postalCode: number | string;
}

function readRows(filePath: string): unknown[][] {
  const workbook = XLSX.readFile(filePath, { cellDates: false });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error(`No sheets found in ${filePath}`);
  }

  return XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
    header: 1,
    raw: false,
    blankrows: false
  }) as unknown[][];
}

async function readPostalCodeMap(filePath: string): Promise<Map<string, string>> {
  const records = JSON.parse(await readFile(filePath, "utf8")) as PostalCodeRecord[];
  const postalCodes = new Map<string, string>();

  for (const record of records) {
    const subdistrictCode = String(record.subdistrictCode).trim();
    const postalCode = String(record.postalCode).trim();
    if (/^\d{6}$/.test(subdistrictCode) && /^\d{5}$/.test(postalCode)) {
      postalCodes.set(subdistrictCode, postalCode);
    }
  }

  return postalCodes;
}

async function writePayload(outputDir: string, payload: Uint8Array, data: ThaiAddressData, stats: unknown): Promise<void> {
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "thai-address-core.json.gz"), payload);
  await writeFile(
    path.join(outputDir, "thai-address-core.meta.json"),
    `${JSON.stringify(
      {
        generatedAt: data.generatedAt,
        source: data.source,
        counts: {
          provinces: data.provinces.length,
          districts: data.districts.length,
          subdistricts: data.subdistricts.length,
          postalCodes: data.postalCodes?.filter(Boolean).length ?? 0
        },
        stats,
        gzipBytes: payload.byteLength
      },
      null,
      2
    )}\n`
  );
}

async function main(): Promise<void> {
  const rows = readRows(RAW_CCAATT);
  const postalCodeMap = await readPostalCodeMap(RAW_POSTAL_CODES);
  const converted = convertCcaattRows(rows);
  const postalCodes = converted.subdistricts.map(([code]) => postalCodeMap.get(code) ?? "");
  const data: ThaiAddressData = {
    version: 1,
    generatedAt: new Date().toISOString(),
    source: {
      name: "DOPA STAT-BORA CCAATT + thailand-geography-json postal codes",
      url: SOURCE_URL,
      files: ["raw/ccaatt.xlsx", "raw/thailand-geography-subdistricts.json"],
      note: `Rows with a disposal/cancel date, star marker, explicit cancellation text, or update footer are excluded. Postal codes are matched by subdistrictCode from ${POSTAL_SOURCE_URL} under the MIT license.`
    },
    provinces: converted.provinces,
    districts: converted.districts,
    subdistricts: converted.subdistricts,
    postalCodes
  };
  const json = JSON.stringify(data);
  const payload = gzipSync(json, { level: 9 });

  await writePayload(path.join(ROOT, "data"), payload, data, converted.stats);
  await writePayload(path.join(ROOT, "public", "data"), payload, data, converted.stats);

  console.log(
    JSON.stringify(
      {
        provinces: data.provinces.length,
        districts: data.districts.length,
        subdistricts: data.subdistricts.length,
        postalCodes: postalCodes.filter(Boolean).length,
        rawRecords: converted.stats.rawRecords,
        excluded: converted.stats.excluded,
        jsonBytes: Buffer.byteLength(json),
        gzipBytes: payload.byteLength
      },
      null,
      2
    )
  );
}

await main();
