import { mockRequest } from './http';
import { clients } from '@/data/clients';
import { team } from '@/data/team';
import { posts } from '@/data/posts';
import { campaigns } from '@/data/campaigns';
import { videos } from '@/data/videos';
import { agenda } from '@/data/agenda';
import type {
  Client,
  TeamMember,
  Post,
  Campaign,
  VideoTask,
  AgendaBlock,
  PostStatus,
  VideoStage,
} from '@/types';

// Estado em memória (mock). Em produção isso vira chamadas ao back-end.
const db = {
  clients: [...clients],
  team: [...team],
  posts: [...posts],
  campaigns: [...campaigns],
  videos: [...videos],
  agenda: [...agenda],
};

// ---------- Clientes ----------
export const clientsApi = {
  list: () => mockRequest<Client[]>(db.clients),
  get: (id: string) =>
    mockRequest<Client | undefined>(db.clients.find((c) => c.id === id)),
};

// ---------- Equipe ----------
export const teamApi = {
  list: () => mockRequest<TeamMember[]>(db.team),
};

// ---------- Postagens ----------
export const postsApi = {
  list: () => mockRequest<Post[]>(db.posts),
  byClient: (clientId: string) =>
    mockRequest<Post[]>(db.posts.filter((p) => p.clientId === clientId)),
  updateStatus: (id: string, status: PostStatus) => {
    const post = db.posts.find((p) => p.id === id);
    if (post) post.status = status;
    return mockRequest<Post | undefined>(post, 80);
  },
  reschedule: (id: string, scheduledAt: string) => {
    const post = db.posts.find((p) => p.id === id);
    if (post) post.scheduledAt = scheduledAt;
    return mockRequest<Post | undefined>(post, 80);
  },
  update: (id: string, patch: Partial<Post>) => {
    const post = db.posts.find((p) => p.id === id);
    if (post) Object.assign(post, patch);
    return mockRequest<Post | undefined>(post, 80);
  },
};

// ---------- Campanhas ----------
export const campaignsApi = {
  list: () => mockRequest<Campaign[]>(db.campaigns),
  byClient: (clientId: string) =>
    mockRequest<Campaign[]>(db.campaigns.filter((c) => c.clientId === clientId)),
};

// ---------- Vídeos ----------
export const videosApi = {
  list: () => mockRequest<VideoTask[]>(db.videos),
  updateStage: (id: string, stage: VideoStage) => {
    const v = db.videos.find((x) => x.id === id);
    if (v) v.stage = stage;
    return mockRequest<VideoTask | undefined>(v, 80);
  },
};

// ---------- Agenda do CEO ----------
export const agendaApi = {
  list: () => mockRequest<AgendaBlock[]>(db.agenda),
};
