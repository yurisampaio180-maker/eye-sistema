import { useEffect, useState } from 'react';
import { UsersRound, Video, Palette, Share2, Crown, Loader2, Image as ImageIcon } from 'lucide-react';
import { Card, PageHeader, Avatar, Badge, EmptyState } from '@/components/ui';
import { backend, type Membro, type Tarefa } from '@/services/backend';
import { cn } from '@/lib/utils';

const roleIcon: Record<string, typeof Video> = {
  ceo: Crown,
  videomaker: Video,
  designer_governo: Palette,
  social: Share2,
};

const roleLabel: Record<string, string> = {
  ceo: 'CEO · Visão total',
  social: 'Social Media',
  designer_governo: 'Designer · Governo',
  videomaker: 'Videomaker',
};

const prodLabel: Record<string, { label: string; badge: string }> = {
  ideia: { label: 'A iniciar', badge: 'bg-ink-700 text-cloud-muted' },
  roteiro: { label: 'A iniciar', badge: 'bg-ink-700 text-cloud-muted' },
  producao: { label: 'Em produção', badge: 'bg-violet-500/15 text-violet-400' },
  gravacao: { label: 'Gravando', badge: 'bg-violet-500/15 text-violet-400' },
  edicao: { label: 'Em edição', badge: 'bg-blue-500/15 text-blue-400' },
  aprovacao: { label: 'Em revisão', badge: 'bg-blue-500/15 text-blue-400' },
  pronto: { label: 'Aguardando CEO', badge: 'bg-amber-500/15 text-amber-400' },
};

export function EquipePage() {
  const [equipe, setEquipe] = useState<Membro[] | null>(null);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);

  async function carregar() {
    try {
      const [e, t] = await Promise.all([backend.equipe(), backend.tarefas.list()]);
      setEquipe(e);
      setTarefas(t);
    } catch { setEquipe([]); }
  }
  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 15000);
    return () => clearInterval(t);
  }, []);

  const tarefasDoMembro = (id: string) =>
    tarefas.filter((t) => t.responsavelId === id && t.statusProducao !== 'pronto');

  return (
    <div>
      <PageHeader
        icon={UsersRound}
        title="Equipe & Tarefas"
        subtitle="Papéis, atividade em tempo real e atribuições"
      />

      {equipe === null ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-eye-red" /></div>
      ) : equipe.length === 0 ? (
        <EmptyState>Nenhum membro da equipe cadastrado.</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {equipe.map((m) => {
            const minhasTarefas = tarefasDoMembro(m.id);
            const Icon = roleIcon[m.role] ?? Palette;
            return (
              <Card key={m.id} className="p-5">
                <div className="flex items-center gap-3">
                  <Avatar name={m.nome} color={m.avatarColor} size="lg" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg font-bold text-cloud">{m.nome}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-cloud-muted">
                      <Icon className="h-3 w-3 text-eye-red" />
                      {roleLabel[m.role] ?? m.role}
                    </div>
                  </div>
                  {minhasTarefas.length > 0 && (
                    <Badge className="bg-eye-red/15 text-eye-red">{minhasTarefas.length}</Badge>
                  )}
                </div>

                {m.role === 'ceo' ? (
                  <p className="mt-4 rounded-xl border border-eye-red/20 bg-eye-red/5 px-3 py-2 text-xs text-cloud-muted">
                    Acesso total ao sistema · acompanhamento em tempo real de toda a operação.
                  </p>
                ) : (
                  <div className="mt-4">
                    <span className="eye-label">Tarefas em andamento</span>
                    <div className="mt-2 space-y-1.5">
                      {minhasTarefas.slice(0, 4).map((t) => {
                        const pl = prodLabel[t.statusProducao] ?? { label: t.statusProducao, badge: 'bg-ink-700 text-cloud-muted' };
                        const isVideo = t.tipo === 'video';
                        return (
                          <div key={t.id} className="flex items-center gap-2 rounded-lg border border-ink-700/50 px-2.5 py-1.5 text-xs">
                            {isVideo ? <Video className="h-3 w-3 shrink-0 text-sky-400" /> : <ImageIcon className="h-3 w-3 shrink-0 text-violet-400" />}
                            <span className="min-w-0 flex-1 truncate text-cloud">{t.titulo}</span>
                            <span className="shrink-0 text-[10px] text-cloud-dim">{t.clienteNome}</span>
                            <Badge className={pl.badge}>{pl.label}</Badge>
                          </div>
                        );
                      })}
                      {minhasTarefas.length === 0 && (
                        <p className="rounded-lg border border-dashed border-ink-700 py-3 text-center text-xs text-cloud-dim">
                          Sem tarefas em andamento
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Quadro de atribuições */}
      <Card className="mt-6 p-5">
        <h2 className="mb-3 font-display text-lg font-bold text-cloud">Todas as tarefas em andamento</h2>
        {tarefas.filter((t) => t.statusProducao !== 'pronto').length === 0 ? (
          <EmptyState>Nenhuma tarefa em andamento. O sistema está aguardando novas solicitações aprovadas.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={cn('border-b border-ink-700 text-left text-xs uppercase tracking-wide text-cloud-dim')}>
                  <th className="pb-2 pr-4 font-semibold">Tarefa</th>
                  <th className="pb-2 pr-4 font-semibold">Cliente</th>
                  <th className="pb-2 pr-4 font-semibold">Responsável</th>
                  <th className="pb-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {tarefas
                  .filter((t) => t.statusProducao !== 'pronto')
                  .map((t) => {
                    const pl = prodLabel[t.statusProducao] ?? { label: t.statusProducao, badge: 'bg-ink-700 text-cloud-muted' };
                    return (
                      <tr key={t.id} className="border-b border-ink-800/60">
                        <td className="py-2.5 pr-4 text-cloud">{t.titulo}</td>
                        <td className="py-2.5 pr-4 text-cloud-muted">{t.clienteNome ?? '—'}</td>
                        <td className="py-2.5 pr-4">
                          {t.responsavelNome ? (
                            <span className="flex items-center gap-2">
                              <Avatar name={t.responsavelNome} color={t.responsavelCor ?? '#E11D2A'} size="sm" />
                              <span className="text-cloud-muted">{t.responsavelNome}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-cloud-dim">Não atribuído</span>
                          )}
                        </td>
                        <td className="py-2.5"><Badge className={pl.badge}>{pl.label}</Badge></td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
