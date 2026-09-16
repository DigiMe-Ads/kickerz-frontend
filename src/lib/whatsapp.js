/**
 * The academy's WhatsApp number, for every "enquire" / "contact us" call to
 * action that used to jump to the on-page contact form.
 *
 * The contact form itself (Contact.jsx) is unchanged and still on the page -
 * this is only for buttons whose whole job is to get someone talking to the
 * academy as fast as possible. wa.me wants the number with no "+", spaces or
 * leading zero, same digits as site.contact.phones[0] in data/site.js.
 */
const WHATSAPP_NUMBER = '94777749559';

/** A wa.me link, optionally with a pre-filled message. */
export function whatsappHref(message) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Plain link, no pre-filled text - used where a message wouldn't add anything. */
export const WHATSAPP_URL = whatsappHref();

export default whatsappHref;
