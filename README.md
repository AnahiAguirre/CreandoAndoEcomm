# CreandoAndo — ecommerce

Tienda propia para vender juguetes (físicos) e imprimibles para colorear en PDF (digitales). Ver el plan completo en `C:\Users\ANAGUIRRE\.claude\plans\necesito-hacer-un-plan-humming-noodle.md`.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind 4 · Drizzle ORM sobre Postgres (Supabase) · Better Auth (magic link + rol admin, sin RLS) · Supabase Storage · Mercado Pago Checkout Pro · Resend · Zod · Vitest.

## Arquitectura

```
src/domain/     entidades y casos de uso puros — sin Next.js, sin Drizzle, sin SDKs
src/infra/      implementaciones concretas (Drizzle, Supabase, Mercado Pago, Resend)
src/lib/        env, auth, guards de autorización, validación, composition root (container.ts)
src/components/ UI compartida entre tienda y admin
src/app/        Next.js — capa de presentación, delgada
tests/          tests unitarios (Vitest) del dominio y los helpers, con puertos en memoria
```

`src/lib/container.ts` es el único lugar que conecta una implementación de `infra/` con el puerto de `domain/` que le corresponde. Nada en `app/` importa una clase de `infra/` directamente.

No hay RLS de Postgres: toda autorización pasa por `requireUser()`/`requireAdmin()` en `src/lib/auth-guards.ts`, llamado al principio de cada página/acción/ruta protegida. `src/proxy.ts` solo hace un chequeo optimista de cookie para `/admin/*`: **no es la barrera de seguridad**.

Los archivos nunca pasan por el servidor: un Server Action firma un ticket de subida y el navegador sube directo a Supabase Storage (`CatalogAdmin.prepareUpload` → `uploadWithTicket` → `confirm*Upload`).

## Puesta en marcha

### 1. Cuentas

- **Supabase**: creá un proyecto en [supabase.com](https://supabase.com). Necesitás:
  - `Connect → ORMs → Drizzle` → connection string del *transaction pooler* (6543) y la de *session* (5432).
  - `Project Settings → Data API` → `Project URL`.
  - `Project Settings → API Keys` → la **secret key** (`sb_secret_…`) y la **publishable key** (`sb_publishable_…`).
  - `Storage`: creá `product-images` (**público**) y, para la fase 4, `product-files` (**privado**).
- **Resend** (opcional en dev): [resend.com](https://resend.com), verificá un dominio y generá una API key. Sin `RESEND_API_KEY`, los magic links se imprimen en la consola del servidor.
- **Mercado Pago** (fase 3): [Tus integraciones](https://www.mercadopago.com.ar/developers/panel) → app → **Access Token de prueba** (`TEST-…`) y la **Secret Key** de webhooks.

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

Completá `.env.local`. Solo las variables `NEXT_PUBLIC_*` llegan al navegador; **todo lo demás es secreto de servidor**.

### 3. Base de datos

```bash
npm install
npm run db:migrate    # aplica las migraciones (conexión directa, 5432)
npm run db:seed       # opcional: productos de ejemplo
```

### 4. Primer admin

No hay forma pública de volverse admin (a propósito). Iniciá sesión una vez con tu email en `/ingresar` y después:

```bash
npm run admin:promote -- tu@email.com
```

Cerrá sesión y volvé a entrar para que el rol tome efecto (la sesión cachea el usuario 5 minutos).

### 5. Correr en local

```bash
npm run dev
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` / `typecheck` | ESLint / `tsc --noEmit` |
| `npm test` / `test:watch` / `test:coverage` | Vitest |
| `npm run db:generate` | Genera una migración a partir de `src/infra/db/schema` |
| `npm run db:migrate` | Aplica las migraciones pendientes |
| `npm run db:studio` | Abre Drizzle Studio contra la base |
| `npm run db:seed` | Carga productos de ejemplo (idempotente) |
| `npm run admin:promote -- email@x.com` | Le da rol admin a un usuario existente |

## Estado actual

El código se reconstruye por fases sobre el plan. Cada fase vive en su rama y se mergea a `main` cuando está verificada contra la base real.

| Fase | Estado | Contenido |
|---|---|---|
| 1 · Fundaciones | ✅ verificada | Esqueleto `domain/infra/lib/app`, schema del catálogo, migración `0000_catalog`, cliente Postgres (pooler, `prepare:false`), catálogo público (`/` y `/producto/[slug]`), seed. |
| 2 · Auth + admin | ✅ verificada | Better Auth (magic link + rol admin, migración `0001_auth`), `requireUser`/`requireAdmin`, `proxy.ts`, `/ingresar`, panel `/admin/productos` con ABM, uploads directos a Storage y reglas de publicación. Tests unitarios (Vitest). |
| 3 · Pago (digitales) | ⏳ | Carrito, `computeOrderTotals()`, `/api/checkout`, webhook MP con firma e idempotencia. |
| 4 · Entrega digital | ⏳ | Entitlements, `/mis-descargas`, signed URLs, mail de confirmación. |
| 5–9 | ⏳ | Físicos + envío, cupones, dashboard, envío calculado, producción (ver plan). |

`npm run lint`, `npm run typecheck`, `npm test` y `npm run build` pasan limpios.
