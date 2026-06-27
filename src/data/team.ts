import type { TeamMember } from '@/types';

export const team: TeamMember[] = [
  {
    id: 'ceo',
    name: 'Yuri Sampaio',
    roles: ['ceo'],
    roleLabel: 'CEO · Visão total',
    avatarColor: '#E11D2A',
    online: true,
    currentActivity: 'Acompanhando o painel em tempo real',
  },
  {
    id: 'alysson',
    name: 'Alysson',
    roles: ['videomaker', 'designer'],
    roleLabel: 'Videomaker e Designer',
    avatarColor: '#6366F1',
    online: true,
    currentActivity: 'Editando vídeo — Nutrileve',
  },
  {
    id: 'pedro',
    name: 'Pedro Alysson',
    roles: ['videomaker', 'designer'],
    roleLabel: 'Videomaker e Designer',
    avatarColor: '#0EA5E9',
    online: true,
    currentActivity: 'Gravação externa — Governo de Moraújo',
  },
  {
    id: 'henrique',
    name: 'Henrique',
    roles: ['designer'],
    roleLabel: 'Designer',
    avatarColor: '#22C55E',
    online: false,
    currentActivity: 'Offline',
  },
  {
    id: 'lourenco',
    name: 'Lourenço',
    roles: ['designer'],
    roleLabel: 'Designer',
    avatarColor: '#F59E0B',
    online: true,
    currentActivity: 'Criando carrossel — Siara',
  },
  {
    id: 'eduarda',
    name: 'Eduarda',
    roles: ['social', 'designer'],
    roleLabel: 'Social Media e Designer',
    avatarColor: '#EC4899',
    online: true,
    currentActivity: 'Agendando postagens — Verso Nosso',
  },
];

export const ceo = team[0];
