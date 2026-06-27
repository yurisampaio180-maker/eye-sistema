import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, GitBranch } from 'lucide-react';
import { Card } from '@/components/ui';
import { backend, type Stats } from '@/services/backend';

/** Faixa de pendências de aprovação + gargalos de produção (dados reais do backend). */
export function StatsStrip() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    backend.stats().then(setStats).catch(() => setErro(true));
  }, []);

  if (erro) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-300">
        Backend (eye-api) offline — rode <code className="rounded bg-ink-800 px-1">npm run dev</code> em <code className="rounded bg-ink-800 px-1">eye-api</code> (porta 3333).
      </Card>
    );
  }
  if (!stats) return null;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Link to="/aprovacoes" className="md:col-span-1">
        <Card hover className="flex items-center gap-3 p-4">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-eye-red/15 text-eye-red">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="font-display text-2xl font-extrabold text-cloud">{stats.pendentesAprovacao}</p>
            <p className="text-xs text-cloud-muted">Aguardando sua aprovação</p>
          </div>
          <ArrowRight className="h-4 w-4 text-cloud-dim" />
        </Card>
      </Link>

      <Card className="p-4 md:col-span-2">
        <div className="mb-2 flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-eye-red" />
          <p className="eye-label">Produção por etapa</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {stats.producao.length === 0 && <span className="text-xs text-cloud-dim">Nenhuma tarefa em produção.</span>}
          {stats.producao.map((p) => (
            <span key={p.coluna} className="rounded-lg border border-ink-700 bg-ink-900 px-2.5 py-1 text-xs text-cloud-muted">
              {p.coluna}: <span className="font-bold text-cloud">{p.total}</span>
            </span>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {stats.porCliente.filter((c) => c.pendentes > 0).map((c) => (
            <span key={c.cliente} className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] text-amber-300">
              {c.cliente}: {c.pendentes} pendente(s)
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
