import type { Cents } from '@/domain/shared/money';

const ars = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
});

export function formatPrice(cents: Cents): string {
  return ars.format(cents / 100);
}

const arsWhole = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

/** Marketing style, no cents and no space: "$18.500". For headlines, not for totals. */
export function formatPriceShort(cents: Cents): string {
  return `$${arsWhole.format(Math.round(cents / 100))}`;
}
