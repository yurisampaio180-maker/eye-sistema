// ============================================================
// Tipos de domínio — Sistema EYE Agência
// ============================================================

export type ID = string;

// ---------- Equipe ----------
export type TeamRole = 'ceo' | 'videomaker' | 'designer' | 'social';

export interface TeamMember {
  id: ID;
  name: string;
  roles: TeamRole[];
  /** rótulo amigável dos papéis (ex.: "Videomaker e Designer") */
  roleLabel: string;
  avatarColor: string;
  online: boolean;
  /** atividade atual em tempo real (mock) */
  currentActivity?: string;
}

// ---------- Cliente ----------
export type ServiceType =
  | 'conteudo'
  | 'trafego'
  | 'video'
  | 'branding'
  | 'social';

export interface ClientBrand {
  primary: string;
  secondary: string;
  /** tom de voz para a IA */
  toneOfVoice: string;
  fonts: string;
  logoText: string;
}

export interface SocialProfile {
  platform: SocialPlatform;
  handle: string;
  followers: number;
  /** série de visualizações por semana (mock para gráficos) */
  weeklyViews: number[];
}

export interface Client {
  id: ID;
  name: string;
  segment: string;
  brand: ClientBrand;
  services: ServiceType[];
  profiles: SocialProfile[];
  status: ClientStatus;
  /** % de postagens da semana já entregues */
  deliveryRate: number;
  pendingTasks: number;
  activeCampaigns: number;
}

export type ClientStatus = 'em_dia' | 'atencao' | 'pendente';

export type SocialPlatform =
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'youtube'
  | 'linkedin';

// ---------- Postagens / Calendário ----------
export type PostStatus =
  | 'ideia'
  | 'producao'
  | 'aprovado'
  | 'agendado'
  | 'postado';

export interface Post {
  id: ID;
  clientId: ID;
  title: string;
  platform: SocialPlatform;
  /** ISO date-time do agendamento */
  scheduledAt: string;
  status: PostStatus;
  caption: string;
  imageUrl?: string;
  /** descrição usada para gerar a imagem por IA */
  imagePrompt?: string;
  assigneeId?: ID;
}

// ---------- Tráfego pago ----------
export type CampaignObjective =
  | 'alcance'
  | 'trafego'
  | 'conversao'
  | 'leads'
  | 'engajamento';

export interface Campaign {
  id: ID;
  clientId: ID;
  name: string;
  platform: 'meta' | 'google' | 'tiktok';
  objective: CampaignObjective;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  audience: string;
  status: 'ativa' | 'pausada' | 'encerrada';
  metrics: CampaignMetrics;
}

export interface CampaignMetrics {
  reach: number;
  clicks: number;
  conversions: number;
  cpl: number;
  cpc: number;
  roi: number;
}

// ---------- Vídeos (pipeline) ----------
export type VideoStage =
  | 'roteiro'
  | 'gravacao'
  | 'edicao'
  | 'aprovacao'
  | 'agendado';

export interface VideoTask {
  id: ID;
  clientId: ID;
  title: string;
  stage: VideoStage;
  script?: VideoScript;
  videomakerId?: ID;
  designerId?: ID;
  uploadUrl?: string;
  durationSec?: number;
  dueDate?: string;
}

export interface VideoScript {
  hook: string;
  development: string;
  cta: string;
  scenes: string[];
  estimatedDuration: string;
}

// ---------- Conteúdo gerado por IA ----------
export type GeneratedKind = 'imagem' | 'legenda' | 'roteiro';

export interface GeneratedContent {
  id: ID;
  clientId: ID;
  kind: GeneratedKind;
  prompt: string;
  output: string;
  imageUrl?: string;
  approved: boolean;
  createdAt: string;
}

// ---------- Notificações / Fila de disparo ----------
export interface DispatchItem {
  id: ID;
  postId: ID;
  clientId: ID;
  scheduledAt: string;
  caption: string;
  imageUrl?: string;
  channel: 'whatsapp' | 'email' | 'webhook';
  status: 'pendente' | 'pronto' | 'enviado';
  recipients: string[];
}

// ---------- Agenda do CEO ----------
export type Weekday =
  | 'segunda'
  | 'terca'
  | 'quarta'
  | 'quinta'
  | 'sexta'
  | 'sabado'
  | 'domingo';

export type Turno = 'manha' | 'tarde' | 'dia_todo';

export interface AgendaBlock {
  id: ID;
  weekday: Weekday;
  turno: Turno;
  clientId: ID;
  label: string;
  location: string;
  conflict?: boolean;
}
