import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, ArrowUpRight, Megaphone, ListChecks } from 'lucide-react';
import { useClients, useInstagramTodos } from '@/hooks/queries';
import { backend } from '@/services/backend';
import { Card, PageHeader, Badge, Skeleton } from '@/components/ui';
import { clientStatusConfig, platformLabel } from '@/lib/status';
import { compact, pct } from '@/lib/utils';

const serviceLabel: Record<string, string> = {
  conteudo: 'Conteúdo',
  trafego: 'Tráfego',
  video: 'Vídeo',
  branding: 'Branding',
  social: 'Social',
};

export function ClientesPage() {
  const { data: clients, isLoading } = useClients();
  const { data: igTodos } = useInstagramTodos();
  const igMap = useMemo(
    () => Object.fromEntries((igTodos ?? []).map((m) => [m.clienteId, m])),
    [igTodos]
  );
  const { data: backendClients } = useQuery({
    queryKey: ['backend-clients-logo'],
    queryFn: () => backend.clientes(),
    staleTime: 60_000,
  });
  const logoMap = useMemo(
    () => Object.fromEntries((backendClients ?? []).map((c) => [c.id, Boolean(c.temLogo)])),
    [backendClients]
  );

  return (
    <div>
      <PageHeader
        icon={Users}
        title="Clientes"
        subtitle="Cada marca com sua identidade e serviços"
      />

      {isLoading || !clients ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clients.map((c) => {
            const st = clientStatusConfig[c.status];
            const ig = igMap[c.id];
            const seguidores = ig?.metrica?.seguidores ?? null;
            const alcance    = ig?.metrica?.alcanceSemana ?? null;
            return (
              <Link key={c.id} to={`/clientes/${c.id}`}>
                <Card hover className="group relative overflow-hidden">
                  <div
                    className="h-20 w-full"
                    style={{ background: `linear-gradient(135deg, ${c.brand.primary}, ${c.brand.secondary})` }}
                  />
                  <div className="-mt-8 px-5 pb-5">
                    <div className="flex items-end justify-between">
                      <span
                        className="grid h-14 w-14 place-items-center rounded-2xl border-4 border-ink-850 font-display text-lg font-black text-white shadow-lg"
                        style={{ backgroundColor: c.brand.primary }}
                      >
                        {c.name.slice(0, 2).toUpperCase()}
                      </span>
                      <ArrowUpRight className="h-5 w-5 text-cloud-dim transition-colors group-hover:text-eye-red" />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <h3 className="font-display text-lg font-bold text-cloud">{c.name}</h3>
                      <Badge className={st.badge} dot={st.dot}>{st.label}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-cloud-muted">{c.segment}</p>
                      {backendClients && logoMap[c.id] === false && (
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-400" title="Logomarca não cadastrada — geração de artes bloqueada">
                          Sem logo
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {c.services.map((s) => (
                        <span key={s} className="rounded-md bg-ink-800 px-2 py-0.5 text-[10px] font-medium text-cloud-muted">
                          {serviceLabel[s]}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-ink-700/50 pt-3 text-center">
                      <Metric label="Seguidores" value={seguidores !== null ? compact(seguidores) : '—'} />
                      <Metric label="Alcance/sem" value={alcance !== null ? compact(alcance) : '—'} />
                      <Metric label="Entrega" value={pct(c.deliveryRate)} />
                    </div>

                    <div className="mt-3 flex items-center gap-3 text-xs text-cloud-dim">
                      {c.pendingTasks > 0 && (
                        <span className="flex items-center gap-1">
                          <ListChecks className="h-3.5 w-3.5" /> {c.pendingTasks} pendência(s)
                        </span>
                      )}
                      {c.activeCampaigns > 0 && (
                        <span className="flex items-center gap-1">
                          <Megaphone className="h-3.5 w-3.5" /> {c.activeCampaigns} ativa(s)
                        </span>
                      )}
                      {ig?.conectado
                        ? <span className="ml-auto text-emerald-500">● {ig.username}</span>
                        : <span className="ml-auto text-amber-500">● não conectado</span>
                      }
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-base font-bold text-cloud">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-cloud-dim">{label}</p>
    </div>
  );
}
