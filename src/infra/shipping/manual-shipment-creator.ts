import type { ShipmentCreator } from '@/domain/orders/ports';

/** No carrier connection: the order is left for the admin to ship by hand from /admin/pedidos. */
export class ManualShipmentCreator implements ShipmentCreator {
  async create(): Promise<'manual'> {
    return 'manual';
  }
}
