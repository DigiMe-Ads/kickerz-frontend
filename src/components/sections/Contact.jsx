import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { site } from '../../data/site';
import { programs } from '../../data/programs';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import Reveal from '../ui/Reveal';

/**
 * Contact / enquiry form.
 *
 * -------------------------------------------------------------------------
 * The form POSTs JSON to /form-api/contact.php, a small PHP endpoint that
 * lives beside the built site on Hostinger (source: public/form-api/).
 * It has to be server-side: the academy's SMTP credentials must never end up
 * in the JavaScript bundle, which is public.
 *
 * `npm run dev` has no PHP runtime, so submissions fail locally with the
 * network error below. Test the form against the real host, or run a local
 * `php -S` on the built output. See README "Contact form".
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
  const [values, setValues] = useState(INITIAL);
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [error, setError] = useState('');

  const update = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;

    setStatus('sending');
    setError('');

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'We could not send your message. Please try again.');
      }

      setStatus('success');
      setValues(INITIAL);
    } catch (err) {
      setStatus('error');
      setError(
        err instanceof TypeError
          ? 'Could not reach the server. Please check your connection and try again.'
          : err.message,
      );
    }
  };

  const fieldClass =
    'w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3.5 text-sm text-white placeholder:text-white/50 outline-none transition-all duration-300 focus:border-gold-500 focus:bg-white/15';

  return (
    <section id="contact" className="relative py-20 lg:py-28">
      <Container>
        <SectionHeading
          title="Get In Touch"
          subtitle="Ready to join Sri Lanka's leading youth football academy? Send us a message and our team will get back to you."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* ---------- Form ---------- */}
          <Reveal variant="left">
            <div className="relative h-full overflow-hidden rounded-[28px] bg-brand-600 p-7 sm:p-10">
              <div className="pointer-events-none absolute inset-0 bg-pitch-lines opacity-40" />
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-500/20 blur-3xl" />

              <div className="relative flex h-full flex-col">
                <h3 className="font-display text-2xl font-black uppercase text-white sm:text-3xl">
                  Send Us A Message
                </h3>
                <p className="mt-2 text-sm text-white/75">
                  Trials, programs, tournaments or partnerships — we read every enquiry.
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
                        className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3 text-sm text-white"
                      >
                        <AlertCircle className="h-4 w-4 shrink-0 text-gold-400" />
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </form>

                {/* Fills the space left over once the form's fixed-height
                    fields stop short of the taller details+photo column
                    beside it. */}
                <div className="mt-6 min-h-55 flex-1 overflow-hidden rounded-2xl border border-white/20">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57348.190388285184!2d79.8562055!3d6.92183865!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2f3b74291f183d5b%3A0xa12bc58886cf4934!2sColombo%20Kickerz%20Football%20Academy!5e1!3m2!1sen!2slk!4v1788953799405!5m2!1sen!2slk"
                    title="Colombo Kickerz Football Academy location"
                    className="h-full min-h-55 w-full"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              </div>
            </div>
          </Reveal>

          {/* ---------- Details + photo ---------- */}
          <Reveal variant="right" delay={0.1} className="flex flex-col gap-6">
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
                  {site.contact.phones.map((phone) => (
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

            <div className="relative flex-1 overflow-hidden rounded-[28px]">
              {/* Must be a photo taken at the home ground - the caption below
                  names it. */}
              <img
                src="/images/gallery3.jpg"
                alt="Kickerz players at the Colombo Racecourse Ground"
                loading="lazy"
                className="h-full min-h-55 w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-900/85 via-brand-900/20 to-transparent" />
              <p className="absolute inset-x-6 bottom-6 font-display text-lg font-extrabold uppercase leading-tight text-white">
                Training every week at the
                <span className="text-gold-400"> Colombo Racecourse Ground</span>
              </p>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
