import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/stores/auth';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Palette, Megaphone, Calendar, Sparkles, MessageSquareQuote,
  LayoutDashboard, Clapperboard, Inbox, Settings, Clock, Loader2,
  Instagram, RefreshCw, AlertCircle, Upload, Trash2, Image as ImageIcon,
} from 'lucide-react';
import { useClient, usePosts, useCampaigns, useVideos, useInstagramMetricas } from '@/hooks/queries';
import { Card, Badge, Skeleton } from '@/components/ui';
import { clientStatusConfig, postStatusConfig, platformLabel, videoStageConfig, videoStageOrder } from '@/lib/status';
import { compact, brl, pct, cn } from '@/lib/utils';
import { dayMonth, time, monthMatrix, fmt, isSameDay } from '@/lib/dates';
import { ClienteCriarIA } from '@/features/conteudo/ConteudoPage';
import { ClienteCalendario } from './ClienteCalendario';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { dnaByClient } from '@/features/conteudo/data/clientesDNA';
import { frameworks } from '@/features/conteudo/data/frameworks';
import { backend, solicStatusInfo, type Solicitacao, type ClienteAsset } from '@/services/backend';
import type { InstagramStatus } from '@/services/backend';

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
  const { data: igData, refetch: refetchIg } = useInstagramMetricas(id);
  const [aba, setAba] = useState<AbaId>('visao');
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();
  const [igMsg, setIgMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  useEffect(() => {
    const ig = searchParams.get('instagram');
    if (!ig) return;
    if (ig === 'conectado') {
      setIgMsg({ tipo: 'ok', texto: 'Instagram conectado com sucesso!' });
      qc.invalidateQueries({ queryKey: ['instagram', id] });
      qc.invalidateQueries({ queryKey: ['instagram-todos'] });
    } else if (ig === 'erro') {
      const msg = searchParams.get('msg') ?? 'Erro ao conectar Instagram.';
      setIgMsg({ tipo: 'erro', texto: decodeURIComponent(msg) });
    }
    // limpar da URL
    window.history.replaceState({}, '', `/clientes/${id}`);
  }, []);

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

      {igMsg && (
        <div className={cn(
          'flex items-start gap-2 rounded-xl border px-4 py-3 text-sm',
          igMsg.tipo === 'ok'
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
            : 'border-eye-red/30 bg-eye-red/5 text-eye-red'
        )}>
          {igMsg.tipo === 'ok' ? <Instagram className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
          <span>{igMsg.texto}</span>
          <button className="ml-auto text-xs opacity-60 hover:opacity-100" onClick={() => setIgMsg(null)}>✕</button>
        </div>
      )}

      <div className="animate-fade-in">
        {aba === 'visao' && <ErrorBoundary><VisaoGeral id={id} client={client} igData={igData} role={role} /></ErrorBoundary>}
        {aba === 'calendario' && <ErrorBoundary><ClienteCalendario clienteId={id} primary={client.brand.primary} /></ErrorBoundary>}
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
function VisaoGeral({ id, client, igData, role }: { id: string; client: any; igData: InstagramStatus | undefined; role: string | undefined }) {
  const { data: posts } = usePosts();
  const { data: campaigns } = useCampaigns();
  const clientPosts = (posts ?? []).filter((p: any) => p.clientId === id);
  const clientCampaigns = (campaigns ?? []).filter((c: any) => c.clientId === id);

  const seguidores  = igData?.metrica?.seguidores ?? null;
  const alcance     = igData?.metrica?.alcanceSemana ?? null;
  const visitasPerfil = igData?.metrica?.visitasPerfil ?? null;
  const conectado   = igData?.conectado ?? false;

  const [connecting, setConnecting] = useState(false);

  async function conectarInstagram() {
    setConnecting(true);
    try {
      const { url } = await backend.instagram.url(id);
      window.location.href = url;
    } catch {
      setConnecting(false);
    }
  }

  async function sincronizar() {
    try {
      await backend.instagram.sincronizar(id);
    } catch { /* silencioso */ }
  }

  return (
    <div className="space-y-5">
      {/* Métricas Instagram */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Mini label="Seguidores" value={seguidores !== null ? compact(seguidores) : '—'} />
        <Mini label="Alcance/sem" value={alcance !== null ? compact(alcance) : '—'} />
        <Mini label="Visitas perfil" value={visitasPerfil !== null ? compact(visitasPerfil) : '—'} />
        <Mini label="Campanhas" value={String(clientCampaigns.length)} />
      </div>

      {/* Status Instagram */}
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <Instagram className="h-4 w-4 shrink-0 text-pink-400" />
        {conectado ? (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-cloud">@{igData?.username}</p>
              <p className="text-xs text-cloud-dim">
                Atualizado: {igData?.ultimaSincEm ? new Date(igData.ultimaSincEm).toLocaleString('pt-BR') : '—'}
              </p>
            </div>
            {role === 'ceo' && (
              <button
                onClick={sincronizar}
                className="flex items-center gap-1.5 rounded-lg border border-ink-700 px-3 py-1.5 text-xs text-cloud-muted hover:border-ink-500 hover:text-cloud"
              >
                <RefreshCw className="h-3 w-3" /> Sincronizar
              </button>
            )}
          </>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-cloud">Instagram não conectado</p>
              <p className="text-xs text-cloud-dim">Conecte para ver métricas reais de seguidores e alcance.</p>
            </div>
            {role === 'ceo' && (
              <button
                onClick={conectarInstagram}
                disabled={connecting}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {connecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Instagram className="h-3 w-3" />}
                Conectar Instagram
              </button>
            )}
          </>
        )}
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

// ---------- Configurações (DNA + Assets) ----------
function ConfiguracoesCliente({ id, client }: { id: string; client: any }) {
  const dna = dnaByClient(id);
  return (
    <div className="space-y-5">
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
              {dna.fraseCentral && <Campo label="Frase central" valor={`"${dna.fraseCentral}"`} />}
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
      <AssetsCliente clienteId={id} />
    </div>
  );
}

// ---------- Assets (logos + referências para a IA) ----------
function AssetsCliente({ clienteId }: { clienteId: string }) {
  const [assets, setAssets] = useState<ClienteAsset[]>([]);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState('');

  async function carregar() {
    try { setAssets(await backend.assets.list(clienteId)); } catch { setAssets([]); }
  }
  useEffect(() => { carregar(); }, [clienteId]);

  async function upload(tipo: 'logo' | 'referencia', file: File) {
    setErro(''); setBusy(true);
    try {
      const fd = new FormData();
      fd.append('tipo', tipo);
      fd.append('arquivo', file);
      fd.append('nome', file.name);
      await backend.assets.upload(clienteId, fd);
      await carregar();
    } catch (e: any) {
      setErro(e?.message ?? 'Erro ao fazer upload.');
    } finally { setBusy(false); }
  }

  async function remover(assetId: string) {
    setBusy(true);
    try { await backend.assets.remover(clienteId, assetId); await carregar(); }
    finally { setBusy(false); }
  }

  const logos = assets.filter((a) => a.tipo === 'logo');
  const refs  = assets.filter((a) => a.tipo === 'referencia');

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2"><ImageIcon className="h-4 w-4 text-eye-red" /><h2 className="font-display font-bold text-cloud">Assets para geração de imagem</h2></div>
      {erro && <p className="mb-3 rounded-lg border border-eye-red/30 bg-eye-red/5 p-2 text-xs text-eye-red">{erro}</p>}

      {/* Logos */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="eye-label">Logomarcas oficiais <span className="text-cloud-dim">(PNG com fundo transparente)</span></p>
          <label className={cn('eye-btn eye-btn-ghost cursor-pointer py-1 text-xs', busy && 'pointer-events-none opacity-50')}>
            <Upload className="h-3.5 w-3.5" /> Adicionar logo
            <input type="file" accept="image/png" className="hidden" onChange={(e) => e.target.files?.[0] && upload('logo', e.target.files[0])} />
          </label>
        </div>
        {logos.length === 0 ? (
          <p className="text-xs text-cloud-dim">Nenhuma logo cadastrada. A IA usará descrição textual.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {logos.map((a) => (
              <div key={a.id} className="group relative rounded-xl border border-ink-700 bg-ink-900 p-1">
                <img src={a.url} alt={a.nome ?? 'logo'} className="h-16 w-16 rounded-lg object-contain" />
                <button onClick={() => remover(a.id)} disabled={busy} className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-eye-red text-white group-hover:flex">
                  <Trash2 className="h-3 w-3" />
                </button>
                <p className="mt-1 max-w-[64px] truncate text-center text-[9px] text-cloud-dim">{a.nome}</p>
              </div>
            ))}
          </div>
        )}
        <p className="mt-1 text-[10px] text-amber-400/80">⚠️ A logo será inserida EXATAMENTE como enviada — sem redesenho.</p>
      </div>

      {/* Referências */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="eye-label">Artes de referência <span className="text-cloud-dim">(exemplos aprovados de estilo)</span></p>
          <label className={cn('eye-btn eye-btn-ghost cursor-pointer py-1 text-xs', busy && 'pointer-events-none opacity-50')}>
            <Upload className="h-3.5 w-3.5" /> Adicionar referência
            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && upload('referencia', e.target.files[0])} />
          </label>
        </div>
        {refs.length === 0 ? (
          <p className="text-xs text-cloud-dim">Nenhuma referência. Envie artes aprovadas para que a IA imite o estilo.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {refs.map((a) => (
              <div key={a.id} className="group relative rounded-xl border border-ink-700 bg-ink-900 p-1">
                <img src={a.url} alt={a.nome ?? 'ref'} className="h-16 w-16 rounded-lg object-cover" />
                <button onClick={() => remover(a.id)} disabled={busy} className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-eye-red text-white group-hover:flex">
                  <Trash2 className="h-3 w-3" />
                </button>
                <p className="mt-1 max-w-[64px] truncate text-center text-[9px] text-cloud-dim">{a.nome}</p>
              </div>
            ))}
          </div>
        )}
        <p className="mt-1 text-[10px] text-cloud-dim">💡 Até 3 referências são enviadas a cada geração de arte.</p>
      </div>
    </Card>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return <div className="mb-2"><p className="eye-label mb-0.5">{label}</p><p className="text-sm text-cloud">{valor || '—'}</p></div>;
}
