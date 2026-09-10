import Container from '../components/ui/Container';
import Button from '../components/ui/Button';

/**
 * Catch-all for any path the .htaccess SPA fallback hands us that isn't one
 * of our routes (see public/.htaccess RULE 5). Without this, React Router
 * would just render nothing.
 */
export default function NotFound() {
  return (
    <main className="relative isolate -mt-[88px] flex min-h-[80vh] items-center bg-ink-950 pt-[88px]">
      <div className="pointer-events-none absolute inset-0 bg-pitch-lines opacity-40" />
      <Container className="relative py-20 text-center">
        <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-gold-500">
          404
        </p>
        <h1 className="mt-4 font-display text-3xl font-black uppercase text-white sm:text-5xl">
          Page Not Found
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-slate-300">
          The page you're looking for doesn't exist, or may have moved.
        </p>
        <Button href="/" variant="primary" size="lg" className="mt-8">
          Back To Home
        </Button>
      </Container>
    </main>
  );
}
