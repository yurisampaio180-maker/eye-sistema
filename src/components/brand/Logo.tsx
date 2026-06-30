import { cn } from '@/lib/utils';

type LogoProps = {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sz = {
  sm: { icon: 'h-7 w-7',   sub: 'text-[10px]', gap: 'gap-2' },
  md: { icon: 'h-9 w-9',   sub: 'text-xs',      gap: 'gap-2.5' },
  lg: { icon: 'h-12 w-12', sub: 'text-sm',      gap: 'gap-3' },
};

/**
 * Logo oficial EYE Agência.
 * Dois arcos vermelhos diagonais (superior-esquerdo + inferior-direito)
 * emoldurando o texto "eye" em cinza claro — fiel ao arquivo oficial.
 *
 * variant="full"  → ícone + "agência" ao lado (padrão)
 * variant="icon"  → somente o ícone
 */
export function Logo({ variant = 'full', size = 'md', className }: LogoProps) {
  const s = sz[size];
  return (
    <div className={cn('flex items-center', s.gap, className)}>
      <svg
        viewBox="0 0 100 100"
        className={cn('shrink-0', s.icon)}
        role="img"
        aria-label="EYE"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* "eye" — texto grande em cinza claro, desenhado primeiro (arcos por cima) */}
        <text
          x="50"
          y="64"
          textAnchor="middle"
          fill="#D4D4D4"
          fontFamily="Archivo, Inter, system-ui, sans-serif"
          fontSize="46"
          fontWeight="700"
        >
          eye
        </text>

        {/* Arco superior-esquerdo: parte de baixo-esquerda e sobe até centro-superior */}
        <path
          d="M 8 58 C 4 26, 28 4, 62 8"
          stroke="#E11D2A"
          strokeWidth="8.5"
          strokeLinecap="round"
        />

        {/* Arco inferior-direito: parte de centro-baixo e desce até direita */}
        <path
          d="M 38 92 C 64 97, 94 76, 93 44"
          stroke="#E11D2A"
          strokeWidth="8.5"
          strokeLinecap="round"
        />
      </svg>

      {variant === 'full' && (
        <span
          className={cn(
            'select-none font-display font-semibold tracking-widest text-cloud-muted uppercase',
            s.sub,
          )}
        >
          agência
        </span>
      )}
    </div>
  );
}
