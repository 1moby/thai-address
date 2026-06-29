import { attachThaiAddressAutocomplete } from "../src/dom";
import { miniData } from "./fixtures/miniData";

describe("plain JavaScript autocomplete", () => {
  it("attaches suggestions to an input and cleans up", () => {
    document.body.innerHTML = `<label>Address <input id="address" /></label>`;
    const input = document.querySelector<HTMLInputElement>("#address");
    const onSelect = vi.fn();

    const cleanup = attachThaiAddressAutocomplete(input!, {
      data: miniData,
      onSelect
    });

    input!.value = "ทับเที่ยง";
    input!.dispatchEvent(new Event("input", { bubbles: true }));

    const option = document.querySelector<HTMLButtonElement>('[role="option"]');
    expect(option?.textContent).toBe("ตำบลทับเที่ยง อำเภอเมืองตรัง จังหวัดตรัง");

    option!.click();
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "920101"
      })
    );
    expect(input!.value).toBe("ตำบลทับเที่ยง อำเภอเมืองตรัง จังหวัดตรัง");

    cleanup();
    expect(document.querySelector('[role="listbox"]')).toBeNull();
  });
});
