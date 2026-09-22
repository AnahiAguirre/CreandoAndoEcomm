export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  /** Plain-text fallback. Always provide one: some clients and spam filters want it. */
  text: string;
}

/** Port: outbound email. Implemented with Resend in prod, console logging in dev. */
export interface MailSender {
  send(message: MailMessage): Promise<void>;
}
