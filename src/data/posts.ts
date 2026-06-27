import type { Post, PostStatus, SocialPlatform } from '@/types';

/** cria ISO a partir de offset de dias e hora do dia. */
function at(dayOffset: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

let seq = 0;
const id = () => `post-${++seq}`;

interface Seed {
  clientId: string;
  title: string;
  platform: SocialPlatform;
  dayOffset: number;
  hour: number;
  status: PostStatus;
  caption: string;
  assigneeId?: string;
  imagePrompt?: string;
}

const seeds: Seed[] = [
  // Hoje
  {
    clientId: 'siara',
    title: 'Drop Inverno · Look do dia',
    platform: 'instagram',
    dayOffset: 0,
    hour: 9,
    status: 'agendado',
    caption:
      'O frio chegou e o estilo também ❄️🔥 Confira o novo drop de inverno da Siara. Link na bio!',
    assigneeId: 'eduarda',
    imagePrompt: 'Modelo com casaco de inverno, fundo urbano, tom vibrante rosa',
  },
  {
    clientId: 'nutrileve',
    title: 'Receita fit · Bowl proteico',
    platform: 'instagram',
    dayOffset: 0,
    hour: 12,
    status: 'aprovado',
    caption:
      'Almoço prático e saudável 🥗 Bowl proteico em 15 minutos. Salva esse post!',
    assigneeId: 'henrique',
  },
  {
    clientId: 'governo-moraujo',
    title: 'Mutirão de saúde · Aviso',
    platform: 'facebook',
    dayOffset: 0,
    hour: 16,
    status: 'agendado',
    caption:
      'Atenção, moraujoense! Mutirão de saúde neste sábado no Centro. Leve seu cartão do SUS.',
    assigneeId: 'pedro',
  },
  // Amanhã
  {
    clientId: 'junior-univel',
    title: 'Bastidores do campus',
    platform: 'tiktok',
    dayOffset: 1,
    hour: 10,
    status: 'producao',
    caption: 'Um dia na Univel 🎓 vem com a gente!',
    assigneeId: 'alysson',
  },
  {
    clientId: 'verso-nosso',
    title: 'Verso da semana',
    platform: 'instagram',
    dayOffset: 1,
    hour: 19,
    status: 'ideia',
    caption: 'O verso que a semana pediu...',
  },
  {
    clientId: 'siara',
    title: 'Reels · Provador',
    platform: 'instagram',
    dayOffset: 1,
    hour: 18,
    status: 'aprovado',
    caption: 'Qual look você levaria? 👗 Comenta aqui!',
    assigneeId: 'lourenco',
  },
  // +2
  {
    clientId: 'nutrileve',
    title: 'Carrossel · 5 mitos da dieta',
    platform: 'instagram',
    dayOffset: 2,
    hour: 11,
    status: 'producao',
    caption: '5 mitos sobre dieta que você precisa parar de acreditar 🚫',
    assigneeId: 'henrique',
  },
  {
    clientId: 'governo-moraujo',
    title: 'Obras · Pavimentação',
    platform: 'instagram',
    dayOffset: 2,
    hour: 15,
    status: 'agendado',
    caption: 'Mais asfalto para Moraújo 🚧 Confira as ruas contempladas.',
    assigneeId: 'pedro',
  },
  // +3
  {
    clientId: 'junior-univel',
    title: 'Depoimento de aluno',
    platform: 'instagram',
    dayOffset: 3,
    hour: 17,
    status: 'aprovado',
    caption: '"A Univel mudou minha trajetória." 💙',
    assigneeId: 'alysson',
  },
  {
    clientId: 'siara',
    title: 'Promo relâmpago',
    platform: 'instagram',
    dayOffset: 3,
    hour: 20,
    status: 'ideia',
    caption: 'Só hoje: 30% OFF em peças selecionadas 🔥',
  },
  // Passado (postado)
  {
    clientId: 'siara',
    title: 'Coleção primavera',
    platform: 'instagram',
    dayOffset: -1,
    hour: 10,
    status: 'postado',
    caption: 'Primavera chegando com tudo 🌸',
    assigneeId: 'eduarda',
  },
  {
    clientId: 'nutrileve',
    title: 'Dica de hidratação',
    platform: 'instagram',
    dayOffset: -1,
    hour: 14,
    status: 'postado',
    caption: 'Bebeu água hoje? 💧',
    assigneeId: 'eduarda',
  },
  {
    clientId: 'governo-moraujo',
    title: 'Calendário de vacinação',
    platform: 'facebook',
    dayOffset: -2,
    hour: 9,
    status: 'postado',
    caption: 'Confira o calendário de vacinação deste mês.',
    assigneeId: 'pedro',
  },
  {
    clientId: 'junior-univel',
    title: 'Inscrições abertas',
    platform: 'instagram',
    dayOffset: -2,
    hour: 11,
    status: 'postado',
    caption: 'Inscrições abertas para o próximo semestre 🎓',
    assigneeId: 'alysson',
  },
  // +4 / +5
  {
    clientId: 'verso-nosso',
    title: 'Sarau online',
    platform: 'instagram',
    dayOffset: 4,
    hour: 19,
    status: 'producao',
    caption: 'Nosso sarau volta nesta sexta 🎤',
    assigneeId: 'lourenco',
  },
  {
    clientId: 'nutrileve',
    title: 'Live com nutricionista',
    platform: 'instagram',
    dayOffset: 5,
    hour: 18,
    status: 'agendado',
    caption: 'Tire suas dúvidas ao vivo com a nutri 🩺',
    assigneeId: 'henrique',
  },
];

export const posts: Post[] = seeds.map((s) => ({
  id: id(),
  clientId: s.clientId,
  title: s.title,
  platform: s.platform,
  scheduledAt: at(s.dayOffset, s.hour),
  status: s.status,
  caption: s.caption,
  assigneeId: s.assigneeId,
  imagePrompt: s.imagePrompt,
}));
