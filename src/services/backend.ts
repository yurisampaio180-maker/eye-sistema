import { api } from './apiClient';

// ---------- Tipos do domínio (espelham o backend) ----------
export type SolicTipo = 'arte' | 'video';
export type Prioridade = 'baixa' | 'normal' | 'alta' | 'urgente';
export type SolicStatus =
  | 'rascunho' | 'enviada' | 'em_aprovacao' | 'aprovada' | 'reprovada'
  | 'em_producao' | 'em_revisao' | 'aguardando_confirmacao' | 'confirmada'
  | 'agendada' | 'postada' | 'cancelada';

export type TipoCobertura = 'reels' | 'reels_fotos' | 'reels_fotos_stories';

export interface Anexo {
  id: string;
  categoria: 'referencia' | 'entrega';
  nomeArquivo: string;
  url: string;
  mime: string;
}

export interface HistoricoItem {
  id: string;
  acao: string;
  de: string | null;
  para: string | null;
  detalhe: string | null;
  autorNome: string | null;
  createdAt: string;
}

export interface TarefaResumo {
  id: string;
  statusProducao: string;
  responsavelId: string | null;
  promptSugerido: string | null;
  legendaSugerida: string | null;
  entregaUrl: string | null;
}

export interface Solicitacao {
  id: string;
  clienteId: string;
  unidadeId: string | null;
  solicitanteId: string;
  tipo: SolicTipo;
  titulo: string;
  descricao: string;
  prioridade: Prioridade;
  prazoDesejado: string | null;
  status: SolicStatus;
  formato: string | null;
  textosDesejados: string | null;
  informacoes: string | null;
  tipoVideo: string | null;
  localGravacao: string | null;
  dataEvento: string | null;
  precisaEquipeNoLocal: boolean;
  roteiroNecessario: boolean;
  horaEvento: string | null;
  tipoCobertura: TipoCobertura | null;
  coberturaReels: boolean;
  coberturaFotos: boolean;
  coberturaStories: boolean;
  tipoReels: string | null;
  motivoReprovacao: string | null;
  createdAt: string;
  updatedAt: string;
  clienteNome?: string;
  unidadeNome?: string | null;
  solicitanteNome?: string;
  anexos: Anexo[];
  historico: HistoricoItem[];
  tarefa: TarefaResumo | null;
  sla?: TransicaoSLA[];
}

export interface NovaSolicitacao {
  tipo: SolicTipo;
  titulo: string;
  clienteId?: string;
  descricao?: string;
  prioridade?: Prioridade;
  prazoDesejado?: string;
  unidadeId?: string;
  formato?: string;
  textosDesejados?: string;
  informacoes?: string;
  tipoVideo?: string;
  localGravacao?: string;
  dataEvento?: string;
  horaEvento?: string;
  tipoCobertura?: TipoCobertura;
  coberturaReels?: boolean;
  coberturaFotos?: boolean;
  coberturaStories?: boolean;
  tipoReels?: 'informativo' | 'evento';
  precisaEquipeNoLocal?: boolean;
  roteiroNecessario?: boolean;
  enviarAgora?: boolean;
}

export interface Tarefa {
  id: string;
  solicitacaoId: string;
  tipo: SolicTipo;
  titulo: string;
  statusProducao: string;
  responsavelId: string | null;
  responsavelNome: string | null;
  responsavelCor: string | null;
  clienteNome: string | null;
  solicitacaoStatus: string;
  entregaUrl: string | null;
  videoLink: string | null;
  videoLinkTipo: string | null;
  promptSugerido: string | null;
  legendaSugerida: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Membro {
  id: string;
  nome: string;
  role: string;
  avatarColor: string;
}

export interface ClienteAsset {
  id: string;
  clienteId: string;
  tipo: 'logo' | 'referencia';
  url: string;
  nome: string | null;
  createdAt: string;
}

export type PostStatus = 'rascunho' | 'aguardando_confirmacao' | 'confirmado' | 'postado' | 'agendado';

export interface TransicaoSLA {
  id: string;
  status: string;
  responsavelId: string | null;
  responsavelNome: string | null;
  iniciadoEm: string;
  finalizadoEm: string | null;
  duracaoMinutos: number;
  emAndamento: boolean;
}

export interface PostAgenda {
  id: string;
  clienteId: string;
  solicitacaoId: string | null;
  titulo: string;
  dataHora: string;
  plataforma: string | null;
  tipo: string;
  status: PostStatus;
  legenda: string;
  imagemUrl: string | null;
  hashtags: string;
  criadoPorNome: string | null;
  postarPorNome: string | null;
  clienteNome: string | null;
  responsavelId: string | null;
  responsavelNome: string | null;
  localEvento: string | null;
  atrasado: boolean;
  geradoPorIA?: number;
  roteiro?: string | null;
  justificativa?: string | null;
  formato?: string | null;
  objetivo?: string | null;
}

export interface NovoPost {
  clienteId: string;
  titulo: string;
  dataHora: string;
  plataforma?: string;
  legenda?: string;
  imagemUrl?: string;
  hashtags?: string;
}

export const postStatusInfo: Record<PostStatus | 'atrasado', { label: string; badge: string; dot: string }> = {
  rascunho: { label: 'Rascunho', badge: 'bg-ink-700 text-cloud-muted', dot: 'bg-cloud-dim' },
  aguardando_confirmacao: { label: 'Aguardando CEO', badge: 'bg-amber-500/15 text-amber-400', dot: 'bg-amber-400' },
  confirmado: { label: 'Confirmado', badge: 'bg-emerald-500/15 text-emerald-400', dot: 'bg-emerald-400' },
  agendado: { label: 'Agendado', badge: 'bg-sky-500/15 text-sky-400', dot: 'bg-sky-400' },
  postado: { label: 'Postado', badge: 'bg-emerald-500/15 text-emerald-400', dot: 'bg-emerald-400' },
  atrasado: { label: 'Atrasado', badge: 'bg-eye-red/15 text-eye-red', dot: 'bg-eye-red' },
};

export const POST_STATUS_FALLBACK = { label: 'Indefinido', badge: 'bg-ink-700 text-cloud-dim', dot: 'bg-cloud-dim' };
export function safePostStatus(status?: string, atrasado?: boolean) {
  const key = atrasado && status !== 'postado' ? 'atrasado' : (status ?? '');
  return postStatusInfo[key as PostStatus | 'atrasado'] ?? POST_STATUS_FALLBACK;
}

export interface Unidade {
  id: string;
  nome: string;
}

export interface Stats {
  pendentesAprovacao: number;
  porCliente: { cliente: string; total: number; pendentes: number }[];
  producao: { coluna: string; total: number }[];
  porStatus: { status: string; total: number }[];
}

// ---------- Funções ----------
export const backend = {
  solicitacoes: {
    list: (status?: string) =>
      api.get<Solicitacao[]>(`/solicitacoes${status ? `?status=${status}` : ''}`),
    get: (id: string) => api.get<Solicitacao>(`/solicitacoes/${id}`),
    create: (body: NovaSolicitacao) => api.post<Solicitacao>('/solicitacoes', body),
    update: (id: string, body: Partial<NovaSolicitacao>) => api.patch<Solicitacao>(`/solicitacoes/${id}`, body),
    delete: (id: string) => api.delete<Solicitacao>(`/solicitacoes/${id}`),
    lembreteWhatsApp: (id: string) => api.post<{ enviado: boolean }>(`/solicitacoes/${id}/lembrete-whatsapp`),
    enviar: (id: string) => api.post<Solicitacao>(`/solicitacoes/${id}/enviar`),
    reenviar: (id: string) => api.post<Solicitacao>(`/solicitacoes/${id}/reenviar`),
    cancelar: (id: string) => api.post<Solicitacao>(`/solicitacoes/${id}/cancelar`),
    aprovar: (id: string, body: { responsavelId?: string; prazoProducao?: string }) =>
      api.post<Solicitacao>(`/solicitacoes/${id}/aprovar`, body),
    reprovar: (id: string, motivo: string) =>
      api.post<Solicitacao>(`/solicitacoes/${id}/reprovar`, { motivo }),
    confirmar: (id: string) => api.post<Solicitacao>(`/solicitacoes/${id}/confirmar`),
    devolver: (id: string, motivo: string) => api.post<Solicitacao>(`/solicitacoes/${id}/devolver`, { motivo }),
    postar: (id: string) => api.post<Solicitacao>(`/solicitacoes/${id}/postar`),
    anexos: (id: string, form: FormData) => api.upload<{ anexos: Anexo[] }>(`/solicitacoes/${id}/anexos`, form),
  },
  tarefas: {
    list: () => api.get<Tarefa[]>('/tarefas'),
    mover: (id: string, statusProducao: string) =>
      api.patch<Tarefa>(`/tarefas/${id}`, { statusProducao }),
    atribuir: (id: string, responsavelId: string) =>
      api.patch<Tarefa>(`/tarefas/${id}`, { responsavelId }),
    entrega: (id: string, form: FormData) => api.upload<Tarefa>(`/tarefas/${id}/entrega`, form),
    entregaLink: (id: string, videoLink: string) =>
      api.post<Tarefa>(`/tarefas/${id}/entrega-link`, { videoLink }),
  },
  agenda: {
    list: (clienteId?: string) => api.get<PostAgenda[]>(`/agenda${clienteId ? `?clienteId=${clienteId}` : ''}`),
    pendentes: (clienteId?: string) => api.get<PostAgenda[]>(`/agenda/pendentes${clienteId ? `?clienteId=${clienteId}` : ''}`),
    criar: (body: NovoPost) => api.post<PostAgenda>('/agenda', body),
    editar: (id: string, body: Partial<NovoPost & { titulo: string; legenda: string; hashtags: string; responsavelId: string | null; localEvento: string | null }>) => api.patch<PostAgenda>(`/agenda/${id}`, body),
    excluir: (id: string) => api.delete(`/agenda/${id}`),
    confirmar: (id: string) => api.post<PostAgenda>(`/agenda/${id}/confirmar`),
    devolver: (id: string, motivo: string) => api.post<PostAgenda>(`/agenda/${id}/devolver`, { motivo }),
    postar: (id: string) => api.post<PostAgenda>(`/agenda/${id}/postar`),
    regenerarImagem: (id: string) => api.post<PostAgenda>(`/agenda/${id}/regenerar-imagem`),
  },
  ia: {
    gerarImagem: (form: FormData) =>
      api.upload<{ imagemUrl: string; modeloUsado: string; geradoEm: string }>('/ia/gerar-imagem', form),
  },
  instagram: {
    url: (clienteId: string) =>
      api.get<{ url: string }>(`/instagram/url/${clienteId}`),
    metricas: (clienteId: string) =>
      api.get<InstagramStatus>(`/instagram/metricas/${clienteId}`),
    metricasTodos: () =>
      api.get<InstagramStatusCliente[]>('/instagram/metricas'),
    sincronizar: (clienteId: string) =>
      api.post<InstagramStatus>(`/instagram/sincronizar/${clienteId}`),
  },
  equipe: () => api.get<Membro[]>('/equipe'),
  assets: {
    list: (clienteId: string) => api.get<ClienteAsset[]>(`/clientes/${clienteId}/assets`),
    upload: (clienteId: string, form: FormData) => api.upload<ClienteAsset>(`/clientes/${clienteId}/assets`, form),
    remover: (clienteId: string, assetId: string) => api.delete(`/clientes/${clienteId}/assets/${assetId}`),
  },
  clientes: () => api.get<{ id: string; nome: string; corPrimaria: string }[]>('/clientes'),
  unidades: (clienteId: string) => api.get<Unidade[]>(`/clientes/${clienteId}/unidades`),
  stats: () => api.get<Stats>('/stats'),
  notificacoes: {
    list: () => api.get<Notificacao[]>('/notificacoes'),
    lida: (id: string) => api.post<{ ok: boolean }>(`/notificacoes/${id}/lida`),
  },
  usuarios: {
    list: () => api.get<UsuarioAdmin[]>('/users'),
    create: (body: NovoUsuario) => api.post<{ id: string }>('/users', body),
    toggle: (id: string, ativo: boolean) => api.patch<{ ok: boolean }>(`/users/${id}`, { ativo }),
  },
  motor: {
    gerar: (clienteId: string, mes?: string) =>
      api.post<{ geracaoId: string; mensagem: string }>(
        `/motor/gerar/${clienteId}${mes ? `?mes=${mes}` : ''}`,
      ),
    status: (geracaoId: string) =>
      api.get<GeracaoMarketing>(`/motor/status/${geracaoId}`),
    historico: (clienteId: string) =>
      api.get<GeracaoMarketing[]>(`/motor/historico/${clienteId}`),
    ativas: () => api.get<GeracaoMarketing[]>('/motor/ativas'),
  },
  trocarSenha: (senhaAtual: string, novaSenha: string) =>
    api.post<{ ok: boolean }>('/auth/change-password', { senhaAtual, novaSenha }),
};

export interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  solicitacaoId: string | null;
  lida: boolean | number;
  createdAt: string;
}

export interface UsuarioAdmin {
  id: string;
  nome: string;
  email: string;
  role: string;
  clienteNome: string | null;
  unidadeNome: string | null;
  ativo: number;
  mustChangePassword: number;
}

export interface InstagramMetrica {
  seguidores: number;
  seguindo: number;
  totalPosts: number;
  alcanceSemana: number | null;
  impressoesSem: number | null;
  visitasPerfil: number | null;
  coletadoEm: string;
}

export interface InstagramStatus {
  conectado: boolean;
  username: string | null;
  tokenExpiraEm: string | null;
  ultimaSincEm: string | null;
  metrica: InstagramMetrica | null;
}

export interface InstagramStatusCliente extends InstagramStatus {
  clienteId: string;
}

export type GeracaoStatus = 'processando' | 'concluido' | 'erro';

export interface GeracaoMarketing {
  id: string;
  clienteId: string;
  mes: string;
  status: GeracaoStatus;
  totalItens: number;
  itensGerados: number;
  erros: number;
  iniciadoEm: string;
  concluidoEm: string | null;
}

export interface NovoUsuario {
  nome: string;
  email: string;
  role: string;
  senhaProvisoria: string;
  clienteId?: string;
  unidadeId?: string;
  gestorCliente?: boolean;
}

// ---------- Config visual de status ----------
export const solicStatusInfo: Record<SolicStatus, { label: string; badge: string; dot: string }> = {
  rascunho: { label: 'Rascunho', badge: 'bg-ink-700 text-cloud-muted', dot: 'bg-cloud-dim' },
  enviada: { label: 'Enviada', badge: 'bg-sky-500/15 text-sky-400', dot: 'bg-sky-400' },
  em_aprovacao: { label: 'Em aprovação', badge: 'bg-amber-500/15 text-amber-400', dot: 'bg-amber-400' },
  aprovada: { label: 'Aprovada', badge: 'bg-emerald-500/15 text-emerald-400', dot: 'bg-emerald-400' },
  reprovada: { label: 'Reprovada', badge: 'bg-eye-red/15 text-eye-red', dot: 'bg-eye-red' },
  em_producao: { label: 'Em produção', badge: 'bg-violet-500/15 text-violet-400', dot: 'bg-violet-400' },
  em_revisao: { label: 'Em revisão', badge: 'bg-blue-500/15 text-blue-400', dot: 'bg-blue-400' },
  aguardando_confirmacao: { label: 'Aguardando sua confirmação', badge: 'bg-orange-500/15 text-orange-400', dot: 'bg-orange-400' },
  confirmada: { label: 'Confirmada', badge: 'bg-teal-500/15 text-teal-400', dot: 'bg-teal-400' },
  agendada: { label: 'Agendada', badge: 'bg-amber-500/15 text-amber-400', dot: 'bg-amber-400' },
  postada: { label: 'Postada', badge: 'bg-emerald-500/15 text-emerald-400', dot: 'bg-emerald-400' },
  cancelada: { label: 'Cancelada', badge: 'bg-ink-700 text-cloud-dim', dot: 'bg-cloud-dim' },
};

export const prioridadeInfo: Record<Prioridade, { label: string; badge: string }> = {
  baixa: { label: 'Baixa', badge: 'bg-ink-700 text-cloud-muted' },
  normal: { label: 'Normal', badge: 'bg-sky-500/15 text-sky-400' },
  alta: { label: 'Alta', badge: 'bg-amber-500/15 text-amber-400' },
  urgente: { label: 'Urgente', badge: 'bg-eye-red/15 text-eye-red' },
};
