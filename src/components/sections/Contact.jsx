import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useContent } from '../../content/ContentProvider';
import { safeMapEmbed } from '../../lib/safe';
import { whatsappHref } from '../../lib/whatsapp';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import Reveal from '../ui/Reveal';

/**
 * Contact / enquiry form.
 *
 * -------------------------------------------------------------------------
 * Every submission is saved straight to Supabase (the `enquiries` table -
 * see supabase/schema.sql) so it shows up in the admin's Enquiries page.
 * That insert is the one thing this form actually depends on for its
 * success/error state below.
 *
 * Alongside it, this also POSTs the same JSON to /form-api/contact.php, a
 * small PHP endpoint that lives beside the built site on Hostinger (source:
 * public/form-api/) and emails the academy - best-effort, since it has to be
 * server-side (the academy's SMTP credentials must never end up in the
 * JavaScript bundle, which is public) and doesn't exist at all in local dev.
 * A failure there is silently ignored: the message is already saved above.
 * -------------------------------------------------------------------------
 */

const ENDPOINT = '/form-api/contact.php';

const INITIAL = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  company: '', // honeypot - see below
};

export default function Contact() {
  const site = useContent('site');
  const programs = useContent('programs').items;
  const copy = useContent('contact');
  const mapSrc = safeMapEmbed(copy.mapEmbedUrl);
  const [values, setValues] = useState(INITIAL);
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [error, setError] = useState('');

  const update = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;

    // Honeypot: real visitors never see this field, so anything that
    // filled it in is a bot - pretend to succeed without saving or sending
    // anything anywhere.
    if (values.company) {
      setStatus('success');
      setValues(INITIAL);
      return;
    }

    setStatus('sending');
    setError('');

    try {
      // Imported on demand, same reasoning as ContentProvider's fetchRemote:
      // Supabase stays its own chunk rather than weighing down the main
      // bundle every visitor downloads.
      const { submitEnquiry } = await import('../../lib/db');
      await submitEnquiry(values);

      // Fire-and-forget: see the file header for why a failure here doesn't
      // affect the outcome below.
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      }).catch(() => {});

      setStatus('success');
      setValues(INITIAL);
    } catch (err) {
      setStatus('error');
      setError(
        err instanceof TypeError
          ? 'Could not reach the server. Please check your connection and try again.'
          : 'We could not send your message. Please try again.',
      );
    }
  };

  const fieldClass =
    'w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3.5 text-sm text-white placeholder:text-white/50 outline-none transition-all duration-300 focus:border-gold-500 focus:bg-white/15';

  return (
    <section id="contact" className="relative py-20 lg:py-28">
      <Container>
        <SectionHeading
          title={copy.title}
          subtitle={copy.subtitle}
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* ---------- Form ---------- */}
          <Reveal variant="left">
            <div className="relative h-full overflow-hidden rounded-[28px] bg-brand-600 p-7 sm:p-10">
              <div className="pointer-events-none absolute inset-0 bg-pitch-lines opacity-40" />
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-500/20 blur-3xl" />

              <div className="relative flex h-full flex-col">
                <h3 className="font-display text-2xl font-black uppercase text-white sm:text-3xl">
                  {copy.formTitle}
                </h3>
                <p className="mt-2 text-sm text-white/75">
                  {copy.formSubtitle}
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
                  <div>
                    <label htmlFor="name" className="sr-only">
                      Your name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={values.name}
                      onChange={update('name')}
                      placeholder="Your Name *"
                      className={fieldClass}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="email" className="sr-only">
                        Email address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={values.email}
                        onChange={update('email')}
                        placeholder="Email *"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="sr-only">
                        Phone number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={values.phone}
                        onChange={update('phone')}
                        placeholder="Phone"
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="sr-only">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={values.subject}
                      onChange={update('subject')}
                      className={fieldClass + ' appearance-none [&>option]:text-ink-900'}
                    >
                      <option value="">Select a subject *</option>
                      {programs.map((program) => (
                        <option key={program.id} value={program.name}>
                          {program.name}
                        </option>
                      ))}
                      <option value="Tournaments">Tournaments</option>
                      <option value="Partnerships">Partnerships</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="sr-only">
                      Your message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={values.message}
                      onChange={update('message')}
                      placeholder="Your Message *"
                      className={fieldClass + ' resize-none'}
                    />
                  </div>

                  {/*
                    Honeypot. Real visitors never see this field, so anything
                    that fills it in is a bot - the PHP endpoint drops those
                    submissions silently.
                  */}
                  <input
                    type="text"
                    name="company"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={values.company}
                    onChange={update('company')}
                    className="absolute left-[-9999px] h-0 w-0 opacity-0"
                  />

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 px-8 py-4 font-display text-xs font-bold uppercase tracking-[0.14em] text-ink-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                        Send Message
                      </>
                    )}
                  </button>

                  <AnimatePresence mode="wait">
                    {status === 'success' && (
                      <motion.p
                        key="success"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        role="status"
                        className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3 text-sm text-white"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-gold-400" />
                        Thanks — your message is on its way. We will be in touch shortly.
                      </motion.p>
                    )}

                    {status === 'error' && (
                      <motion.p
                        key="error"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        role="alert"
                        className="flex items-start gap-2 rounded-xl bg-white/15 px-4 py-3 text-sm text-white"
                      >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                        <span>
                          {error}{' '}
                          <a
                            href={whatsappHref("Hi! I tried to send a message through the website but it didn't go through.")}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="font-semibold text-gold-400 underline-offset-4 hover:underline"
                          >
                            Message us on WhatsApp instead.
                          </a>
                        </span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </form>

                {/* Fills the space left over once the form's fixed-height
                    fields stop short of the taller details+photo column
                    beside it. */}
                {mapSrc && (
                  <div className="mt-6 min-h-55 flex-1 overflow-hidden rounded-2xl border border-white/20">
                    <iframe
                      src={mapSrc}
                      title={`${site.fullName} location`}
                      className="h-full min-h-55 w-full"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          {/* ---------- Photo + details ---------- */}
          <Reveal variant="right" delay={0.1} className="flex flex-col gap-6">
            <div className="relative flex-1 overflow-hidden rounded-[28px]">
              {/* Should be a photo taken at the place the caption names. */}
              <img
                src={copy.photo}
                alt={[copy.photoCaption, copy.photoCaptionAccent].filter(Boolean).join(' ')}
                loading="lazy"
                className="h-full min-h-55 w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-900/85 via-brand-900/20 to-transparent" />
              <p className="absolute inset-x-6 bottom-6 font-display text-lg font-extrabold uppercase leading-tight text-white">
                {copy.photoCaption}
                {copy.photoCaptionAccent && <span className="text-gold-400"> {copy.photoCaptionAccent}</span>}
              </p>
            </div>

            <div className="panel space-y-6 p-7 sm:p-9">
              <div className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="font-display text-sm font-extrabold uppercase tracking-wide text-ink-900">
                    {site.contact.addressLabel}
                  </h4>
                  <p className="mt-1 text-sm text-slate-600">{site.contact.address}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="font-display text-sm font-extrabold uppercase tracking-wide text-ink-900">
                    Contact Numbers
                  </h4>
                  {(site.contact?.phones || []).map((phone) => (
                    <a
                      key={phone}
                      href={'tel:' + phone.replace(/\s/g, '')}
                      className="mt-1 block text-sm text-slate-600 transition-colors hover:text-brand-600"
                    >
                      {phone}
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                  <Mail className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h4 className="font-display text-sm font-extrabold uppercase tracking-wide text-ink-900">
                    E-Mail
                  </h4>
                  <a
                    href={'mailto:' + site.contact.email}
                    className="mt-1 block break-all text-sm text-slate-600 transition-colors hover:text-brand-600"
                  >
                    {site.contact.email}
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
