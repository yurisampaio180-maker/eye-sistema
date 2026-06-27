import type {
  ClientStatus,
  PostStatus,
  VideoStage,
  SocialPlatform,
} from '@/types';

interface StatusConfig {
  label: string;
  /** classes tailwind para badge */
  badge: string;
  dot: string;
}

export const clientStatusConfig: Record<ClientStatus, StatusConfig> = {
  em_dia: {
    label: 'Em dia',
    badge: 'bg-emerald-500/15 text-emerald-400',
    dot: 'bg-emerald-400',
  },
  atencao: {
    label: 'Atenção',
    badge: 'bg-amber-500/15 text-amber-400',
    dot: 'bg-amber-400',
  },
  pendente: {
    label: 'Pendente',
    badge: 'bg-eye-red/15 text-eye-red',
    dot: 'bg-eye-red',
  },
};

export const postStatusConfig: Record<PostStatus, StatusConfig> = {
  ideia: {
    label: 'Ideia',
    badge: 'bg-ink-700 text-cloud-muted',
    dot: 'bg-cloud-dim',
  },
  producao: {
    label: 'Em produção',
    badge: 'bg-sky-500/15 text-sky-400',
    dot: 'bg-sky-400',
  },
  aprovado: {
    label: 'Aprovado',
    badge: 'bg-violet-500/15 text-violet-400',
    dot: 'bg-violet-400',
  },
  agendado: {
    label: 'Agendado',
    badge: 'bg-amber-500/15 text-amber-400',
    dot: 'bg-amber-400',
  },
  postado: {
    label: 'Postado',
    badge: 'bg-emerald-500/15 text-emerald-400',
    dot: 'bg-emerald-400',
  },
};

export const postStatusOrder: PostStatus[] = [
  'ideia',
  'producao',
  'aprovado',
  'agendado',
  'postado',
];

export const videoStageConfig: Record<VideoStage, StatusConfig> = {
  roteiro: {
    label: 'Roteiro',
    badge: 'bg-ink-700 text-cloud-muted',
    dot: 'bg-cloud-dim',
  },
  gravacao: {
    label: 'Gravação',
    badge: 'bg-sky-500/15 text-sky-400',
    dot: 'bg-sky-400',
  },
  edicao: {
    label: 'Edição',
    badge: 'bg-violet-500/15 text-violet-400',
    dot: 'bg-violet-400',
  },
  aprovacao: {
    label: 'Aprovação',
    badge: 'bg-amber-500/15 text-amber-400',
    dot: 'bg-amber-400',
  },
  agendado: {
    label: 'Agendado',
    badge: 'bg-emerald-500/15 text-emerald-400',
    dot: 'bg-emerald-400',
  },
};

export const videoStageOrder: VideoStage[] = [
  'roteiro',
  'gravacao',
  'edicao',
  'aprovacao',
  'agendado',
];

export const platformLabel: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
};
