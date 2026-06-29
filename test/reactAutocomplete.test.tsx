import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThaiAddressAutocomplete } from "../src/react";
import { miniData } from "./fixtures/miniData";

describe("React ThaiAddressAutocomplete", () => {
  it("shows suggestions and emits the selected address", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <ThaiAddressAutocomplete
        data={miniData}
        label="ที่อยู่"
        placeholder="ค้นหาตำบล อำเภอ จังหวัด"
        onSelect={onSelect}
      />
    );

    await user.type(screen.getByRole("combobox", { name: "ที่อยู่" }), "สีลม");
    await user.click(screen.getByRole("option", { name: "แขวงสีลม เขตบางรัก กรุงเทพมหานคร" }));

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "100402",
        label: "แขวงสีลม เขตบางรัก กรุงเทพมหานคร"
      })
    );
  });
});
