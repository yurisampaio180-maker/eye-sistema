import { UsersRound, Video, Palette, Share2, Crown, CircleDot } from 'lucide-react';
import { useTeam, usePosts, useVideos } from '@/hooks/queries';
import { Card, PageHeader, Avatar, Badge } from '@/components/ui';
import { clientName } from '@/data/clients';
import { postStatusConfig, videoStageConfig } from '@/lib/status';
import { dayMonth } from '@/lib/dates';
import type { TeamRole } from '@/types';

const roleIcon: Record<TeamRole, typeof Video> = {
  ceo: Crown,
  videomaker: Video,
  designer: Palette,
  social: Share2,
};

export function EquipePage() {
  const { data: team } = useTeam();
  const { data: posts } = usePosts();
  const { data: videos } = useVideos();

  return (
    <div>
      <PageHeader
        icon={UsersRound}
        title="Equipe & Tarefas"
        subtitle="Papéis, atividade em tempo real e atribuições"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(team ?? []).map((m) => {
          const postTasks = (posts ?? []).filter(
            (p) => p.assigneeId === m.id && p.status !== 'postado'
          );
          const videoTasks = (videos ?? []).filter(
            (v) => v.videomakerId === m.id || v.designerId === m.id
          );
          const totalTasks = postTasks.length + videoTasks.length;

          return (
            <Card key={m.id} className="p-5">
              <div className="flex items-center gap-3">
                <Avatar name={m.name} color={m.avatarColor} size="lg" online={m.online} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-bold text-cloud">{m.name}</h3>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {m.roles.map((r) => {
                      const Icon = roleIcon[r];
                      return (
                        <span key={r} className="flex items-center gap-1 text-xs text-cloud-muted">
                          <Icon className="h-3 w-3 text-eye-red" />
                        </span>
                      );
                    })}
                    <span className="text-xs text-cloud-muted">{m.roleLabel}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-xl bg-ink-900 px-3 py-2 text-xs">
                <CircleDot className={m.online ? 'h-3.5 w-3.5 text-emerald-400' : 'h-3.5 w-3.5 text-cloud-dim'} />
                <span className="text-cloud-muted">{m.currentActivity}</span>
              </div>

              {m.id !== 'ceo' && (
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="eye-label">Tarefas</span>
                    <Badge className="bg-eye-red/15 text-eye-red">{totalTasks}</Badge>
                  </div>
                  <div className="space-y-1.5">
                    {postTasks.slice(0, 3).map((p) => {
                      const st = postStatusConfig[p.status];
                      return (
                        <div key={p.id} className="flex items-center gap-2 rounded-lg border border-ink-700/50 px-2.5 py-1.5 text-xs">
                          <Palette className="h-3 w-3 shrink-0 text-cloud-dim" />
                          <span className="min-w-0 flex-1 truncate text-cloud">{p.title}</span>
                          <Badge className={st.badge}>{st.label}</Badge>
                        </div>
                      );
                    })}
                    {videoTasks.slice(0, 3).map((v) => {
                      const st = videoStageConfig[v.stage];
                      return (
                        <div key={v.id} className="flex items-center gap-2 rounded-lg border border-ink-700/50 px-2.5 py-1.5 text-xs">
                          <Video className="h-3 w-3 shrink-0 text-cloud-dim" />
                          <span className="min-w-0 flex-1 truncate text-cloud">{v.title}</span>
                          <Badge className={st.badge}>{st.label}</Badge>
                        </div>
                      );
                    })}
                    {totalTasks === 0 && (
                      <p className="rounded-lg border border-dashed border-ink-700 py-3 text-center text-xs text-cloud-dim">
                        Sem tarefas no momento
                      </p>
                    )}
                  </div>
                </div>
              )}

              {m.id === 'ceo' && (
                <p className="mt-4 rounded-xl border border-eye-red/20 bg-eye-red/5 px-3 py-2 text-xs text-cloud-muted">
                  Acesso total ao sistema · acompanhamento em tempo real de toda a operação.
                </p>
              )}
            </Card>
          );
        })}
      </div>

      {/* Quadro geral de atribuições recentes */}
      <Card className="mt-6 p-5">
        <h2 className="mb-3 font-display text-lg font-bold text-cloud">
          Atribuições da semana
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-left text-xs uppercase tracking-wide text-cloud-dim">
                <th className="pb-2 pr-4 font-semibold">Tarefa</th>
                <th className="pb-2 pr-4 font-semibold">Cliente</th>
                <th className="pb-2 pr-4 font-semibold">Responsável</th>
                <th className="pb-2 pr-4 font-semibold">Quando</th>
                <th className="pb-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {(posts ?? [])
                .filter((p) => p.assigneeId && p.status !== 'postado')
                .slice(0, 8)
                .map((p) => {
                  const member = team?.find((m) => m.id === p.assigneeId);
                  const st = postStatusConfig[p.status];
                  return (
                    <tr key={p.id} className="border-b border-ink-800/60">
                      <td className="py-2.5 pr-4 text-cloud">{p.title}</td>
                      <td className="py-2.5 pr-4 text-cloud-muted">{clientName(p.clientId)}</td>
                      <td className="py-2.5 pr-4">
                        {member && (
                          <span className="flex items-center gap-2">
                            <Avatar name={member.name} color={member.avatarColor} size="sm" />
                            <span className="text-cloud-muted">{member.name}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 text-cloud-dim">{dayMonth(p.scheduledAt)}</td>
                      <td className="py-2.5">
                        <Badge className={st.badge} dot={st.dot}>{st.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
