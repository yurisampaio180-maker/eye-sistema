import { useMemo, useState } from 'react';
import { Megaphone, Target, MousePointerClick, TrendingUp, Wallet } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { useCampaigns, useClients } from '@/hooks/queries';
import { Card, PageHeader, StatCard, Badge } from '@/components/ui';
import { brl, compact, sum, cn } from '@/lib/utils';
import { clientName } from '@/data/clients';

const objectiveLabel: Record<string, string> = {
  alcance: 'Alcance',
  trafego: 'Tráfego',
  conversao: 'Conversão',
  leads: 'Leads',
  engajamento: 'Engajamento',
};

const platformLabel: Record<string, string> = {
  meta: 'Meta Ads',
  google: 'Google Ads',
  tiktok: 'TikTok Ads',
};

export function TrafegoPage() {
  const { data: campaigns } = useCampaigns();
  const { data: clients } = useClients();
  const [filter, setFilter] = useState('all');

  const list = useMemo(
    () => (campaigns ?? []).filter((c) => filter === 'all' || c.clientId === filter),
    [campaigns, filter]
  );

  const totalBudget = sum(list.map((c) => c.budget));
  const totalSpent = sum(list.map((c) => c.spent));
  const totalConv = sum(list.map((c) => c.metrics.conversions));
  const avgRoi =
    list.length > 0 ? sum(list.map((c) => c.metrics.roi)) / list.length : 0;

  const chartData = list.map((c) => ({
    name: c.name.length > 14 ? c.name.slice(0, 14) + '…' : c.name,
    roi: c.metrics.roi,
    color: clients?.find((cl) => cl.id === c.clientId)?.brand.primary ?? '#E11D2A',
  }));

  return (
    <div>
      <PageHeader
        icon={Megaphone}
        title="Tráfego Pago"
        subtitle="Campanhas, investimento e performance"
        actions={
          <select
            className="eye-input w-auto"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Todos os clientes</option>
            {clients?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Investido" value={brl(totalSpent)} delta={`de ${brl(totalBudget)} previstos`} icon={Wallet} accent />
        <StatCard label="Conversões" value={compact(totalConv)} icon={Target} />
        <StatCard label="ROI médio" value={`${avgRoi.toFixed(1)}x`} icon={TrendingUp} />
        <StatCard label="Campanhas ativas" value={list.filter((c) => c.status === 'ativa').length} icon={MousePointerClick} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-bold text-cloud">ROI por campanha</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C2C34" horizontal={false} />
              <XAxis type="number" stroke="#6B6B74" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" stroke="#6B6B74" fontSize={10} width={90} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: '#ffffff08' }}
                contentStyle={{ background: '#16161A', border: '1px solid #2C2C34', borderRadius: 12, fontSize: 12 }}
                formatter={(v: number) => [`${v}x`, 'ROI']}
              />
              <Bar dataKey="roi" radius={[0, 6, 6, 0]}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div className="space-y-3 lg:col-span-3">
          {list.map((c) => {
            const color = clients?.find((cl) => cl.id === c.clientId)?.brand.primary ?? '#E11D2A';
            const spentPct = (c.spent / c.budget) * 100;
            return (
              <Card key={c.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <h3 className="font-display font-bold text-cloud">{c.name}</h3>
                    </div>
                    <p className="mt-0.5 text-xs text-cloud-dim">
                      {clientName(c.clientId)} · {platformLabel[c.platform]} · {objectiveLabel[c.objective]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/15 text-emerald-400">ROI {c.metrics.roi}x</Badge>
                    <Badge className={cn(c.status === 'ativa' ? 'bg-sky-500/15 text-sky-400' : 'bg-ink-700 text-cloud-muted')}>
                      {c.status}
                    </Badge>
                  </div>
                </div>

                <p className="mt-2 text-xs text-cloud-dim">🎯 {c.audience}</p>

                <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
                  <KV k="Verba" v={brl(c.budget)} />
                  <KV k="Gasto" v={brl(c.spent)} />
                  <KV k="Alcance" v={compact(c.metrics.reach)} />
                  <KV k="Cliques" v={compact(c.metrics.clicks)} />
                  <KV k="CPC" v={brl(c.metrics.cpc)} />
                  <KV k="CPL" v={brl(c.metrics.cpl)} />
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[10px] text-cloud-dim">
                    <span>Verba utilizada</span>
                    <span>{Math.round(spentPct)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-ink-700">
                    <div className="h-full rounded-full" style={{ width: `${spentPct}%`, backgroundColor: color }} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="font-display text-sm font-bold text-cloud">{v}</p>
      <p className="text-[10px] uppercase tracking-wide text-cloud-dim">{k}</p>
    </div>
  );
}
