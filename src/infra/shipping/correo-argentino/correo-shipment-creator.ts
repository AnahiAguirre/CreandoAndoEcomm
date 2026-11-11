import type { Order } from '@/domain/orders/order';
import { DEFAULT_PARCEL } from '@/domain/orders/parcel';
import { ShipmentFailedError, type ShipmentCreator } from '@/domain/orders/ports';

import type { CorreoClient } from './client';

/** Registers a paid order in MiCorreo (`/shipping/import`), so nobody has to type it in by hand. */
export class CorreoShipmentCreator implements ShipmentCreator {
  constructor(private readonly client: CorreoClient) {}

  async create(order: Order): Promise<'created'> {
    const shipping = order.shipping;
    if (!shipping) throw new ShipmentFailedError('El pedido no tiene envío.');
    // Orders made before the carrier integration have the address as free text only.
    if (!shipping.provinceCode) throw new ShipmentFailedError('Pedido sin provincia: cargalo a mano en MiCorreo.');

    const parcel = shipping.parcel ?? DEFAULT_PARCEL;
    const physicalCents = order.items
      .filter((i) => i.kind === 'physical')
      .reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);

    let delivery: Record<string, unknown> | null = null;
    if (shipping.method === 'sucursal' && shipping.agencyCode) {
      delivery = { deliveryType: 'S', agency: shipping.agencyCode };
    } else if (shipping.method === 'domicilio' && shipping.street) {
      delivery = {
        deliveryType: 'D',
        address: {
          streetName: shipping.street.name,
          streetNumber: shipping.street.number,
          floor: shipping.street.floor ?? undefined,
          apartment: shipping.street.apartment ?? undefined,
          city: shipping.street.city,
          provinceCode: shipping.provinceCode,
          postalCode: shipping.postalCode,
        },
      };
    }
    if (!delivery) throw new ShipmentFailedError('Faltan datos de entrega: cargalo a mano en MiCorreo.');

    try {
      await this.client.importShipment({
        extOrderId: order.id,
        orderNumber: order.id.slice(0, 8),
        recipient: { name: shipping.recipient, email: order.email, phone: shipping.phone },
        shipping: {
          ...delivery,
          weight: Math.round(parcel.weightG),
          length: Math.round(parcel.lengthCm),
          width: Math.round(parcel.widthCm),
          height: Math.round(parcel.heightCm),
          declaredValue: physicalCents / 100,
        },
      });
    } catch {
      throw new ShipmentFailedError('MiCorreo no aceptó el envío. Probá de nuevo o cargalo a mano.');
    }
    return 'created';
  }
}
