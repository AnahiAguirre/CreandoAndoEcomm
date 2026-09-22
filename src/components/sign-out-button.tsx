'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={signOut} disabled={pending}>
      Salir
    </Button>
  );
}
