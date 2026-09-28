import type { MailMessage } from '@/domain/notifications/mail-sender';

/** Sent once per new entitlement. Links to "Mis descargas", never to the file: download URLs expire in a minute. */
export function downloadReadyMail(to: string, productName: string, libraryUrl: string): MailMessage {
  return {
    to,
    subject: `Tu imprimible "${productName}" ya está listo`,
    text: [
      'Hola!',
      '',
      `Ya podés descargar "${productName}".`,
      'Entrá a Mis descargas con este mismo email:',
      libraryUrl,
      '',
      'Podés volver a bajarlo cuando quieras.',
    ].join('\n'),
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1f1a17">
        <h1 style="font-size:20px;margin:0 0 16px">¡Tu imprimible está listo!</h1>
        <p>Ya podés descargar <strong>${escapeHtml(productName)}</strong>. Entrá con este mismo email a Mis descargas.</p>
        <p style="margin:24px 0">
          <a href="${libraryUrl}" style="background:#1f1a17;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">
            Ir a Mis descargas
          </a>
        </p>
        <p style="font-size:12px;color:#777">Podés volver a bajarlo cuando quieras.<br>Si el botón no funciona, copiá y pegá esta dirección:<br>${libraryUrl}</p>
      </div>
    `,
  };
}

// The product name is typed by the admin; keep it from breaking the markup.
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
