'use client';

import { createAuthClient } from 'better-auth/react';

/**
 * Browser-side auth client. Talks to /api/auth/*. No baseURL needed: same origin.
 * The admin plugin is deliberately NOT mounted here — role changes happen only
 * via scripts/promote-admin.ts, never from the browser.
 */
export const authClient = createAuthClient();
