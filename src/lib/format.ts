import type { Cents } from '@/domain/shared/money';

const ars = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
});

export function formatPrice(cents: Cents): string {
  return ars.format(cents / 100);
}
