import type { AgendaBlock } from '@/types';

/**
 * Agenda do CEO montada automaticamente conforme a regra de presença:
 * - Maior parte da semana no Governo Municipal de Moraújo
 * - Um turno dedicado à Nutrileve
 * - Um dia da semana dedicado ao Junior (Univel)
 */
export const agenda: AgendaBlock[] = [
  {
    id: 'ag-seg',
    weekday: 'segunda',
    turno: 'dia_todo',
    clientId: 'governo-moraujo',
    label: 'Presença na Prefeitura',
    location: 'Gabinete · Governo Municipal de Moraújo',
  },
  {
    id: 'ag-ter-m',
    weekday: 'terca',
    turno: 'manha',
    clientId: 'governo-moraujo',
    label: 'Pauta institucional',
    location: 'Secretaria de Comunicação · Moraújo',
  },
  {
    id: 'ag-ter-t',
    weekday: 'terca',
    turno: 'tarde',
    clientId: 'nutrileve',
    label: 'Turno dedicado · Nutrileve',
    location: 'Nutrileve',
  },
  {
    id: 'ag-qua',
    weekday: 'quarta',
    turno: 'dia_todo',
    clientId: 'junior-univel',
    label: 'Dia dedicado · Junior (Univel)',
    location: 'Univel',
  },
  {
    id: 'ag-qui',
    weekday: 'quinta',
    turno: 'dia_todo',
    clientId: 'governo-moraujo',
    label: 'Presença na Prefeitura',
    location: 'Gabinete · Governo Municipal de Moraújo',
  },
  {
    id: 'ag-sex',
    weekday: 'sexta',
    turno: 'dia_todo',
    clientId: 'governo-moraujo',
    label: 'Presença na Prefeitura',
    location: 'Gabinete · Governo Municipal de Moraújo',
  },
];
