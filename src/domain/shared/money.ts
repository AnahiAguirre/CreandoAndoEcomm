/**
 * All money in the system is an integer amount of centavos (ARS).
 * Never use floats for prices — see plan §"Modelo de datos".
 */
export type Cents = number;

export function assertCents(value: number, label = 'amount'): Cents {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${label} must be a non-negative integer of cents, got ${value}`);
  }
  return value;
}

/**
 * Applies a percentage change to a price and rounds to the nearest multiple of
 * `roundTo` centavos. Integer-only output; the float only lives inside this call.
 */
export function adjustCents(cents: Cents, percent: number, roundTo = 1): Cents {
  return Math.round((cents * (100 + percent)) / 100 / roundTo) * roundTo;
}
