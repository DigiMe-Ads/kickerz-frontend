import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Mail, MessageCircle, Phone, RefreshCw, Trash2 } from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { ENQUIRIES_TABLE } from '../../lib/db';
import { whatsappHref } from '../../lib/whatsapp';
import { Btn, Spinner, useToast, friendlyDbError } from '../components/ui';
import { cn } from '../../lib/cn';

const SELECT_COLUMNS = 'id, name, email, phone, subject, message, read, created_at';

const formatDate = (iso) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));

function EnquiryRow({ item, open, onToggle, onToggleRead, onDelete, busy }) {
  return (
    <li className={cn('overflow-hidden rounded-2xl bg-white shadow-sm ring-1', item.read ? 'ring-slate-200' : 'ring-brand-300')}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
      >
        {!item.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-600" aria-hidden="true" />}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-bold text-ink-900">{item.name}</span>
            <span className="shrink-0 text-xs text-slate-400">{formatDate(item.created_at)}</span>
          </div>
          <p className="mt-0.5 truncate text-sm text-slate-500">
            {item.subject ? <span className="font-medium text-slate-600">{item.subject}: </span> : null}
            {item.message}
          </p>
        </div>
        {open ? (
          <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        ) : (
          <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="space-y-3.5 border-t border-slate-100 px-4 py-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-900">{item.message}</p>

          <div className="flex flex-wrap gap-2 text-sm">
            <a
              href={'mailto:' + item.email}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 font-medium text-ink-900 hover:bg-slate-200"
            >
              <Mail className="h-3.5 w-3.5" /> {item.email}
            </a>
            {item.phone && (
              <a
                href={'tel:' + item.phone.replace(/\s/g, '')}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 font-medium text-ink-900 hover:bg-slate-200"
              >
                <Phone className="h-3.5 w-3.5" /> {item.phone}
              </a>
            )}
            {item.phone && (
              <a
                href={whatsappHref(`Hi ${item.name}, thanks for reaching out to Colombo Kickerz!`)}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 font-medium text-green-700 hover:bg-green-100"
              >
                <MessageCircle className="h-3.5 w-3.5" /> Reply on WhatsApp
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <Btn size="sm" variant="secondary" onClick={onToggleRead} disabled={busy}>
              Mark as {item.read ? 'unread' : 'read'}
            </Btn>
            <Btn size="sm" variant="danger" className="ml-auto" onClick={onDelete} disabled={busy}>
              <Trash2 className="h-4 w-4" /> Delete
            </Btn>
          </div>
        </div>
      )}
    </li>
  );
}

/**
 * Every submission from the public contact form (Contact.jsx), newest
 * first. Nothing here can be edited - only read, marked read/unread, or
 * deleted - since these are records of what a visitor sent in, not content.
 */
export default function Enquiries() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loadState, setLoadState] = useState('loading');
  const [openId, setOpenId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const { data, error } = await getSupabase()
        .from(ENQUIRIES_TABLE)
        .select(SELECT_COLUMNS)
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      setItems(data);
      setLoadState('ready');
    } catch (error) {
      if (import.meta.env.DEV) console.error(error);
      toast(friendlyDbError(error), 'error');
      setLoadState('error');
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleRead = async (item) => {
    setBusyId(item.id);
    try {
      const { error } = await getSupabase()
        .from(ENQUIRIES_TABLE)
        .update({ read: !item.read })
        .eq('id', item.id)
        .select('id')
        .single(); // throws if RLS matched zero rows, rather than silently no-op'ing
      if (error) throw error;
      setItems((all) => all.map((x) => (x.id === item.id ? { ...x, read: !item.read } : x)));
    } catch (error) {
      toast(friendlyDbError(error), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete the message from ${item.name}? This can’t be undone.`)) return;
    setBusyId(item.id);
    try {
      const { error } = await getSupabase().from(ENQUIRIES_TABLE).delete().eq('id', item.id).select('id').single();
      if (error) throw error;
      setItems((all) => all.filter((x) => x.id !== item.id));
      if (openId === item.id) setOpenId(null);
      toast('Message deleted.');
    } catch (error) {
      toast(friendlyDbError(error), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const unreadCount = items.filter((i) => !i.read).length;

  return (
    <div className="mx-auto max-w-2xl px-3 pb-16 pt-4 sm:px-5 sm:pt-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black uppercase text-ink-900">Enquiries</h1>
          <p className="text-sm text-slate-500">
            {unreadCount > 0 ? `${unreadCount} unread — ` : ''}
            Messages sent from the site’s contact form.
          </p>
        </div>
        <Btn variant="ghost" onClick={load} aria-label="Refresh" disabled={loadState === 'loading'}>
          <RefreshCw className={cn('h-4 w-4', loadState === 'loading' && 'animate-spin')} />
        </Btn>
      </div>

      {loadState === 'loading' && items.length === 0 && (
        <div className="grid place-items-center py-16 text-slate-400">
          <Spinner />
        </div>
      )}

      {loadState !== 'loading' && items.length === 0 && (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center">
          <p className="font-semibold text-ink-900">No messages yet</p>
          <p className="mt-1 text-sm text-slate-500">Submissions from the site’s contact form will show up here.</p>
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <EnquiryRow
            key={item.id}
            item={item}
            open={openId === item.id}
            onToggle={() => setOpenId((id) => (id === item.id ? null : item.id))}
            onToggleRead={() => toggleRead(item)}
            onDelete={() => remove(item)}
            busy={busyId === item.id}
          />
        ))}
      </ul>
    </div>
  );
}
