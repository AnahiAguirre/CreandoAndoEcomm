import { type NextRequest, NextResponse } from 'next/server';

import { DownloadNotAllowedError } from '@/domain/delivery/use-cases/digital-delivery';
import { getCurrentUser } from '@/lib/auth-guards';
import { container } from '@/lib/container';

/**
 * GET /api/download/:fileId — checks the signed-in customer owns the file,
 * then redirects to a signed Storage URL that expires in a minute. The PDF
 * itself never passes through this function (Vercel's size and time limits).
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    const login = new URL('/ingresar', request.url);
    login.searchParams.set('next', '/mis-descargas');
    return NextResponse.redirect(login);
  }

  const { fileId } = await params;
  try {
    const url = await container.delivery.downloadUrl(user.email, fileId);
    const response = NextResponse.redirect(url);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (err) {
    if (err instanceof DownloadNotAllowedError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    throw err;
  }
}
