export type UnitOfMeasureDefinition = {
  code: string;
  displayUnit: string;
  title: string;
  quantityType: "MASS" | "VOLUME" | "COUNT" | "LENGTH";
  toSiFactor: number | null;
};

export const UNITS_OF_MEASURE: UnitOfMeasureDefinition[] = [
  { code: "GRM", displayUnit: "g", title: "gram", quantityType: "MASS", toSiFactor: 0.001 },
  { code: "KGM", displayUnit: "kg", title: "kilogram", quantityType: "MASS", toSiFactor: 1 },
  { code: "ONZ", displayUnit: "oz", title: "ounce", quantityType: "MASS", toSiFactor: 0.0283495 },
  { code: "LBR", displayUnit: "lb", title: "pound", quantityType: "MASS", toSiFactor: 0.453592 },
  { code: "MLT", displayUnit: "ml", title: "millilitre", quantityType: "VOLUME", toSiFactor: 0.000001 },
  { code: "LTR", displayUnit: "L", title: "litre", quantityType: "VOLUME", toSiFactor: 0.001 },
  { code: "MMT", displayUnit: "mm", title: "millimetre", quantityType: "LENGTH", toSiFactor: 0.001 },
  { code: "CMT", displayUnit: "cm", title: "centimetre", quantityType: "LENGTH", toSiFactor: 0.01 },
  { code: "MTR", displayUnit: "m", title: "metre", quantityType: "LENGTH", toSiFactor: 1 },
  { code: "EA", displayUnit: "ea", title: "each", quantityType: "COUNT", toSiFactor: null },
];

export type MeasuredValue = {
  value: number;
  unitCode: string;
  displayUnit: string;
};

export function formatMeasuredValue(measurement: MeasuredValue): string {
  return `${measurement.value} ${measurement.displayUnit}`;
}

export function convertMeasuredValue(
  measurement: MeasuredValue,
  targetCode: string,
): MeasuredValue | null {
  const from = UNITS_OF_MEASURE.find((item) => item.code === measurement.unitCode);
  const to = UNITS_OF_MEASURE.find((item) => item.code === targetCode);
  if (!from || !to || from.toSiFactor === null || to.toSiFactor === null) {
    return null;
  }
  if (from.quantityType !== to.quantityType) {
    return null;
  }

  const si = measurement.value * from.toSiFactor;
  return {
    value: Number((si / to.toSiFactor).toPrecision(10)),
    unitCode: to.code,
    displayUnit: to.displayUnit,
  };
}
