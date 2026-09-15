import { motion } from 'framer-motion';
import { CalendarDays, MapPin } from 'lucide-react';
import { useContent, useMatches } from '../../content/ContentProvider';
import { formatKickoff, hasScore } from '../../content/matches';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import TeamBadge from '../ui/TeamBadge';
import { stagger, fadeUp, viewportOnce } from '../../lib/motion';
import { cn } from '../../lib/cn';

function StatusBadge({ status }) {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 font-display text-[10px] font-black uppercase tracking-[0.16em] text-red-400 ring-1 ring-red-500/40">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
        </span>
        Live
      </span>
    );
  }
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-1 font-display text-[10px] font-black uppercase tracking-[0.16em] ring-1',
        status === 'ft'
          ? 'bg-white/10 text-white/70 ring-white/15'
          : 'bg-gold-500/15 text-gold-400 ring-gold-500/40',
      )}
    >
      {status === 'ft' ? 'Full Time' : 'Upcoming'}
    </span>
  );
}

function Side({ team, align }) {
  return (
    <div className={cn('flex min-w-0 flex-1 flex-col items-center gap-2.5 text-center')}>
      <TeamBadge name={team?.name} logo={team?.logo} className="h-14 w-14 text-lg sm:h-16 sm:w-16" />
      <span
        className={cn(
          'line-clamp-2 font-display text-[13px] font-extrabold uppercase leading-tight tracking-wide text-white sm:text-sm',
          align,
        )}
      >
        {team?.name || 'TBC'}
      </span>
    </div>
  );
}

function MatchCard({ match }) {
  const { date, time } = formatKickoff(match.kickoff);
  const scored = hasScore(match);
  const live = match.status === 'live';

  return (
    <motion.article
      variants={fadeUp}
      className={cn(
        'flex h-full flex-col rounded-2xl border bg-ink-800/80 p-5 backdrop-blur-sm transition-colors duration-500 sm:p-6',
        live ? 'border-red-500/40 shadow-[0_0_50px_-20px_rgb(239_68_68/0.55)]' : 'border-white/10 hover:border-brand-400/50',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="truncate font-display text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">
          {match.competition || 'Match'}
        </span>
        <StatusBadge status={match.status} />
      </div>

      <div className="mt-6 flex items-start gap-3">
        <Side team={match.home} />

        <div className="flex shrink-0 flex-col items-center pt-3 sm:pt-4">
          {scored && match.status !== 'upcoming' ? (
            <span className="font-display text-4xl font-black tabular-nums leading-none text-white sm:text-5xl">
              {match.homeScore}
              <span className="mx-1.5 text-white/30">-</span>
              {match.awayScore}
            </span>
          ) : (
            <span className="font-display text-xl font-black uppercase leading-none text-gold-400 sm:text-2xl">
              {time || 'VS'}
            </span>
          )}
        </div>

        <Side team={match.away} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 border-t border-white/10 pt-4 text-xs text-white/60">
        {match.venue && (
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-gold-500" />
            <span className="truncate">{match.venue}</span>
          </span>
        )}
        {date && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-gold-500" />
            {date}
            {time && <span className="text-white/40">&middot; {time}</span>}
          </span>
        )}
      </div>
    </motion.article>
  );
}

/**
 * Match Centre: live scores, upcoming fixtures and recent results, entered
 * from /admin/scores. Renders nothing at all until there's a match to show,
 * so an empty section never appears on the site.
 */
export default function Results() {
  const { title, subtitle } = useContent('results');
  const matches = useMatches();

  if (!matches.length) return null;

  return (
    <section id="results" className="relative py-8 lg:py-12">
      <Container>
        <div className="panel-dark relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-pitch-lines opacity-50" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-600/25 blur-[110px]" />

          <div className="relative px-5 py-16 sm:px-8 lg:px-14 lg:py-20">
            <SectionHeading title={title} subtitle={subtitle} dark />

            <motion.div
              variants={stagger(0.08)}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="mt-14 flex flex-wrap justify-center gap-5"
            >
              {/* Flex, not grid, so one or two matches sit centred instead of
                  stranded at the left of an empty three-column row. */}
              {matches.map((match) => (
                <div key={match.id} className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.834rem)]">
                  <MatchCard match={match} />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
