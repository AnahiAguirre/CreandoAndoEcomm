/**
 * Seasonal touches (lights, Santa hats) turn themselves on and off by date, so
 * nobody has to remember to take the Christmas decoration down in January.
 *
 * Window: from 15 November to 6 January (Reyes) inclusive, Argentine time.
 */
export function isChristmasSeason(now: Date = new Date()): boolean {
  // Argentina has no DST: UTC-3 all year.
  const ar = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const month = ar.getUTCMonth() + 1;
  const day = ar.getUTCDate();
  return (month === 11 && day >= 15) || month === 12 || (month === 1 && day <= 6);
}
