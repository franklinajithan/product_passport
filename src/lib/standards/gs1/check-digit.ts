/**
 * GS1 Modulo-10 check digit used by GTIN-8/12/13/14.
 * Positions are counted from the right of the payload (excluding the check digit).
 * Odd positions are multiplied by 3; even positions by 1.
 */
export function calculateGTINCheckDigit(payloadWithoutCheck: string): string {
  if (!/^\d+$/.test(payloadWithoutCheck) || payloadWithoutCheck.length === 0) {
    throw new Error("GTIN payload must be a non-empty numeric string.");
  }

  const reversed = payloadWithoutCheck.split("").map(Number).reverse();
  let sum = 0;

  for (let index = 0; index < reversed.length; index += 1) {
    const multiplier = index % 2 === 0 ? 3 : 1;
    sum += reversed[index] * multiplier;
  }

  return String((10 - (sum % 10)) % 10);
}

export function isGtinCheckDigitValid(gtin: string): boolean {
  if (!/^\d+$/.test(gtin) || gtin.length < 8) {
    return false;
  }

  return calculateGTINCheckDigit(gtin.slice(0, -1)) === gtin.slice(-1);
}
