import { describe, expect, it } from "vitest";
import { convertMeasuredValue, formatMeasuredValue } from "./units";

describe("units of measure", () => {
  it("formats declared values without concatenating number and unit", () => {
    expect(formatMeasuredValue({ value: 500, unitCode: "GRM", displayUnit: "g" })).toBe("500 g");
  });

  it("converts mass when mathematically safe and keeps the original declaration separate", () => {
    const original = { value: 500, unitCode: "GRM", displayUnit: "g" };
    const converted = convertMeasuredValue(original, "KGM");
    expect(original).toEqual({ value: 500, unitCode: "GRM", displayUnit: "g" });
    expect(converted?.unitCode).toBe("KGM");
    expect(converted?.value).toBe(0.5);
  });

  it("refuses to convert count to mass", () => {
    expect(convertMeasuredValue({ value: 6, unitCode: "EA", displayUnit: "ea" }, "GRM")).toBeNull();
  });
});
