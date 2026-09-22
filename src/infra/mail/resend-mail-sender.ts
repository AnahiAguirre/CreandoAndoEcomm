import { Resend } from 'resend';

import type { MailMessage, MailSender } from '@/domain/notifications/mail-sender';

export class ResendMailSender implements MailSender {
  private readonly resend: Resend;

  constructor(
    apiKey: string,
    /** Must be an address on a domain verified in Resend, e.g. "CreandoAndo <hola@tudominio.com>". */
    private readonly from: string,
  ) {
    this.resend = new Resend(apiKey);
  }

  async send(message: MailMessage): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
    if (error) throw new Error(`Resend: ${error.name}: ${error.message}`);
  }
}
