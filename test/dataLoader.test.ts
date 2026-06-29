import { gzipSync } from "node:zlib";
import { decodeThaiAddressData } from "../src/dataLoader";
import { miniData } from "./fixtures/miniData";

describe("gzipped data loader", () => {
  it("decodes gzipped address data with browser-native streams", async () => {
    const compressed = gzipSync(JSON.stringify(miniData));

    const decoded = await decodeThaiAddressData(compressed);

    expect(decoded.provinces).toHaveLength(miniData.provinces.length);
    expect(decoded.subdistricts.find(([code]) => code === "100402")).toEqual(["100402", "1004", "สีลม", "Si Lom"]);
    expect(decoded.postalCodes?.[decoded.subdistricts.findIndex(([code]) => code === "100704")]).toBe("10330");
  });
});
