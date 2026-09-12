import {
  getApplicationIdentifier,
  matchLongestAi,
  type ApplicationIdentifierDefinition,
} from "@/lib/standards/gs1/application-identifiers.dictionary";
import { toCanonicalGTIN14, validateGTIN } from "@/lib/standards/gs1/gtin";

export type ParsedAiValue = {
  ai: string;
  title: string;
  value: string;
  definition: ApplicationIdentifierDefinition;
};

export type ElementStringParseResult = {
  ok: boolean;
  values: ParsedAiValue[];
  errors: string[];
};

const GROUP_SEPARATOR = String.fromCharCode(29);

export function validateApplicationIdentifiers(values: Array<{ ai: string; value: string }>): string[] {
  const errors: string[] = [];

  for (const item of values) {
    const definition = getApplicationIdentifier(item.ai);
    if (!definition) {
      errors.push(`Unknown Application Identifier ${item.ai}.`);
      continue;
    }

    if (item.value.length < definition.minLength || item.value.length > definition.maxLength) {
      errors.push(
        `AI ${item.ai} (${definition.title}) must be ${definition.minLength}–${definition.maxLength} characters.`,
      );
    }

    if (definition.dataType === "NUMERIC" || definition.dataType === "DATE" || definition.dataType === "DECIMAL") {
      if (!/^\d+$/.test(item.value)) {
        errors.push(`AI ${item.ai} must be numeric.`);
      }
    }

    if (item.ai === "01" || item.ai === "02") {
      const gtin = validateGTIN(item.value);
      if (!gtin.valid) {
        errors.push(`AI ${item.ai} is not a valid GTIN.`);
      }
    }
  }

  return errors;
}

export function generateGS1ElementString(
  values: Array<{ ai: string; value: string }>,
  style: "human" | "machine" = "human",
): string {
  const normalised = values.map((item) => {
    if ((item.ai === "01" || item.ai === "02") && /^\d{8,14}$/.test(item.value)) {
      return { ...item, value: toCanonicalGTIN14(item.value) };
    }
    return item;
  });
  const errors = validateApplicationIdentifiers(normalised);
  if (errors.length > 0) {
    throw new Error(errors[0]);
  }

  return normalised
    .map((item) => {
      const definition = getApplicationIdentifier(item.ai);
      const encoded = item.value;

      if (style === "human") {
        return `(${item.ai})${encoded}`;
      }

      const separator = definition && !definition.fixedLength ? GROUP_SEPARATOR : "";
      return `${item.ai}${encoded}${separator}`;
    })
    .join("");
}

export function parseGS1ElementString(input: string): ElementStringParseResult {
  const errors: string[] = [];
  const values: ParsedAiValue[] = [];
  const trimmed = input.trim();

  if (!trimmed) {
    return { ok: false, values, errors: ["Element string is empty."] };
  }

  if (trimmed.includes("(")) {
    const matches = [...trimmed.matchAll(/\((\d{2,4})\)([^\(]*)/g)];
    if (matches.length === 0) {
      return { ok: false, values, errors: ["No Application Identifiers found."] };
    }

    for (const match of matches) {
      const ai = match[1];
      const value = match[2].replace(new RegExp(GROUP_SEPARATOR, "g"), "").trim();
      const definition = getApplicationIdentifier(ai);
      if (!definition) {
        errors.push(`Unknown Application Identifier ${ai}.`);
        continue;
      }
      values.push({ ai: definition.ai, title: definition.title, value, definition });
    }
  } else {
    let cursor = 0;
    const source = trimmed.replace(/\]e[0-9]/gi, "");
    while (cursor < source.length) {
      const rest = source.slice(cursor);
      const definition = matchLongestAi(rest);
      if (!definition) {
        errors.push(`Unable to parse Application Identifier at position ${cursor}.`);
        break;
      }

      cursor += definition.ai.length;
      let value: string;
      if (definition.fixedLength) {
        value = source.slice(cursor, cursor + definition.maxLength);
        cursor += definition.maxLength;
      } else {
        const nextSep = source.indexOf(GROUP_SEPARATOR, cursor);
        if (nextSep === -1) {
          value = source.slice(cursor);
          cursor = source.length;
        } else {
          value = source.slice(cursor, nextSep);
          cursor = nextSep + 1;
        }
      }

      values.push({
        ai: definition.ai,
        title: definition.title,
        value,
        definition,
      });
    }
  }

  errors.push(...validateApplicationIdentifiers(values.map((item) => ({ ai: item.ai, value: item.value }))));

  return { ok: errors.length === 0 && values.length > 0, values, errors };
}
