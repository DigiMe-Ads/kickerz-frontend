import { useId, useState } from 'react';
import { ChevronDown, ChevronUp, ArrowUp, ArrowDown, Plus, Trash2 } from 'lucide-react';
import MediaField from './MediaField';
import { Btn, FieldShell, inputClass } from './ui';
import { LINK_SUGGESTIONS } from '../schema';
import { extractIframeSrc } from '../../lib/safe';
import { cn } from '../../lib/cn';

const LINK_LIST_ID = 'ck-admin-link-suggestions';

/** Rendered once by the dashboard so every link field can offer the anchors. */
export function LinkSuggestions() {
  return (
    <datalist id={LINK_LIST_ID}>
      {LINK_SUGGESTIONS.map((href) => (
        <option key={href} value={href} />
      ))}
    </datalist>
  );
}

function Toggle({ id, checked, onChange, label }) {
  return (
    <label htmlFor={id} className="flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-3.5 py-2">
      <span className="text-sm font-medium text-ink-900">{label}</span>
      <span className="relative inline-flex shrink-0">
        <input id={id} type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="h-7 w-12 rounded-full bg-slate-300 transition-colors peer-checked:bg-brand-600 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-100" />
        <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function StringsField({ field, value, onChange }) {
  const items = Array.isArray(value) ? value : [];
  const set = (i, v) => onChange(items.map((x, j) => (j === i ? v : x)));
  return (
    <FieldShell label={field.label} help={field.help}>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={item}
              onChange={(e) => set(i, e.target.value)}
              className={inputClass}
              aria-label={`${field.itemLabel || 'Item'} ${i + 1}`}
            />
            <Btn
              variant="ghost"
              className="shrink-0 px-3 text-red-600 hover:bg-red-50"
              aria-label={`Remove ${field.itemLabel || 'item'} ${i + 1}`}
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              <Trash2 className="h-4 w-4" />
            </Btn>
          </div>
        ))}
        <Btn size="sm" variant="secondary" onClick={() => onChange([...items, ''])}>
          <Plus className="h-4 w-4" /> Add {(field.itemLabel || 'item').toLowerCase()}
        </Btn>
      </div>
    </FieldShell>
  );
}

function ListField({ field, value, onChange, folder }) {
  const items = Array.isArray(value) ? value : [];
  // Long lists (20 coaches, 16 partners) start collapsed; a new item opens.
  const [open, setOpen] = useState(() => new Set(items.length <= 3 ? items.map((_, i) => i) : []));
  const atMin = field.min != null && items.length <= field.min;
  const atMax = field.max != null && items.length >= field.max;
  const noun = field.itemLabel || 'item';

  const toggle = (i) =>
    setOpen((s) => {
      const next = new Set(s);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  // Open/closed state is tracked by position, so it has to move with the item.
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setOpen((s) => {
      const n = new Set();
      s.forEach((k) => n.add(k === i ? j : k === j ? i : k));
      return n;
    });
  };

  const remove = (i) => {
    const title = field.itemTitle?.(items[i], i) || noun;
    if (!window.confirm(`Remove “${title}”? This isn’t saved until you press Save.`)) return;
    onChange(items.filter((_, j) => j !== i));
    setOpen((s) => {
      const n = new Set();
      s.forEach((k) => {
        if (k < i) n.add(k);
        else if (k > i) n.add(k - 1);
      });
      return n;
    });
  };

  const add = () => {
    onChange([...items, field.newItem ? field.newItem() : {}]);
    setOpen((s) => new Set(s).add(items.length));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink-900">{field.label}</h3>
        <span className="text-xs text-slate-500">
          {items.length} {items.length === 1 ? noun : `${noun}s`}
          {field.max != null && ` (max ${field.max})`}
        </span>
      </div>
      {field.help && <p className="text-xs text-slate-500">{field.help}</p>}

      <ol className="space-y-2">
        {items.map((item, i) => {
          const isOpen = open.has(i);
          const title = field.itemTitle?.(item, i) || `${noun} ${i + 1}`;
          return (
            <li key={item?.id || i} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="flex items-center gap-1 pr-1">
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  className="flex min-h-12 min-w-0 flex-1 items-center gap-2.5 px-3.5 text-left"
                >
                  <span className="w-5 shrink-0 text-xs font-semibold tabular-nums text-slate-400">{i + 1}</span>
                  <span className="truncate text-sm font-semibold text-ink-900">{title}</span>
                  {isOpen ? <ChevronUp className="ml-auto h-4 w-4 shrink-0 text-slate-400" /> : <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-slate-400" />}
                </button>
                <Btn variant="ghost" size="sm" className="px-2" aria-label={`Move ${title} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowUp className="h-4 w-4" />
                </Btn>
                <Btn variant="ghost" size="sm" className="px-2" aria-label={`Move ${title} down`} disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                  <ArrowDown className="h-4 w-4" />
                </Btn>
                <Btn
                  variant="ghost"
                  size="sm"
                  className="px-2 text-red-600 hover:bg-red-50"
                  aria-label={`Remove ${title}`}
                  disabled={atMin}
                  onClick={() => remove(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Btn>
              </div>
              {isOpen && (
                <div className="space-y-4 border-t border-slate-200 bg-white p-3.5 sm:p-4">
                  <Fields fields={field.fields} value={item} onChange={(v) => onChange(items.map((x, j) => (j === i ? v : x)))} folder={folder} />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <Btn variant="secondary" onClick={add} disabled={atMax} className="w-full border-dashed sm:w-auto">
        <Plus className="h-4 w-4" /> Add {noun}
      </Btn>
    </div>
  );
}

export function Field({ field, value, onChange, folder }) {
  const id = useId();

  switch (field.type) {
    case 'text':
    case 'link':
      return (
        <FieldShell label={field.label} help={field.help} htmlFor={id}>
          <input
            id={id}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            list={field.type === 'link' ? LINK_LIST_ID : undefined}
            placeholder={field.type === 'link' ? '#contact, /page or https://…' : undefined}
            className={inputClass}
          />
        </FieldShell>
      );

    case 'textarea':
      return (
        <FieldShell label={field.label} help={field.help} htmlFor={id}>
          <textarea
            id={id}
            value={value ?? ''}
            rows={field.rows || 3}
            onChange={(e) => onChange(field.mapEmbed ? extractIframeSrc(e.target.value) : e.target.value)}
            className={cn(inputClass, 'resize-y leading-relaxed')}
          />
        </FieldShell>
      );

    case 'number':
      return (
        <FieldShell label={field.label} help={field.help} htmlFor={id}>
          <input
            id={id}
            type="number"
            inputMode="numeric"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
            className={inputClass}
          />
        </FieldShell>
      );

    case 'toggle':
      return <Toggle id={id} checked={value} onChange={onChange} label={field.label} />;

    case 'select':
      return (
        <FieldShell label={field.label} help={field.help} htmlFor={id}>
          <select
            id={id}
            value={value ?? ''}
            onChange={(e) => onChange(field.numeric ? Number(e.target.value) : e.target.value)}
            className={inputClass}
          >
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FieldShell>
      );

    case 'image':
    case 'video':
      return (
        <MediaField
          kind={field.type}
          variant={field.variant}
          folder={folder}
          label={field.label}
          help={field.help}
          value={value}
          onChange={onChange}
        />
      );

    case 'strings':
      return <StringsField field={field} value={value} onChange={onChange} />;

    case 'group':
      return (
        <fieldset className="space-y-4 rounded-xl border border-slate-200 p-3.5 sm:p-4">
          <legend className="px-1.5 text-sm font-semibold text-ink-900">{field.label}</legend>
          <Fields fields={field.fields} value={value || {}} onChange={onChange} folder={folder} />
        </fieldset>
      );

    case 'list':
      return <ListField field={field} value={value} onChange={onChange} folder={folder} />;

    default:
      return null;
  }
}

/** A set of fields bound to one object. */
export function Fields({ fields, value, onChange, folder }) {
  const obj = value || {};
  return fields.map((field) => (
    <Field
      key={field.key}
      field={field}
      value={obj[field.key]}
      onChange={(v) => onChange({ ...obj, [field.key]: v })}
      folder={folder}
    />
  ));
}

export default Field;
