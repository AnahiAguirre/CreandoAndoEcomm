import type { MailMessage } from '@/domain/notifications/mail-sender';

export function magicLinkMail(to: string, url: string): MailMessage {
  return {
    to,
    subject: 'Tu link para entrar a CreandoAndo',
    text: [
      'Hola!',
      '',
      'Para entrar a tu cuenta de CreandoAndo hacé clic en este link (vence en 15 minutos):',
      url,
      '',
      'Si no pediste este mail, ignoralo.',
    ].join('\n'),
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1f1a17">
        <h1 style="font-size:20px;margin:0 0 16px">Entrá a CreandoAndo</h1>
        <p>Hacé clic en el botón para iniciar sesión. El link vence en 15 minutos.</p>
        <p style="margin:24px 0">
          <a href="${url}" style="background:#1f1a17;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">
            Iniciar sesión
          </a>
        </p>
        <p style="font-size:12px;color:#777">Si el botón no funciona, copiá y pegá esta dirección:<br>${url}</p>
        <p style="font-size:12px;color:#777">Si no pediste este mail, ignoralo.</p>
      </div>
    `,
  };
}
