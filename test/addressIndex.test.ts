import { createThaiAddressIndex } from "../src/addressIndex";
import { miniData } from "./fixtures/miniData";

describe("Thai address index", () => {
  it("returns Bangkok suggestions with correct prefixes", () => {
    const index = createThaiAddressIndex(miniData);

    const [first] = index.search("สีลม บางรัก กรุงเทพ", { limit: 3 });

    expect(first).toMatchObject({
      code: "100402",
      label: "แขวงสีลม เขตบางรัก กรุงเทพมหานคร",
      subdistrict: { code: "100402", name: "สีลม" },
      district: { code: "1004", name: "บางรัก" },
      province: { code: "10", name: "กรุงเทพมหานคร" }
    });
  });

  it("finds a normal province address from prefixed shorthand", () => {
    const index = createThaiAddressIndex(miniData);

    const [first] = index.search("ต.ทับเที่ยง อ.เมืองตรัง จ.ตรัง");

    expect(first.label).toBe("ตำบลทับเที่ยง อำเภอเมืองตรัง จังหวัดตรัง");
    expect(first.code).toBe("920101");
  });

  it("returns bilingual suggestions from English queries", () => {
    const index = createThaiAddressIndex(miniData);

    const [first] = index.search("Thung Phaya Thai Ratchathewi Bangkok", { limit: 3 });

    expect(first).toMatchObject({
      code: "103701",
      label: "แขวงทุ่งพญาไท เขตราชเทวี กรุงเทพมหานคร",
      labelEn: "Thung Phaya Thai, Ratchathewi, Bangkok",
      subdistrict: { name: "ทุ่งพญาไท", nameEn: "Thung Phaya Thai" },
      district: { name: "ราชเทวี", nameEn: "Ratchathewi" },
      province: { name: "กรุงเทพมหานคร", nameEn: "Bangkok" }
    });
  });

  it("keeps ambiguous partial queries ranked but bounded", () => {
    const index = createThaiAddressIndex(miniData);

    const results = index.search("เมือง", { limit: 2 });

    expect(results).toHaveLength(2);
    expect(results.every((result) => result.score > 0)).toBe(true);
  });
});
