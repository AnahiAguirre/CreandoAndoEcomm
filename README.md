# CreandoAndo — ecommerce

Tienda propia para vender juguetes (físicos) e imprimibles para colorear en PDF (digitales). Ver el plan completo en `C:\Users\ANAGUIRRE\.claude\plans\necesito-hacer-un-plan-humming-noodle.md`.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind 4 · Drizzle ORM sobre Postgres (Supabase) · Better Auth (Google para compradores, email + contraseña para admins, sin RLS) · Supabase Storage · Mercado Pago Checkout Pro · Resend · Zod · Vitest.

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

La autorización no usa policies de RLS: toda pasa por `requireUser()`/`requireAdmin()` en `src/lib/auth-guards.ts`, llamado al principio de cada página/acción/ruta protegida. `src/proxy.ts` solo hace un chequeo optimista de cookie para `/admin/*`: **no es la barrera de seguridad**.

RLS sí está **activado, sin ninguna policy**, en todas las tablas de `public` (migración `0005_enable_rls`). No es para autorizar: es para cerrar la Data API de Supabase (`/rest/v1`), porque la publishable key llega al navegador y con RLS apagado cualquiera podía leer y escribir usuarios, sesiones y hashes de contraseñas con ella. Sin policies, `anon`/`authenticated` no ven nada; la app se conecta como `postgres` (que ignora RLS) y no cambia. Toda tabla nueva tiene que llevar su `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` en la misma migración.

Los archivos nunca pasan por el servidor: un Server Action firma un ticket de subida y el navegador sube directo a Supabase Storage (`CatalogAdmin.prepareUpload` → `uploadWithTicket` → `confirm*Upload`).

## Puesta en marcha

### 1. Cuentas

- **Supabase**: creá un proyecto en [supabase.com](https://supabase.com). Necesitás:
  - `Connect → ORMs → Drizzle` → connection string del *transaction pooler* (6543) y la de *session* (5432).
  - `Project Settings → Data API` → `Project URL`.
  - `Project Settings → API Keys` → la **secret key** (`sb_secret_…`) y la **publishable key** (`sb_publishable_…`).
  - `Storage`: creá `product-images` (**público**) y, para la fase 4, `product-files` (**privado**).
- **Resend** (opcional en dev): [resend.com](https://resend.com), verificá un dominio y generá una API key. Sin `RESEND_API_KEY`, los mails (ej. "ya podés descargarlo") se imprimen en la consola del servidor.
- **Google Cloud** (login): en [console.cloud.google.com](https://console.cloud.google.com) creá un proyecto y:
  1. `APIs y servicios → Pantalla de consentimiento de OAuth` (o `Google Auth Platform → Branding`): tipo **Externo**, nombre "CreandoAndo", tu email de soporte. Mientras esté en modo *Prueba* solo pueden entrar los usuarios de prueba que agregues; para abrirlo a cualquier comprador, **Publicar app** (con los permisos básicos `email`/`profile` no hace falta verificación de Google).
  2. `Credenciales → Crear credenciales → ID de cliente de OAuth` → tipo **Aplicación web**. En *URIs de redireccionamiento autorizados* agregá `http://localhost:3000/api/auth/callback/google` y `https://<tu-dominio>/api/auth/callback/google`.
  3. Copiá el ID y el secreto a `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
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

No hay forma pública de volverse admin (a propósito). Hay dos puertas de entrada:

- **Compradores**: con Google en `/ingresar` (si `GOOGLE_CLIENT_ID` no está cargada, la página avisa que todavía no se puede).
- **Admins**: con email y contraseña en `/ingresar/admin` (no está linkeada desde la tienda). No hay registro: la cuenta la crea este script, que imprime una contraseña aleatoria una sola vez:

```bash
npm run admin:create -- tu@email.com
```

Correrlo de nuevo con el mismo email genera otra contraseña y cierra las sesiones abiertas. Si el email ya era de un comprador, ese mismo usuario pasa a ser admin.

Para sacarle el rol a alguien, desde el SQL Editor de Supabase: `update users set role = 'user' where email = 'x@email.com';` (`npm run admin:promote -- email` hace lo inverso con un usuario que ya existe). El cambio de rol tarda hasta 5 minutos en notarse (la sesión cachea el usuario).

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
| `npm run admin:create -- email@x.com` | Crea un admin con contraseña (o le resetea la contraseña) para `/ingresar/admin` |
| `npm run admin:promote -- email@x.com` | Le da rol admin a un usuario existente |
| `npm run storage:setup` | Crea los buckets `product-images` (público) y `product-files` (privado) si faltan; no toca los existentes |

## Estado actual

El código se reconstruye por fases sobre el plan. Cada fase vive en su rama y se mergea a `main` cuando está verificada contra la base real.

| Fase | Estado | Contenido |
|---|---|---|
| 1 · Fundaciones | ✅ verificada | Esqueleto `domain/infra/lib/app`, schema del catálogo, migración `0000_catalog`, cliente Postgres (pooler, `prepare:false`), catálogo público (`/` y `/producto/[slug]`), seed. |
| 2 · Auth + admin | ✅ verificada | Better Auth (Google para compradores y email + contraseña para admins — antes magic link —, migración `0001_auth`), `requireUser`/`requireAdmin`, `proxy.ts`, `/ingresar`, panel `/admin/productos` con ABM, uploads directos a Storage y reglas de publicación. Tests unitarios (Vitest). |
| 3 · Carrito y pago | 🟡 carrito listo, sin pago | **Carrito** (físicos y digitales): vive en el navegador (`localStorage`, solo ids y cantidades); `/carrito` pide a la base los precios y el stock reales y corrige lo que haya cambiado (`reconcileCart` en `src/domain/cart`). Los botones de la home y la ficha agregan productos reales (la home los vincula por slug). **Falta**: `computeOrderTotals()`, `/api/checkout` (Mercado Pago) y el webhook con firma e idempotencia. |
| 4 · Entrega digital | 🟡 sin pagos | Entitlements por email (migración `0002_entitlements`), `/mis-descargas`, `GET /api/download/[fileId]` → signed URL de 60 s, mail "ya podés descargarlo". Por ahora el acceso se da a mano desde la ficha del producto en el admin; en la fase 3 el webhook llama al mismo `DigitalDelivery.grant()` con el `orderId`. |
| 5–9 | ⏳ | Físicos + envío, cupones, dashboard, envío calculado, producción (ver plan). |

`npm run lint`, `npm run typecheck`, `npm test` y `npm run build` pasan limpios.
