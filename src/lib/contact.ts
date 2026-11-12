/** WhatsApp of the shop, in the international format wa.me asks for (country 54, mobile 9, area 11). */
export const WHATSAPP_NUMBER = '5491123901905';

/** The number as people read it. */
export const WHATSAPP_DISPLAY = '11 2390-1905';

/** A wa.me link that opens a chat with the shop, with `text` already typed. */
export function whatsappLink(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
