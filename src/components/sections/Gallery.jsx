import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Instagram, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { galleryImages, instagramHandle, instagramUrl } from '../../data/gallery';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';
import { EASE } from '../../lib/motion';

/**
 * Photo gallery with a lightbox.
 *
 * A uniform grid rather than a masonry mosaic: with a variable number of
 * images, mixed row/column spans always end up leaving a hole in the last row.
 * Even 4:5 tiles tile cleanly at any count.
 */
export default function Gallery() {
  const [openIndex, setOpenIndex] = useState(null);
  const isOpen = openIndex !== null;

  const close = () => setOpenIndex(null);
  const step = (delta) =>
    setOpenIndex((i) => (i + delta + galleryImages.length) % galleryImages.length);

  // Keyboard control for the lightbox, plus a body-scroll lock while it is up.
  useEffect(() => {
    if (!isOpen) return undefined;

    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };

    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <section id="gallery" className="relative py-20 lg:py-28">
      <Container>
        <SectionHeading
          title="Inside The Academy"
          subtitle={
            'Follow us on Instagram ' +
            instagramHandle +
            ' to see the latest training sessions, matches and academy life.'
          }
        />

        <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          {galleryImages.map((image, i) => (
            <Reveal
              key={image.src}
              variant="scale"
              delay={Math.min(i * 0.07, 0.4)}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-200"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(i)}
                className="block h-full w-full"
                aria-label={'Open image: ' + image.alt}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                />

                <span className="absolute inset-0 bg-brand-900/0 transition-colors duration-500 group-hover:bg-brand-900/45" />
                <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-white/95 text-brand-700">
                    <Instagram className="h-5 w-5" />
                  </span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 flex justify-center">
          <Button href={instagramUrl} target="_blank" rel="noreferrer noopener" variant="primary" size="lg">
            <Instagram className="h-4 w-4" />
            Follow Us On Instagram
          </Button>
        </Reveal>
      </Container>

      {/* ---------- Lightbox ---------- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="Gallery image viewer"
            className="fixed inset-0 z-[80] grid place-items-center bg-ink-950/92 p-4 backdrop-blur-sm"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
            >
              <X className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              aria-label="Previous image"
              className="absolute left-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 sm:left-8"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <motion.img
              key={galleryImages[openIndex].src}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
              src={galleryImages[openIndex].src}
              alt={galleryImages[openIndex].alt}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              aria-label="Next image"
              className="absolute right-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 sm:right-8"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-white/70">
              {openIndex + 1} / {galleryImages.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
