export type AiDataType = "NUMERIC" | "ALPHANUMERIC" | "DATE" | "DECIMAL";

export type ApplicationIdentifierDefinition = {
  ai: string;
  title: string;
  description: string;
  dataType: AiDataType;
  minLength: number;
  maxLength: number;
  fixedLength: boolean;
  decimalIndicator: boolean;
  qualifier: boolean;
};

export const GS1_APPLICATION_IDENTIFIERS: ApplicationIdentifierDefinition[] = [
  { ai: "00", title: "SSCC", description: "Serial Shipping Container Code", dataType: "NUMERIC", minLength: 18, maxLength: 18, fixedLength: true, decimalIndicator: false, qualifier: false },
  { ai: "01", title: "GTIN", description: "Global Trade Item Number", dataType: "NUMERIC", minLength: 14, maxLength: 14, fixedLength: true, decimalIndicator: false, qualifier: false },
  { ai: "02", title: "CONTENT", description: "GTIN of contained trade items", dataType: "NUMERIC", minLength: 14, maxLength: 14, fixedLength: true, decimalIndicator: false, qualifier: false },
  { ai: "10", title: "BATCH/LOT", description: "Batch or lot number", dataType: "ALPHANUMERIC", minLength: 1, maxLength: 20, fixedLength: false, decimalIndicator: false, qualifier: true },
  { ai: "11", title: "PROD DATE", description: "Production date (YYMMDD)", dataType: "DATE", minLength: 6, maxLength: 6, fixedLength: true, decimalIndicator: false, qualifier: false },
  { ai: "13", title: "PACK DATE", description: "Packaging date (YYMMDD)", dataType: "DATE", minLength: 6, maxLength: 6, fixedLength: true, decimalIndicator: false, qualifier: false },
  { ai: "15", title: "BEST BEFORE", description: "Best before date (YYMMDD)", dataType: "DATE", minLength: 6, maxLength: 6, fixedLength: true, decimalIndicator: false, qualifier: false },
  { ai: "17", title: "EXPIRY", description: "Expiration date (YYMMDD)", dataType: "DATE", minLength: 6, maxLength: 6, fixedLength: true, decimalIndicator: false, qualifier: false },
  { ai: "21", title: "SERIAL", description: "Serial number", dataType: "ALPHANUMERIC", minLength: 1, maxLength: 20, fixedLength: false, decimalIndicator: false, qualifier: true },
  { ai: "22", title: "CPV", description: "Consumer product variant", dataType: "ALPHANUMERIC", minLength: 1, maxLength: 20, fixedLength: false, decimalIndicator: false, qualifier: true },
  { ai: "30", title: "COUNT", description: "Variable count of items", dataType: "NUMERIC", minLength: 1, maxLength: 8, fixedLength: false, decimalIndicator: false, qualifier: false },
  { ai: "37", title: "COUNT", description: "Count of trade items", dataType: "NUMERIC", minLength: 1, maxLength: 8, fixedLength: false, decimalIndicator: false, qualifier: false },
  { ai: "310", title: "NET WEIGHT kg", description: "Net weight, kilograms, with decimal indicator", dataType: "DECIMAL", minLength: 6, maxLength: 6, fixedLength: true, decimalIndicator: true, qualifier: false },
  { ai: "311", title: "LENGTH m", description: "Length or first dimension, metres", dataType: "DECIMAL", minLength: 6, maxLength: 6, fixedLength: true, decimalIndicator: true, qualifier: false },
  { ai: "320", title: "NET WEIGHT lb", description: "Net weight, pounds", dataType: "DECIMAL", minLength: 6, maxLength: 6, fixedLength: true, decimalIndicator: true, qualifier: false },
  { ai: "400", title: "ORDER NUMBER", description: "Customer's purchase order number", dataType: "ALPHANUMERIC", minLength: 1, maxLength: 30, fixedLength: false, decimalIndicator: false, qualifier: false },
  { ai: "410", title: "SHIP TO LOC", description: "Ship to / deliver to GLN", dataType: "NUMERIC", minLength: 13, maxLength: 13, fixedLength: true, decimalIndicator: false, qualifier: false },
  { ai: "414", title: "LOC No", description: "GLN of physical location", dataType: "NUMERIC", minLength: 13, maxLength: 13, fixedLength: true, decimalIndicator: false, qualifier: false },
  { ai: "240", title: "ADDITIONAL ID", description: "Additional product identification", dataType: "ALPHANUMERIC", minLength: 1, maxLength: 30, fixedLength: false, decimalIndicator: false, qualifier: false },
  { ai: "241", title: "CUST. PART No", description: "Customer part number", dataType: "ALPHANUMERIC", minLength: 1, maxLength: 30, fixedLength: false, decimalIndicator: false, qualifier: false },
  { ai: "250", title: "SECONDARY SERIAL", description: "Secondary serial number", dataType: "ALPHANUMERIC", minLength: 1, maxLength: 30, fixedLength: false, decimalIndicator: false, qualifier: false },
  { ai: "253", title: "GDTI", description: "Global Document Type Identifier", dataType: "ALPHANUMERIC", minLength: 13, maxLength: 30, fixedLength: false, decimalIndicator: false, qualifier: false },
];

const BY_AI = new Map(GS1_APPLICATION_IDENTIFIERS.map((item) => [item.ai, item]));

export function getApplicationIdentifier(ai: string): ApplicationIdentifierDefinition | undefined {
  if (BY_AI.has(ai)) {
    return BY_AI.get(ai);
  }

  if (/^\d{4}$/.test(ai) && BY_AI.has(ai.slice(0, 3))) {
    const base = BY_AI.get(ai.slice(0, 3));
    if (base?.decimalIndicator) {
      return { ...base, ai };
    }
  }

  return undefined;
}

export function matchLongestAi(source: string): ApplicationIdentifierDefinition | undefined {
  for (const length of [4, 3, 2]) {
    const candidate = source.slice(0, length);
    const definition = getApplicationIdentifier(candidate);
    if (definition) {
      return definition;
    }
  }
  return undefined;
}
