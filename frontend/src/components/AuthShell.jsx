import { motion } from 'framer-motion';
import { ArrowRight, Building2, ShieldEllipsis, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';

const highlights = [
  {
    title: 'Asset lifecycle clarity',
    description: 'Track every registration, allocation, return, and retirement event from one workspace.',
    icon: Workflow,
  },
  {
    title: 'Role-safe workflows',
    description: 'Give admins, asset managers, and employees the right operational context at the right time.',
    icon: ShieldEllipsis,
  },
  {
    title: 'Operational visibility',
    description: 'Surface maintenance, bookings, and audit pressure before they become manual fire drills.',
    icon: Building2,
  },
];

function AuthShell({ title, subtitle, children, footerLabel, footerLink, footerText }) {
  return (
    <div className="auth-shell">
      <motion.section
        className="auth-hero glass-panel"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gap: '2rem', height: '100%' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.8rem', borderRadius: 999, background: 'rgba(96, 165, 250, 0.12)', border: '1px solid rgba(96, 165, 250, 0.16)', color: 'var(--text-secondary)', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <span style={{ width: 9, height: 9, borderRadius: 999, background: 'var(--brand-secondary)', boxShadow: '0 0 20px rgba(56, 189, 248, 0.45)' }} />
              Enterprise Asset ERP
            </div>
            <h1 className="gradient-text" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4.6rem)', lineHeight: 0.95, margin: '1.4rem 0 1rem' }}>
              AssetFlow keeps every asset, resource, and request moving in sync.
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 640, lineHeight: 1.75 }}>
              Built for departments that need confident allocation, maintenance approval, booking control, and audit traceability without spreadsheet sprawl.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '0.9rem' }}>
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem 1.05rem', borderRadius: 20, background: 'rgba(8, 18, 34, 0.42)', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 15, background: 'rgba(56, 189, 248, 0.12)', display: 'grid', placeItems: 'center', color: 'var(--brand-secondary)', flexShrink: 0 }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, marginBottom: '0.3rem' }}>{item.title}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{item.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="auth-card glass-panel"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.06 }}
      >
        <div style={{ display: 'grid', gap: '1.4rem' }}>
          <div>
            <div style={{ width: 58, height: 58, borderRadius: 20, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #2563eb, #38bdf8 52%, #818cf8)', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '1rem' }}>AF</div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.9rem' }}>{title}</h2>
            <p style={{ margin: '0.55rem 0 0', color: 'var(--text-secondary)' }}>{subtitle}</p>
          </div>

          {children}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <span>{footerText}</span>
            <Link to={footerLink} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', textDecoration: 'none', fontWeight: 800, color: 'var(--brand-secondary)' }}>
              {footerLabel}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default AuthShell;
