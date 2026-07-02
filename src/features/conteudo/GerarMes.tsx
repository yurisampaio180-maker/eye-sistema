import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bot, Play, Clock, CheckCircle2, XCircle, RefreshCw, Sparkles, CalendarDays } from 'lucide-react';
import { useClients, useMotorHistorico, useMotorStatus, useAgendaPendentes } from '@/hooks/queries';
import { backend, type GeracaoMarketing } from '@/services/backend';
import { Card, Skeleton } from '@/components/ui';
import { FilaRevisao } from './FilaRevisao';
import { cn } from '@/lib/utils';
import type { Client } from '@/types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function mesLabel(value: string): string {
  const [ano, mes] = value.split('-').map(Number);
  return new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

function gerarOpcoesMes(): { value: string; label: string }[] {
  return [0, 1, 2].map((offset) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + offset);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return { value, label: mesLabel(value) };
  });
}

function pct(atual: number, total: number): number {
  if (!total) return 0;
  return Math.round((atual / total) * 100);
}

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: GeracaoMarketing['status'] }) {
  if (status === 'processando') return <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />;
  if (status === 'concluido') return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  return <XCircle className="h-4 w-4 text-eye-red" />;
}

function statusLabel(s: GeracaoMarketing['status']) {
  if (s === 'processando') return 'Gerando...';
  if (s === 'concluido') return 'Concluído';
  return 'Erro';
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
      <div
        className="h-full rounded-full bg-eye-red transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function GeracaoCard({ geracaoId, mes }: { geracaoId: string; mes: string }) {
  const { data: geracao } = useMotorStatus(geracaoId);
  if (!geracao) return null;
  const progresso = pct(geracao.itensGerados, geracao.totalItens || 1);

  return (
    <div className="mt-3 rounded-xl border border-ink-700 bg-ink-850 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <StatusIcon status={geracao.status} />
          <span className="font-medium text-cloud">{statusLabel(geracao.status)}</span>
          <span className="text-cloud-muted">
            {geracao.itensGerados}/{geracao.totalItens || '?'} posts
          </span>
        </div>
        <span className="text-xs text-cloud-dim capitalize">{mesLabel(mes)}</span>
      </div>

      {geracao.status === 'processando' && (
        <div className="mt-2 space-y-1">
          <ProgressBar value={progresso} />
          <p className="text-[10px] text-cloud-dim">
            {geracao.itensGerados === 0
              ? 'Analisando tendências e gerando estratégia...'
              : `Gerando artes e roteiros: ${progresso}%`}
          </p>
        </div>
      )}

      {geracao.status === 'concluido' && (
        <div className="mt-2 flex items-center gap-3 text-xs text-cloud-muted">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {geracao.itensGerados} posts no calendário
          </span>
          {geracao.erros > 0 && (
            <span className="text-amber-400">{geracao.erros} com erro</span>
          )}
        </div>
      )}

      {geracao.status === 'erro' && (
        <p className="mt-1 text-xs text-eye-red/70">
          Falha na geração. Tente novamente ou verifique os créditos OpenAI.
        </p>
      )}
    </div>
  );
}

function ClienteMotorCard({ cliente, mes }: { cliente: Client; mes: string }) {
  const qc = useQueryClient();
  const clienteId = String(cliente.id);
  const { data: historico, isLoading } = useMotorHistorico(clienteId);
  const [geracaoAtiva, setGeracaoAtiva] = useState<string | null>(
    () => historico?.find((g) => g.status === 'processando')?.id ?? null,
  );

  const ultimaGeracao = historico?.[0];
  const jaGerado = ultimaGeracao?.mes === mes && ultimaGeracao.status === 'concluido';

  const mutation = useMutation({
    mutationFn: () => backend.motor.gerar(clienteId, mes),
    onSuccess: ({ geracaoId }) => {
      setGeracaoAtiva(geracaoId);
      qc.invalidateQueries({ queryKey: ['motor-historico', clienteId] });
    },
  });

  const isProcessando =
    historico?.some((g) => g.status === 'processando') || mutation.isPending;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl font-display text-sm font-black text-white"
            style={{ backgroundColor: cliente.brand.primary }}
          >
            {cliente.name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <p className="font-display text-sm font-bold text-cloud">{cliente.name}</p>
            {jaGerado && (
              <p className="text-xs text-emerald-400 capitalize">✓ {mesLabel(mes)} gerado</p>
            )}
            {!jaGerado && !isProcessando && (
              <p className="text-xs capitalize text-cloud-dim">{mesLabel(mes)} · aguardando</p>
            )}
          </div>
        </div>

        <button
          onClick={() => mutation.mutate()}
          disabled={isProcessando || jaGerado}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
            isProcessando || jaGerado
              ? 'cursor-not-allowed bg-ink-700 text-cloud-dim'
              : 'bg-eye-red text-white hover:bg-eye-red/90',
          )}
        >
          {isProcessando ? (
            <><RefreshCw className="h-3 w-3 animate-spin" /> Gerando...</>
          ) : jaGerado ? (
            <><CheckCircle2 className="h-3 w-3" /> Gerado</>
          ) : (
            <><Play className="h-3 w-3" /> Gerar</>
          )}
        </button>
      </div>

      {isLoading && <div className="mt-3 h-1.5 animate-pulse rounded-full bg-ink-700" />}

      {geracaoAtiva && <GeracaoCard geracaoId={geracaoAtiva} mes={mes} />}

      {!geracaoAtiva && ultimaGeracao && ultimaGeracao.mes === mes && (
        <GeracaoCard geracaoId={ultimaGeracao.id} mes={mes} />
      )}
    </Card>
  );
}

// ─── GerarMes ────────────────────────────────────────────────────────────────

export function GerarMes() {
  const qc = useQueryClient();
  const opcoesMes = gerarOpcoesMes();
  const [mes, setMes] = useState(opcoesMes[1].value); // próximo mês por padrão
  const { data: clients, isLoading } = useClients();
  const { data: pendentes = [], refetch: refetchPendentes } = useAgendaPendentes();

  const gerarTodos = useMutation({
    mutationFn: async () => {
      if (!clients) return;
      for (const c of clients) {
        await backend.motor.gerar(String(c.id), mes).catch(() => {});
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['motor-historico'] }),
  });

  return (
    <div>
      {/* Controles: seletor de mês + botão gerar todos */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-cloud-muted">Mês alvo:</label>
          <select
            className="eye-input w-auto py-1.5 capitalize"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
          >
            {opcoesMes.map((m) => (
              <option key={m.value} value={m.value} className="capitalize">
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => gerarTodos.mutate()}
          disabled={gerarTodos.isPending || isLoading}
          className={cn(
            'ml-auto flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
            gerarTodos.isPending
              ? 'cursor-not-allowed bg-ink-700 text-cloud-dim'
              : 'bg-eye-red text-white hover:bg-eye-red/90',
          )}
        >
          {gerarTodos.isPending ? (
            <><RefreshCw className="h-4 w-4 animate-spin" /> Iniciando...</>
          ) : (
            <><Sparkles className="h-4 w-4" /> Gerar todos</>
          )}
        </button>
      </div>

      {/* Info box */}
      <div className="mb-5 rounded-xl border border-ink-700 bg-ink-850 p-4">
        <div className="flex items-start gap-3">
          <Bot className="mt-0.5 h-5 w-5 shrink-0 text-eye-red" />
          <p className="text-xs leading-relaxed text-cloud-muted">
            Para cada cliente: analisa tendências → gera plano 20–26 posts (GPT-4o) → cria artes
            (gpt-image-1) e roteiros → insere no calendário como{' '}
            <span className="mx-1 rounded bg-amber-500/15 px-1 text-amber-400">
              Aguardando CEO
            </span>
            . Nenhum post é publicado sem aprovação. Tempo estimado: 15–30 min por cliente.
          </p>
        </div>
      </div>

      {/* Cards por cliente */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(clients ?? []).map((c) => (
            <ClienteMotorCard key={c.id} cliente={c} mes={mes} />
          ))}
        </div>
      )}

      {/* Cron tip */}
      <div className="mt-5 flex items-center gap-2 text-xs text-cloud-dim">
        <Clock className="h-3.5 w-3.5 shrink-0" />
        <span>
          O cron automático roda no dia 25 às 09h e gera o mês seguinte para todos os clientes.
          Você pode disparar manualmente a qualquer momento.
        </span>
      </div>

      {/* Fila de revisão */}
      <FilaRevisao itens={pendentes} onAtualizar={() => void refetchPendentes()} />
    </div>
  );
}
