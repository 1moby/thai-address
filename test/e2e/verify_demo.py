from pathlib import Path
from playwright.sync_api import expect, sync_playwright


ROOT = Path(__file__).resolve().parents[2]
SCREENSHOT_DIR = ROOT / "test-results"
SCREENSHOT_DIR.mkdir(exist_ok=True)
BASE_URL = "http://127.0.0.1:4173/thai-address/"


def run_viewport(width: int, height: int, suffix: str) -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": width, "height": height})
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        expect(page.get_by_text("ข้อมูลกรมการปกครองพร้อมใช้")).to_be_visible()
        expect(page.get_by_label("วางที่อยู่")).to_be_visible()
        expect(page.get_by_text("เอกสารภาษาอื่น")).to_be_visible()
        expect(page.locator('a[href="/thai-address/docs/en/"]').first).to_be_visible()
        expect(page.locator(".language-link").filter(has_text="🇬🇧").filter(has_text="English").filter(has_text="Docs · en")).to_be_visible()
        expect(page.locator(".language-link").filter(has_text="อังกฤษ")).to_have_count(0)
        expect(page.get_by_text('"houseNumber": "87/2"')).to_be_visible()
        expect(page.get_by_text('"building": "CRC All Seasons Place"')).to_be_visible()
        expect(page.get_by_text('"road": "วิทยุ"')).to_be_visible()
        expect(page.get_by_text('"district": "ปทุมวัน"')).to_be_visible()
        expect(page.get_by_text('"phone": "0-2626-2300"')).to_be_visible()
        expect(page.get_by_text('"postalCode": "10330"')).to_be_visible()
        expect(page.locator(".field-row").filter(has_text="ตำบล/แขวง").filter(has_text="ลุมพินี").filter(has_text="Lumphini")).to_be_visible()
        expect(page.locator(".field-row").filter(has_text="อำเภอ/เขต").filter(has_text="ปทุมวัน").filter(has_text="Pathum Wan")).to_be_visible()
        expect(page.locator(".field-row").filter(has_text="จังหวัด").filter(has_text="กรุงเทพมหานคร").filter(has_text="Bangkok")).to_be_visible()
        expect(page.locator(".field-row").filter(has_text="รหัสไปรษณีย์").filter(has_text="10330")).to_be_visible()

        typo_sample = "35    ถนนสุขุมวิท แขวงคลองเตยน เขตวัฒนา จังหวัดกรุงเทพมหานคร 10110 โทรศัพท์ 0-2208-4232,0-2208-4204,0-2208-4241,0-2208-4246,4219,0-2208-4227"
        page.get_by_role("button", name=typo_sample).click()
        expect(page.get_by_text('"road": "สุขุมวิท"')).to_be_visible()
        expect(page.get_by_text('"subdistrict": "คลองเตยเหนือ"')).to_be_visible()
        expect(page.get_by_text('"district": "วัฒนา"')).to_be_visible()
        expect(page.get_by_text('"postalCode": "10110"')).to_be_visible()

        room_sample = "ห้องเลขที่ TNAO-3001-02 ชั้น 30 ทาวเวอร์ เอ อาคารเดอะไนน์ ทาวเวอร์ แกรนด์ พระราม 9 33/4 ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร"
        page.get_by_label("วางที่อยู่").fill(room_sample)
        expect(page.locator(".field-row").filter(has_text="รหัสไปรษณีย์").filter(has_text="10310")).to_be_visible()
        expect(page.get_by_text('"postalCode": "10310"')).to_be_visible()

        ayutthaya_sample = "18/21     ตำบลหอรัตนไชย อำเภอพระนครศรีอยุธยา จังหวัดพระนครศรีอยุธยา 13000 โทรศัพท์ 03 525 2243"
        page.get_by_label("วางที่อยู่").fill(ayutthaya_sample)
        expect(page.locator(".field-row").filter(has_text="บ้านเลขที่").filter(has_text="18/21")).to_be_visible()
        expect(page.locator(".field-row").filter(has_text="โทรศัพท์").filter(has_text="03 525 2243")).to_be_visible()
        expect(page.locator(".field-row").filter(has_text="ตำบล/แขวง").filter(has_text="หอรัตนไชย").filter(has_text="Ho Rattanachai")).to_be_visible()
        expect(page.locator(".field-row").filter(has_text="อำเภอ/เขต").filter(has_text="พระนครศรีอยุธยา").filter(has_text="Phra Nakhon Si Ayutthaya")).to_be_visible()
        expect(page.locator(".field-row").filter(has_text="จังหวัด").filter(has_text="พระนครศรีอยุธยา").filter(has_text="Phra Nakhon Si Ayutthaya")).to_be_visible()
        expect(page.locator(".field-row").filter(has_text="รหัสไปรษณีย์").filter(has_text="13000")).to_be_visible()

        search = page.locator("#admin-search")
        search.fill("Thap Thiang Mueang Trang")
        option = page.get_by_role("option").filter(has_text="ตำบลทับเที่ยง อำเภอเมืองตรัง จังหวัดตรัง")
        expect(option).to_be_visible()
        option.click()

        expect(page.get_by_text('"subdistrict": "ทับเที่ยง"')).to_be_visible()
        expect(page.get_by_text('"subdistrictEn": "Thap Thiang"')).to_be_visible()
        expect(page.get_by_text('"province": "ตรัง"')).to_be_visible()

        page.get_by_role("button", name="คัดลอก").click()
        expect(page.get_by_role("button", name="คัดลอกแล้ว")).to_be_visible()

        page.locator('a[href="/thai-address/docs/en/"]').first.click()
        page.wait_for_url("**/thai-address/docs/en/")
        expect(page.get_by_role("heading", name="thai-address documentation")).to_be_visible()
        expect(page.get_by_text("address parsing accepts Thai and English address text only")).to_be_visible()

        page.screenshot(path=str(SCREENSHOT_DIR / f"demo-{suffix}.png"), full_page=True)
        browser.close()


run_viewport(1440, 1000, "desktop")
run_viewport(390, 920, "mobile")
