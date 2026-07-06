import { useEffect, useState } from 'react';
import { CalendarDays, Loader2, Plus, Video, Clock, MapPin, Building2, CalendarClock, X, MessageCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { PageHeader, Card, Button, Badge, EmptyState } from '@/components/ui';
import { backend, postStatusInfo, solicStatusInfo, type Solicitacao, type PostAgenda } from '@/services/backend';
import { useAuth } from '@/stores/auth';
import { cn } from '@/lib/utils';
import { fmt, time } from '@/lib/dates';

export function AgendaFilmagensPage() {
  const user = useAuth((s) => s.user);
  const [solics, setSolics] = useState<Solicitacao[] | null>(null);
  const [posts, setPosts] = useState<PostAgenda[]>([]);
  const [equipe, setEquipe] = useState<{ id: string; nome: string; role: string }[]>([]);
  const [criando, setCriando] = useState(false);

  async function carregar() {
    try {
      const [s, p, e] = await Promise.all([backend.solicitacoes.list(), backend.agenda.list(), backend.equipe()]);
      setSolics(s);
      setPosts(p);
      setEquipe(e);
    } catch { setSolics([]); }
  }
  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 12000);
    return () => clearInterval(t);
  }, []);

  const filmagens = (solics ?? []).filter(
    (s) => s.tipo === 'video' && !['cancelada', 'rascunho'].includes(s.status),
  );
  const aguardando = posts.filter((p) => p.status === 'aguardando_confirmacao');
  const confirmados = posts.filter((p) => p.status === 'confirmado');

  return (
    <div>
      <PageHeader
        icon={CalendarDays}
        title="Agenda de Filmagens e Postagens"
        subtitle="Gravações agendadas e posts a confirmar/agendar"
        actions={<Button onClick={() => setCriando(true)}><Plus className="h-4 w-4" /> Nova gravação</Button>}
      />

      {solics === null ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-eye-red" /></div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Filmagens agendadas */}
          <Card className="p-4 lg:col-span-2">
            <h2 className="mb-3 flex items-center gap-2 font-display font-bold text-cloud">
              <Video className="h-4 w-4 text-eye-red" /> Filmagens agendadas
            </h2>
            {filmagens.length === 0 ? (
              <EmptyState>Nenhuma filmagem agendada ainda.</EmptyState>
            ) : (
              <div className="space-y-2">
                {filmagens.map((s) => (
                  <FilmagemCard
                    key={s.id}
                    solic={s}
                    userId={user?.id}
                    userRole={user?.role}
                    onAtualizar={carregar}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Posts */}
          <div className="space-y-5">
            <Card className="p-4">
              <h2 className="mb-3 flex items-center gap-2 font-display font-bold text-cloud">
                <CalendarClock className="h-4 w-4 text-amber-400" /> Aguardando o CEO
              </h2>
              {aguardando.length === 0 ? (
                <EmptyState>Nada aguardando confirmação.</EmptyState>
              ) : (
                <div className="space-y-2">
                  {aguardando.map((p) => <PostMini key={p.id} p={p} />)}
                </div>
              )}
            </Card>
            <Card className="p-4">
              <h2 className="mb-3 flex items-center gap-2 font-display font-bold text-cloud">
                <CalendarDays className="h-4 w-4 text-emerald-400" /> Confirmados p/ postar
              </h2>
              {confirmados.length === 0 ? (
                <EmptyState>Nenhum post confirmado.</EmptyState>
              ) : (
                <div className="space-y-2">
                  {confirmados.map((p) => (
                    <PostMini key={p.id} p={p} acao={() => backend.agenda.postar(p.id).then(carregar)} />
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {criando && (
        <NovaGravacaoModal
          equipe={equipe.filter((e) => e.role === 'videomaker' || e.role === 'ceo')}
          onClose={() => setCriando(false)}
          onCriado={() => { setCriando(false); carregar(); }}
        />
      )}
    </div>
  );
}

// ─── Card individual de filmagem ─────────────────────────────────────────────

function FilmagemCard({
  solic,
  userId,
  userRole,
  onAtualizar,
}: {
  solic: Solicitacao;
  userId?: string;
  userRole?: string;
  onAtualizar: () => void;
}) {
  const [lembrando, setLembrando] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [excluindo, setExcluindo] = useState(false);

  const ehMinha = solic.solicitanteId === userId;
  const podeExcluir = ehMinha && !['postada', 'cancelada'].includes(solic.status);
  const st = solicStatusInfo[solic.status as keyof typeof solicStatusInfo];

  async function lembrar() {
    setLembrando('loading');
    try {
      const res = await backend.solicitacoes.lembreteWhatsApp(solic.id);
      setLembrando(res.enviado ? 'ok' : 'err');
    } catch {
      setLembrando('err');
    } finally {
      setTimeout(() => setLembrando('idle'), 3000);
    }
  }

  async function excluir() {
    if (!confirm(`Excluir "${solic.titulo}"? A solicitação será cancelada.`)) return;
    setExcluindo(true);
    try {
      await backend.solicitacoes.delete(solic.id);
      onAtualizar();
    } catch (e: any) {
      alert(e?.message ?? 'Erro ao excluir.');
      setExcluindo(false);
    }
  }

  return (
    <div className="rounded-xl border border-ink-700/50 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-cloud">{solic.titulo}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-cloud-dim">
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {solic.clienteNome}{solic.unidadeNome ? ` · ${solic.unidadeNome}` : ''}
            </span>
            {solic.dataEvento && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {fmt(solic.dataEvento, 'dd/MM')} {solic.horaEvento ?? ''}
              </span>
            )}
            {solic.localGravacao && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {solic.localGravacao}
              </span>
            )}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Badge className="bg-sky-500/15 text-sky-400">
            {solic.tipoCobertura
              ? solic.tipoCobertura.replace(/_/g, ' + ')
              : (solic.tipoVideo ?? 'vídeo')}
          </Badge>
          {st && <Badge className={st.badge} dot={st.dot}>{st.label}</Badge>}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <button
          onClick={lembrar}
          disabled={lembrando === 'loading'}
          className={cn(
            'flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
            lembrando === 'ok'
              ? 'bg-emerald-600/20 text-emerald-400'
              : lembrando === 'err'
                ? 'bg-eye-red/10 text-eye-red'
                : 'bg-ink-700 text-cloud-muted hover:bg-ink-600 hover:text-cloud',
          )}
          title="Enviar lembrete WhatsApp para o CEO"
        >
          {lembrando === 'ok' ? (
            <><CheckCircle2 className="h-3 w-3" /> Enviado!</>
          ) : lembrando === 'err' ? (
            <>📵 Falhou</>
          ) : (
            <><MessageCircle className={cn('h-3 w-3', lembrando === 'loading' && 'animate-pulse')} /> Lembrar CEO</>
          )}
        </button>

        {podeExcluir && (
          <button
            onClick={excluir}
            disabled={excluindo}
            className="flex items-center gap-1 rounded-lg bg-eye-red/10 px-2.5 py-1.5 text-xs font-medium text-eye-red hover:bg-eye-red/20 disabled:opacity-50"
            title="Cancelar solicitação"
          >
            {excluindo ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Post mini ───────────────────────────────────────────────────────────────

function PostMini({ p, acao }: { p: PostAgenda; acao?: () => void }) {
  const st = postStatusInfo[p.status];
  return (
    <div className="flex items-center gap-2 rounded-lg border border-ink-700/50 p-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-cloud">{p.titulo}</p>
        <p className="text-xs text-cloud-dim">{p.clienteNome} · {fmt(p.dataHora, 'dd/MM')} {time(p.dataHora)}</p>
      </div>
      {acao
        ? <Button className="bg-sky-600 py-1 hover:bg-sky-700" onClick={acao}>Postar</Button>
        : <Badge className={st.badge} dot={st.dot}>{st.label}</Badge>}
    </div>
  );
}

// ─── Modal nova gravação ──────────────────────────────────────────────────────

function NovaGravacaoModal({
  equipe,
  onClose,
  onCriado,
}: {
  equipe: { id: string; nome: string }[];
  onClose: () => void;
  onCriado: () => void;
}) {
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([]);
  const [clienteId, setClienteId] = useState('governo-moraujo');
  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [local, setLocal] = useState('');
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => { backend.clientes().then(setClientes).catch(() => {}); }, []);

  async function criar() {
    setErro('');
    if (!titulo.trim() || !data || !hora) return setErro('Preencha título, data e hora.');
    setBusy(true);
    try {
      await backend.solicitacoes.create({
        tipo: 'video',
        titulo,
        clienteId,
        descricao: `Gravação solicitada pela Social. Local: ${local}`,
        tipoVideo: 'cobertura',
        localGravacao: local,
        dataEvento: new Date(`${data}T${hora}`).toISOString(),
        horaEvento: hora,
        tipoCobertura: 'reels',
        coberturaReels: true,
        enviarAgora: true,
      });
      onCriado();
    } catch (e: any) {
      setErro(e?.message ?? 'Erro ao criar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-ink-700 bg-ink-850 sm:max-w-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-700/60 p-4">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold text-cloud">
            <Video className="h-5 w-5 text-eye-red" /> Nova solicitação de gravação
          </h3>
          <button onClick={onClose} className="text-cloud-dim hover:text-cloud"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3 p-4">
          {erro && (
            <p className="rounded-lg border border-eye-red/30 bg-eye-red/5 p-2 text-xs text-eye-red">{erro}</p>
          )}
          <div>
            <label className="eye-label mb-1 block">Cliente</label>
            <select className="eye-input" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="eye-label mb-1 block">Título</label>
            <input
              className="eye-input"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Cobertura do evento X"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="eye-label mb-1 block">Data <span className="text-eye-red">*</span></label>
              <input type="date" className="eye-input" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
            <div>
              <label className="eye-label mb-1 block">Hora <span className="text-eye-red">*</span></label>
              <input type="time" className="eye-input" value={hora} onChange={(e) => setHora(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="eye-label mb-1 block">Local</label>
            <input
              className="eye-input"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              placeholder="Ex.: Praça Central"
            />
          </div>
          <p className="text-xs text-cloud-dim">
            Entra direto na agenda do CEO + lembrete disponível após criar.
          </p>
          <Button className="w-full" onClick={criar} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Enviar para o CEO
          </Button>
        </div>
      </div>
    </div>
  );
}
