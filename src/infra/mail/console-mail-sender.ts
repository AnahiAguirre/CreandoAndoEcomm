import type { MailMessage, MailSender } from '@/domain/notifications/mail-sender';

/**
 * Dev fallback when RESEND_API_KEY is not set: prints the mail to the server
 * console so the magic link can be copied from the terminal.
 */
export class ConsoleMailSender implements MailSender {
  async send(message: MailMessage): Promise<void> {
    console.log(
      [
        '',
        '┌──────────────────────── MAIL (not sent — no RESEND_API_KEY) ────────────────────────',
        `│ To:      ${message.to}`,
        `│ Subject: ${message.subject}`,
        '├──────────────────────────────────────────────────────────────────────────────────────',
        ...message.text.split('\n').map((l) => `│ ${l}`),
        '└──────────────────────────────────────────────────────────────────────────────────────',
        '',
      ].join('\n'),
    );
  }
}
