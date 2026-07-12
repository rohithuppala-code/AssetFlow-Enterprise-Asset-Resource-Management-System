import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Check,
  ChevronsUpDown,
  CircleAlert,
  CircleX,
  LoaderCircle,
  Bell,
  Box,
  Building2,
  CalendarClock,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileBarChart2,
  Package2,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const fadeItem = {
  hidden: { opacity: 0, y: 18 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.34, delay: index * 0.05, ease: 'easeOut' },
  }),
};

export const pageIcons = {
  '/': Package2,
  '/assets': Box,
  '/allocations': Sparkles,
  '/bookings': CalendarClock,
  '/maintenance': Wrench,
  '/audits': ClipboardCheck,
  '/org-setup': Settings2,
  '/reports': FileBarChart2,
  '/notifications': Bell,
  '/activity-logs': Clock3,
};

const breadcrumbLabels = {
  '/': 'Dashboard',
  '/assets': 'Asset Directory',
  '/allocations': 'Allocations',
  '/bookings': 'Bookings',
  '/maintenance': 'Maintenance',
  '/audits': 'Audit Cycles',
  '/org-setup': 'Organization Setup',
  '/reports': 'Reports',
  '/notifications': 'Notifications',
  '/activity-logs': 'Activity Logs',
};

export const statusTone = {
  success: 'pill pill-success',
  warning: 'pill pill-warning',
  danger: 'pill pill-danger',
  info: 'pill pill-info',
  neutral: 'pill pill-neutral',
};

export function toneForValue(value) {
  const normalized = String(value || '').toLowerCase();
  if (
    ['available', 'active', 'resolved', 'completed', 'verified', 'employee', 'good', 'open'].includes(normalized)
  ) {
    return statusTone.success;
  }
  if (
    ['pending', 'upcoming', 'reserved', 'undermaintenance', 'inprogress', 'damaged', 'departmenthead', 'high'].includes(normalized)
  ) {
    return statusTone.warning;
  }
  if (
    ['lost', 'rejected', 'cancelled', 'critical', 'missing', 'overdue', 'admin'].includes(normalized)
  ) {
    return statusTone.danger;
  }
  if (
    ['allocated', 'approved', 'assetmanager', 'ongoing', 'technicianassigned', 'medium', 'requested'].includes(normalized)
  ) {
    return statusTone.info;
  }
  return statusTone.neutral;
}

export function StatusPill({ children, tone }) {
  return <span className={tone || toneForValue(children)}>{children}</span>;
}

export function PageHeader({ eyebrow, title, description, actions }) {
  const location = useLocation();
  const Icon = pageIcons[location.pathname] || ShieldCheck;
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="surface-panel"
      variants={prefersReducedMotion ? undefined : fadeItem}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate={prefersReducedMotion ? false : 'visible'}
    >
      <div style={{ padding: '1.4rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'grid', gap: '0.45rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-secondary)', fontSize: '0.76rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <Icon size={16} />
              <span>{eyebrow || 'AssetFlow Workspace'}</span>
            </div>
            <div>
              <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem, 2vw, 2.4rem)', lineHeight: 1.05 }}>{title}</h1>
              <p style={{ margin: '0.55rem 0 0', color: 'var(--text-secondary)', maxWidth: '72ch' }}>{description}</p>
            </div>
          </div>
          {actions ? <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>{actions}</div> : null}
        </div>
      </div>
    </motion.div>
  );
}

export function MetricCard({ title, value, delta, icon: Icon, tone = 'var(--brand-primary)', index = 0, footer }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      className="surface-panel metric-card"
      custom={index}
      variants={prefersReducedMotion ? undefined : fadeItem}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate={prefersReducedMotion ? false : 'visible'}
      style={{ gridColumn: 'span 2', position: 'relative' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ display: 'grid', gap: '0.45rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', fontWeight: 700 }}>{title}</span>
          <strong style={{ fontSize: '2rem', lineHeight: 1, fontFamily: 'var(--font-display)' }}>{value}</strong>
        </div>
        <div style={{ width: 46, height: 46, borderRadius: 16, background: `${tone}22`, color: tone, display: 'grid', placeItems: 'center', border: `1px solid ${tone}33` }}>
          {Icon ? <Icon size={20} /> : null}
        </div>
      </div>
      {delta ? <div style={{ marginTop: '0.85rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{delta}</div> : null}
      {footer ? <div style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{footer}</div> : null}
    </motion.div>
  );
}

export function SurfaceCard({ children, title, description, actions, minHeight, index = 0 }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.section
      className="surface-panel"
      custom={index}
      variants={prefersReducedMotion ? undefined : fadeItem}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate={prefersReducedMotion ? false : 'visible'}
      style={{ borderRadius: '26px', minHeight }}
    >
      {(title || actions) && (
        <div style={{ padding: '1.3rem 1.4rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              {title ? <h2 style={{ margin: 0, fontSize: '1.06rem' }}>{title}</h2> : null}
              {description ? <p style={{ margin: '0.4rem 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{description}</p> : null}
            </div>
            {actions ? <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>{actions}</div> : null}
          </div>
        </div>
      )}
      <div style={{ padding: title || actions ? '1.2rem 1.4rem 1.4rem' : '1.4rem' }}>{children}</div>
    </motion.section>
  );
}

export function FiltersBar({ children }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
      {children}
    </div>
  );
}

export function SearchField({ value, onChange, placeholder = 'Search', style }) {
  return (
    <div style={{ position: 'relative', minWidth: 220, ...style }}>
      <Search size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
      <input className="input" style={{ paddingLeft: '2.5rem' }} value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}

export function FormHint({ children, tone = 'default' }) {
  const style = tone === 'error'
    ? { color: '#fecaca' }
    : tone === 'warning'
      ? { color: '#fde68a' }
      : undefined;

  return <span className="field-hint" style={style}>{children}</span>;
}

export function RequiredLabel({ children }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
      <span>{children}</span>
      <span aria-hidden="true" style={{ color: 'var(--danger)' }}>*</span>
    </span>
  );
}

export function EmptyState({ icon: Icon = Building2, title, description }) {
  return (
    <div className="empty-state">
      <div style={{ width: 52, height: 52, borderRadius: 18, margin: '0 auto 0.85rem', display: 'grid', placeItems: 'center', color: 'var(--brand-secondary)', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.16)' }}>
        <Icon size={22} />
      </div>
      <div style={{ fontWeight: 800, marginBottom: '0.4rem' }}>{title}</div>
      <div style={{ color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto' }}>{description}</div>
    </div>
  );
}

export function LoadingState({ label = 'Loading AssetFlow workspace...' }) {
  return (
    <div className="empty-state" style={{ padding: '3rem 1.25rem' }}>
      <div style={{ width: 40, height: 40, borderRadius: '999px', border: '3px solid rgba(96, 165, 250, 0.18)', borderTopColor: 'var(--brand-primary)', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
      <div>{label}</div>
    </div>
  );
}

export function SkeletonBlock({ height = 16, width = '100%', style }) {
  return <div className="skeleton-block" style={{ height, width, ...style }} aria-hidden="true" />;
}

export function LoadingRows({ rows = 4, columns = 4 }) {
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: '0.75rem' }}>
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <SkeletonBlock key={columnIndex} height={18} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function KeyValueList({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
      {items.map((item) => (
        <div key={item.label} style={{ padding: '0.95rem', borderRadius: 18, background: 'rgba(148, 163, 184, 0.06)', border: '1px solid rgba(148, 163, 184, 0.09)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>{item.label}</div>
          <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}

export function Breadcrumbs() {
  const location = useLocation();
  const crumbs = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (!segments.length) {
      return [{ path: '/', label: breadcrumbLabels['/'] }];
    }

    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      return { path, label: breadcrumbLabels[path] || segment };
    });
  }, [location.pathname]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
      <Link to="/" style={{ textDecoration: 'none' }}>AssetFlow</Link>
      {crumbs.map((crumb) => (
        <span key={crumb.path} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--text-secondary)' }}>{crumb.label}</span>
        </span>
      ))}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  width = 560,
}) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="overlay-scrim"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={prefersReducedMotion ? false : { opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-panel"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
            animate={prefersReducedMotion ? false : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            style={{ width: `min(calc(100vw - 2rem), ${width}px)` }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{title}</h3>
                {description ? <p style={{ margin: '0.45rem 0 0', color: 'var(--text-secondary)' }}>{description}</p> : null}
              </div>
              <button className="button button-ghost button-sm" onClick={onClose} aria-label="Close dialog">
                <X size={16} />
              </button>
            </div>
            <div style={{ marginTop: '1rem' }}>{children}</div>
            {actions ? <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>{actions}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function Drawer({ open, onClose, title, description, children, width = 520 }) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="overlay-scrim"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={prefersReducedMotion ? false : { opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0 }}
          onClick={onClose}
        >
          <motion.aside
            className="drawer-panel"
            initial={prefersReducedMotion ? false : { x: 48, opacity: 0 }}
            animate={prefersReducedMotion ? false : { x: 0, opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { x: 32, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ width: `min(calc(100vw - 1rem), ${width}px)` }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.12rem' }}>{title}</h3>
                {description ? <p style={{ margin: '0.4rem 0 0', color: 'var(--text-secondary)' }}>{description}</p> : null}
              </div>
              <button className="button button-ghost button-sm" onClick={onClose} aria-label="Close drawer">
                <X size={16} />
              </button>
            </div>
            {children}
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  tone = 'danger',
  loading = false,
  children,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      actions={[
        <button key="cancel" className="button button-secondary" onClick={onClose}>Cancel</button>,
        <button key="confirm" className={`button ${tone === 'danger' ? 'button-danger' : 'button-primary'}`} onClick={onConfirm} disabled={loading}>
          {loading ? <LoaderCircle size={16} className="spin-icon" /> : null}
          <span>{loading ? 'Working...' : confirmLabel}</span>
        </button>,
      ]}
    >
      {children}
    </Modal>
  );
}

export function EntityPicker({
  label,
  required,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search',
  emptyTitle = 'No results found',
  emptyDescription = 'Try a different search term.',
  helperText,
  renderOption,
  renderValue,
  error,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 30);
    }
  }, [open]);

  const selected = options.find((option) => option.value === value) || null;
  const filtered = options.filter((option) => {
    if (!query.trim()) return true;
    const haystack = `${option.label} ${option.searchText || ''}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <div className="field">
      <label>{required ? <RequiredLabel>{label}</RequiredLabel> : label}</label>
      <button
        type="button"
        className={`picker-trigger ${error ? 'picker-trigger-error' : ''}`}
        onClick={() => setOpen(true)}
        aria-label={label}
      >
        <div style={{ minWidth: 0, textAlign: 'left' }}>
          {selected ? (
            renderValue ? renderValue(selected) : (
              <>
                <div style={{ fontWeight: 700 }}>{selected.label}</div>
                {selected.meta ? <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{selected.meta}</div> : null}
              </>
            )
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>{placeholder}</span>
          )}
        </div>
        <ChevronsUpDown size={16} color="var(--text-muted)" />
      </button>
      {helperText ? <FormHint>{helperText}</FormHint> : null}
      {error ? <FormHint tone="error">{error}</FormHint> : null}

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setQuery('');
        }}
        title={label}
        description="Choose from live ERP records instead of entering raw IDs."
        width={680}
      >
        <div className="page-stack">
          <SearchField value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} style={{ minWidth: 0 }} />
          <div className="entity-picker-list">
            {filtered.length === 0 ? (
              <EmptyState icon={CircleAlert} title={emptyTitle} description={emptyDescription} />
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`entity-picker-option ${option.value === value ? 'entity-picker-option-active' : ''}`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {renderOption ? renderOption(option) : (
                      <>
                        <div style={{ fontWeight: 800 }}>{option.label}</div>
                        {option.meta ? <div style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', marginTop: '0.25rem' }}>{option.meta}</div> : null}
                      </>
                    )}
                  </div>
                  {option.value === value ? <Check size={16} color="var(--brand-secondary)" /> : null}
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function TableToolbar({ search, onSearchChange, filters, actions, searchPlaceholder = 'Search records' }) {
  return (
    <div className="table-toolbar">
      <SearchField value={search} onChange={onSearchChange} placeholder={searchPlaceholder} style={{ flex: 1, minWidth: 240 }} />
      {filters ? <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>{filters}</div> : null}
      {actions ? <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>{actions}</div> : null}
    </div>
  );
}

export function SortableHeader({ label, active, direction = 'asc', onClick }) {
  return (
    <button type="button" className={`sortable-header ${active ? 'sortable-header-active' : ''}`} onClick={onClick}>
      <span>{label}</span>
      <ChevronsUpDown size={14} />
      {active ? <span style={{ fontSize: '0.72rem' }}>{direction === 'asc' ? '↑' : '↓'}</span> : null}
    </button>
  );
}

export function formatDate(value, options) {
  if (!value) return '--';
  return new Date(value).toLocaleDateString(undefined, options);
}

export function formatDateTime(value) {
  if (!value) return '--';
  return new Date(value).toLocaleString();
}

export function formatNumber(value) {
  return new Intl.NumberFormat().format(Number(value || 0));
}

export function quickStat(label, value, detail) {
  return { label, value, detail };
}

export function MiniStat({ label, value, detail, icon: Icon = Sparkles }) {
  return (
    <div style={{ padding: '1rem', borderRadius: 18, background: 'rgba(8, 18, 34, 0.55)', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{label}</div>
        <Icon size={16} color="var(--text-muted)" />
      </div>
      <div style={{ marginTop: '0.45rem', fontSize: '1.45rem', fontFamily: 'var(--font-display)' }}>{value}</div>
      {detail ? <div style={{ marginTop: '0.25rem', color: 'var(--text-muted)', fontSize: '0.76rem' }}>{detail}</div> : null}
    </div>
  );
}

if (typeof document !== 'undefined' && !document.head.querySelector('style[data-assetflow-spin]')) {
  const globalStyle = document.createElement('style');
  globalStyle.innerHTML = '@keyframes spin{to{transform:rotate(360deg)}}';
  globalStyle.dataset.assetflowSpin = 'true';
  document.head.appendChild(globalStyle);
}
