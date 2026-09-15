/**
 * Guards for links and embeds that come from the admin.
 *
 * Only admins can write content (Row Level Security, supabase/schema.sql),
 * but a stolen admin password would otherwise let someone plant
 * `javascript:` links that run in every visitor's browser - React 18 still
 * renders those. So content-driven URLs are checked against what the site
 * legitimately uses.
 */

// In-page anchors, same-site paths (but not protocol-relative "//host"),
// web links, email and phone.
const SAFE_HREF = /^(#|\/(?!\/)|https?:\/\/|mailto:|tel:)/i;

export function safeHref(href, fallback = '#') {
  const value = typeof href === 'string' ? href.trim() : '';
  return value && SAFE_HREF.test(value) ? value : fallback;
}

const MAP_EMBED = /^https:\/\/(www\.)?google\.[a-z.]{2,8}\/maps\/embed\?/i;

/** The map iframe only ever points at Google Maps' embed endpoint. */
export function safeMapEmbed(url) {
  return typeof url === 'string' && MAP_EMBED.test(url.trim()) ? url.trim() : '';
}

/**
 * Admins will paste Google's whole "<iframe src=...>" snippet rather than
 * the bare URL; pull the URL out so they don't have to.
 */
export function extractIframeSrc(value) {
  const match = /<iframe[^>]*\ssrc=["']([^"']+)["']/i.exec(value || '');
  return match ? match[1].replace(/&amp;/g, '&') : value;
}
