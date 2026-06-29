import { convertCcaattRows } from "../src/build/convertDopa";

describe("DOPA CCAATT conversion", () => {
  it("keeps only active province, district, and subdistrict rows", () => {
    const converted = convertCcaattRows([
      ["รหัสจังหวัด 2 หลัก//อำเภอ 4 หลัก//ตำบล 6 หลัก", "จังหวัด/อำเภอ/ตำบล ภาษาไทย", "จังหวัด/อำเภอ/ตำบล ภาษาอังกฤษ", "ปีเดือนวันที่จำหน่าย"],
      ["10000000", "กรุงเทพมหานคร", "Bangkok", "0"],
      ["10040000", "เขตบางรัก", "Bang Rak", "0"],
      ["10040200", "สีลม", "Si Lom", "0"],
      ["10040500", "บางซื่อ*", "Bang Sue", "25490101"],
      ["92000000", "ตรัง", "Trang", "0"],
      ["92010000", "เมืองตรัง", "Mueang Trang", "0"],
      ["92010100", "ทับเที่ยง", "Thap Thiang", "0"],
      ["92019900", "ตำบลจำหน่าย", "Disposed", "25600101"],
      ["* update 25660901", "", "", ""]
    ]);

    expect(converted.provinces).toEqual([
      ["10", "กรุงเทพมหานคร", "Bangkok"],
      ["92", "ตรัง", "Trang"]
    ]);
    expect(converted.districts).toEqual([
      ["1004", "10", "บางรัก", "Bang Rak"],
      ["9201", "92", "เมืองตรัง", "Mueang Trang"]
    ]);
    expect(converted.subdistricts).toEqual([
      ["100402", "1004", "สีลม", "Si Lom"],
      ["920101", "9201", "ทับเที่ยง", "Thap Thiang"]
    ]);
    expect(converted.stats.excluded).toBe(3);
  });
});
