# thai-address

ระบบค้นหาและแยกส่วนที่อยู่ไทยสำหรับใช้งานบนเบราว์เซอร์ทั้งหมด ไม่ต้องมี backend และไม่ต้องโหลดฐานข้อมูลขนาดใหญ่ตอน runtime

เดโมและเอกสาร: https://1moby.github.io/thai-address/

npm: https://www.npmjs.com/package/@1moby/thai-address

## จุดเด่น

- ทำงาน client-side 100% เหมาะกับ GitHub Pages, static hosting และเว็บแอปทั่วไป
- โหลดข้อมูล `.json.gz` ขนาดเล็กด้วย `DecompressionStream`
- แปลงข้อมูลจาก DOPA STAT-BORA `CCAATT` และจับคู่รหัสไปรษณีย์จากข้อมูล `thailand-geography-json`
- ตัดรายการที่ถูกจำหน่าย/ยกเลิกออกระหว่าง build ข้อมูล
- ค้นหาได้ทั้งชื่อไทยและชื่ออังกฤษของจังหวัด อำเภอ/เขต และตำบล/แขวง
- แยกที่อยู่เป็นฟิลด์ เช่น บ้านเลขที่ อาคาร ชั้น ห้อง หมู่ ซอย ถนน โทรศัพท์ รหัสไปรษณีย์ จังหวัด อำเภอ และตำบล
- มี core API แบบไม่ผูก framework, React component และตัวช่วย plain JavaScript
- หน้า landing page ภาษาไทย พร้อมหน้าเอกสารแปล 10 ภาษา
- payload ข้อมูลหลักประมาณ 125 kB เมื่อ gzip

## ติดตั้ง

```bash
npm install @1moby/thai-address
```

## ใช้งาน Core API

```ts
import { createThaiAddressIndex, loadThaiAddressData } from "@1moby/thai-address";

const data = await loadThaiAddressData("/data/thai-address-core.json.gz");
const index = createThaiAddressIndex(data);

const suggestions = index.search("สีลม บางรัก กรุงเทพ", { limit: 5 });
const englishSuggestions = index.search("Thung Phaya Thai Ratchathewi Bangkok", { limit: 5 });

const parsed = index.parse("99/9 ซอยคอนแวนต์ ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500");
const parsedEnglish = index.parse("270 Rama VI Road Thung Phaya Thai Ratchathewi Bangkok 10400");
const parsedOffice = index.parse("ห้องเลขที่ TNAO-3001-02 ชั้น 30 อาคารเดอะไนน์ ทาวเวอร์ แกรนด์ พระราม 9 33/4 ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร");
const parsedPhone = index.parse("8/51 ถนนพัทยาเหนือ ตำบลนาเกลือ อำเภอบางละมุง จังหวัดชลบุรี 20150 โทรศัพท์ 038 370 518 (19-21), 038 427 671 (72-73)");
```

ผลลัพธ์ของการค้นหาและการ parse จะมีชื่อไทยพร้อมชื่ออังกฤษเมื่อข้อมูลต้นทางมีให้:

```json
{
  "subdistrict": { "code": "103701", "name": "ทุ่งพญาไท", "nameEn": "Thung Phaya Thai" },
  "district": { "code": "1037", "name": "ราชเทวี", "nameEn": "Ratchathewi" },
  "province": { "code": "10", "name": "กรุงเทพมหานคร", "nameEn": "Bangkok" }
}
```

ตัวอย่างฟิลด์ที่ parser สามารถคืนค่าได้:

```json
{
  "houseNumber": "33/4",
  "building": "เดอะไนน์ ทาวเวอร์ แกรนด์ พระราม 9",
  "floor": "30",
  "unit": "TNAO-3001-02",
  "moo": "7",
  "soi": "101",
  "road": "พระราม 9",
  "phone": "038 370 518 (19-21), 038 427 671 (72-73)",
  "postalCode": "10310",
  "subdistrict": "ห้วยขวาง",
  "subdistrictEn": "Huai Khwang",
  "district": "ห้วยขวาง",
  "districtEn": "Huai Khwang",
  "province": "กรุงเทพมหานคร",
  "provinceEn": "Bangkok",
  "subdistrictCode": "101701",
  "districtCode": "1017",
  "provinceCode": "10",
  "confidence": 0.95
}
```

## ใช้งานกับ React

```tsx
import { ThaiAddressAutocomplete } from "@1moby/thai-address/react";

export function AddressField() {
  return (
    <ThaiAddressAutocomplete
      dataUrl="/data/thai-address-core.json.gz"
      label="ที่อยู่"
      placeholder="ค้นหาตำบล อำเภอ จังหวัด"
      onSelect={(address) => console.log(address)}
    />
  );
}
```

## ใช้งานกับ Plain JavaScript

```html
<input id="address" autocomplete="off" />
<script type="module">
  import { attachThaiAddressAutocomplete } from "@1moby/thai-address/dom";

  attachThaiAddressAutocomplete(document.querySelector("#address"), {
    dataUrl: "/data/thai-address-core.json.gz",
    onSelect(address) {
      console.log(address);
    }
  });
</script>
```

## โครงสร้างข้อมูล

สร้างไฟล์ข้อมูลขนาดเล็กจาก `raw/ccaatt.xlsx` และ `raw/thailand-geography-subdistricts.json`:

```bash
npm run build:data
```

ผลลัพธ์:

- `data/thai-address-core.json.gz` สำหรับ npm package
- `public/data/thai-address-core.json.gz` สำหรับ demo และ static hosting
- ไฟล์ `.meta.json` ที่เก็บจำนวน record และสถิติการ build

ตัว converter จะเก็บเฉพาะข้อมูลเขตการปกครองที่ยังใช้งานอยู่ และตัด row ที่มีวันที่จำหน่าย, marker `*`, ข้อความ `จำหน่าย` หรือ `ยกเลิก`, รวมถึง footer/update note ออกจาก payload

ข้อมูลหลักมีจังหวัด อำเภอ/เขต ตำบล/แขวง รหัสไปรษณีย์ และชื่อไทย/อังกฤษ เมื่อ parser จับคู่ตำบล/แขวงได้ ระบบจะเติม `postalCode` จากข้อมูลตำบลนั้นแม้ข้อความที่ผู้ใช้วางจะไม่ได้ระบุรหัสไปรษณีย์ไว้โดยตรง ส่วนพจนานุกรมถนน ซอย และชุมชนยังไม่ได้แนบใน payload เพื่อรักษาขนาดให้เล็กและโหลดเร็วบน browser

## ขอบเขตการ parse

parser จะพยายามอ่านพื้นที่จากใหญ่ไปเล็ก:

1. จังหวัด
2. อำเภอ/เขต
3. ตำบล/แขวง
4. ถนน ซอย หมู่ และรายละเอียดหน้า address

แนวทางนี้ช่วยลดปัญหาชื่อซ้ำหรือชื่อซ้อน เช่น `พญาไท`, `ทุ่งพญาไท` และ `ราชเทวี`

ฟิลด์อาคาร ชั้น และห้องจะถูกเติมเมื่อข้อความมีคำกำกับชัดเจนเท่านั้น เช่น `อาคาร`, `ชั้น`, `ห้อง`, `ห้องเลขที่` ส่วนโทรศัพท์จะอ่านจากคำว่า `โทรศัพท์` และหยุดก่อน `โทรสาร`

## Demo และเอกสาร

รันหน้า demo ในเครื่อง:

```bash
npm run dev
```

build สำหรับ GitHub Pages:

```bash
npm run build
```

workflow ที่ `.github/workflows/pages.yml` จะรัน test, build ข้อมูล, build หน้า landing page ภาษาไทยและหน้าเอกสารแปล แล้ว deploy `demo-dist` ไปที่:

https://1moby.github.io/thai-address/

หน้าเอกสารมี 10 ภาษา ได้แก่ อังกฤษ จีน ฮินดี สเปน ฝรั่งเศส อาหรับ เบงกาลี โปรตุเกส รัสเซีย และอูรดู เอกสารแปลใช้เพื่ออธิบายวิธีใช้งานเท่านั้น ตัว parser ยังคงรองรับ input ที่อยู่ภาษาไทยและอังกฤษเป็นหลัก

## ทดสอบและ build

```bash
npm test
npm run build
npm pack --dry-run
```

## เผยแพร่ npm

```bash
npm publish --access public
```

metadata ของ package เตรียมไว้สำหรับ repository:

https://github.com/1moby/thai-address

ชื่อ package บน npm คือ `@1moby/thai-address`:

https://www.npmjs.com/package/@1moby/thai-address

## หมายเหตุด้านประสิทธิภาพ

ไฟล์ JSON ที่ generate ได้มีขนาดประมาณ 524 kB และบีบอัดด้วย gzip เหลือประมาณ 125 kB การใช้ index ในหน่วยความจำแบบไม่มี dependency สามารถค้นหาจากข้อมูลตำบล/แขวง 7,436 รายการได้เร็วพอสำหรับการพิมพ์ทีละตัวอักษร การตรวจสอบในเครื่องวัดได้ประมาณ 2.3 ms ต่อการค้นหาแบบผสมไทย/อังกฤษ 1,000 ครั้ง

สำหรับ payload v1 นี้ SQLite-WASM หรือ DuckDB-WASM เพิ่มขนาดและเวลาเริ่มต้นมากกว่าประโยชน์ที่ได้ จึงเลือกโครงสร้างข้อมูล gzip ขนาดเล็กและ index ใน memory เพื่อให้เริ่มใช้งานบน browser ได้เร็วที่สุด

## แหล่งอ้างอิง

- DOPA STAT-BORA CCAATT: https://stat.bora.dopa.go.th/stat/statnew/statMenu/newStat/ccaa.php
- thailand-geography-json postal codes: https://github.com/thailand-geography-data/thailand-geography-json
- MDN `DecompressionStream`: https://developer.mozilla.org/en-US/docs/Web/API/DecompressionStream
- SQLite WASM: https://sqlite.org/wasm/doc/trunk/index.md
- DuckDB-WASM: https://duckdb.org/docs/current/clients/wasm/overview.html
