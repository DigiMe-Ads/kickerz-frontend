import { getSupabase } from '../lib/supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase-config';

export const UPLOAD_BUCKET = 'uploads';

/**
 * Largest edge, in pixels, an uploaded image is scaled down to. Most uploads
 * come straight off a phone (4000px+, several MB) and are shown at a
 * fraction of that - resizing here saves the admin's mobile data on the way
 * up and every visitor's on the way down.
 */
export const IMAGE_MAX_EDGE = { photo: 1920, logo: 512 };

/** Above this, a hero video is going to hurt load times - see VideoField. */
export const VIDEO_WARN_BYTES = 15 * 1024 * 1024;
/** Hard ceiling, matched by the "uploads" bucket's file_size_limit in schema.sql. */
export const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

const PASSTHROUGH_TYPES = ['image/svg+xml', 'image/gif'];

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function renamed(name, ext) {
  const base = (name || 'image').replace(/\.[^.]+$/, '');
  return `${base}.${ext}`;
}

/**
 * Downscale and re-encode an image before upload. WebP where the browser can
 * encode it; otherwise PNG for logos (they need their transparency) and
 * JPEG for photos. SVGs and GIFs pass through untouched, as does anything
 * already small enough.
 */
export async function prepareImage(file, variant = 'photo') {
  if (!file.type.startsWith('image/') || PASSTHROUGH_TYPES.includes(file.type)) return file;

  const maxEdge = IMAGE_MAX_EDGE[variant] ?? IMAGE_MAX_EDGE.photo;
  let bitmap;
  try {
    // 'from-image' applies the EXIF rotation, so portrait phone photos don't
    // come out sideways.
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return file; // a format this browser can't decode (e.g. HEIC) - send as-is
  }

  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 300 * 1024) {
    bitmap.close?.();
    return file;
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();

  const webp = await canvasToBlob(canvas, 'image/webp', 0.85);
  if (webp && webp.type === 'image/webp') {
    return new File([webp], renamed(file.name, 'webp'), { type: 'image/webp' });
  }
  const fallbackType = variant === 'logo' ? 'image/png' : 'image/jpeg';
  const fallback = await canvasToBlob(canvas, fallbackType, 0.85);
  return fallback
    ? new File([fallback], renamed(file.name, variant === 'logo' ? 'png' : 'jpg'), { type: fallbackType })
    : file;
}

function extensionFor(file) {
  const fromName = /\.([a-z0-9]+)$/i.exec(file.name || '')?.[1];
  if (fromName) return fromName.toLowerCase();
  return (file.type.split('/')[1] || 'bin').replace('jpeg', 'jpg').replace('svg+xml', 'svg');
}

/**
 * Upload to Storage under <folder>/ and resolve to a public URL, reporting
 * progress as it goes.
 *
 * @supabase/supabase-js's own `upload()` has no progress callback (there's
 * nothing to hook - it's a plain fetch under the hood), so this talks to the
 * same REST endpoint directly over XHR instead, purely to get
 * `xhr.upload.onprogress`. Everything else about the request - path shape,
 * auth, cache headers - matches what the SDK itself sends.
 *
 * Filenames are unique per upload, so a file is never overwritten in place -
 * which is what makes it safe to cache for a year.
 */
export async function uploadFile(file, folder, onProgress) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw Object.assign(new Error('too-large'), { code: 'local/too-large' });
  }

  const supabase = getSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw Object.assign(new Error('not-signed-in'), { code: 'local/not-signed-in' });
  }

  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const path = `${folder}/${unique}.${extensionFor(file)}`;

  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/${UPLOAD_BUCKET}/${path}`);
    xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
    xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.setRequestHeader('cache-control', 'max-age=31536000');

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      // Storage's error body is {statusCode, error, message} - `error` is
      // the short machine-readable reason (e.g. "Bucket not found",
      // "Payload too large"), which is what friendlyUploadError matches on.
      let label = 'unknown';
      try {
        const body = JSON.parse(xhr.responseText);
        label = body?.error || body?.message || label;
      } catch {
        /* non-JSON error body - keep the generic label */
      }
      reject(Object.assign(new Error(`upload failed (${xhr.status}): ${label}`), { code: `storage/${label}`, status: xhr.status }));
    };
    xhr.onerror = () => reject(Object.assign(new Error('network error'), { code: 'storage/network-request-failed' }));
    xhr.onabort = () => reject(Object.assign(new Error('cancelled'), { code: 'storage/canceled' }));

    xhr.send(file);
  });

  return supabase.storage.from(UPLOAD_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Plain-English upload errors, including the ones you get before setup is finished. */
export function friendlyUploadError(error) {
  const code = error?.code || '';
  if (code === 'local/too-large') return 'That file is over 200MB - too big to upload.';
  if (code === 'local/not-signed-in') return 'You’ve been signed out. Sign in again and retry the upload.';
  if (error?.status === 401 || error?.status === 403 || code.includes('unauthorized') || code.includes('Unauthorized')) {
    return 'Upload refused. Either this account isn’t an admin, or supabase/schema.sql hasn’t been run yet.';
  }
  if (code === 'storage/canceled') return 'Upload cancelled.';
  if (code === 'storage/network-request-failed') return 'The connection dropped during upload. Try again.';
  if (error?.status === 404 || code.includes('Bucket not found') || code.includes('bucket_not_found')) {
    return 'File storage isn’t set up for this project yet. You can paste an image link below instead.';
  }
  if (error?.status === 413 || code.includes('exceeded') || code.includes('Payload')) {
    return 'That file is larger than this bucket allows.';
  }
  if (error?.status === 415 || code.includes('mime') || code.includes('type_not_allowed')) {
    return 'That file type isn’t allowed here - only images and video.';
  }
  return 'Upload failed. Please try again.';
}
