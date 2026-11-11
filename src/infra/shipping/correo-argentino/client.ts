import { z } from 'zod';

import { ShippingUnavailableError } from '@/domain/orders/ports';

export const CORREO_BASE_URLS = {
  test: 'https://apitest.correoargentino.com.ar/micorreo/v1',
  prod: 'https://api.correoargentino.com.ar/micorreo/v1',
} as const;

export interface CorreoConfig {
  env: keyof typeof CORREO_BASE_URLS;
  user: string;
  password: string;
  customerId: string;
  originPostalCode: string;
}

const TIMEOUT_MS = 10_000;
// Renew a minute before the token expires so a request never leaves with a dead one.
const EXPIRY_MARGIN_MS = 60_000;

const tokenSchema = z.object({ token: z.string().min(1), expires: z.string() });

const ratesSchema = z.object({
  rates: z.array(
    z.object({
      deliveredType: z.enum(['D', 'S']),
      productName: z.string(),
      price: z.number(),
      deliveryTimeMax: z.coerce.number().optional(),
    }),
  ),
});
export type CorreoRate = z.infer<typeof ratesSchema>['rates'][number];

const agencySchema = z.object({
  code: z.string(),
  name: z.string(),
  status: z.string().optional(),
  services: z.object({ pickupAvailability: z.boolean().optional() }).optional(),
  location: z.object({
    address: z.object({
      streetName: z.string().nullish(),
      streetNumber: z.string().nullish(),
      locality: z.string().nullish(),
      city: z.string().nullish(),
      postalCode: z.string().nullish(),
    }),
  }),
});
export type CorreoAgency = z.infer<typeof agencySchema>;

export interface RatesRequest {
  postalCodeDestination: string;
  deliveredType: 'D' | 'S';
  weightG: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface ImportRequest {
  extOrderId: string;
  orderNumber: string;
  recipient: { name: string; email: string; phone: string };
  shipping: Record<string, unknown>;
}

/**
 * The only file that knows MiCorreo's wire format. The API was written from
 * third-party docs, so every response is parsed with zod: if Correo answers
 * with something else, it fails loudly here and gets fixed here.
 */
export class CorreoClient {
  private token: { value: string; expiresAt: number } | null = null;

  constructor(
    private readonly config: CorreoConfig,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async rates(input: RatesRequest): Promise<CorreoRate[]> {
    const body = {
      customerId: this.config.customerId,
      postalCodeOrigin: this.config.originPostalCode,
      postalCodeDestination: input.postalCodeDestination,
      deliveredType: input.deliveredType,
      dimensions: { weight: input.weightG, length: input.lengthCm, width: input.widthCm, height: input.heightCm },
    };
    const json = await this.request('POST', '/rates', body);
    return this.parse(ratesSchema, json).rates;
  }

  async agencies(provinceCode: string): Promise<CorreoAgency[]> {
    const json = await this.request('GET', `/agencies?provinceCode=${encodeURIComponent(provinceCode)}`);
    return this.parse(z.array(agencySchema), json);
  }

  async importShipment(input: ImportRequest): Promise<void> {
    await this.request('POST', '/shipping/import', { customerId: this.config.customerId, ...input });
  }

  private parse<T>(schema: z.ZodType<T>, json: unknown): T {
    const result = schema.safeParse(json);
    if (!result.success) {
      console.error('[correo] respuesta inesperada:', z.prettifyError(result.error));
      throw new ShippingUnavailableError();
    }
    return result.data;
  }

  private get baseUrl(): string {
    return CORREO_BASE_URLS[this.config.env];
  }

  private async getToken(force = false): Promise<string> {
    if (!force && this.token && this.token.expiresAt - EXPIRY_MARGIN_MS > Date.now()) return this.token.value;
    const basic = Buffer.from(`${this.config.user}:${this.config.password}`).toString('base64');
    const res = await this.send(`${this.baseUrl}/token`, { method: 'POST', headers: { Authorization: `Basic ${basic}` } });
    if (!res.ok) {
      console.error(`[correo] no pude autenticar (${res.status})`);
      throw new ShippingUnavailableError();
    }
    const { token, expires } = this.parse(tokenSchema, await res.json());
    const expiresAt = Date.parse(expires);
    this.token = { value: token, expiresAt: Number.isNaN(expiresAt) ? Date.now() + 5 * 60_000 : expiresAt };
    return token;
  }

  private async request(method: 'GET' | 'POST', path: string, body?: unknown): Promise<unknown> {
    const call = (token: string) =>
      this.send(`${this.baseUrl}${path}`, {
        method,
        headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });

    let res = await call(await this.getToken());
    if (res.status === 401) res = await call(await this.getToken(true));
    if (!res.ok) {
      console.error(`[correo] ${method} ${path} → ${res.status}`, await res.text().catch(() => ''));
      throw new ShippingUnavailableError();
    }
    return res.status === 204 ? null : res.json().catch(() => null);
  }

  private async send(url: string, init: RequestInit): Promise<Response> {
    try {
      return await this.fetchImpl(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS), cache: 'no-store' });
    } catch (err) {
      console.error('[correo] sin respuesta:', err);
      throw new ShippingUnavailableError();
    }
  }
}
