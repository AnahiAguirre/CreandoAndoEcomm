import { toNextJsHandler } from 'better-auth/next-js';

import { auth } from '@/lib/container';

export const { GET, POST } = toNextJsHandler(auth);
