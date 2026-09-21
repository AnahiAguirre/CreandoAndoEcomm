# CreandoAndo — ecommerce

Tienda propia para vender juguetes (físicos) e imprimibles para colorear en PDF (digitales). Ver el plan completo en `C:\Users\ANAGUIRRE\.claude\plans\necesito-hacer-un-plan-humming-noodle.md`.

## Stack

Next.js (App Router) + TypeScript + Tailwind · Drizzle ORM sobre Postgres (Supabase) · Better Auth (magic link + rol admin, sin RLS) · Mercado Pago Checkout Pro · Resend · Zod.

## Arquitectura

```
src/domain/    entidades y casos de uso puros — sin Next.js, sin Drizzle, sin SDKs
src/infra/     implementaciones concretas (Drizzle, Supabase, Mercado Pago, Resend)
src/lib/       env, auth, guards de autorización, validación, composition root (container.ts)
src/app/       Next.js — capa de presentación, delgada
```

`src/lib/container.ts` es el único lugar que conecta una implementación de `infra/` con el puerto de `domain/` que le corresponde. Nada en `app/` importa una clase de `infra/` directamente.

No hay RLS de Postgres: toda autorización pasa por `requireUser()`/`requireAdmin()` en `src/lib/auth-guards.ts`, llamado al principio de cada página/acción/ruta protegida.

## Puesta en marcha

### 1. Cuentas (esto lo tenés que hacer vos — no puedo crear cuentas por vos)

- **Supabase**: creá un proyecto en [supabase.com](https://supabase.com). Necesitás:
  - `Project Settings → Database` → dos connection strings: la del *pooler* (puerto 6543) y la directa (puerto 5432).
  - `Project Settings → API` → `Project URL`, `anon key` y `service_role key`.
  - `Storage`: creá dos buckets — `product-images` (**público**) y `product-files` (**privado**).
- **Mercado Pago**: [Tus integraciones](https://www.mercadopago.com.ar/developers/panel) → creá una app → copiá el **Access Token de prueba** (`TEST-...`) → en la sección Webhooks, copiá la **Secret Key**.
- **Resend**: creá una cuenta en [resend.com](https://resend.com), verificá un dominio propio y generá una API key.

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

Completá `.env.local` con los valores reales de arriba. **Nunca** le pongas el prefijo `NEXT_PUBLIC_` a nada que no sea `SUPABASE_URL`/`SUPABASE_ANON_KEY` — todo lo demás es secreto de servidor.

### 3. Base de datos

```bash
npm install
npm run db:generate   # ya corrido una vez — vuelve a correrlo si tocás el schema
npm run db:migrate    # aplica las migraciones contra Supabase (conexión directa)
```

### 4. Primer admin

No hay señalización pública para volverse admin (a propósito). Iniciá sesión una vez con tu email en `/ingresar`, y después:

```bash
npm run admin:promote -- tu@email.com
```

### 5. Correr en local

```bash
npm run dev
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` / `typecheck` | ESLint / `tsc --noEmit` |
| `npm run db:generate` | Genera una migración a partir de `src/infra/db/schema` |
| `npm run db:migrate` | Aplica las migraciones pendientes |
| `npm run db:studio` | Abre Drizzle Studio contra la base |
| `npm run db:seed` | Carga productos de ejemplo (idempotente) para ver el catálogo antes de tener admin |
| `npm run admin:promote -- email@x.com` | Le da rol admin a un usuario existente (fase 2) |

## Estado actual

El código se está reconstruyendo por fases sobre el plan. Cada fase vive en su rama y se mergea a `main` cuando está verificada.

| Fase | Estado | Contenido |
|---|---|---|
| 1 · Fundaciones | ✅ código listo · ⏳ sin probar contra Supabase | Esqueleto `domain/infra/lib/app`, schema del catálogo (`products`, `product_images`, `product_files`) + migración `0000_catalog`, cliente Postgres (pooler, `prepare: false`), catálogo público (`/` y `/producto/[slug]`), seed. |
| 2 · Auth + admin | ⏳ | Better Auth (magic link + rol admin), guards, ABM de productos, uploads directos a Storage. |
| 3 · Pago (digitales) | ⏳ | Carrito, `computeOrderTotals()`, `/api/checkout`, webhook MP con firma e idempotencia. |
| 4 · Entrega digital | ⏳ | Entitlements, `/mis-descargas`, signed URLs, mail de confirmación. |
| 5–9 | ⏳ | Físicos + envío, cupones, dashboard, envío calculado, producción (ver plan). |

`npm run lint`, `npm run typecheck` y `npm run build` pasan limpios en la fase actual.
