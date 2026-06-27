import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn, initials } from '@/lib/utils';

// ---------- Card ----------
export function Card({
  children,
  className,
  hover,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={cn('eye-card', hover && 'eye-card-hover', className)}>
      {children}
    </div>
  );
}

// ---------- Button ----------
type Variant = 'primary' | 'ghost' | 'soft';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}
export function Button({
  variant = 'primary',
  className,
  children,
  ...rest
}: ButtonProps) {
  const map: Record<Variant, string> = {
    primary: 'eye-btn-primary',
    ghost: 'eye-btn-ghost',
    soft: 'eye-btn-soft',
  };
  return (
    <button className={cn(map[variant], className)} {...rest}>
      {children}
    </button>
  );
}

// ---------- Badge ----------
export function Badge({
  children,
  className,
  dot,
}: {
  children: ReactNode;
  className?: string;
  dot?: string;
}) {
  return (
    <span className={cn('eye-badge', className)}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />}
      {children}
    </span>
  );
}

// ---------- Avatar ----------
export function Avatar({
  name,
  color,
  size = 'md',
  online,
}: {
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  online?: boolean;
}) {
  const sizes = {
    sm: 'h-7 w-7 text-[10px]',
    md: 'h-9 w-9 text-xs',
    lg: 'h-12 w-12 text-sm',
  };
  return (
    <div className="relative shrink-0">
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-bold text-white',
          sizes[size]
        )}
        style={{ backgroundColor: color }}
      >
        {initials(name)}
      </div>
      {online !== undefined && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink-850',
            online ? 'bg-emerald-400' : 'bg-ink-600'
          )}
        />
      )}
    </div>
  );
}

// ---------- PageHeader ----------
export function PageHeader({
  title,
  subtitle,
  actions,
  icon: Icon,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="mt-1 grid h-10 w-10 place-items-center rounded-xl bg-eye-red/10 text-eye-red">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div>
          <h1 className="eye-title text-2xl md:text-3xl">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-cloud-muted">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ---------- StatCard (KPI) ----------
export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  accent,
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  icon?: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <Card className={cn('relative overflow-hidden p-4', accent && 'bg-hud-grid bg-[length:32px_32px]')}>
      <div className="flex items-start justify-between">
        <span className="eye-label">{label}</span>
        {Icon && <Icon className={cn('h-4 w-4', accent ? 'text-eye-red' : 'text-cloud-dim')} />}
      </div>
      <div className="mt-2 font-display text-3xl font-extrabold text-cloud">
        {value}
      </div>
      {delta && (
        <div className="mt-1 text-xs font-medium text-emerald-400">{delta}</div>
      )}
    </Card>
  );
}

// ---------- EmptyState ----------
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-ink-700 py-12 text-center text-sm text-cloud-dim">
      {children}
    </div>
  );
}

// ---------- Skeleton ----------
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-ink-800', className)} />;
}
