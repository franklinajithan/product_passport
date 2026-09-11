import { MeasurementUnit } from "@prisma/client";

const UNIT_LABELS: Record<MeasurementUnit, string> = {
  G: "g",
  KG: "kg",
  ML: "ml",
  L: "L",
  OZ: "oz",
  LB: "lb",
  PIECES: "pieces",
};

export function formatMeasurement(
  value: { toString(): string } | number | null | undefined,
  unit: MeasurementUnit | null | undefined,
): string | null {
  if (value === null || value === undefined || !unit) {
    return null;
  }

  const numeric = Number(value.toString());
  if (Number.isNaN(numeric)) {
    return null;
  }

  const rendered =
    Number.isInteger(numeric) ? numeric.toString() : numeric.toLocaleString("en-GB", { maximumFractionDigits: 2 });

  return `${rendered} ${UNIT_LABELS[unit]}`;
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function titleFromRole(role: string): string {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
