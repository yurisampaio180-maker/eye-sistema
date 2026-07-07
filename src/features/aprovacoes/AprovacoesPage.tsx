import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Image as ImageIcon,
  Video,
  Check,
  X,
  Loader2,
  Paperclip,
  CalendarClock,
  Building2,
  Clock,
  Pencil,
} from 'lucide-react';
import { PageHeader, Card, Button, Badge, Avatar, EmptyState } from '@/components/ui';
import {
  backend,
  prioridadeInfo,
  type Solicitacao,
  type Membro,
  type TransicaoSLA,
  type PostAgenda,
} from '@/services/backend';
import { EditarEventoModal } from '@/features/agenda/EditarEventoModal';
import { cn } from '@/lib/utils';
import { fmt } from '@/lib/dates';

const API_ORIGIN = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3333/api/v1').replace('/api/v1', '');

function resolveImg(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_ORIGIN}${url}`;
}

const prioridadePeso = { urgente: 0, alta: 1, normal: 2, baixa: 3 };

type Aba = 'aprovar' | 'confirmar';

export function AprovacoesPage() {
  const [aba, setAba] = useState<Aba>('aprovar');
  const [aprovar, setAprovar] = useState<Solicitacao[]>([]);
  const [postsConfirmar, setPostsConfirmar] = useState<PostAgenda[]>([]);
  const [solicsConfirmar, setSolicsConfirmar] = useState<Solicitacao[]>([]);
  const [equipe, setEquipe] = useState<Membro[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    setLoading(true);
    try {
      const [pend, pendencias, membros] = await Promise.all([
        backend.solicitacoes.list('em_aprovacao'),
        backend.pendenciasConfirmar(),
        backend.equipe(),
      ]);
      pend.sort((a, b) => prioridadePeso[a.prioridade] - prioridadePeso[b.prioridade]);
      setAprovar(pend);
      setPostsConfirmar(pendencias.posts);
      setSolicsConfirmar(pendencias.solicitacoes);
      setEquipe(membros);
    } finally {
      setLoading(false);
    }
  }
  // recarrega a cada 12s (tempo real leve)
  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 12000);
    return () => clearInterval(t);
  }, []);

  const totalConfirmar = postsConfirmar.length + solicsConfirmar.length;
  const vazio = aba === 'aprovar' ? aprovar.length === 0 : totalConfirmar === 0;

  return (
    <div>
      <PageHeader
        icon={ShieldCheck}
        title="Aprovações do CEO"
        subtitle="Nada avança nem é postado sem o seu aval"
      />

      <div className="mb-5 flex gap-2">
        <TabBtn ativo={aba === 'aprovar'} onClick={() => setAba('aprovar')} label="Aprovar solicitações" n={aprovar.length} />
        <TabBtn ativo={aba === 'confirmar'} onClick={() => setAba('confirmar')} label="Confirmar p/ postar" n={totalConfirmar} />
      </div>

      {loading ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-eye-red" /></div>
      ) : vazio ? (
        <EmptyState>{aba === 'aprovar' ? 'Nenhuma solicitação aguardando aprovação. 🎉' : 'Nenhum post aguardando confirmação. 🎉'}</EmptyState>
      ) : aba === 'aprovar' ? (
        <div className="space-y-4">
          {aprovar.map((s) => <AprovacaoCard key={s.id} solic={s} equipe={equipe} onResolvido={carregar} />)}
        </div>
      ) : (
        <div className="space-y-4">
          {postsConfirmar.map((p) => <PostConfirmarCard key={p.id} post={p} onResolvido={carregar} />)}
          {solicsConfirmar.map((s) => <ConfirmacaoCard key={s.id} solic={s} onResolvido={carregar} />)}
        </div>
      )}
    </div>
  );
}

// Card de confirmação de POST do calendário (EventoAgenda aguardando_confirmacao)
function PostConfirmarCard({ post, onResolvido }: { post: PostAgenda; onResolvido: () => void }) {
  const [busy, setBusy] = useState(false);
  const [modo, setModo] = useState<'idle' | 'rejeitar'>('idle');
  const [motivo, setMotivo] = useState('');
  const [editando, setEditando] = useState(false);

  async function acao(fn: () => Promise<unknown>) {
    setBusy(true);
    try { await fn(); onResolvido(); } finally { setBusy(false); }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start gap-3 p-4">
        <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', post.tipo === 'evento' ? 'bg-sky-500/15 text-sky-400' : 'bg-violet-500/15 text-violet-400')}>
          {post.tipo === 'evento' ? <Video className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-bold text-cloud">{post.titulo}</h3>
          <p className="text-xs text-cloud-dim">
            <Building2 className="mr-1 inline h-3 w-3" />{post.clienteNome ?? '—'}
            {' · '}{fmt(post.dataHora, "dd/MM 'às' HH:mm")}{post.plataforma ? ` · ${post.plataforma}` : ''}
            {post.geradoPorIA === 1 ? ' · ✨ IA' : ''}
          </p>
        </div>
        <Badge className="bg-orange-500/15 text-orange-400" dot="bg-orange-400">aguardando confirmação</Badge>
      </div>
      {post.imagemUrl && (
        <div className="border-t border-ink-700/60 px-4 py-3">
          <img src={resolveImg(post.imagemUrl)} alt="" className="max-h-56 rounded-lg object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </div>
      )}
      {post.legenda && <p className="border-t border-ink-700/60 px-4 py-3 text-sm text-cloud-muted line-clamp-4 whitespace-pre-line">{post.legenda}</p>}
      <div className="border-t border-ink-700/60 bg-ink-900/40 p-4">
        {modo === 'rejeitar' ? (
          <div className="space-y-2">
            <textarea className="eye-input h-20 resize-none" placeholder="Motivo da devolução (volta para rascunho)" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
            <div className="flex gap-2">
              <Button variant="primary" className="bg-eye-red" disabled={busy || motivo.trim().length < 3} onClick={() => acao(() => backend.agenda.devolver(post.id, motivo))}>Devolver p/ ajuste</Button>
              <Button variant="ghost" onClick={() => setModo('idle')}>Cancelar</Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => acao(() => backend.agenda.confirmar(post.id))} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Confirmar
            </Button>
            <Button variant="ghost" onClick={() => setEditando(true)}><Pencil className="h-4 w-4" /> Editar</Button>
            <Button variant="ghost" onClick={() => setModo('rejeitar')}><X className="h-4 w-4" /> Rejeitar</Button>
          </div>
        )}
      </div>
      {editando && (
        <EditarEventoModal ev={post} onClose={() => setEditando(false)} onSalvo={() => { setEditando(false); onResolvido(); }} />
      )}
    </Card>
  );
}

function TabBtn({ ativo, onClick, label, n }: { ativo: boolean; onClick: () => void; label: string; n: number }) {
  return (
    <button onClick={onClick} className={cn('flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors', ativo ? 'border-eye-red bg-eye-red/10 text-cloud' : 'border-ink-700 text-cloud-muted hover:text-cloud')}>
      {label}
      {n > 0 && <span className={cn('rounded-full px-1.5 text-xs', ativo ? 'bg-eye-red text-white' : 'bg-ink-700 text-cloud-muted')}>{n}</span>}
    </button>
  );
}

function ConfirmacaoCard({ solic, onResolvido }: { solic: Solicitacao; onResolvido: () => void }) {
  const [busy, setBusy] = useState(false);
  const [modo, setModo] = useState<'idle' | 'devolver'>('idle');
  const [motivo, setMotivo] = useState('');
  const entrega = solic.anexos.find((a) => a.categoria === 'entrega');

  async function acao(fn: () => Promise<unknown>) {
    setBusy(true);
    try { await fn(); onResolvido(); } finally { setBusy(false); }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start gap-3 p-4">
        <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', solic.tipo === 'arte' ? 'bg-violet-500/15 text-violet-400' : 'bg-sky-500/15 text-sky-400')}>
          {solic.tipo === 'arte' ? <ImageIcon className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-bold text-cloud">{solic.titulo}</h3>
          <p className="text-xs text-cloud-dim"><Building2 className="mr-1 inline h-3 w-3" />{solic.clienteNome}{solic.unidadeNome ? ` · ${solic.unidadeNome}` : ''}</p>
        </div>
        <Badge className="bg-orange-500/15 text-orange-400" dot="bg-orange-400">peça pronta</Badge>
      </div>
      {entrega && (
        <div className="border-t border-ink-700/60 px-4 py-3">
          <a href={`${API_ORIGIN}${entrega.url}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-eye-red hover:underline">
            <Paperclip className="h-4 w-4" /> Ver entrega: {entrega.nomeArquivo}
          </a>
        </div>
      )}
      {/* SLA — tempo total em produção */}
      {solic.sla && solic.sla.length > 0 && (
        <div className="border-t border-ink-700/60 px-4 py-2">
          <SlaTimeline sla={solic.sla} />
        </div>
      )}
      <div className="border-t border-ink-700/60 bg-ink-900/40 p-4">
        {modo === 'devolver' ? (
          <div className="space-y-2">
            <textarea className="eye-input h-20 resize-none" placeholder="O que precisa ajustar? (volta para produção)" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
            <div className="flex gap-2">
              <Button variant="primary" className="bg-eye-red" disabled={busy || motivo.trim().length < 3} onClick={() => acao(() => backend.solicitacoes.devolver(solic.id, motivo))}>Devolver p/ ajuste</Button>
              <Button variant="ghost" onClick={() => setModo('idle')}>Cancelar</Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => acao(() => backend.solicitacoes.confirmar(solic.id))} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Confirmar
            </Button>
            <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => acao(async () => { await backend.solicitacoes.confirmar(solic.id); await backend.solicitacoes.postar(solic.id); })} disabled={busy}>
              Confirmar e postar
            </Button>
            <Button variant="ghost" onClick={() => setModo('devolver')}><X className="h-4 w-4" /> Devolver</Button>
          </div>
        )}
      </div>
    </Card>
  );
}

function AprovacaoCard({ solic, equipe, onResolvido }: { solic: Solicitacao; equipe: Membro[]; onResolvido: () => void }) {
  const [modo, setModo] = useState<'idle' | 'reprovar'>('idle');
  const [responsavelId, setResponsavelId] = useState('');
  const [prazo, setPrazo] = useState('');
  const [motivo, setMotivo] = useState('');
  const [busy, setBusy] = useState(false);
  const refs = solic.anexos.filter((a) => a.categoria === 'referencia');
  const elegiveis = equipe.filter((m) => (solic.tipo === 'video' ? m.role === 'videomaker' || m.role === 'ceo' : m.role === 'designer_governo'));

  async function aprovar() {
    setBusy(true);
    try {
      await backend.solicitacoes.aprovar(solic.id, {
        responsavelId: responsavelId || undefined,
        prazoProducao: prazo ? new Date(prazo).toISOString() : undefined,
      });
      onResolvido();
    } finally {
      setBusy(false);
    }
  }
  async function reprovar() {
    if (motivo.trim().length < 3) return;
    setBusy(true);
    try {
      await backend.solicitacoes.reprovar(solic.id, motivo);
      onResolvido();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start gap-3 p-4">
        <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', solic.tipo === 'arte' ? 'bg-violet-500/15 text-violet-400' : 'bg-sky-500/15 text-sky-400')}>
          {solic.tipo === 'arte' ? <ImageIcon className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-bold text-cloud">{solic.titulo}</h3>
            <Badge className={prioridadeInfo[solic.prioridade].badge}>{prioridadeInfo[solic.prioridade].label}</Badge>
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-cloud-dim">
            <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {solic.clienteNome}{solic.unidadeNome ? ` · ${solic.unidadeNome}` : ''}</span>
            <span>por {solic.solicitanteNome}</span>
            {solic.prazoDesejado && <span className="flex items-center gap-1"><CalendarClock className="h-3 w-3" /> prazo {fmt(solic.prazoDesejado, 'dd/MM')}</span>}
          </p>
        </div>
      </div>

      <div className="border-t border-ink-700/60 px-4 py-3">
        <p className="text-sm text-cloud-muted">{solic.descricao}</p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-cloud-dim">
          {solic.formato && <span>Formato: <span className="text-cloud-muted">{solic.formato}</span></span>}
          {solic.textosDesejados && <span>Textos: <span className="text-cloud-muted">{solic.textosDesejados}</span></span>}
          {solic.tipoVideo && <span>Vídeo: <span className="text-cloud-muted">{solic.tipoVideo}</span></span>}
          {solic.localGravacao && <span>Local: <span className="text-cloud-muted">{solic.localGravacao}</span></span>}
          {solic.roteiroNecessario && <Badge className="bg-eye-red/15 text-eye-red">precisa roteiro</Badge>}
        </div>
        {refs.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {refs.map((a) => (
              <a key={a.id} href={`${API_ORIGIN}${a.url}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-lg border border-ink-700 px-2 py-1 text-xs text-cloud-muted hover:text-cloud">
                <Paperclip className="h-3 w-3" /> {a.nomeArquivo}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* ações */}
      <div className="border-t border-ink-700/60 bg-ink-900/40 p-4">
        {modo === 'reprovar' ? (
          <div className="space-y-2">
            <textarea className="eye-input h-20 resize-none" placeholder="Motivo da reprovação (obrigatório) — volta ao cliente" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
            <div className="flex gap-2">
              <Button variant="primary" className="bg-eye-red" onClick={reprovar} disabled={busy || motivo.trim().length < 3}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />} Confirmar reprovação
              </Button>
              <Button variant="ghost" onClick={() => setModo('idle')}>Cancelar</Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="eye-label mb-1 flex items-center gap-1">Atribuir a {elegiveis.length > 0 && <Avatar name={elegiveis[0].nome} color={elegiveis[0].avatarColor} size="sm" />}</label>
              <select className="eye-input w-auto py-1.5" value={responsavelId} onChange={(e) => setResponsavelId(e.target.value)}>
                <option value="">— opcional —</option>
                {elegiveis.map((m) => <option key={m.id} value={m.id}>{m.nome} ({m.role})</option>)}
              </select>
            </div>
            <div>
              <label className="eye-label mb-1 block">Prazo de produção</label>
              <input type="date" className="eye-input w-auto py-1.5" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
            </div>
            <div className="ml-auto flex gap-2">
              <Button variant="ghost" onClick={() => setModo('reprovar')}><X className="h-4 w-4" /> Reprovar</Button>
              <Button onClick={aprovar} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Aprovar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h < 24) return `${h}h${m > 0 ? `${m}min` : ''}`;
  const d = Math.floor(h / 24);
  const hr = h % 24;
  return `${d}d${hr > 0 ? `${hr}h` : ''}`;
}

function SlaTimeline({ sla }: { sla: TransicaoSLA[] }) {
  const total = sla.reduce((acc, t) => acc + t.duracaoMinutos, 0);
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-cloud-dim">
        <Clock className="h-3 w-3" /> SLA · Total: {formatMinutes(total)}
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {sla.map((t) => (
          <span key={t.id} className={cn('flex items-center gap-1 text-xs', t.emAndamento ? 'text-amber-400' : 'text-cloud-dim')}>
            <span className={cn('h-1.5 w-1.5 rounded-full', t.emAndamento ? 'bg-amber-400' : 'bg-ink-600')} />
            {t.status.replace(/_/g, ' ')}: <span className="font-medium text-cloud">{formatMinutes(t.duracaoMinutos)}</span>
            {t.responsavelNome && <span className="text-cloud-dim">({t.responsavelNome})</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
