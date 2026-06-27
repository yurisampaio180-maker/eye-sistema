import type { VideoTask } from '@/types';

export const videos: VideoTask[] = [
  {
    id: 'vid-1',
    clientId: 'siara',
    title: 'Reels · Bastidores do drop de inverno',
    stage: 'gravacao',
    videomakerId: 'pedro',
    designerId: 'lourenco',
    durationSec: 30,
    dueDate: 'amanhã',
    script: {
      hook: 'Você não vai acreditar no que chegou na Siara...',
      development:
        'Mostrar peças do novo drop sendo desembaladas, provador, detalhes de tecido.',
      cta: 'Corre pra loja ou clica no link da bio!',
      scenes: [
        'Plano fechado nas caixas chegando',
        'Modelo experimentando 3 looks',
        'Detalhe de etiqueta e tecido',
        'Selfie final com CTA na tela',
      ],
      estimatedDuration: '30s',
    },
  },
  {
    id: 'vid-2',
    clientId: 'nutrileve',
    title: 'Receita · Bowl proteico em 15min',
    stage: 'edicao',
    videomakerId: 'alysson',
    designerId: 'alysson',
    durationSec: 45,
    script: {
      hook: 'Almoço saudável em 15 minutos? Bora!',
      development: 'Passo a passo do preparo, ingredientes na bancada, montagem do bowl.',
      cta: 'Salva esse vídeo e marca quem precisa comer melhor!',
      scenes: ['Ingredientes', 'Preparo acelerado', 'Montagem', 'Prato final'],
      estimatedDuration: '45s',
    },
  },
  {
    id: 'vid-3',
    clientId: 'governo-moraujo',
    title: 'Institucional · Obras de pavimentação',
    stage: 'aprovacao',
    videomakerId: 'pedro',
    designerId: 'henrique',
    durationSec: 60,
    script: {
      hook: 'Moraújo está mudando.',
      development: 'Imagens das obras, entrevista rápida com morador, antes e depois.',
      cta: 'Acompanhe as obras no perfil oficial da Prefeitura.',
      scenes: ['Drone das ruas', 'Máquinas trabalhando', 'Depoimento morador', 'Logo final'],
      estimatedDuration: '60s',
    },
  },
  {
    id: 'vid-4',
    clientId: 'junior-univel',
    title: 'Depoimento de aluno · Univel',
    stage: 'roteiro',
    videomakerId: 'alysson',
    script: {
      hook: '"A Univel mudou minha vida."',
      development: 'Aluno conta a trajetória, imagens do campus, conquistas.',
      cta: 'Inscrições abertas — sua vez de transformar o futuro.',
      scenes: ['Aluno falando', 'B-roll campus', 'Conquista/formatura', 'CTA'],
      estimatedDuration: '40s',
    },
  },
  {
    id: 'vid-5',
    clientId: 'siara',
    title: 'TikTok · Trend provador',
    stage: 'agendado',
    videomakerId: 'pedro',
    designerId: 'lourenco',
    durationSec: 20,
    script: {
      hook: 'POV: você entrou na Siara só pra olhar...',
      development: 'Transições rápidas de looks ao som de trend.',
      cta: 'Qual look você levaria? Comenta!',
      scenes: ['Look 1', 'Transição', 'Look 2', 'Look 3 + CTA'],
      estimatedDuration: '20s',
    },
  },
  {
    id: 'vid-6',
    clientId: 'nutrileve',
    title: 'Live teaser · Nutricionista',
    stage: 'roteiro',
    designerId: 'henrique',
    script: {
      hook: 'Tem live nova chegando!',
      development: 'Convite para a live com a nutricionista, temas que serão abordados.',
      cta: 'Ative o lembrete e não perca!',
      scenes: ['Apresentação', 'Temas', 'Data e hora', 'CTA lembrete'],
      estimatedDuration: '25s',
    },
  },
];

export const videosByClient = (clientId: string) =>
  videos.filter((v) => v.clientId === clientId);
