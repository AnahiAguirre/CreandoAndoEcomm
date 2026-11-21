import type { Cents } from '@/domain/shared/money';

const ars = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
});

const arsWhole = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatPrice(cents: Cents): string {
  return ars.format(cents / 100);
}

/** Without centavos, for round amounts in copy: "$ 70.000". */
export function formatPriceShort(cents: Cents): string {
  return arsWhole.format(cents / 100);
}
