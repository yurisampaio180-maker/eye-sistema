/** Concatena classes condicionalmente (mini clsx). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Formata número como moeda BRL. */
export function brl(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  });
}

/** Abrevia números grandes (1.2k, 3.4M). */
export function compact(value: number): string {
  return Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/** Percentual formatado. */
export function pct(value: number): string {
  return `${Math.round(value)}%`;
}

/** Iniciais a partir do nome. */
export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

/** Soma simples de array. */
export const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
