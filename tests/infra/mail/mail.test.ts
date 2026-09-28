import { afterEach, describe, expect, it, vi } from 'vitest';

import { ConsoleMailSender } from '@/infra/mail/console-mail-sender';
import { downloadReadyMail } from '@/infra/mail/templates/download-ready';
import { magicLinkMail } from '@/infra/mail/templates/magic-link';

describe('magicLinkMail', () => {
  const url = 'http://localhost:3000/api/auth/magic-link/verify?token=abc&callbackURL=%2F';
  const mail = magicLinkMail('vos@ejemplo.com', url);

  it('addresses the recipient and includes the link in both bodies', () => {
    expect(mail.to).toBe('vos@ejemplo.com');
    expect(mail.text).toContain(url);
    expect(mail.html).toContain(`href="${url}"`);
  });

  it('mentions the expiry so the user knows to act quickly', () => {
    expect(mail.text).toMatch(/15 minutos/);
    expect(mail.html).toMatch(/15 minutos/);
  });
});

describe('downloadReadyMail', () => {
  const library = 'https://tienda.test/mis-descargas';

  it('links to Mis descargas (never to the file) in both bodies', () => {
    const mail = downloadReadyMail('vos@ejemplo.com', 'Cuaderno Animales', library);
    expect(mail.to).toBe('vos@ejemplo.com');
    expect(mail.subject).toContain('Cuaderno Animales');
    expect(mail.text).toContain(library);
    expect(mail.html).toContain(`href="${library}"`);
  });

  it('escapes the product name in the HTML', () => {
    const mail = downloadReadyMail('vos@ejemplo.com', '<b>Dinos</b> & más', library);
    expect(mail.html).not.toContain('<b>Dinos</b>');
    expect(mail.html).toContain('&#60;b&#62;Dinos');
  });
});

describe('ConsoleMailSender', () => {
  afterEach(() => vi.restoreAllMocks());

  it('prints recipient, subject and the plain-text body to the console', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await new ConsoleMailSender().send({
      to: 'a@b.com',
      subject: 'Hola',
      text: 'línea 1\nlínea 2',
      html: '<p>ignored</p>',
    });
    const output = log.mock.calls.map((c) => c.join(' ')).join('\n');
    expect(output).toContain('a@b.com');
    expect(output).toContain('Hola');
    expect(output).toContain('línea 1');
    expect(output).toContain('línea 2');
    expect(output).not.toContain('<p>');
  });
});
