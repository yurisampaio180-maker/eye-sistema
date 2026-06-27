import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, CalendarClock, Users, ArrowRight, Inbox, Factory } from 'lucide-react';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';
import { backend, solicStatusInfo, type Stats, type PostAgenda, type SolicStatus } from '@/services/backend';
import { cn } from '@/lib/utils';

const prodLabel: Record<string, string> = {
  ideia: 'A iniciar (arte)', roteiro: 'A iniciar (vídeo)', producao: 'Em produção',
  gravacao: 'Gravando', edicao: 'Em edição', aprovacao: 'Em revisão', pronto: 'Aguardando confirmação',
};

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendentes, setPendentes] = useState<PostAgenda[]>([]);
  const [clientesN, setClientesN] = useState<number | null>(null);

  async function carregar() {
    try {
      const [s, p, c] = await Promise.all([backend.stats(), backend.agenda.pendentes(), backend.clientes()]);
      setStats(s); setPendentes(p); setClientesN(c.length);
    } catch { /* silencioso */ }
  }
  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 12000);
    return () => clearInterval(t);
  }, []);

  const totalSolic = stats ? stats.porStatus.reduce((a, s) => a + s.total, 0) : 0;

  return (
    <div className="space-y-6">
      <PageHeader icon={Activity} title="Painel do CEO" subtitle="Visão geral da operação em tempo real" />

      {/* KPIs reais (sem números inventados) */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Solicitações p/ aprovar" value={stats ? String(stats.pendentesAprovacao) : '—'} accent icon={ShieldCheck} to="/aprovacoes" />
        <Kpi label="Posts p/ confirmar" value={String(pendentes.length)} icon={CalendarClock} to="/aprovacoes" />
        <Kpi label="Clientes ativos" value={clientesN === null ? '—' : String(clientesN)} icon={Users} to="/clientes" />
        <Kpi label="Solicitações no total" value={stats ? String(totalSolic) : '—'} icon={Inbox} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pendências de aprovação */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-cloud"><ShieldCheck className="h-4 w-4 text-eye-red" /> Aguardando você</h2>
            <Link to="/aprovacoes" className="flex items-center gap-1 text-xs font-medium text-eye-red hover:underline">Ir para aprovações <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <div className="space-y-2">
            <LinhaPendencia label="Solicitações para aprovar" n={stats?.pendentesAprovacao ?? 0} />
            <LinhaPendencia label="Posts para confirmar" n={pendentes.length} />
          </div>
          {(stats?.pendentesAprovacao ?? 0) === 0 && pendentes.length === 0 && (
            <p className="mt-3 flex items-center gap-2 text-sm text-emerald-400"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Tudo em dia. Nada aguardando.</p>
          )}
        </Card>

        {/* Solicitações por cliente */}
        <Card className="p-5">
          <h2 className="mb-3 font-display text-lg font-bold text-cloud">Solicitações por cliente</h2>
          {!stats || stats.porCliente.every((c) => c.total === 0) ? (
            <EmptyState>Nenhuma solicitação ainda.</EmptyState>
          ) : (
            <div className="space-y-2">
              {stats.porCliente.filter((c) => c.total > 0).map((c) => (
                <div key={c.cliente} className="flex items-center gap-3">
                  <span className="w-40 truncate text-sm text-cloud">{c.cliente}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-700">
                    <div className="h-full rounded-full bg-eye-red" style={{ width: `${Math.min(100, c.total * 18)}%` }} />
                  </div>
                  <span className="text-xs text-cloud-muted">{c.total}{c.pendentes > 0 ? ` · ${c.pendentes} pend.` : ''}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Gargalos na produção */}
      <Card className="p-5">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cloud"><Factory className="h-4 w-4 text-eye-red" /> Produção</h2>
        {!stats || stats.producao.length === 0 ? (
          <EmptyState>Nenhuma tarefa em produção ainda.</EmptyState>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {stats.producao.map((p) => (
              <div key={p.coluna} className="rounded-xl border border-ink-700/50 p-3 text-center">
                <p className="font-display text-2xl font-extrabold text-cloud">{p.total}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-cloud-dim">{prodLabel[p.coluna] ?? p.coluna}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Status das solicitações */}
      {stats && stats.porStatus.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-3 font-display text-lg font-bold text-cloud">Status das solicitações</h2>
          <div className="flex flex-wrap gap-2">
            {stats.porStatus.map((s) => {
              const info = solicStatusInfo[s.status as SolicStatus];
              return <Badge key={s.status} className={info?.badge ?? 'bg-ink-700 text-cloud-muted'} dot={info?.dot}>{(info?.label ?? s.status)}: {s.total}</Badge>;
            })}
          </div>
        </Card>
      )}

      <p className="text-center text-xs text-cloud-dim">As métricas de alcance/seguidores/ROI aparecerão aqui quando integradas às plataformas. Sem dados inventados.</p>
    </div>
  );
}

function Kpi({ label, value, icon: Icon, accent, to }: { label: string; value: string; icon: typeof Users; accent?: boolean; to?: string }) {
  const body = (
    <Card className={cn('p-4', accent && 'bg-hud-grid bg-[length:32px_32px]', to && 'eye-card-hover')}>
      <div className="flex items-start justify-between">
        <span className="eye-label">{label}</span>
        <Icon className={cn('h-4 w-4', accent ? 'text-eye-red' : 'text-cloud-dim')} />
      </div>
      <div className="mt-2 font-display text-3xl font-extrabold text-cloud">{value}</div>
    </Card>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

function LinhaPendencia({ label, n }: { label: string; n: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-ink-700/50 px-3 py-2.5">
      <span className="text-sm text-cloud">{label}</span>
      <span className={cn('grid h-6 min-w-6 place-items-center rounded-full px-2 text-xs font-bold', n > 0 ? 'bg-eye-red text-white' : 'bg-ink-700 text-cloud-muted')}>{n}</span>
    </div>
  );
}
