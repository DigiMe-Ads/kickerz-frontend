import { cn } from '../../lib/cn';

/**
 * The rough painted band that sits behind every section title.
 *
 * The viewBox is 100 units wide with preserveAspectRatio="none", so every x
 * coordinate below reads directly as a percentage of the band's width. That is
 * what lets one path sit correctly behind a two-word heading and a ten-word
 * one alike.
 *
 * The body stops at 92% and the tail fleck starts at 94%, so the heading needs
 * roughly 8% of horizontal padding on each side to stay on the paint - see the
 * px-* values in SectionHeading.
 */
export default function BrushStroke({ className }) {
  return (
    <svg
      className={cn('absolute inset-0 h-full w-full', className)}
      viewBox="0 0 100 20"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Main band - the wobble in the top and bottom edges is what reads as
          a brush rather than a rectangle. It runs to 93.5% so the heading,
          padded to roughly 9% a side, always sits on paint. */}
      <path
        fill="currentColor"
        d="M1.2 4.2C14 1.9 27 3.3 40 2.2 53 1.1 66 3.2 79 1.6c5-.6 10 .2 14.2 1.4 1.4 3.4 1.5 9.8.2 13.6-4.4 1.3-9.4 2-14.4 1.6-13-1-26 .8-39-.3C27 16.8 14 18.6 1.6 16.2.2 13 0 7.6 1.2 4.2Z"
      />
      {/* Brush tail - the flick of paint that trails off the end. */}
      <path
        fill="currentColor"
        opacity="0.85"
        d="M96 5.6c1.4-.4 2.8 0 3.8.8l-.4 7.2c-1.2.4-2.5.2-3.4-.4.3-2.5.3-5.1 0-7.6Z"
      />
    </svg>
  );
}
