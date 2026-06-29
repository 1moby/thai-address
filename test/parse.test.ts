import { createThaiAddressIndex } from "../src/addressIndex";
import { miniData } from "./fixtures/miniData";

describe("Thai address parsing", () => {
  it("extracts Bangkok address fields from a pasted free-form address", () => {
    const index = createThaiAddressIndex(miniData);

    const parsed = index.parse("บ้านเลขที่ 99/9 หมู่ 2 ซอยคอนแวนต์ ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500");

    expect(parsed.confidence).toBeGreaterThanOrEqual(0.8);
    expect(parsed.fields).toMatchObject({
      houseNumber: "99/9",
      moo: "2",
      soi: "คอนแวนต์",
      road: "สีลม",
      postalCode: "10500"
    });
    expect(parsed.address?.label).toBe("แขวงสีลม เขตบางรัก กรุงเทพมหานคร");
  });

  it("extracts non-Bangkok administrative fields from shorthand", () => {
    const index = createThaiAddressIndex(miniData);

    const parsed = index.parse("88 ม.7 ต.ทับเที่ยง อ.เมืองตรัง จ.ตรัง");

    expect(parsed.fields.houseNumber).toBe("88");
    expect(parsed.fields.moo).toBe("7");
    expect(parsed.address?.code).toBe("920101");
    expect(parsed.address?.district.name).toBe("เมืองตรัง");
  });

  it("stops road extraction before following administrative fields", () => {
    const index = createThaiAddressIndex(miniData);

    const parsed = index.parse("99/9 ถนนสีลม ตำบลทับเที่ยง อำเภอเมืองตรัง จังหวัดตรัง");

    expect(parsed.fields.road).toBe("สีลม");
    expect(parsed.address?.code).toBe("920101");
  });

  it("stops road at soi and stops soi at moo before unlabeled Bangkok administrative names", () => {
    const index = createThaiAddressIndex(miniData);

    const parsed = index.parse("189 ถนนลาดพร้าว ซอย 101 ม.7 คลองจั่น บางกะปิ กรุงเทพมหานคร 10240");

    expect(parsed.confidence).toBeGreaterThanOrEqual(0.9);
    expect(parsed.fields).toMatchObject({
      houseNumber: "189",
      road: "ลาดพร้าว",
      soi: "101",
      moo: "7",
      postalCode: "10240"
    });
    expect(parsed.address).toMatchObject({
      code: "100601",
      subdistrict: { name: "คลองจั่น", nameEn: "Khlong Chan" },
      district: { name: "บางกะปิ", nameEn: "Bang Kapi" },
      province: { name: "กรุงเทพมหานคร", nameEn: "Bangkok" }
    });
  });

  it.each([
    {
      input:
        "87/2 อาคาร CRC All Seasons Place ชั้น 40   ถ.วิทยุ แขวงลุมพินี เขตปทุมวัน จังหวัดกรุงเทพมหานคร โทรศัพท์ 0-2626-2300 โทรสาร 0-2626-2306, 0-2626-2301",
      fields: {
        houseNumber: "87/2",
        building: "CRC All Seasons Place",
        floor: "40",
        road: "วิทยุ"
      },
      code: "100704"
    },
    {
      input:
        "6/10 อาคารพิพัฒนสิน ชั้น 16   ถ.นราธิวาสราชนครินทร์ แขวงทุ่งมหาเมฆ เขตสาทร จังหวัดกรุงเทพมหานคร โทรศัพท์ 0 2678 3900 โทรสาร 0 2678 3904",
      fields: {
        houseNumber: "6/10",
        building: "พิพัฒนสิน",
        floor: "16",
        road: "นราธิวาสราชนครินทร์"
      },
      code: "102803"
    },
    {
      input:
        "356 อาคารชั้น 1 อาคารดับเบิ้ลยูวัน   ถ.นราธิวาสราชนครินทร์ แขวงช่องนนทรี เขตยานนาวา จังหวัดกรุงเทพมหานคร โทรศัพท์ 02-678-0666 โทรสาร 02-678-0665",
      fields: {
        houseNumber: "356",
        building: "ดับเบิ้ลยูวัน",
        floor: "1",
        road: "นราธิวาสราชนครินทร์"
      },
      code: "101203"
    }
  ])("extracts labeled building and floor fields without contact details", ({ input, fields, code }) => {
    const index = createThaiAddressIndex(miniData);

    const parsed = index.parse(input);

    expect(parsed.fields).toMatchObject(fields);
    expect(parsed.fields.building).not.toContain("โทรศัพท์");
    expect(parsed.fields.floor).not.toContain("โทรศัพท์");
    expect(parsed.address?.code).toBe(code);
  });

  it("does not populate building floor or unit without their explicit labels", () => {
    const index = createThaiAddressIndex(miniData);

    const parsed = index.parse(
      "900    ถนนนวมินทร์ แขวงคลองกุ่ม เขตบึงกุ่ม จังหวัดกรุงเทพมหานคร โทรศัพท์ 02-290-1500 โทรสาร 02-290-1599"
    );

    expect(parsed.fields).toMatchObject({
      houseNumber: "900",
      road: "นวมินทร์"
    });
    expect(parsed.fields.building).toBeUndefined();
    expect(parsed.fields.floor).toBeUndefined();
    expect(parsed.fields.unit).toBeUndefined();
    expect(parsed.address?.code).toBe("102701");
  });

  it("extracts room floor and building before resolving the street address", () => {
    const index = createThaiAddressIndex(miniData);

    const parsed = index.parse(
      "ห้องเลขที่ TNAO-3001-02 ชั้น 30 ทาวเวอร์ เอ อาคารเดอะไนน์ ทาวเวอร์ แกรนด์ พระราม 9 33/4 ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร"
    );

    expect(parsed.confidence).toBeGreaterThanOrEqual(0.9);
    expect(parsed.fields).toMatchObject({
      unit: "TNAO-3001-02",
      floor: "30",
      building: "เดอะไนน์ ทาวเวอร์ แกรนด์ พระราม 9",
      houseNumber: "33/4",
      road: "พระราม 9"
    });
    expect(parsed.address?.code).toBe("101701");
  });

  it.each([
    {
      input: "88/89  หมู่ที่ 1  ถนนสุขุมวิท ตำบลห้วยกะปิ อำเภอเมืองชลบุรี จังหวัดชลบุรี 20000 โทรศัพท์ 03 812 9159",
      fields: {
        houseNumber: "88/89",
        moo: "1",
        road: "สุขุมวิท",
        postalCode: "20000",
        phone: "03 812 9159"
      },
      code: "200115"
    },
    {
      input: "7/51 – 7/52  หมู่ที่ 3   ตำบลบ่อวิน อำเภอศรีราชา จังหวัดชลบุรี 20230 โทรศัพท์ 033-006-999",
      fields: {
        houseNumber: "7/51 - 7/52",
        moo: "3",
        postalCode: "20230",
        phone: "033-006-999"
      },
      code: "200708"
    },
    {
      input: "208/14    ถนนพระยาสัจจา ตำบลเสม็ด อำเภอเมืองชลบุรี จังหวัดชลบุรี 20000 โทรศัพท์ 0-3811-1434",
      fields: {
        houseNumber: "208/14",
        road: "พระยาสัจจา",
        postalCode: "20000",
        phone: "0-3811-1434"
      },
      code: "200116"
    },
    {
      input: "310/11-12 หมู่ที่ 3     ตำบลบ่อวิน อำเภอศรีราชา จังหวัดชลบุรี 20230 โทรศัพท์ 038-337-338 โทรสาร 038-337-339",
      fields: {
        houseNumber: "310/11-12",
        moo: "3",
        postalCode: "20230",
        phone: "038-337-338"
      },
      code: "200708"
    },
    {
      input: "804    ถนนเจตน์จำนงค์ ตำบลบางปลาสร้อย อำเภอเมืองชลบุรี จังหวัดชลบุรี 20000 โทรศัพท์ 03 827 3601-3",
      fields: {
        houseNumber: "804",
        road: "เจตน์จำนงค์",
        postalCode: "20000",
        phone: "03 827 3601-3"
      },
      code: "200101"
    },
    {
      input: "8/51    ถนนพัทยาเหนือ ตำบลนาเกลือ อำเภอบางละมุง จังหวัดชลบุรี 20150 โทรศัพท์ 038 370 518 (19-21), 038 427 671 (72-73)",
      fields: {
        houseNumber: "8/51",
        road: "พัทยาเหนือ",
        postalCode: "20150",
        phone: "038 370 518 (19-21), 038 427 671 (72-73)"
      },
      code: "200408"
    },
    {
      input: "726/1-2    ถนนสุขุมวิท ตำบลบางปลาสร้อย อำเภอเมืองชลบุรี จังหวัดชลบุรี 20000 โทรศัพท์ 03 828 3184 - 6",
      fields: {
        houseNumber: "726/1-2",
        road: "สุขุมวิท",
        postalCode: "20000",
        phone: "03 828 3184-6"
      },
      code: "200101"
    }
  ])("extracts Chonburi phone numbers and keeps the address fields clean", ({ input, fields, code }) => {
    const index = createThaiAddressIndex(miniData);

    const parsed = index.parse(input);

    expect(parsed.confidence).toBeGreaterThanOrEqual(0.9);
    expect(parsed.fields).toMatchObject(fields);
    expect(parsed.fields.phone).not.toContain("โทรสาร");
    expect(parsed.fields.phone).not.toContain("โทรศัพท์");
    if (parsed.fields.road) {
      expect(parsed.fields.road).not.toContain("โทรศัพท์");
    }
    expect(parsed.address?.code).toBe(code);
  });

  it.each([
    {
      input: "31    ถนนภูเก็ต ตำบลตลาดใหญ่ อำเภอเมืองภูเก็ต จังหวัดภูเก็ต 83000 โทรศัพท์ 07 621 1501",
      fields: {
        houseNumber: "31",
        road: "ภูเก็ต",
        postalCode: "83000",
        phone: "07 621 1501"
      },
      code: "830101"
    },
    {
      input:
        "125 อาคารชั้น 2   ถนนพังงา ตำบลตลาดใหญ่ อำเภอเมืองภูเก็ต จังหวัดภูเก็ต 83000 โทรศัพท์ 0 7622 3032",
      fields: {
        houseNumber: "125",
        floor: "2",
        road: "พังงา",
        postalCode: "83000",
        phone: "0 7622 3032"
      },
      code: "830101",
      missingFields: ["building"]
    },
    {
      input:
        "206    ถนนภูเก็ต ตำบลตลาดใหญ่ อำเภอเมืองภูเก็ต จังหวัดภูเก็ต 83000 โทรศัพท์ 07 621 1566, 07 621 1577",
      fields: {
        houseNumber: "206",
        road: "ภูเก็ต",
        postalCode: "83000",
        phone: "07 621 1566, 07 621 1577"
      },
      code: "830101"
    },
    {
      input:
        "59/45-47    ถนนบางกอก ตำบลตลาดเหนือ อำเภอเมืองภูเก็ต จังหวัดภูเก็ต 83000 โทรศัพท์ 076 218 191 (92-93)",
      fields: {
        houseNumber: "59/45-47",
        road: "บางกอก",
        postalCode: "83000",
        phone: "076 218 191 (92-93)"
      },
      code: "830102"
    },
    {
      input:
        "63/714-716  หมู่ที่ 4   ตำบลวิชิต อำเภอเมืองภูเก็ต จังหวัดภูเก็ต 83000 โทรศัพท์ 02 165 5555",
      fields: {
        houseNumber: "63/714-716",
        moo: "4",
        postalCode: "83000",
        phone: "02 165 5555"
      },
      code: "830105"
    }
  ])("extracts Phuket phone records and keeps administrative names bilingual", ({ input, fields, code, missingFields = [] }) => {
    const index = createThaiAddressIndex(miniData);

    const parsed = index.parse(input);

    expect(parsed.confidence).toBeGreaterThanOrEqual(0.9);
    expect(parsed.fields).toMatchObject(fields);
    for (const field of missingFields) {
      expect(parsed.fields[field as keyof typeof parsed.fields]).toBeUndefined();
    }
    expect(parsed.fields.phone).not.toContain("โทรศัพท์");
    expect(parsed.address).toMatchObject({
      code,
      district: { name: "เมืองภูเก็ต", nameEn: "Mueang Phuket" },
      province: { name: "ภูเก็ต", nameEn: "Phuket" }
    });
  });

  it.each([
    {
      input:
        "6 อาคารศูนย์การค้าเทสโก้โลตัส รวมโชค ชั้น 2 หมู่ที่ 6   ตำบลฟ้าฮ่าม อำเภอเมืองเชียงใหม่ จังหวัดเชียงใหม่ 50000 โทรศัพท์ 0-5324-3124-5",
      fields: {
        houseNumber: "6",
        building: "ศูนย์การค้าเทสโก้โลตัส รวมโชค",
        floor: "2",
        moo: "6",
        postalCode: "50000",
        phone: "0-5324-3124-5"
      },
      code: "500114"
    },
    {
      input:
        "433/4 อาคารศูนย์การค้าบิ๊กซี หางดง ชั้น 1 หมู่ที่ 7   ตำบลแม่เหียะ อำเภอเมืองเชียงใหม่ จังหวัดเชียงใหม่ 50100 โทรศัพท์ 0-5344-7855",
      fields: {
        houseNumber: "433/4",
        building: "ศูนย์การค้าบิ๊กซี หางดง",
        floor: "1",
        moo: "7",
        postalCode: "50100",
        phone: "0-5344-7855"
      },
      code: "500109"
    }
  ])("keeps Chiang Mai mall building records from becoming inferred roads", ({ input, fields, code }) => {
    const index = createThaiAddressIndex(miniData);

    const parsed = index.parse(input);

    expect(parsed.confidence).toBeGreaterThanOrEqual(0.9);
    expect(parsed.fields).toMatchObject(fields);
    expect(parsed.fields.road).toBeUndefined();
    expect(parsed.address?.code).toBe(code);
  });

  it.each([
    {
      input:
        "28    ถนนประดิษฐ์จองคำ ตำบลจองคำ อำเภอเมืองแม่ฮ่องสอน จังหวัดแม่ฮ่องสอน 58000 โทรศัพท์ 0 5361 1029",
      fields: {
        houseNumber: "28",
        road: "ประดิษฐ์จองคำ",
        postalCode: "58000",
        phone: "0 5361 1029"
      }
    },
    {
      input:
        "2   5 ถนนขุนลุมประพาส ตำบลจองคำ อำเภอเมืองแม่ฮ่องสอน จังหวัดแม่ฮ่องสอน 58000 โทรศัพท์ 053 611 843 (44-46)",
      fields: {
        houseNumber: "25",
        road: "ขุนลุมประพาส",
        postalCode: "58000",
        phone: "053 611 843 (44-46)"
      }
    }
  ])("extracts Mae Hong Son records and repairs split house-number digits before the road", ({ input, fields }) => {
    const index = createThaiAddressIndex(miniData);

    const parsed = index.parse(input);

    expect(parsed.confidence).toBeGreaterThanOrEqual(0.9);
    expect(parsed.fields).toMatchObject(fields);
    expect(parsed.address?.code).toBe("580101");
  });

  it.each([
    {
      input:
        "87/2 อาคาร CRC All Seasons Place ชั้น 40   ถ.วิทยุ แขวงลุมพินี เขตปทุมวัน จังหวัดกรุงเทพมหานคร โทรศัพท์ 0-2626-2300 โทรสาร 0-2626-2306, 0-2626-2301",
      fields: {
        houseNumber: "87/2",
        building: "CRC All Seasons Place",
        floor: "40",
        road: "วิทยุ",
        phone: "0-2626-2300"
      },
      code: "100704"
    },
    {
      input: "31    ถนนภูเก็ต ตำบลตลาดใหญ่ อำเภอเมืองภูเก็ต จังหวัดภูเก็ต 83000 โทรศัพท์ 07 621 1501",
      fields: {
        houseNumber: "31",
        road: "ภูเก็ต",
        postalCode: "83000",
        phone: "07 621 1501"
      },
      code: "830101"
    },
    {
      input:
        "18/21     ตำบลหอรัตนไชย อำเภอพระนครศรีอยุธยา จังหวัดพระนครศรีอยุธยา 13000 โทรศัพท์ 03 525 2243",
      fields: {
        houseNumber: "18/21",
        postalCode: "13000",
        phone: "03 525 2243"
      },
      code: "140103",
      missingFields: ["road"]
    },
    {
      input: "73     ตำบลปากเพรียว อำเภอเมืองสระบุรี จังหวัดสระบุรี 18000 โทรศัพท์ 03 621 1351",
      fields: {
        houseNumber: "73",
        postalCode: "18000",
        phone: "03 621 1351"
      },
      code: "190101",
      missingFields: ["road"]
    },
    {
      input: "314     ตำบลหน้าเมือง อำเภอเมืองปราจีนบุรี จังหวัดปราจีนบุรี 25000 โทรศัพท์ 03 721 1005",
      fields: {
        houseNumber: "314",
        postalCode: "25000",
        phone: "03 721 1005"
      },
      code: "250101",
      missingFields: ["road"]
    },
    {
      input:
        "900    ถนนนวมินทร์ แขวงคลองกุ่ม เขตบึงกุ่ม จังหวัดกรุงเทพมหานคร โทรศัพท์ 02-290-1500 โทรสาร 02-290-1599",
      fields: {
        houseNumber: "900",
        road: "นวมินทร์",
        phone: "02-290-1500"
      },
      code: "102701"
    },
    {
      input:
        "6/10 อาคารพิพัฒนสิน ชั้น 16   ถ.นราธิวาสราชนครินทร์ แขวงทุ่งมหาเมฆ เขตสาทร จังหวัดกรุงเทพมหานคร โทรศัพท์ 0 2678 3900 โทรสาร 0 2678 3904",
      fields: {
        houseNumber: "6/10",
        building: "พิพัฒนสิน",
        floor: "16",
        road: "นราธิวาสราชนครินทร์",
        phone: "0 2678 3900"
      },
      code: "102803"
    },
    {
      input:
        "356 อาคารชั้น 1 อาคารดับเบิ้ลยูวัน   ถ.นราธิวาสราชนครินทร์ แขวงช่องนนทรี เขตยานนาวา จังหวัดกรุงเทพมหานคร โทรศัพท์ 02-678-0666 โทรสาร 02-678-0665",
      fields: {
        houseNumber: "356",
        building: "ดับเบิ้ลยูวัน",
        floor: "1",
        road: "นราธิวาสราชนครินทร์",
        phone: "02-678-0666"
      },
      code: "101203"
    },
    {
      input:
        "35    ถนนสุขุมวิท แขวงคลองเตยน เขตวัฒนา จังหวัดกรุงเทพมหานคร 10110 โทรศัพท์ 0-2208-4232,0-2208-4204,0-2208-4241,0-2208-4246,4219,0-2208-4227",
      fields: {
        houseNumber: "35",
        road: "สุขุมวิท",
        postalCode: "10110",
        phone: "0-2208-4232, 0-2208-4204, 0-2208-4241, 0-2208-4246, 4219, 0-2208-4227"
      },
      code: "103901"
    },
    {
      input:
        "98 อาคารสาทรสแคว์ ออฟฟิส ทาวเวอร์ ชั้น 32-35   ถนนสาทรเหนือ แขวงสีลม เขตบางรัก จังหวัดกรุงเทพมหานคร 10500 โทรศัพท์ 02-163-2999",
      fields: {
        houseNumber: "98",
        building: "สาทรสแคว์ ออฟฟิส ทาวเวอร์",
        floor: "32-35",
        road: "สาทรเหนือ",
        postalCode: "10500",
        phone: "02-163-2999"
      },
      code: "100402"
    }
  ])("parses every public website sample address cleanly", ({ input, fields, code, missingFields = [] }) => {
    const index = createThaiAddressIndex(miniData);

    const parsed = index.parse(input);

    expect(parsed.confidence).toBeGreaterThanOrEqual(0.85);
    expect(parsed.fields).toMatchObject(fields);
    for (const field of missingFields) {
      expect(parsed.fields[field as keyof typeof parsed.fields]).toBeUndefined();
    }
    expect(parsed.fields.phone).not.toContain("โทรสาร");
    expect(parsed.fields.phone).not.toContain("โทรศัพท์");
    expect(parsed.address?.code).toBe(code);
  });

  it("prefers explicit Bangkok district and subdistrict labels over substring matches", () => {
    const index = createThaiAddressIndex(miniData);

    const parsed = index.parse("270 ถนนพระรามที่ 6 แขวงทุ่งพญาไท เขตราชเทวี กรุงเทพมหานคร 10400");

    expect(parsed.confidence).toBeGreaterThanOrEqual(0.9);
    expect(parsed.fields).toMatchObject({
      houseNumber: "270",
      road: "พระรามที่ 6",
      postalCode: "10400"
    });
    expect(parsed.address?.code).toBe("103701");
    expect(parsed.address?.subdistrict.name).toBe("ทุ่งพญาไท");
    expect(parsed.address?.district.name).toBe("ราชเทวี");
    expect(parsed.address?.province.name).toBe("กรุงเทพมหานคร");
  });

  it("resolves unlabeled Thai addresses from province to district to subdistrict before road", () => {
    const index = createThaiAddressIndex(miniData);

    const parsed = index.parse("270 พระรามที่ 6 ทุ่งพญาไท ราชเทวี กรุงเทพ 10400");

    expect(parsed.confidence).toBeGreaterThanOrEqual(0.85);
    expect(parsed.fields.road).toBe("พระรามที่ 6");
    expect(parsed.address?.code).toBe("103701");
  });

  it("tolerates a small Thai typo while keeping the province and district hierarchy", () => {
    const index = createThaiAddressIndex(miniData);

    const parsed = index.parse("270 ถนนพระราม 6 แขวงทุ่งพะยาไท เขตราชเทวี กทม 10400");

    expect(parsed.confidence).toBeGreaterThanOrEqual(0.75);
    expect(parsed.address?.code).toBe("103701");
  });

  it("parses English input and returns bilingual administrative names", () => {
    const index = createThaiAddressIndex(miniData);

    const parsed = index.parse("270 Rama VI Road Thung Phaya Thai Ratchathewi Bangkok 10400");

    expect(parsed.confidence).toBeGreaterThanOrEqual(0.85);
    expect(parsed.fields.road).toBe("Rama VI");
    expect(parsed.address).toMatchObject({
      code: "103701",
      label: "แขวงทุ่งพญาไท เขตราชเทวี กรุงเทพมหานคร",
      labelEn: "Thung Phaya Thai, Ratchathewi, Bangkok",
      subdistrict: { name: "ทุ่งพญาไท", nameEn: "Thung Phaya Thai" },
      district: { name: "ราชเทวี", nameEn: "Ratchathewi" },
      province: { name: "กรุงเทพมหานคร", nameEn: "Bangkok" }
    });
  });

  it("returns low confidence when the administrative address cannot be resolved", () => {
    const index = createThaiAddressIndex(miniData);

    const parsed = index.parse("99/9 ถนนสีลม จังหวัดภูเก็ต");

    expect(parsed.address).toBeUndefined();
    expect(parsed.confidence).toBeLessThan(0.5);
    expect(parsed.warnings).toContain("No matching province/district/subdistrict combination found.");
  });
});
