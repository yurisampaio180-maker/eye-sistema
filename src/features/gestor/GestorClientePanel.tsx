import { useEffect, useMemo, useState } from 'react';
import { LogOut, Loader2, Building2, Inbox, CalendarDays, Image as ImageIcon, Video, Eye } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Card, Badge, Avatar, EmptyState } from '@/components/ui';
import { useAuth } from '@/stores/auth';
import { backend, solicStatusInfo, type Solicitacao, type PostAgenda } from '@/services/backend';
import { cn } from '@/lib/utils';
import { fmt, time } from '@/lib/dates';

/** Painel consolidado do cliente (ex.: Prefeito vê todas as secretarias). Somente leitura. */
export function GestorClientePanel() {
  const { user, logout } = useAuth();
  const [solics, setSolics] = useState<Solicitacao[] | null>(null);
  const [posts, setPosts] = useState<PostAgenda[]>([]);

  async function carregar() {
    try {
      const [s, p] = await Promise.all([backend.solicitacoes.list(), backend.agenda.list()]);
      setSolics(s);
      setPosts(p);
    } catch {
      setSolics([]);
    }
  }
  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 15000);
    return () => clearInterval(t);
  }, []);

  const porSecretaria = useMemo(() => {
    const map = new Map<string, Solicitacao[]>();
    for (const s of solics ?? []) {
      const k = s.unidadeNome ?? 'Geral';
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(s);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [solics]);

  const total = solics?.length ?? 0;
  const emAndamento = (solics ?? []).filter((s) => !['postada', 'cancelada', 'reprovada'].includes(s.status)).length;
  const postados = (solics ?? []).filter((s) => s.status === 'postada').length;

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="flex h-16 items-center justify-between border-b border-ink-800 bg-ink-900 px-4 md:px-6">
        <Logo />
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold text-cloud">{user?.nome}</p>
            <p className="text-[10px] uppercase tracking-wide text-cloud-dim">Painel do Governo · visão geral</p>
          </div>
          <Avatar name={user?.nome ?? '?'} color="#FACC15" size="sm" />
          <button onClick={logout} className="grid h-9 w-9 place-items-center rounded-xl border border-ink-700 text-cloud-muted hover:text-eye-red" title="Sair">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <div className="mb-5">
          <h1 className="eye-title text-2xl">Governo Municipal de Moraújo</h1>
          <p className="text-sm text-cloud-muted">Acompanhamento de todas as secretarias (somente leitura — a aprovação é da EYE Agência).</p>
        </div>

        {solics === null ? (
          <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-eye-red" /></div>
        ) : (
          <>
            <div className="mb-5 grid grid-cols-3 gap-3">
              <Mini label="Solicitações" value={String(total)} icon={Inbox} />
              <Mini label="Em andamento" value={String(emAndamento)} icon={Eye} />
              <Mini label="Postadas" value={String(postados)} icon={CalendarDays} />
            </div>

            {/* Por secretaria */}
            <h2 className="mb-2 font-display text-lg font-bold text-cloud">Por secretaria</h2>
            {porSecretaria.length === 0 ? (
              <EmptyState>Nenhuma solicitação ainda. Cada secretaria abre as suas pelo portal.</EmptyState>
            ) : (
              <div className="space-y-3">
                {porSecretaria.map(([secretaria, lista]) => (
                  <Card key={secretaria} className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 font-display font-bold text-cloud"><Building2 className="h-4 w-4 text-eye-red" /> {secretaria}</h3>
                      <span className="text-xs text-cloud-dim">{lista.length} solicitação(ões)</span>
                    </div>
                    <div className="space-y-1.5">
                      {lista.map((s) => {
                        const st = solicStatusInfo[s.status];
                        return (
                          <div key={s.id} className="flex items-center gap-2 rounded-lg border border-ink-700/50 px-2.5 py-1.5 text-sm">
                            <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-lg', s.tipo === 'arte' ? 'bg-violet-500/15 text-violet-400' : 'bg-sky-500/15 text-sky-400')}>
                              {s.tipo === 'arte' ? <ImageIcon className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-cloud">{s.titulo}</span>
                            <Badge className={st.badge} dot={st.dot}>{st.label}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Calendário geral (posts) */}
            <h2 className="mb-2 mt-6 font-display text-lg font-bold text-cloud">Calendário do Governo</h2>
            {posts.length === 0 ? (
              <EmptyState>Nenhum post agendado ainda.</EmptyState>
            ) : (
              <Card className="p-4">
                <div className="space-y-1.5">
                  {posts.slice(0, 12).map((p) => (
                    <div key={p.id} className="flex items-center gap-2 rounded-lg border border-ink-700/50 px-2.5 py-1.5 text-sm">
                      <span className="text-xs text-cloud-dim">{fmt(p.dataHora, 'dd/MM')} {time(p.dataHora)}</span>
                      <span className="min-w-0 flex-1 truncate text-cloud">{p.titulo}</span>
                      <Badge className="bg-ink-700 text-cloud-muted">{p.status.replace(/_/g, ' ')}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Mini({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Inbox }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <span className="eye-label">{label}</span>
        <Icon className="h-4 w-4 text-cloud-dim" />
      </div>
      <p className="mt-1 font-display text-2xl font-extrabold text-cloud">{value}</p>
    </Card>
  );
}
