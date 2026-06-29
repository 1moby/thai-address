import { createThaiAddressIndex } from "../src/addressIndex";
import {
  buildParsedAddressJson,
  buildParsedFieldRows,
  resolveDisplayPostalCode
} from "../demo/src/displayFields";
import { miniData } from "./fixtures/miniData";

describe("demo parsed field display", () => {
  const postalCodesBySubdistrictCode: Record<string, string> = {
    "100704": "10330",
    "101701": "10310",
    "140103": "13000"
  };
  const miniDataWithPostcodes = {
    ...miniData,
    postalCodes: miniData.subdistricts.map(([code]) => postalCodesBySubdistrictCode[code] ?? "")
  };

  it("uses the same postal-code value in JSON and visible fields for the Huai Khwang room sample", () => {
    const index = createThaiAddressIndex(miniDataWithPostcodes);
    const parsed = index.parse(
      "ห้องเลขที่ TNAO-3001-02 ชั้น 30 ทาวเวอร์ เอ อาคารเดอะไนน์ ทาวเวอร์ แกรนด์ พระราม 9 33/4 ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร"
    );

    expect(parsed.fields.postalCode).toBe("10310");
    expect(resolveDisplayPostalCode(parsed)).toBe("10310");
    expect(JSON.parse(buildParsedAddressJson(parsed))).toMatchObject({
      postalCode: "10310",
      subdistrictCode: "101701"
    });
  });

  it("keeps a pasted postal code ahead of the fallback value", () => {
    const index = createThaiAddressIndex(miniDataWithPostcodes);
    const parsed = index.parse("270 ถนนพระรามที่ 6 แขวงทุ่งพญาไท เขตราชเทวี กรุงเทพมหานคร 10400");

    expect(resolveDisplayPostalCode(parsed)).toBe("10400");
    expect(JSON.parse(buildParsedAddressJson(parsed))).toMatchObject({
      postalCode: "10400",
      subdistrictCode: "103701"
    });
  });

  it("shows matched Thai and English administrative fields in the same visible rows", () => {
    const index = createThaiAddressIndex(miniDataWithPostcodes);
    const parsed = index.parse(
      "18/21     ตำบลหอรัตนไชย อำเภอพระนครศรีอยุธยา จังหวัดพระนครศรีอยุธยา 13000 โทรศัพท์ 03 525 2243"
    );

    expect(buildParsedFieldRows(parsed)).toEqual([
      { label: "บ้านเลขที่", value: "18/21" },
      { label: "อาคาร", value: undefined },
      { label: "ชั้น", value: undefined },
      { label: "ห้อง", value: undefined },
      { label: "หมู่", value: undefined },
      { label: "ซอย", value: undefined },
      { label: "ถนน", value: undefined },
      { label: "โทรศัพท์", value: "03 525 2243" },
      { label: "ตำบล/แขวง", value: "หอรัตนไชย", valueEn: "Ho Rattanachai" },
      { label: "อำเภอ/เขต", value: "พระนครศรีอยุธยา", valueEn: "Phra Nakhon Si Ayutthaya" },
      { label: "จังหวัด", value: "พระนครศรีอยุธยา", valueEn: "Phra Nakhon Si Ayutthaya" },
      { label: "รหัสไปรษณีย์", value: "13000" }
    ]);
  });

  it("fills postcode from matched subdistrict data when the pasted address omits it", () => {
    const index = createThaiAddressIndex(miniDataWithPostcodes);
    const parsed = index.parse(
      "87/2 อาคาร CRC All Seasons Place ชั้น 40   ถ.วิทยุ แขวงลุมพินี เขตปทุมวัน จังหวัดกรุงเทพมหานคร โทรศัพท์ 0-2626-2300 โทรสาร 0-2626-2306, 0-2626-2301"
    );

    expect(parsed.address).toMatchObject({
      subdistrict: { code: "100704", name: "ลุมพินี", nameEn: "Lumphini" },
      district: { code: "1007", name: "ปทุมวัน", nameEn: "Pathum Wan" },
      province: { code: "10", name: "กรุงเทพมหานคร", nameEn: "Bangkok" },
      postalCode: "10330"
    });
    expect(parsed.fields.postalCode).toBe("10330");
    expect(resolveDisplayPostalCode(parsed)).toBe("10330");
    expect(buildParsedFieldRows(parsed)).toContainEqual({
      label: "ตำบล/แขวง",
      value: "ลุมพินี",
      valueEn: "Lumphini"
    });
    expect(buildParsedFieldRows(parsed)).not.toContainEqual({
      label: "ตำบล/แขวง อังกฤษ",
      value: "Lumphini"
    });
  });
});
