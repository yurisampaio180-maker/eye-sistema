import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/stores/auth';
import {
  ArrowLeft, Palette, Megaphone, Calendar, Sparkles, MessageSquareQuote,
  LayoutDashboard, Clapperboard, Inbox, Settings, Clock, Loader2,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useClient, usePosts, useCampaigns, useVideos } from '@/hooks/queries';
import { Card, Badge, Skeleton } from '@/components/ui';
import { clientStatusConfig, postStatusConfig, platformLabel, videoStageConfig, videoStageOrder } from '@/lib/status';
import { compact, brl, pct, cn } from '@/lib/utils';
import { dayMonth, time, monthMatrix, fmt, isSameDay } from '@/lib/dates';
import { ClienteCriarIA } from '@/features/conteudo/ConteudoPage';
import { ClienteCalendario } from './ClienteCalendario';
import { dnaByClient } from '@/features/conteudo/data/clientesDNA';
import { frameworks } from '@/features/conteudo/data/frameworks';
import { backend, solicStatusInfo, type Solicitacao } from '@/services/backend';

type AbaId = 'visao' | 'calendario' | 'ia' | 'videos' | 'solicitacoes' | 'trafego' | 'config';

const ABAS: { id: AbaId; label: string; icon: typeof Calendar }[] = [
  { id: 'visao', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'calendario', label: 'Calendário', icon: Calendar },
  { id: 'ia', label: 'Criar com IA', icon: Sparkles },
  { id: 'videos', label: 'Vídeos', icon: Clapperboard },
  { id: 'solicitacoes', label: 'Solicitações', icon: Inbox },
  { id: 'trafego', label: 'Tráfego Pago', icon: Megaphone },
  { id: 'config', label: 'Configurações', icon: Settings },
];

export function ClienteDetalhePage() {
  const { id = '' } = useParams();
  const role = useAuth((s) => s.user?.role);
  const { data: client, isLoading } = useClient(id);
  const [aba, setAba] = useState<AbaId>('visao');

  // Designer do Governo só acessa o perfil do Governo Municipal
  if (role === 'designer_governo' && id !== 'governo-moraujo') return <Navigate to="/minhas-demandas" replace />;

  if (isLoading) return <Skeleton className="h-96" />;
  if (!client)
    return (
      <div className="text-center text-cloud-muted">
        Cliente não encontrado. <Link to="/clientes" className="text-eye-red hover:underline">Voltar</Link>
      </div>
    );

  const st = clientStatusConfig[client.status];

  return (
    <div className="space-y-5">
      <Link to="/clientes" className="inline-flex items-center gap-1.5 text-sm text-cloud-muted hover:text-cloud">
        <ArrowLeft className="h-4 w-4" /> Clientes
      </Link>

      {/* Header da marca */}
      <Card className="relative overflow-hidden">
        <div className="h-24 sm:h-28" style={{ background: `linear-gradient(135deg, ${client.brand.primary}, ${client.brand.secondary})` }} />
        <div className="-mt-10 flex flex-wrap items-end gap-4 px-4 pb-4 sm:px-6 sm:pb-6">
          <span className="grid h-16 w-16 place-items-center rounded-2xl border-4 border-ink-850 font-display text-xl font-black text-white shadow-xl sm:h-20 sm:w-20 sm:text-2xl" style={{ backgroundColor: client.brand.primary }}>
            {client.name.slice(0, 2).toUpperCase()}
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="eye-title text-xl sm:text-3xl">{client.name}</h1>
              <Badge className={st.badge} dot={st.dot}>{st.label}</Badge>
            </div>
            <p className="text-sm text-cloud-muted">{client.segment}</p>
          </div>
        </div>
      </Card>

      {/* Abas (rolável no mobile) */}
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-ink-700/60 bg-ink-900/50 p-1">
        {ABAS.map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition-colors',
              aba === a.id ? 'bg-eye-red text-white' : 'text-cloud-muted hover:text-cloud'
            )}
          >
            <a.icon className="h-3.5 w-3.5" /> {a.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in">
        {aba === 'visao' && <VisaoGeral id={id} client={client} />}
        {aba === 'calendario' && <ClienteCalendario clienteId={id} primary={client.brand.primary} />}
        {aba === 'ia' && <ClienteCriarIA clienteId={id} />}
        {aba === 'videos' && <VideosCliente id={id} />}
        {aba === 'solicitacoes' && <SolicitacoesCliente id={id} />}
        {aba === 'trafego' && <TrafegoCliente id={id} primary={client.brand.primary} />}
        {aba === 'config' && <ConfiguracoesCliente id={id} client={client} />}
      </div>
    </div>
  );
}

// ---------- Visão Geral ----------
function VisaoGeral({ id, client }: { id: string; client: any }) {
  const { data: posts } = usePosts();
  const { data: campaigns } = useCampaigns();
  const clientPosts = (posts ?? []).filter((p: any) => p.clientId === id);
  const clientCampaigns = (campaigns ?? []).filter((c: any) => c.clientId === id);
  const chartData = client.profiles[0].weeklyViews.map((_: number, i: number) => ({
    week: `S${i + 1}`,
    views: client.profiles.reduce((a: number, p: any) => a + (p.weeklyViews[i] ?? 0), 0),
  }));
  const followers = client.profiles.reduce((a: number, p: any) => a + p.followers, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Mini label="Seguidores" value={compact(followers)} />
        <Mini label="Views/semana" value={compact(client.profiles.reduce((a: number, p: any) => a + (p.weeklyViews.at(-1) ?? 0), 0))} />
        <Mini label="Entrega" value={pct(client.deliveryRate)} />
        <Mini label="Campanhas" value={String(clientCampaigns.length)} />
      </div>
      <Card className="p-4 sm:p-5">
        <h2 className="mb-3 font-display font-bold text-cloud">Crescimento de visualizações</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ left: -18, right: 8, top: 4 }}>
            <defs>
              <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={client.brand.primary} stopOpacity={0.35} />
                <stop offset="100%" stopColor={client.brand.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2C2C34" vertical={false} />
            <XAxis dataKey="week" stroke="#6B6B74" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#6B6B74" fontSize={11} tickLine={false} axisLine={false} tickFormatter={compact} />
            <Tooltip contentStyle={{ background: '#16161A', border: '1px solid #2C2C34', borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [compact(v), 'Views']} />
            <Area type="monotone" dataKey="views" stroke={client.brand.primary} strokeWidth={2.5} fill="url(#gv)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
      <Card className="p-4 sm:p-5">
        <h2 className="mb-3 font-display font-bold text-cloud">Últimos posts</h2>
        <div className="space-y-2">
          {clientPosts.slice(0, 6).map((p: any) => {
            const ps = postStatusConfig[p.status as keyof typeof postStatusConfig];
            return (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-ink-700/50 p-2.5">
                <span className="h-8 w-1 rounded-full" style={{ backgroundColor: client.brand.primary }} />
                <div className="min-w-0 flex-1"><p className="truncate text-sm text-cloud">{p.title}</p><p className="text-xs text-cloud-dim">{dayMonth(p.scheduledAt)} · {time(p.scheduledAt)}</p></div>
                <Badge className={ps.badge} dot={ps.dot}>{ps.label}</Badge>
              </div>
            );
          })}
          {clientPosts.length === 0 && <p className="py-6 text-center text-sm text-cloud-dim">Sem posts ainda.</p>}
        </div>
      </Card>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="eye-label">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold text-cloud">{value}</p>
    </Card>
  );
}

// ---------- Calendário do cliente ----------
function CalendarioCliente({ id, primary }: { id: string; primary: string }) {
  const { data: posts } = usePosts();
  const [ref] = useState(new Date());
  const [view, setView] = useState<'mes' | 'lista'>('mes');
  const clientPosts = useMemo(() => (posts ?? []).filter((p: any) => p.clientId === id), [posts, id]);
  const days = monthMatrix(ref).flat();
  const postsByDay = (d: Date) => clientPosts.filter((p: any) => isSameDay(new Date(p.scheduledAt), d));

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold capitalize text-cloud">{fmt(ref, "MMMM 'de' yyyy")}</h2>
        <div className="flex rounded-xl border border-ink-700 p-0.5">
          {(['mes', 'lista'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={cn('rounded-lg px-3 py-1 text-xs font-semibold capitalize', view === v ? 'bg-eye-red text-white' : 'text-cloud-muted')}>{v === 'mes' ? 'Mês' : 'Lista'}</button>
          ))}
        </div>
      </div>

      {/* legenda de cores por status */}
      <div className="mb-3 flex flex-wrap gap-2 text-[11px] text-cloud-muted">
        {Object.entries(postStatusConfig).map(([k, v]) => (
          <span key={k} className="flex items-center gap-1"><span className={cn('h-2 w-2 rounded-full', v.dot)} /> {v.label}</span>
        ))}
      </div>

      {view === 'lista' ? (
        <div className="space-y-2">
          {clientPosts.sort((a: any, b: any) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt)).map((p: any) => {
            const ps = postStatusConfig[p.status as keyof typeof postStatusConfig];
            return (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-ink-700/50 p-3">
                <div className="grid w-14 shrink-0 place-items-center rounded-lg bg-ink-800 py-1.5"><span className="font-display text-sm font-bold text-cloud">{time(p.scheduledAt)}</span></div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm text-cloud">{p.title}</p><p className="text-xs text-cloud-dim">{dayMonth(p.scheduledAt)} · {platformLabel[p.platform as keyof typeof platformLabel]}</p></div>
                <Badge className={ps.badge} dot={ps.dot}>{ps.label}</Badge>
              </div>
            );
          })}
          {clientPosts.length === 0 && <p className="py-6 text-center text-sm text-cloud-dim">Nenhum post agendado.</p>}
        </div>
      ) : (
        <>
          <div className="mb-1 hidden grid-cols-7 gap-1.5 sm:grid">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d) => <div key={d} className="px-2 py-1 text-center text-[11px] font-semibold uppercase text-cloud-dim">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day) => {
              const dp = postsByDay(day);
              const today = isSameDay(day, new Date());
              return (
                <div key={day.toISOString()} className={cn('min-h-[64px] rounded-lg border p-1 sm:min-h-[84px]', today ? 'border-eye-red/50 bg-eye-red/5' : 'border-ink-700/40')}>
                  <span className={cn('text-[10px] font-semibold sm:text-xs', today ? 'text-eye-red' : 'text-cloud-dim')}>{fmt(day, 'd')}</span>
                  <div className="mt-0.5 space-y-0.5">
                    {dp.slice(0, 3).map((p: any) => {
                      const ps = postStatusConfig[p.status as keyof typeof postStatusConfig];
                      return <div key={p.id} title={`${time(p.scheduledAt)} · ${p.title}`} className="truncate rounded border-l-2 bg-ink-800 px-1 py-0.5 text-[9px] text-cloud sm:text-[10px]" style={{ borderLeftColor: primary }}><span className={cn('mr-0.5 inline-block h-1.5 w-1.5 rounded-full align-middle', ps.dot)} />{time(p.scheduledAt)}</div>;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}

// ---------- Vídeos do cliente ----------
function VideosCliente({ id }: { id: string }) {
  const { data: videos } = useVideos();
  const clientVideos = (videos ?? []).filter((v: any) => v.clientId === id);
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {videoStageOrder.map((stage) => {
        const cfg = videoStageConfig[stage];
        const items = clientVideos.filter((v: any) => v.stage === stage);
        return (
          <div key={stage} className="flex w-60 shrink-0 flex-col rounded-2xl border border-ink-700/50 bg-ink-900/50 p-2.5">
            <div className="mb-2 flex items-center justify-between px-1"><span className="flex items-center gap-1.5 text-sm font-bold text-cloud"><span className={cn('h-2 w-2 rounded-full', cfg.dot)} />{cfg.label}</span><span className="text-xs text-cloud-dim">{items.length}</span></div>
            <div className="space-y-2">
              {items.map((v: any) => (
                <div key={v.id} className="rounded-xl border border-ink-700/60 bg-ink-850 p-3"><p className="text-sm font-medium text-cloud">{v.title}</p>{v.durationSec && <p className="mt-1 text-xs text-cloud-dim">{v.durationSec}s</p>}</div>
              ))}
              {items.length === 0 && <div className="grid place-items-center rounded-xl border border-dashed border-ink-700 py-6 text-xs text-cloud-dim">vazio</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Solicitações do cliente (API real) ----------
function SolicitacoesCliente({ id }: { id: string }) {
  const [itens, setItens] = useState<Solicitacao[] | null>(null);
  useEffect(() => {
    backend.solicitacoes.list().then((all) => setItens(all.filter((s) => s.clienteId === id))).catch(() => setItens([]));
  }, [id]);
  if (!itens) return <div className="grid place-items-center py-12"><Loader2 className="h-5 w-5 animate-spin text-eye-red" /></div>;
  if (itens.length === 0) return <Card className="p-8 text-center text-sm text-cloud-dim">Nenhuma solicitação deste cliente.</Card>;
  return (
    <div className="space-y-2">
      {itens.map((s) => {
        const st = solicStatusInfo[s.status];
        return (
          <Card key={s.id} className="flex items-center gap-3 p-3">
            <span className={cn('grid h-8 w-8 place-items-center rounded-lg text-xs', s.tipo === 'arte' ? 'bg-violet-500/15 text-violet-400' : 'bg-sky-500/15 text-sky-400')}>{s.tipo === 'arte' ? 'A' : 'V'}</span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-cloud">{s.titulo}</p><p className="text-xs text-cloud-dim">{s.unidadeNome ?? ''} {s.solicitanteNome ? `· ${s.solicitanteNome}` : ''}</p></div>
            <Badge className={st.badge} dot={st.dot}>{st.label}</Badge>
          </Card>
        );
      })}
    </div>
  );
}

// ---------- Tráfego do cliente ----------
function TrafegoCliente({ id, primary }: { id: string; primary: string }) {
  const { data: campaigns } = useCampaigns();
  const list = (campaigns ?? []).filter((c: any) => c.clientId === id);
  if (list.length === 0) return <Card className="p-8 text-center text-sm text-cloud-dim">Sem campanhas para este cliente.</Card>;
  return (
    <div className="space-y-3">
      {list.map((c: any) => (
        <Card key={c.id} className="p-4">
          <div className="flex items-center justify-between"><p className="font-display font-bold text-cloud">{c.name}</p><span className="text-xs font-semibold text-emerald-400">ROI {c.metrics.roi}x</span></div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs sm:grid-cols-6">
            {[['Verba', brl(c.budget)], ['Gasto', brl(c.spent)], ['Alcance', compact(c.metrics.reach)], ['Cliques', compact(c.metrics.clicks)], ['CPC', brl(c.metrics.cpc)], ['Conv.', String(c.metrics.conversions)]].map(([k, v]) => (
              <div key={k}><p className="font-display text-sm font-bold text-cloud">{v}</p><p className="text-[10px] uppercase text-cloud-dim">{k}</p></div>
            ))}
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-700"><div className="h-full rounded-full" style={{ width: pct((c.spent / c.budget) * 100), backgroundColor: primary }} /></div>
        </Card>
      ))}
    </div>
  );
}

// ---------- Configurações (DNA) ----------
function ConfiguracoesCliente({ id, client }: { id: string; client: any }) {
  const dna = dnaByClient(id);
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2"><Palette className="h-4 w-4 text-eye-red" /><h2 className="font-display font-bold text-cloud">Identidade visual</h2></div>
        <p className="eye-label mb-1.5">Paleta</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {(dna?.paleta?.length ? dna.paleta : [{ nome: 'Primária', hex: client.brand.primary }, { nome: 'Secundária', hex: client.brand.secondary }]).map((p) => (
            <span key={p.hex} className="flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-900 px-2 py-1.5"><span className="h-5 w-5 rounded" style={{ backgroundColor: p.hex }} /><span className="font-mono text-xs text-cloud-muted">{p.hex}</span></span>
          ))}
        </div>
        <Campo label="Tipografia" valor={dna ? `${dna.tipografia.display} / ${dna.tipografia.corpo}` : client.brand.fonts} />
        <Campo label="Serviços contratados" valor={(client.services ?? []).join(', ')} />
      </Card>
      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2"><MessageSquareQuote className="h-4 w-4 text-eye-red" /><h2 className="font-display font-bold text-cloud">DNA criativo</h2></div>
        {dna ? (
          <>
            <Campo label="Tom de voz" valor={dna.tomDeVoz} />
            <Campo label="Referências" valor={dna.referenciasVisuais.join(' · ')} />
            {dna.fraseCentral && <Campo label="Frase central" valor={`“${dna.fraseCentral}”`} />}
            <p className="eye-label mb-1 mt-3">Frameworks preferidos</p>
            <div className="flex flex-wrap gap-1.5">{dna.frameworksCopyPreferidos.map((f) => <Badge key={f} className="bg-eye-red/15 text-eye-red">{frameworks[f].nome}</Badge>)}</div>
            {dna.proibicoes.length > 0 && (
              <div className="mt-3"><p className="eye-label mb-1">Proibições</p><ul className="space-y-0.5 text-xs text-cloud-muted">{dna.proibicoes.slice(0, 4).map((p, i) => <li key={i}>• {p}</li>)}</ul></div>
            )}
          </>
        ) : (
          <p className="text-sm text-cloud-dim">DNA não configurado para este cliente.</p>
        )}
      </Card>
    </div>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return <div className="mb-2"><p className="eye-label mb-0.5">{label}</p><p className="text-sm text-cloud">{valor || '—'}</p></div>;
}
