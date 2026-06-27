import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  /** apenas o símbolo (arcos + olho), sem o texto */
  iconOnly?: boolean;
}

/** Logo da EYE Agência — dois arcos vermelhos cercando o "eye". */
export function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg
        viewBox="0 0 64 64"
        className="h-8 w-8 shrink-0"
        aria-hidden
        fill="none"
      >
        <path
          d="M10 26C18 14 46 14 54 26"
          stroke="#E11D2A"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M10 38C18 50 46 50 54 38"
          stroke="#E11D2A"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="32" cy="32" r="7.5" fill="currentColor" />
        <circle cx="32" cy="32" r="3" fill="#E11D2A" />
      </svg>
      {!iconOnly && (
        <div className="leading-none">
          <span className="font-display text-2xl font-black tracking-tight text-cloud">
            eye
          </span>
          <span className="ml-1 align-top text-xs font-medium text-cloud-muted">
            agência
          </span>
        </div>
      )}
    </div>
  );
}
