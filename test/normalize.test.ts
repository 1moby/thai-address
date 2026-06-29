import { normalizeForSearch, stripAddressWords, toArabicDigits } from "../src/normalize";

describe("Thai address normalization", () => {
  it("normalizes Thai digits and whitespace for search", () => {
    expect(normalizeForSearch("  แขวง สีลม   เขตบางรัก ๑๐๕๐๐ ")).toBe("แขวง สีลม เขตบางรัก 10500");
  });

  it("removes common administrative address words without removing names", () => {
    expect(stripAddressWords("แขวงสีลม เขตบางรัก กรุงเทพฯ")).toBe("สีลม บางรัก กรุงเทพมหานคร");
    expect(stripAddressWords("ต.ทับเที่ยง อ.เมืองตรัง จ.ตรัง")).toBe("ทับเที่ยง เมืองตรัง ตรัง");
  });

  it("converts Thai digits to Arabic digits", () => {
    expect(toArabicDigits("๑๒๓/๔๕ หมู่ ๖")).toBe("123/45 หมู่ 6");
  });
});
