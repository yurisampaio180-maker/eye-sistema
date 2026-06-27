import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek as sow,
  addWeeks,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Weekday } from '@/types';

export const WEEKDAYS: Weekday[] = [
  'segunda',
  'terca',
  'quarta',
  'quinta',
  'sexta',
];

export const weekdayLabel: Record<Weekday, string> = {
  segunda: 'Segunda',
  terca: 'Terça',
  quarta: 'Quarta',
  quinta: 'Quinta',
  sexta: 'Sexta',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

export const fmt = (date: Date | string, pattern: string) =>
  format(typeof date === 'string' ? parseISO(date) : date, pattern, {
    locale: ptBR,
  });

export const time = (iso: string) => fmt(iso, 'HH:mm');
export const dayMonth = (iso: string) => fmt(iso, "dd 'de' MMM");
export const weekdayName = (iso: string) => fmt(iso, 'EEEE');

/** Retorna os 7 dias da semana corrente (segunda a domingo). */
export function weekDays(reference = new Date()): Date[] {
  const start = startOfWeek(reference, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** Matriz de semanas (6x7) para o calendário mensal. */
export function monthMatrix(reference = new Date()): Date[][] {
  const first = startOfMonth(reference);
  const gridStart = sow(first, { weekStartsOn: 1 });
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const start = addWeeks(gridStart, w);
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(start, i)));
  }
  return weeks;
}

export { isSameDay, parseISO, startOfMonth, endOfMonth, addDays };
