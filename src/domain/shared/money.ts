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
