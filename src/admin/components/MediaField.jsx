import { useId, useRef, useState } from 'react';
import { ImagePlus, Film, Link2, Trash2, Upload } from 'lucide-react';
import { prepareImage, uploadFile, friendlyUploadError, VIDEO_WARN_BYTES } from '../upload';
import { Btn, FieldShell, inputClass } from './ui';
import { cn } from '../../lib/cn';

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(bytes > 10 * 1024 * 1024 ? 0 : 1)}MB`;

/**
 * Image or video: upload a file, or paste a link.
 *
 * Uploads go to Supabase Storage (images resized first - see upload.js) and
 * the field's value becomes the file's public URL. The paste-a-link option
 * is there for files already hosted somewhere, and so the admin still works
 * while Storage isn't set up.
 */
export default function MediaField({ kind = 'image', variant = 'photo', folder, label, help, value, onChange }) {
  const inputId = useId();
  const fileRef = useRef(null);
  const [progress, setProgress] = useState(null); // null when idle, 0..1 while uploading
  const [error, setError] = useState('');
  const [showLink, setShowLink] = useState(false);
  const isVideo = kind === 'video';
  const uploading = progress !== null;

  const onFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // so choosing the same file again still fires
    if (!file) return;
    setError('');

    if (isVideo && file.size > VIDEO_WARN_BYTES) {
      const go = window.confirm(
        `This video is ${mb(file.size)}. The hero video plays for every visitor, and one this size will load slowly - especially on phones.\n\nFor best results export it as MP4 at 1080p and under 15MB.\n\nUpload it anyway?`,
      );
      if (!go) return;
    }

    try {
      setProgress(0);
      const prepared = isVideo ? file : await prepareImage(file, variant);
      const url = await uploadFile(prepared, folder || kind, setProgress);
      onChange(url);
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      setError(friendlyUploadError(err));
      setShowLink(true);
    } finally {
      setProgress(null);
    }
  };

  return (
    <FieldShell label={label} help={help} htmlFor={inputId}>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* ---------- Preview ---------- */}
        <div
          className={cn(
            'relative grid place-items-center overflow-hidden',
            isVideo ? 'aspect-video bg-ink-950' : variant === 'logo' ? 'h-32 bg-[length:16px_16px] bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)]' : 'aspect-[16/9] bg-slate-100',
          )}
        >
          {value ? (
            isVideo ? (
              <video src={value} muted loop playsInline controls preload="metadata" className="h-full w-full object-contain" />
            ) : (
              <img
                src={value}
                alt=""
                className={cn('h-full w-full', variant === 'logo' ? 'object-contain p-3' : 'object-cover')}
              />
            )
          ) : (
            <span className="flex flex-col items-center gap-1.5 px-4 text-center text-xs text-slate-400">
              {isVideo ? <Film className="h-6 w-6" /> : <ImagePlus className="h-6 w-6" />}
              {isVideo ? 'Using the built-in video' : 'No image'}
            </span>
          )}

          {uploading && (
            <div className="absolute inset-0 grid place-items-center bg-white/85 backdrop-blur-sm">
              <div className="w-3/4 max-w-xs text-center">
                <p className="text-sm font-semibold text-ink-900">Uploading… {Math.round(progress * 100)}%</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-brand-600 transition-[width] duration-200"
                    style={{ width: `${Math.max(4, progress * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ---------- Actions ---------- */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 p-2">
          <input
            ref={fileRef}
            id={inputId}
            type="file"
            accept={isVideo ? 'video/mp4,video/webm,video/quicktime' : 'image/*'}
            onChange={onFile}
            className="sr-only"
            disabled={uploading}
          />
          <Btn size="sm" variant="secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload className="h-4 w-4" />
            {value ? 'Replace' : 'Upload'}
          </Btn>
          <Btn size="sm" variant="ghost" onClick={() => setShowLink((v) => !v)} disabled={uploading}>
            <Link2 className="h-4 w-4" />
            Link
          </Btn>
          {value && (
            <Btn size="sm" variant="ghost" className="ml-auto text-red-600 hover:bg-red-50" onClick={() => onChange('')} disabled={uploading}>
              <Trash2 className="h-4 w-4" />
              Remove
            </Btn>
          )}
        </div>

        {showLink && (
          <div className="border-t border-slate-100 p-2">
            <input
              type="url"
              inputMode="url"
              value={value || ''}
              onChange={(e) => onChange(e.target.value.trim())}
              placeholder="https://… or /images/…"
              className={inputClass}
              aria-label={`${label || kind} link`}
            />
          </div>
        )}
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </FieldShell>
  );
}
