import { useEffect, useMemo, useState } from 'react';
import { Plus, Loader2, Check, X, Clock, Send, CalendarPlus } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { backend, postStatusInfo, type PostAgenda } from '@/services/backend';
import { useAuth } from '@/stores/auth';
import { cn } from '@/lib/utils';
import { monthMatrix, fmt, time, isSameDay, dayMonth } from '@/lib/dates';

const API_ORIGIN = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3333/api/v1').replace('/api/v1', '');
function resolveImgUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_ORIGIN}${url}`;
}

function statusKey(p: PostAgenda) {
  return p.atrasado && p.status !== 'postado' ? 'atrasado' : p.status;
}

export function ClienteCalendario({ clienteId, primary }: { clienteId: string; primary: string }) {
  const role = useAuth((s) => s.user?.role);
  const [posts, setPosts] = useState<PostAgenda[] | null>(null);
  const [view, setView] = useState<'mes' | 'lista'>('mes');
  const [sel, setSel] = useState<PostAgenda | null>(null);
  const [criando, setCriando] = useState(false);
  const ref = new Date();

  async function carregar() {
    try { setPosts(await backend.agenda.list(clienteId)); } catch { setPosts([]); }
  }
  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 12000);
    return () => clearInterval(t);
  }, [clienteId]);

  const days = monthMatrix(ref).flat();
  const byDay = (d: Date) => (posts ?? []).filter((p) => isSameDay(new Date(p.dataHora), d));

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold capitalize text-cloud">{fmt(ref, "MMMM 'de' yyyy")}</h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-ink-700 p-0.5">
            {(['mes', 'lista'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={cn('rounded-lg px-3 py-1 text-xs font-semibold capitalize', view === v ? 'bg-eye-red text-white' : 'text-cloud-muted')}>{v === 'mes' ? 'Mês' : 'Lista'}</button>
            ))}
          </div>
          <Button className="py-1.5" onClick={() => setCriando(true)}><Plus className="h-4 w-4" /> Post</Button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2 text-[11px] text-cloud-muted">
        {(['rascunho', 'aguardando_confirmacao', 'confirmado', 'postado', 'atrasado'] as const).map((k) => (
          <span key={k} className="flex items-center gap-1"><span className={cn('h-2 w-2 rounded-full', postStatusInfo[k].dot)} /> {postStatusInfo[k].label}</span>
        ))}
      </div>

      {posts === null ? (
        <div className="grid place-items-center py-12"><Loader2 className="h-5 w-5 animate-spin text-eye-red" /></div>
      ) : view === 'lista' ? (
        <div className="space-y-2">
          {[...posts].sort((a, b) => +new Date(a.dataHora) - +new Date(b.dataHora)).map((p) => {
            const st = postStatusInfo[statusKey(p)];
            return (
              <button key={p.id} onClick={() => setSel(p)} className="flex w-full items-center gap-3 rounded-xl border border-ink-700/50 p-3 text-left hover:border-eye-red/40">
                <div className="grid w-14 shrink-0 place-items-center rounded-lg bg-ink-800 py-1.5"><span className="font-display text-sm font-bold text-cloud">{time(p.dataHora)}</span></div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-cloud">{p.titulo}</p><p className="text-xs text-cloud-dim">{dayMonth(p.dataHora)} · {p.plataforma}</p></div>
                <Badge className={st.badge} dot={st.dot}>{st.label}</Badge>
              </button>
            );
          })}
          {posts.length === 0 && <p className="py-6 text-center text-sm text-cloud-dim">Nenhum post. Clique em “+ Post”.</p>}
        </div>
      ) : (
        <>
          <div className="mb-1 hidden grid-cols-7 gap-1.5 sm:grid">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d) => <div key={d} className="px-2 py-1 text-center text-[11px] font-semibold uppercase text-cloud-dim">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day) => {
              const dp = byDay(day);
              const today = isSameDay(day, new Date());
              return (
                <div key={day.toISOString()} className={cn('min-h-[64px] rounded-lg border p-1 sm:min-h-[84px]', today ? 'border-eye-red/50 bg-eye-red/5' : 'border-ink-700/40')}>
                  <span className={cn('text-[10px] font-semibold sm:text-xs', today ? 'text-eye-red' : 'text-cloud-dim')}>{fmt(day, 'd')}</span>
                  <div className="mt-0.5 space-y-0.5">
                    {dp.slice(0, 3).map((p) => {
                      const st = postStatusInfo[statusKey(p)];
                      return <button key={p.id} onClick={() => setSel(p)} title={`${time(p.dataHora)} · ${p.titulo}`} className="block w-full truncate rounded border-l-2 bg-ink-800 px-1 py-0.5 text-left text-[9px] text-cloud sm:text-[10px]" style={{ borderLeftColor: primary }}><span className={cn('mr-0.5 inline-block h-1.5 w-1.5 rounded-full align-middle', st.dot)} />{time(p.dataHora)}</button>;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {sel && <PostModal post={sel} role={role} onClose={() => setSel(null)} onMudou={() => { setSel(null); carregar(); }} />}
      {criando && <NovoPostModal clienteId={clienteId} onClose={() => setCriando(false)} onCriado={() => { setCriando(false); carregar(); }} />}
    </Card>
  );
}

// ---------- Modal de detalhe / confirmação ----------
function PostModal({ post, role, onClose, onMudou }: { post: PostAgenda; role?: string; onClose: () => void; onMudou: () => void }) {
  const [busy, setBusy] = useState(false);
  const [legenda, setLegenda] = useState(post.legenda);
  const st = postStatusInfo[statusKey(post)];
  async function acao(fn: () => Promise<unknown>) { setBusy(true); try { await fn(); onMudou(); } finally { setBusy(false); } }

  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between border-b border-ink-700/60 p-4">
        <div className="flex items-center gap-2"><h3 className="font-display text-lg font-bold text-cloud">{post.titulo}</h3><Badge className={st.badge} dot={st.dot}>{st.label}</Badge></div>
        <button onClick={onClose} className="text-cloud-dim hover:text-cloud"><X className="h-5 w-5" /></button>
      </div>
      <div className="space-y-3 p-4">
        {post.imagemUrl && <img src={resolveImgUrl(post.imagemUrl)!} alt="" className="max-h-60 w-full rounded-xl object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
        <p className="flex items-center gap-2 text-sm text-cloud-muted"><Clock className="h-4 w-4" /> {fmt(post.dataHora, "dd 'de' MMM · HH:mm")} · {post.plataforma}</p>
        <div>
          <p className="eye-label mb-1">Legenda</p>
          <textarea className="eye-input h-28 resize-none" value={legenda} onChange={(e) => setLegenda(e.target.value)} />
          {legenda !== post.legenda && <Button variant="soft" className="mt-2 py-1.5" onClick={() => acao(() => backend.agenda.editar(post.id, { legenda }))}>Salvar legenda</Button>}
        </div>
        <p className="text-xs text-cloud-dim">Criado por {post.criadoPorNome ?? '—'}{post.postarPorNome ? ` · postado por ${post.postarPorNome}` : ''}</p>

        {/* Ações conforme papel e status */}
        <div className="flex flex-wrap gap-2 border-t border-ink-700/60 pt-3">
          {role === 'ceo' && post.status === 'aguardando_confirmacao' && (
            <>
              <Button onClick={() => acao(() => backend.agenda.confirmar(post.id))} disabled={busy}><Check className="h-4 w-4" /> Confirmar</Button>
              <Button variant="ghost" onClick={() => acao(() => backend.agenda.devolver(post.id, 'Ajuste necessário'))} disabled={busy}>Devolver</Button>
            </>
          )}
          {(role === 'ceo' || role === 'social') && post.status === 'confirmado' && (
            <Button variant="primary" className="bg-sky-600 hover:bg-sky-700" onClick={() => acao(() => backend.agenda.postar(post.id))} disabled={busy}><Send className="h-4 w-4" /> Marcar como postado</Button>
          )}
          {post.status === 'aguardando_confirmacao' && role !== 'ceo' && <p className="text-xs text-amber-400">Aguardando confirmação do CEO.</p>}
        </div>
      </div>
    </Overlay>
  );
}

// ---------- Modal "+ Post" ----------
export function NovoPostModal({ clienteId, onClose, onCriado, preset }: { clienteId: string; onClose: () => void; onCriado: () => void; preset?: { titulo?: string; legenda?: string; imagemUrl?: string } }) {
  const [titulo, setTitulo] = useState(preset?.titulo ?? '');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [plataforma, setPlataforma] = useState('instagram');
  const [legenda, setLegenda] = useState(preset?.legenda ?? '');
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState('');

  async function criar() {
    setErro('');
    if (!titulo.trim()) return setErro('Informe um título.');
    if (!data || !hora) return setErro('Data e HORA da postagem são obrigatórias.');
    setBusy(true);
    try {
      await backend.agenda.criar({ clienteId, titulo, dataHora: new Date(`${data}T${hora}`).toISOString(), plataforma, legenda, imagemUrl: preset?.imagemUrl });
      onCriado();
    } catch (e: any) {
      setErro(e?.message ?? 'Erro ao criar.');
    } finally { setBusy(false); }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between border-b border-ink-700/60 p-4">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-cloud"><CalendarPlus className="h-5 w-5 text-eye-red" /> Adicionar ao calendário</h3>
        <button onClick={onClose} className="text-cloud-dim hover:text-cloud"><X className="h-5 w-5" /></button>
      </div>
      <div className="space-y-3 p-4">
        {erro && <p className="rounded-lg border border-eye-red/30 bg-eye-red/5 p-2 text-xs text-eye-red">{erro}</p>}
        <div><label className="eye-label mb-1 block">Título</label><input className="eye-input" value={titulo} onChange={(e) => setTitulo(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="eye-label mb-1 block">Data</label><input type="date" className="eye-input" value={data} onChange={(e) => setData(e.target.value)} /></div>
          <div><label className="eye-label mb-1 block">Hora *</label><input type="time" className="eye-input" value={hora} onChange={(e) => setHora(e.target.value)} /></div>
        </div>
        <div><label className="eye-label mb-1 block">Plataforma</label>
          <select className="eye-input" value={plataforma} onChange={(e) => setPlataforma(e.target.value)}>
            <option value="instagram">Instagram</option><option value="tiktok">TikTok</option><option value="facebook">Facebook</option><option value="whatsapp">WhatsApp</option>
          </select>
        </div>
        <div><label className="eye-label mb-1 block">Legenda</label><textarea className="eye-input h-24 resize-none" value={legenda} onChange={(e) => setLegenda(e.target.value)} /></div>
        <Button className="w-full" onClick={criar} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />} Adicionar (vai p/ sua confirmação)</Button>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-ink-700 bg-ink-850 shadow-card sm:max-w-lg sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
