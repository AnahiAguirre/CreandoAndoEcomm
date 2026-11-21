import { FREE_SHIPPING_MIN_CENTS } from '@/domain/orders/free-shipping';

import { formatPriceShort } from './format';

/** "$ 70.000": the free-shipping minimum as people read it. */
export const FREE_SHIPPING_FROM = formatPriceShort(FREE_SHIPPING_MIN_CENTS);

export const FREE_SHIPPING_TEXT = `Envío gratis en compras desde ${FREE_SHIPPING_FROM}`;
